'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const model=(...ids)=>({version:5,inputUnits:{},inputValues:{},title:'Tal i formlen',tank:E.defaultTank(),shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const result=(m,id=m.formulas[0].id,mode='expanded')=>E.context(m).result('formula:'+id,mode);
const numericText=ast=>E.plain(ast,v=>v.inputValue??v.symbol);
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-10*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
// Independent numerical checks of substitution and conversion.
function value(ast,vars={}){
  if(ast.type==='symbol')return ast.inputValue!==undefined?Number(ast.inputValue):vars[ast.symbol];
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const c=ast.children.map(child=>value(child,vars));
  switch(ast.type){
    case 'group':return c[0];case 'sqrt':return Math.sqrt(c[0]);
    case 'add':return c.reduce((a,b)=>a+b);case 'sub':return c[0]-c[1];
    case 'mul':return c.reduce((a,b)=>a*b);case 'div':return c[0]/c[1];
    case 'pow':return c[0]**c[1];default:assert.fail(ast.type);
  }
}

test('decimal input accepts Danish and dot notation without rounding or executing text',()=>{
  for(const [input,expected]of [['50','50'],['  −2,50 ','-2.50'],['.05','0.05'],['-,05','-0.05'],['+1.2300','1.2300'],['1,','1'],['',''],['   ',''],['0','0'],['-0,00','-0.00'],['12345678901234567890.12345678901','12345678901234567890.12345678901']])assert.equal(E.parseInputValue(input),expected,input);
  for(const input of ['-',',','1,2.3','1 000','1e3','Infinity','NaN','2*3','<img src=x>',{},50,null,'1'.repeat(33)])assert.equal(E.parseInputValue(input),null,String(input));
});

