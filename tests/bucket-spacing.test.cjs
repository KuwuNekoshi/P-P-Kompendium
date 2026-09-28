'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const setup=id=>({version:6,title:'Kopelevator',inputUnits:{},inputValues:{},tank:E.defaultTank(),shapes:[],connections:[],formulas:[E.newFormula('bucket',id)]});
const ast=m=>E.context(m).result('formula:bucket');
const near=(m,n)=>{const answer=E.evaluate(ast(m));assert.equal(answer.status,'ready',answer.error);assert(Math.abs(answer.value-n)<1e-10,`${answer.value} != ${n}`);};

test('one bucket every 20 cm means 1 / 0,2, giving five buckets per metre',()=>{
  const m=setup('bucketCountFromSpacing');m.inputValues={'formula:bucket:s_kop:length':'20'};m.inputUnits={'formula:bucket:s_kop:length':'cm'};
  assert.equal(E.plain(ast(m),null,'values'),'1 / 0,2');near(m,5);
  m.inputValues['formula:bucket:s_kop:length']='0.2';m.inputUnits['formula:bucket:s_kop:length']='m';
  assert.equal(E.plain(ast(m),null,'values'),'1 / 0,2');near(m,5);
  m.inputValues['formula:bucket:s_kop:length']='200';m.inputUnits['formula:bucket:s_kop:length']='mm';near(m,5);
  m.inputValues['formula:bucket:s_kop:length']='0';assert.equal(E.evaluate(ast(m)).status,'error');
});

test('new bucket flow defaults to spacing and combines litre, centimetre, minute and percentage units',()=>{
  const m=setup('bucketFlow');assert.equal(m.formulas[0].expression.args.N.formula,'bucketCountFromSpacing');
  m.inputValues={'formula:bucket:V_kop:volume':'2','formula:bucket:s_kop:length':'20','formula:bucket:v:velocity':'60','formula:bucket:η:scalar':'80'};
  m.inputUnits={'formula:bucket:V_kop:volume':'L','formula:bucket:s_kop:length':'cm','formula:bucket:v:velocity':'m_min','formula:bucket:η:scalar':'percent'};
  m.formulas[0].resultUnit='m3_h';near(m,28.8);
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
  m.formulas[0].expression.args.N=E.symbol('N_meter');m.inputValues['formula:bucket:N_meter:countPerLength']='5';near(m,28.8);
});

test('existing bucket-count inputs keep their meaning on import and the spacing helper can be reversed',()=>{
  const old=setup('bucketFlow');old.version=5;old.formulas[0].expression.args.N=E.symbol('N_meter');
  old.inputValues={'N_meter:countPerLength':'20'};old.inputUnits={'N_meter:countPerLength':'per_m'};
  const m=E.validateModel(old);assert.equal(m.formulas[0].expression.args.N.kind,'symbol');
  assert.equal(m.inputValues['formula:bucket:N_meter:countPerLength'],'20');
  assert(E.rearrangements('bucketCountFromSpacing').some(o=>o.key==='s'&&o.available));
  const inverse=setup('inverse:bucketCountFromSpacing:s');inverse.inputValues={'formula:bucket:N_meter:countPerLength':'5'};
  inverse.formulas[0].resultUnit='cm';near(inverse,20);
});
