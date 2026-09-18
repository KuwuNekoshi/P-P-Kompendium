'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const model=(...ids)=>({version:5,inputUnits:{},inputValues:{},title:'Visning',tank:E.defaultTank(),shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const result=(m,id=m.formulas[0].id,mode='expanded')=>E.context(m).result('formula:'+id,mode);
const plain=(ast,mode)=>E.plain(ast,null,mode);

test('three display modes agree across screen, copy, accessibility and TeX without changing saved inputs',()=>{
  const m=model('rectangleArea');m.inputValues={'B:length':'50','L:length':'30'};
  const ast=result(m),before=JSON.stringify({m,ast});
  const cases={values:'30 · 50',units:'L · B',both:'30 m (L) · 50 m (B)'};
  for(const [mode,expected]of Object.entries(cases)){
    assert.equal(plain(ast,mode),expected);
    assert(E.math(ast,'A','m²',mode).includes('aria-label="A [m²] = '+expected+'"'));
  }
  assert.equal(E.mathBody(ast,'values'),'<mrow><mn>30</mn><mo>·</mo><mn>50</mn></mrow>');
  assert.equal(E.mathBody(ast,'units'),'<mrow><mi>L</mi><mo>·</mo><mi>B</mi></mrow>');
  assert.match(E.mathBody(ast,'both'),/<mstyle mathsize="65%"/);
  assert.equal(E.tex(ast,'values'),'30 \\cdot 50');
  assert.equal(E.tex(ast,'units'),'L \\cdot B');
  assert.match(E.tex(ast,'both'),/50\\,\{\\scriptstyle/);
  assert.equal(plain(ast,'unknown'),cases.both);
  assert.equal(JSON.stringify({m,ast}),before);
});

test('numeric view keeps negative precedence and zero; unit view does not expose hidden values',()=>{
  const m=model('circleArea');m.inputValues={'D:length':'-2'};
  const ast=result(m);
  assert.equal(plain(ast,'values'),'π / 4 · (-2)^2');
  assert.equal(plain(ast,'units'),'π / 4 · D^2');
  assert.equal(plain(ast,'both'),'π / 4 · (-2 m (D))^2');
  assert.match(E.mathBody(ast,'values'),/<msup><mrow><mo>\(<\/mo><mn>-2<\/mn><mo>\)<\/mo><\/mrow><mn>2<\/mn><\/msup>/);
  const a={type:'symbol',symbol:'a',inputValue:'0',valueUnit:'m'},b={...a,symbol:'b',inputValue:'-2.5'};
  assert.equal(plain({type:'div',children:[a,b]},'values'),'0 / (-2,5)');
  assert.equal(plain({type:'sub',children:[a,b]},'values'),'0 − (-2,5)');
  assert.equal(plain({type:'sub',children:[a,b]},'units'),'a − b');
  assert.equal(E.plain({type:'div',children:[a,b]},v=>v.inputValue,'units'),'0 / (-2.5)');
  const partial=model('rectangleArea');partial.inputValues={'B:length':'0'};partial.inputUnits={'L:length':'cm'};
  assert.equal(plain(result(partial),'values'),'L / 100 · 0');
  assert.equal(plain(result(partial),'units'),'L / 100 · B');
});

test('input units, conversion factors and TI estimates survive every presentation mode',()=>{
  const m=model('beltSpeed');m.inputValues={'D:length':'500','n:rotationRate':'120'};
  m.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};m.formulas[0].resultUnit='m_min';
  const ast=result(m),estimate=G.estimate(ast);
  assert.equal(plain(ast,'values'),'π · 500 · 120 / 1000');
  assert.equal(plain(ast,'units'),'π · D · n / 1000');
  for(const mode of ['values','units','both']){
    E.math(ast,'v','m/min',mode);E.tex(ast,mode);
    assert.deepEqual(G.estimate(ast),estimate);
    assert.equal(E.inputValue(m,{symbol:'D',dimension:'length'}),'500');
  }
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
});

test('compact references retain conversion factors and keep unknown symbols in all modes',()=>{
  const m=model('rectangleArea','flow');m.formulas[0].resultUnit='cm2';
  m.formulas[1].expression.args.A=E.ref('formula:rectangleArea');
  m.inputValues={'A:area':'999','B:length':'50','L:length':'30','v:velocity':'2'};
  const compact=result(m,'flow','compact');
  assert.equal(plain(compact,'units'),'A / 10000 · v');
  assert.equal(plain(compact,'values'),'A / 10000 · 2');
  assert(!plain(compact,'values').includes('cm²'));assert(!plain(compact,'values').includes('999'));
  assert.equal(plain(result(m,'flow'),'units'),'L · B · v');
  assert.match(plain(result(m,'flow'),'values'),/30 · 50 · 2/);
});