test('rectangle inputs show small units and original symbols without evaluating the product',()=>{
  const m=model('rectangleArea');m.inputValues={'B:length':'50','L:length':'30'};
  const ast=result(m),html=E.math(ast,'A','m²');
  assert.equal(E.plain(ast),'30 m (L) · 50 m (B)');
  assert.equal(numericText(ast),'30 · 50');
  assert.match(html,/<mn>50<\/mn><mspace[^>]*\/><mstyle mathsize="65%" class="value-annotation"><mtext>m \(<\/mtext><mi>B<\/mi>/);
  assert.match(html,/aria-label="A \[m²\] = 30 m \(L\) · 50 m \(B\)"/);
  assert(!html.includes('1500'));
  assert.match(E.tex(ast),/50\\,\{\\scriptstyle\\text\{m\}\\,\(B\)\}/);
  assert.deepEqual(E.variables(ast).map(v=>v.symbol),['L','B']);
  delete m.inputValues['B:length'];assert.equal(E.plain(result(m)),'30 m (L) · B');
  m.inputValues['B:length']='0';assert.equal(E.plain(result(m)),'30 m (L) · 0 m (B)');
});

test('all base formulas and inverses preserve symbolic structure and editable symbols with values',()=>{
  for(const id of Object.keys(E.FORMULAS)){
    const m=model(id),before=result(m),vars=E.variables(before);
    vars.forEach((v,i)=>m.inputValues[E.Units.key(v)]=String(i+2)+'.50');
    const after=result(m);
    assert.equal(E.plain(after,v=>v.symbol),E.plain(before),id);
    assert.deepEqual(E.variables(after).map(v=>[v.symbol,v.dimension]),vars.map(v=>[v.symbol,v.dimension]),id);
    for(const v of E.variables(after)){
      assert.equal(v.inputValue,m.inputValues[E.Units.key(v)],id);
      assert.equal(v.valueUnit,E.Units.base(v.dimension).label,id);
    }
    assert.doesNotThrow(()=>E.math(after),id);assert.doesNotThrow(()=>E.tex(after),id);
  }
  const m=model('rectangleArea');m.inputValues={'L:length':'50','B:length':'50'};
  assert.equal(E.plain(result(m)),'50 m (L) · 50 m (B)');
});

test('negative values retain precedence in powers, subtraction and denominators',()=>{
  const m=model('circleArea');m.inputValues={'D:length':'-2'};
  const ast=result(m);assert.equal(numericText(ast),'π / 4 · (-2)^2');near(value(ast),Math.PI);
  assert.match(E.mathBody(ast),/<msup><mrow><mo>\(<\/mo><mrow><mn>-2<\/mn>/);
  assert.match(E.plain(ast),/\(-2 m \(D\)\)\^2/);
  const a={type:'symbol',symbol:'a',inputValue:'5',valueUnit:'m'},b={...a,symbol:'b',inputValue:'-2'};
  assert.equal(numericText({type:'sub',children:[a,b]}),'5 − (-2)');
  assert.equal(numericText({type:'div',children:[a,b]}),'5 / (-2)');
  assert.equal(numericText({type:'mul',children:[a,b]}),'5 · (-2)');
  m.inputValues['D:length']='2';assert.match(E.plain(result(m)),/\(2 m \(D\)\)\^2/);
  assert.equal(numericText(result(m)),'π / 4 · 2^2');
});

test('annotations use selected input units while conversions and rpm cancellation stay correct',()=>{
  const rectangle=model('rectangleArea');rectangle.inputValues={'L:length':'30','B:length':'50'};rectangle.inputUnits={'B:length':'mm'};
  near(value(result(rectangle)),1.5);assert.match(E.plain(result(rectangle)),/50 mm \(B\)/);
  rectangle.inputUnits['B:length']='cm';near(value(result(rectangle)),15);
  assert.equal(E.inputValue(rectangle,{symbol:'B',dimension:'length'}),'50');
  const belt=model('beltSpeed');belt.inputValues={'D:length':'500','n:rotationRate':'120'};
  belt.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};belt.formulas[0].resultUnit='m_min';
  const ast=result(belt);near(value(ast),60*Math.PI);assert(!/\b60\b/.test(numericText(ast)));
  assert.match(E.plain(ast),/120 omdr\.\/min \(n\)/);assert.match(numericText(ast),/1000/);
  const mass=model('mass');mass.inputValues={'ρ:density':'7.85','V:volume':'2'};mass.inputUnits={'ρ:density':'ton_m3'};
  near(value(result(mass)),15700);assert.match(E.plain(result(mass)),/7,85 ton\/m³ \(ρ\)/);
});

test('percent and negative Celsius inputs preserve their annotations and offsets',()=>{
  const m=model('temperatureDifference');m.inputValues={'T_slut:temperature':'-10','T_start:temperature':'-30'};
  m.inputUnits={'T_slut:temperature':'C','T_start:temperature':'C'};
  near(value(result(m)),20);assert.match(E.plain(result(m)),/-10 °C \(T_slut\)/);
  const unit=E.Units.get('scalar','percent');
  const ast=E.Units.convert({type:'symbol',symbol:'η',dimension:'scalar',inputValue:'80',valueUnit:unit.label},unit);
  near(value(ast),.8);assert.match(E.mathBody(ast),/<mtext>% \(<\/mtext>/);
  assert.match(E.tex(ast),/\\text\{\\%\}/);
});

test('live and compact references distinguish supplied inputs from computed results',()=>{
  const m=model('rectangleArea','flow');m.inputValues={'L:length':'30','B:length':'50','v:velocity':'2','A:area':'999'};
  m.formulas[1].expression.args.A=E.ref('formula:rectangleArea');
  near(value(result(m,'flow')),3000);
  const compact=result(m,'flow','compact');assert.equal(E.plain(compact),'A · 2 m/s (v)');
  assert(!E.plain(compact).includes('999'));
  m.inputValues['B:length']='40';near(value(result(m,'flow')),2400);
  const source=E.newFormula('known','rectangleArea');source.expression=E.symbol('A_kendt');m.formulas.push(source);
  m.inputValues['A_kendt:area']='5';m.inputUnits['A_kendt:area']='cm2';m.formulas[1].expression.args.A=E.ref('formula:known');
  near(value(result(m,'flow')),.001);near(value(result(m,'flow','compact')),.001);
  assert.match(E.plain(result(m,'flow','compact')),/5 cm² \(A_kendt\)/);
});

test('values survive save/open and rearrangement while blank and malformed saved values are rejected',()=>{
  const m=model('rectangleArea');m.inputValues={'B:length':'50','L:length':'30','A:area':'1500'};
  m.inputUnits={'B:length':'mm'};
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
  const inverse=E.rearrangeFormula(m,'rectangleArea','inverse:rectangleArea:L','length');
  assert.deepEqual(inverse.inputValues,m.inputValues);
  const text=E.plain(result(inverse,'length'));assert.match(text,/1500 m² \(A\)/);assert.match(text,/50 mm \(B\)/);assert(!text.includes('30 m (L)'));
  for(const inputValues of [null,[],{'B:length':''},{'B:length':'Infinity'},{'B:length':'2+3'},{'B:length':50},{'B:unknown':'50'},{'<img>:length':'50'},Object.fromEntries(Array.from({length:3001},(_,i)=>['x'+i+':length','1']))])assert.throws(()=>E.validateModel({...m,inputValues}),/Ugyldig opsætning/);
  const old=E.example();assert.deepEqual(E.validateModel(old),old);
  const decimal=E.validateModel({...m,inputValues:{'B:length':'2,500'}});assert.equal(decimal.inputValues['B:length'],'2.500');
});

test('TI estimates count supplied digits and signs but exclude labels and annotation parentheses',()=>{
  const m=model('rectangleArea');m.inputValues={'B:length':'50','L:length':'30'};
  assert.equal(G.estimate(result(m)).min,5);assert.equal(G.estimate(result(m)).max,5);
  delete m.inputValues['B:length'];assert.equal(G.estimate(result(m)).min,7);assert.equal(G.estimate(result(m)).max,11);
  m.inputValues['B:length']='-2.5';assert.equal(G.estimate(result(m)).min,'30·(-2.5)'.length);
  const circle=model('circleArea');circle.inputValues={'D:length':'2'};
  assert.equal(G.estimate(result(circle)).max,'π/4·2^2'.length);
  const lengthy=E.example();lengthy.inputValues=Object.fromEntries(E.variables(result(lengthy,'time')).map(v=>[E.Units.key(v),'12345678.90123456']));
  const guide=G.create(E.context(lengthy),'formula:time');assert(guide.estimate.tooLong);assert(guide.plan?.steps.length>0);
  const numbers=guide.plan.steps.flatMap(s=>E.variables(s.ast)).filter(v=>v.inputValue!==undefined);
  assert(numbers.length>0);assert(numbers.every(v=>v.valueUnit===E.Units.base(v.dimension).label));
  const vars={};for(const step of guide.plan.steps)vars[step.symbol]=value(step.ast,vars);
  near(value(guide.plan.final,vars),value(result(lengthy,'time')));
});
