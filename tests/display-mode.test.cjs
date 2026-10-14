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
  const saved=E.validateModel(JSON.parse(JSON.stringify(m)));
  assert.equal(saved.version,6);
  assert.deepEqual(saved.inputValues,{'formula:beltSpeed:D:length':'500','formula:beltSpeed:n:rotationRate':'120'});
  assert.equal(plain(result(saved),'both'),plain(ast,'both'));
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(saved))),saved);
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


test('simple substitutes reference results in their own units, preserving conversion and copy formats',()=>{
  const m=model('rectangleArea','flow');m.version=6;
  m.formulas[0].resultUnit='cm2';
  m.formulas[1].expression.args.A=E.ref('formula:rectangleArea');
  m.inputValues={
    'formula:rectangleArea:L:length':'0.3',
    'formula:rectangleArea:B:length':'0.5',
    'formula:flow:v:velocity':'2'
  };
  const saved=JSON.stringify(m),ctx=E.context(m);
  const ast=ctx.result('formula:flow','simple');
  assert.equal(plain(ast,'values'),'1500 / 10000 · 2');
  assert.equal(plain(ast,'units'),'1500 / 10000 · v');
  assert.equal(plain(ast,'both'),'1500 / 10000 · 2 m/s (v)');
  assert.match(E.math(ast,'Q_v','m³/s','values'),/1500 \/ 10000 · 2/);
  assert.match(E.tex(ast,'values'),/1500/);
  assert.equal(E.evaluate(ast).status,'ready');
  assert(Math.abs(E.evaluate(ast).value-0.3)<1e-12);
  assert.deepEqual(JSON.parse(JSON.stringify(m)),JSON.parse(saved));
  assert.equal(plain(ctx.result('formula:flow','compact'),'values'),'A / 10000 · 2');
  assert.equal(plain(ctx.result('formula:flow','expanded'),'values'),'0,3 · 0,5 · 2');
});

test('simple references update live, retain unknown symbols and never calculate with display rounding',()=>{
  const m=model('rectangleArea','flow');m.version=6;
  m.formulas[0].resultUnit='cm2';
  m.formulas[1].expression.args.A=E.ref('formula:rectangleArea');
  m.inputValues={
    'formula:rectangleArea:L:length':'0.3333333333333333',
    'formula:rectangleArea:B:length':'0.5',
    'formula:flow:v:velocity':'3'
  };
  const ctx=E.context(m),read=()=>ctx.result('formula:flow','simple');
  const first=read();
  assert.match(plain(first,'values'),/^1666,667 \/ 10000 · 3$/);
  const exact=E.evaluate(ctx.result('formula:flow','expanded')).value;
  assert(Math.abs(E.evaluate(first).value-exact)<1e-12);
  assert(!/[eE][+-]?\d/.test(plain(first,'values')));
  m.inputValues['formula:rectangleArea:L:length']='0.4';
  assert.equal(plain(read(),'values'),'2000 / 10000 · 3');
  delete m.inputValues['formula:rectangleArea:L:length'];
  assert.equal(plain(read(),'values'),'A / 10000 · 3');
  m.inputValues['formula:rectangleArea:L:length']='0';
  assert.equal(plain(read(),'values'),'0 / 10000 · 3');
  m.inputValues['formula:rectangleArea:L:length']='0.000000000001';
  assert(!/[eE][+-]?\d/.test(plain(read(),'values')),'Tiny intermediate result must not use exponent notation.');
});
