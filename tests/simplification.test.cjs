'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const setup=(...types)=>({version:5,title:'Forenkling',inputUnits:{},tank:E.defaultTank(),shapes:types.map((type,i)=>E.newShape(type,'part'+i,i+1)),connections:[],formulas:[]});
const rectangle=(a,b)=>E.form('rectangleArea',{L:E.symbol(a),B:E.symbol(b)});
const sum=(a,b)=>E.form('areaSum',{A1:a,A2:b});
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
// Numerical checks are independent test fixtures; the application stays symbolic.
function value(ast,vars){
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const a=ast.children.map(c=>value(c,vars));
  switch(ast.type){
    case 'add':return a.reduce((x,y)=>x+y,0);case 'sub':return a[0]-a[1];
    case 'mul':return a.reduce((x,y)=>x*y,1);case 'div':return a[0]/a[1];
    case 'pow':return a[0]**a[1];case 'sqrt':return Math.sqrt(a[0]);case 'group':return a[0];
    default:assert.fail(ast.type);
  }
}

test('four box walls use the requested shared factor in both views and all exports',()=>{
  const m=setup('box');m.shapes[0].faces.bottom='open';
  const original=JSON.stringify(m);
  for(const mode of ['compact','expanded']){
    const ast=E.context(m).target('shape:part0:area',mode);
    assert.equal(E.plain(ast),'2 · (L_1 · h_1 + B_1 · h_1)');
    assert.match(E.tex(ast),/2 \\cdot \\left\(L_\{1\} \\cdot h_\{1\}/);
    assert.match(E.math(ast),/<mn>2<\/mn><mo>·<\/mo><mrow><mo>\(<\/mo>/);
  }
  m.shapes[0].faces.top=m.shapes[0].faces.bottom='closed';
  assert.equal(E.plain(E.context(m).target('shape:part0:area')),'2 · (L_1 · B_1 + L_1 · h_1 + B_1 · h_1)');
  m.shapes[0].faces.top=m.shapes[0].faces.bottom='open';
  assert.equal(JSON.stringify(m),original);
});

test('simplifying a box preserves all 64 independent open/closed face choices',()=>{
  const m=setup('box'),shape=m.shapes[0],faces=Object.keys(shape.faces);
  const expected={top:30,bottom:30,front:40,back:40,left:48,right:48};
  for(let mask=0;mask<64;mask++){
    let area=0;
    faces.forEach((key,i)=>{shape.faces[key]=mask&(1<<i)?'closed':'open';if(shape.faces[key]==='closed')area+=expected[key];});
    near(value(E.context(m).target('shape:part0:area'),{L_1:5,B_1:6,h_1:8}),area);
  }
});

test('half-cylinder ends reduce to π/4 only when both ends are closed',()=>{
  let m=setup('box','halfCylinder');
  m=E.connect(m,{shape:'part0',face:'bottom'},{shape:'part1',face:'top'},'joint');
  const shape=m.shapes[1];
  for(const count of [2,1,0]){
    shape.faces.front=count>0?'closed':'open';shape.faces.back=count>1?'closed':'open';
    const c=E.context(m),ast=c.target('shape:part1:area');
    near(value(ast,{B_1:6,L_1:10}),30*Math.PI+count*4.5*Math.PI);
    for(const mode of ['compact','expanded']){
      const latex=E.tex(c.target('shape:part1:area',mode));
      assert.equal(latex.includes('\\frac{\\pi}{4}'),count===2);
      assert.equal(latex.includes('\\frac{\\pi}{8}'),count===1);
      assert.equal((latex.match(/\^\{2\}/g)||[]).length,count?1:0);
    }
  }
});

test('like terms and repeated factors simplify in arbitrary inserted formulas',()=>{
  const m=setup(),c=E.context(m);
  const two=c.expand(sum(rectangle('a','b'),rectangle('b','a')),'area');
  assert.equal(E.plain(two),'2 · a · b');
  const oneAndAHalf=c.expand(sum(rectangle('a','b'),E.form('triangleArea',{g:E.symbol('b'),h:E.symbol('a')})),'area');
  assert.equal(E.plain(oneAndAHalf),'3 · a · b / 2');
  near(value(oneAndAHalf,{a:7,b:4}),42);
  const square=c.expand(rectangle('x','x'),'area');
  assert.equal(E.plain(square),'x^2');
  const cube=c.expand(E.form('boxVolume',{L:E.symbol('x'),B:E.symbol('x'),h:E.symbol('x')}),'volume');
  assert.equal(E.plain(cube),'x^3');
});

test('equal display labels never merge references to different sources',()=>{
  const m=setup();
  for(const [id,a,b]of [['first','a','b'],['second','c','d']]){
    const f=E.newFormula(id,'rectangleArea');f.expression=rectangle(a,b);f.resultUnit='cm2';m.formulas.push(f);
  }
  const total=E.newFormula('total','areaSum');total.expression=sum(E.ref('formula:first'),E.ref('formula:second'));m.formulas.push(total);
  const context=E.context(m),compact=context.target('formula:total','compact');
  assert.deepEqual(E.variables(compact).map(v=>v.reference),['formula:first','formula:second']);
  near(value(context.target('formula:total'),{a:2,b:3,c:4,d:5}),26);
  total.expression=sum(E.ref('formula:first'),E.ref('formula:first'));
  assert.equal(E.variables(E.context(m).target('formula:total','compact')).length,1);
  assert.match(E.plain(E.context(m).target('formula:total','compact')),/2 ·/);
});

test('copied formulas stay live and preserve each conversion and the complete T9 sum',()=>{
  let m=setup('box','halfCylinder');m.shapes[1].diameter.basis='outer';
  m=E.connect(m,{shape:'part1',face:'top'},{shape:'part0',face:'bottom'},'joint');
  m.inputUnits={'D_2:length':'mm','L_2:length':'cm','h_1:length':'cm','t_plade:length':'mm','ρ_mat:density':'ton_m3'};
  const copy=E.newFormula('copy','areaSum');copy.expression=E.clone(E.context(m).map.get('shape:part0:area').expression);m.formulas.push(copy);
  const mass=E.newTankMass(m,'mass');mass.resultUnit='ton';m.formulas.push(mass);
  const saved=JSON.stringify(m),c=E.context(m),vars={D_2:6000,L_2:1000,h_1:700,t_plade:2,ρ_mat:7.85};
  const D=5.996,area=2*(10*7+D*7)+(Math.PI/2)*D*10+(Math.PI/4)*D*D;
  near(value(c.result('formula:mass'),vars),area*0.002*7850/1000);
  assert.match(E.plain(c.target('formula:mass')),/D_2 \/ 1000/);
  assert.match(E.plain(c.target('formula:mass')),/t_plade \/ 1000/);
  // Thickness in mm and density in ton/m³ cancel their opposite 1000 factors;
  // the entire plate-area sum must still be grouped before multiplication.
  assert.match(E.tex(c.target('formula:mass')),/\\right\) \\cdot t_\{plade\} \\cdot \\rho_\{mat\}$/);
  assert.equal(E.plain(c.target('formula:copy')),E.plain(c.target('shape:part0:area')));
  assert.equal(JSON.stringify(m),saved);
  assert.equal(E.plain(E.context(E.validateModel(JSON.parse(saved))).result('formula:mass')),E.plain(c.result('formula:mass')));
  m.shapes[0].inputs.h=E.symbol('ny_højde');
  assert(E.variables(E.context(m).target('formula:copy')).some(v=>v.symbol==='ny_højde'));
});
