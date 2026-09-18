'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const model=(...ids)=>({version:5,inputUnits:{},inputValues:{},title:'Formelkontrol',tank:E.defaultTank(),shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const result=(m,id=m.formulas[0].id)=>E.evaluate(E.context(m).result('formula:'+id,'expanded'));
const near=(actual,expected)=>{assert.equal(actual.status,'ready',actual.error);assert(Math.abs(actual.value-expected)<1e-10*Math.max(1,Math.abs(expected)),`${actual.value} != ${expected}`);};
const constant=value=>({type:'constant',value:String(value)});
const op=(type,...children)=>({type,children});

test('complete values evaluate without mutating the formula; missing values and zero are distinct',()=>{
  const m=model('rectangleArea');m.inputValues={'B:length':'50','L:length':'30'};
  const ast=E.context(m).result('formula:rectangleArea'),before=JSON.stringify({m,ast});
  near(E.evaluate(ast),1500);assert.equal(JSON.stringify({m,ast}),before);
  delete m.inputValues['B:length'];
  assert.deepEqual(result(m),{status:'incomplete',missing:[{symbol:'B',dimension:'length'}]});
  m.inputValues['B:length']='0';near(result(m),0);
  m.inputValues['B:length']='-2,5';near(result(m),-75);
});

test('result evaluation respects input units, output units, percentage and absolute temperature offsets',()=>{
  const belt=model('beltSpeed');belt.inputValues={'D:length':'500','n:rotationRate':'120'};
  belt.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};belt.formulas[0].resultUnit='m_min';
  near(result(belt),60*Math.PI);
  const mass=model('mass');mass.inputValues={'ρ:density':'7.85','V:volume':'2'};mass.inputUnits={'ρ:density':'ton_m3'};
  near(result(mass),15700);mass.formulas[0].resultUnit='ton';near(result(mass),15.7);
  const power=model('inputPower');power.inputValues={'P_teo:power':'8','η:scalar':'80'};
  power.inputUnits={'P_teo:power':'kW','η:scalar':'percent'};power.formulas[0].resultUnit='kW';near(result(power),10);
  const temperature=model('temperatureDifference');temperature.inputUnits={'T_start:temperature':'C','T_slut:temperature':'C'};
  const inverse=E.rearrangeFormula(temperature,'temperatureDifference','inverse:temperatureDifference:end','end');
  inverse.formulas.at(-1).resultUnit='C';inverse.inputValues={'T_start:temperature':'-20','ΔT:temperatureChange':'30'};
  near(result(inverse,'end'),10);
});

test('live references compute the source without rounding or using a supplied value for its result symbol',()=>{
  const m=model('rectangleArea','flow');m.inputValues={'L:length':'30','B:length':'50','v:velocity':'2','A:area':'999'};
  m.formulas[0].resultUnit='cm2';m.formulas[1].resultUnit='m3_h';
  m.formulas[1].expression.args.A=E.ref('formula:rectangleArea');
  near(result(m,'flow'),10800000);
  m.inputValues['B:length']='40';near(result(m,'flow'),8640000);
  delete m.inputValues['B:length'];assert.equal(result(m,'flow').status,'incomplete');
  // A quotient subsequently multiplied by 3000 must not use a rounded 0.333.
  near(E.evaluate(op('mul',op('div',constant(1),constant(3)),constant(3000))),1000);
});

test('undefined and non-real operations return useful errors instead of a result',()=>{
  const cases=[
    [op('div',constant(1),constant(0)),/dividere med 0/],
    [op('sqrt',constant(-1)),/Kvadratroden/],
    [op('pow',constant(-2),constant(.5)),/reelt tal/],
    [op('pow',constant(0),constant(0)),/ikke defineret/],
    [op('pow',constant(0),constant(-1)),/ikke defineret/],
    [op('mul',constant('1e308'),constant(10)),/talområde/],
    [constant('Infinity'),/ukendt konstant/],
    [{type:'symbol',symbol:'x',dimension:'scalar',inputValue:'2+3'},/gyldigt tal/],
    [op('unknown',constant(1)),/ukendt operation/]
  ];
  for(const [ast,message]of cases){const answer=E.evaluate(ast);assert.equal(answer.status,'error');assert.match(answer.error,message);}
  near(E.evaluate(op('pow',constant(-8),op('div',constant(1),constant(3)))),-2);
  near(E.evaluate(op('sqrt',constant(9))),3);
  assert.equal(Object.is(E.evaluate(constant('-0')).value,-0),false);
});
