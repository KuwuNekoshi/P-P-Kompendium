'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const symbol=name=>({type:'symbol',symbol:name,dimension:'volume'});
const number=n=>({type:'constant',value:String(n)});
const op=(type,...children)=>({type,children});
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
// Independent numerical checks for the suggested sequence, only in tests.
function value(ast,vars){
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),'Missing '+ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const a=ast.children.map(c=>value(c,vars));
  switch(ast.type){
    case 'add':return a.reduce((x,y)=>x+y,0);case 'sub':return a[0]-a[1];
    case 'mul':return a.reduce((x,y)=>x*y,1);case 'div':return a[0]/a[1];
    case 'pow':return a[0]**a[1];case 'sqrt':return Math.sqrt(a[0]);case 'group':return a[0];
    default:assert.fail(ast.type);
  }
}
function follow(plan,vars){
  const values={...vars};
  for(const step of plan.steps){assert(!Object.hasOwn(values,step.symbol),'Intermediate shadows '+step.symbol);values[step.symbol]=value(step.ast,values);}
  return value(plan.final,values);
}

test('length estimates count numeric occurrences and conversions, not printed symbol names or units',()=>{
  const a=op('mul',symbol('D'),symbol('D'));
  const b=op('mul',{...symbol('Meget_langt_navn'),unit:'mm'},{...symbol('Meget_langt_navn'),unit:'mm'});
  assert.deepEqual(G.estimate(a),G.estimate(b));
  assert.equal(G.estimate(a).min,11);assert.equal(G.estimate(a).max,19);
  assert(G.estimate(op('mul',...Array.from({length:9},()=>symbol('D')))).tooLong);
  assert(G.estimate(op('div',a,number(1000000))).max>G.estimate(a).max);
  assert.equal(G.LIMIT,80);
});

test('MathPrint nesting is checked independently of length and split below four levels',()=>{
  let ast=symbol('x');for(let i=0;i<5;i++)ast=op('sqrt',ast);
  assert.equal(G.estimate(ast).nesting,5);assert(G.estimate(ast).max<80);
  assert(G.estimate(ast).recommend);
  const plan=G.split(ast);
  assert(plan.steps.length>0);assert(!plan.incomplete);
  assert(plan.steps.every(s=>s.estimate.nesting<=4));assert(plan.estimate.nesting<=4);
  near(follow(plan,{x:65536}),Math.sqrt(Math.sqrt(Math.sqrt(Math.sqrt(Math.sqrt(65536))))));
});

test('two volumes are calculated separately in cubic metres before the complete litre conversion',()=>{
  const m=E.example();m.inputUnits={'D_1:length':'mm','h_1:length':'cm','h_2:length':'cm'};
  m.formulas[0].resultUnit='L';
  const ctx=E.context(m),guide=G.create(ctx,'formula:volume'),plan=guide.plan;
  assert(guide.estimate.recommend);assert(plan);assert(!plan.incomplete);
  assert.deepEqual(plan.steps.map(s=>s.symbol),['V_1','V_2']);
  assert.deepEqual(plan.steps.map(s=>s.unit),['m³','m³']);
  assert.equal(E.plain(plan.final),'((V_1 + V_2) · 1000)');
  near(follow(plan,{D_1:6000,h_1:1000,h_2:200}),96*Math.PI*1000);
});

test('fill-time advice has ordered intermediate volumes and keeps division by the complete flow',()=>{
  const m=E.example(),guide=G.create(E.context(m),'formula:time'),plan=guide.plan;
  assert(guide.estimate.tooLong);assert.equal(plan.steps.length,2);
  near(follow(plan,{D_1:6,h_1:10,h_2:2,D_3:.1,v:2}),19200);
  assert.match(E.tex(plan.final),/^\\frac\{/);assert(!plan.incomplete);
  const compact=G.create(E.context(m),'formula:time','compact');
  assert(!compact.estimate.recommend);assert.equal(compact.plan,null);
});

test('inline formulas without references split whole subexpressions, including subtraction and powers',()=>{
  const term=n=>op('pow',op('sub',op('div',symbol('x'+n),number(1000)),op('mul',number(2),op('div',symbol('t'),number(1000)))),number(2));
  const ast=op('div',op('sub',op('add',term(1),term(2)),term(3)),op('add',term(4),term(5)));
  const plan=G.split(ast),vars={x1:6000,x2:4000,x3:2000,x4:3000,x5:1000,t:2};
  assert(plan.steps.length>0);assert(!plan.incomplete);
  near(follow(plan,vars),(((6-.004)**2+(4-.004)**2)-(2-.004)**2)/((3-.004)**2+(1-.004)**2));
});

test('wide sums split into bounded blocks without collisions with existing names',()=>{
  const names=['M_1',...Array.from({length:29},(_,i)=>'V_'+i)];
  const ast=op('add',...names.map(symbol)),vars=Object.fromEntries(names.map((name,i)=>[name,i+1]));
  const plan=G.split(ast,[],'M_2');
  assert(plan.steps.length>0&&plan.steps.length<48);assert(!plan.incomplete);
  assert(plan.steps.every(s=>s.estimate.max<=80&&!names.includes(s.symbol)&&s.symbol!=='M_2'));
  near(follow(plan,vars),465);
});

test('T9 advice preserves outside diameters, mixed units and all selected plates without mutating the setup',()=>{
  const m=E.example();m.shapes[0].diameter.basis='outer';
  m.inputUnits={'D_1:length':'mm','h_1:length':'cm','h_2:length':'cm','t_plade:length':'mm','ρ_mat:density':'ton_m3'};
  m.formulas.push(E.newTankMass(m,'mass'));m.formulas.at(-1).resultUnit='ton';
  const before=JSON.stringify(m),guide=G.create(E.context(m),'formula:mass'),vars={D_1:6000,h_1:1000,h_2:200,t_plade:2,ρ_mat:7.85};
  const D=5.996,expected=(Math.PI*D*10+Math.PI*D/2*Math.sqrt((D/2)**2+4))*.002*7.85;
  assert(guide.plan&&!guide.plan.incomplete);near(follow(guide.plan,vars),expected);
  assert.equal(JSON.stringify(m),before);
  m.shapes[0].faces.top='closed';
  near(follow(G.create(E.context(m),'formula:mass').plan,vars),expected+Math.PI/4*D**2*.002*7.85);
});

test('invalid or missing dependencies produce no calculator advice in either view',()=>{
  const m=E.removeShape(E.example(),'pipe');
  for(const mode of ['expanded','compact'])assert.equal(G.create(E.context(m),'formula:time',mode),null);
  assert.equal(G.create(E.context(E.example()),'formula:missing'),null);
});
