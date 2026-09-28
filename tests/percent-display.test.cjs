'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const setup=(...formulas)=>({version:6,title:'Procenter',inputUnits:{},inputValues:{},tank:E.defaultTank(),shapes:[],connections:[],formulas});
const leaf=(inputValue)=>({type:'symbol',symbol:'η',dimension:'scalar',inputValue,valueUnit:'%'});
const near=(answer,expected)=>{assert.equal(answer.status,'ready',answer.error);assert(Math.abs(answer.value-expected)<1e-10*Math.max(1,Math.abs(expected)));};

test('percentages display as exact decimals without changing the entered percentage or the numerical expression',()=>{
  const cases=[['87','0.87'],['87,5','0.875'],['0.87','0.0087'],['100','1.00'],['0','0.00'],['-87','-0.87'],['0.12345678901234567890123456789','0.0012345678901234567890123456789']];
  for(const [input,expected]of cases){
    assert.equal(E.percentToDecimal(input),expected);
    const ast=E.Units.convert(leaf(input.replace(',','.')),E.Units.get('scalar','percent')),before=JSON.stringify(ast);
    assert.equal(E.plain(ast,null,'values'),expected.replace('.',','));
    assert.equal(E.plain(ast,null,'units'),'η / 100');
    assert.equal(E.plain(ast),expected.replace('.',',')+' tal (η)');
    assert(E.math(ast).includes('<mn>'+expected.replace('.',',')+'</mn>'));
    assert(!E.math(ast).includes('<mtext>% ('));
    near(E.evaluate(ast),Number(input.replace(',','.'))/100);assert.equal(JSON.stringify(ast),before);
  }
  const known=E.Units.convert(leaf('87'),E.Units.get('scalar','percent'));
  assert.equal(G.estimate(known).min,'0,87'.length);assert.equal(G.estimate(known).max,'0,87'.length);
  const unknown=E.Units.convert({type:'symbol',symbol:'η',dimension:'scalar'},E.Units.get('scalar','percent'));
  assert.equal(E.plain(unknown),'η / 100');assert.equal(E.evaluate(unknown).status,'incomplete');
});

test('centimetres and percent cannot hide each others conversion in bucket flow',()=>{
  const m=setup(E.newFormula('bucket','bucketFlow'));
  m.inputValues={'formula:bucket:V_kop:volume':'1','formula:bucket:s_kop:length':'20','formula:bucket:v:velocity':'1','formula:bucket:η:scalar':'87'};
  m.inputUnits={'formula:bucket:s_kop:length':'cm','formula:bucket:η:scalar':'percent'};
  const ast=E.context(m).result('formula:bucket'),text=E.plain(ast,null,'values');
  assert.match(text,/1 \/ \(20 \/ 100\)/);assert.match(text,/0,87/);near(E.evaluate(ast),4.35);
  assert.equal(m.inputValues['formula:bucket:η:scalar'],'87');
  m.formulas[0].resultUnit='m3_h';near(E.evaluate(E.context(m).result('formula:bucket')),15660);
  assert.match(E.plain(E.context(m).result('formula:bucket'),null,'values'),/0,87/);
});

test('percentages retain their decimal meaning through inline formulas, references, copies and independent units',()=>{
  const m=setup(E.newFormula('eta','efficiency'),E.newFormula('power','inputPower'),E.newFormula('other','inputPower'));
  m.formulas[0].expression=E.symbol('η');m.formulas[0].resultUnit='percent';
  m.formulas[1].expression.args.eta=E.ref('formula:eta');
  m.inputValues={'formula:eta:η:scalar':'87','formula:power:P_teo:power':'87','formula:other:P_teo:power':'87','formula:other:η:scalar':'0.87'};
  m.inputUnits={'formula:eta:η:scalar':'percent'};
  for(const mode of ['expanded','compact']){
    const ast=E.context(m).result('formula:power',mode);near(E.evaluate(ast),100);assert.match(E.plain(ast,null,'values'),/87 \/ 0,87/);
  }
  near(E.evaluate(E.context(m).result('formula:eta')),87);
  near(E.evaluate(E.context(m).result('formula:other')),100);
  E.copyInputs(m,'formula:eta','formula:power');m.formulas[1].expression.args.eta=E.clone(m.formulas[0].expression);
  near(E.evaluate(E.context(m).result('formula:power')),100);
  m.inputValues['formula:power:η:scalar']='50';near(E.evaluate(E.context(m).result('formula:power')),174);
  assert.equal(m.inputValues['formula:eta:η:scalar'],'87');
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
});
