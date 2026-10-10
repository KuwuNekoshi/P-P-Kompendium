'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const setup=(...formulas)=>({version:6,title:'Del af volumen',tank:E.defaultTank(),shapes:[],connections:[],inputUnits:{},inputValues:{},formulas});
const result=(m,id,output=true)=>{const c=E.context(m),r=E.evaluate(output?c.result('formula:'+id):c.target('formula:'+id));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;};
const near=(a,b)=>assert(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('volume portion accepts 25 as percent and preconverts it exactly once before display',()=>{
 const m=E.initializeUnitChoices(setup(E.newFormula('portion','volumePortion')));
 assert.equal(m.inputUnits['formula:portion:f_vol:scalar'],'percent');assert.equal(E.resultUnit(m.formulas[0]).id,'m3');
 m.inputValues['formula:portion:V_total:volume']='8';
 for(const [p,expected]of [['0',0],['25',2],['25,5',2.04],['100',8]]){
  m.inputValues['formula:portion:f_vol:scalar']=p;near(result(m,'portion'),expected);
 }
 m.inputValues['formula:portion:f_vol:scalar']='25';
 assert.equal(E.plain(E.context(m).result('formula:portion'),null,'values'),'8 · 0,25');
 assert.equal(m.inputValues['formula:portion:f_vol:scalar'],'25');
 m.inputValues['formula:portion:V_total:volume']='8000';m.inputUnits['formula:portion:V_total:volume']='L';near(result(m,'portion'),2);
 m.formulas[0].resultUnit='L';near(result(m,'portion'),2000);near(result(m,'portion',false),2);
});

test('references use SI volume once, independent portions keep their own percentages, and save/reopen keeps units',()=>{
 const source=E.newFormula('volume','boxVolume'),first=E.newFormula('first','volumePortion'),second=E.newFormula('second','volumePortion');
 source.resultUnit='L';first.expression.args.V=E.ref('formula:volume');second.expression.args.V=E.ref('formula:volume');
 const m=E.initializeUnitChoices(setup(source,first,second));
 m.inputValues={'formula:volume:L:length':'2000','formula:volume:B:length':'2000','formula:volume:h:length':'2000','formula:first:f_vol:scalar':'25','formula:second:f_vol:scalar':'50'};
 near(result(m,'volume'),8000);near(result(m,'first'),2);near(result(m,'second'),4);
 m.inputValues['formula:first:f_vol:scalar']='10';near(result(m,'first'),.8);near(result(m,'second'),4);
 m.inputValues['formula:volume:h:length']='3000';near(result(m,'first'),1.2);near(result(m,'second'),6);
 const reopened=E.initializeUnitChoices(E.validateModel(E.clone(m)),false);assert.deepEqual(reopened,m);near(result(reopened,'first'),1.2);
 m.inputUnits['formula:first:f_vol:scalar']='number';m.inputValues['formula:first:f_vol:scalar']='0.25';E.initializeUnitChoices(m);near(result(m,'first'),3);
 const explicit=E.initializeUnitChoices(E.validateModel(E.clone(m)),false);assert.equal(explicit.inputUnits['formula:first:f_vol:scalar'],'number');near(result(explicit,'first'),3);
 // Legacy/explicit implicit SI values are frozen before applying new defaults.
 const old=setup(E.newFormula('old','volumePortion'));old.inputValues={'formula:old:V_total:volume':'8','formula:old:f_vol:scalar':'0.25'};
 E.initializeUnitChoices(old,false);E.initializeUnitChoices(old);assert.equal(old.inputUnits['formula:old:f_vol:scalar'],'number');near(result(old,'old'),2);
});

test('inline portions, figure assemblies and downstream Hx use the same percentage defaults and references',()=>{
 const m=setup(E.newFillHeight('hx','tank'),E.newFormula('portion','volumePortion'));
 m.shapes.push(E.newShape('box','tank',1));m.formulas[1].expression.args.V=E.assembly('volume',undefined,'tank');m.formulas[0].expression.volume=E.ref('formula:portion');
 E.initializeUnitChoices(m);
 m.inputValues={'shape:tank:L_1:length':'2000','shape:tank:B_1:length':'1000','shape:tank:h_1:length':'4000','formula:portion:f_vol:scalar':'25'};
 near(result(m,'portion'),2);near(result(m,'hx'),1000);
 m.formulas[0].expression.volume=E.newExpression('volumePortion');m.formulas[0].expression.volume.args.V=E.assembly('volume',undefined,'tank');E.initializeUnitChoices(m);
 assert.equal(m.inputUnits['formula:hx:f_vol:scalar'],'percent');m.inputValues['formula:hx:f_vol:scalar']='50';near(result(m,'hx'),2000);near(result(m,'portion'),2);
});

test('a percentage reference is not divided by 100 twice and the percentage can be isolated in place',()=>{
 const percentage={id:'fraction',name:'Fyldningsgrad',symbol:'f',dimension:'scalar',expression:E.symbol('f'),resultUnit:'percent'},portion=E.newFormula('portion','volumePortion');
 portion.expression.args.f=E.ref('formula:fraction');const m=E.initializeUnitChoices(setup(percentage,portion));
 m.inputUnits['formula:fraction:f:scalar']='percent';m.inputValues={'formula:fraction:f:scalar':'25','formula:portion:V_total:volume':'8'};
 near(result(m,'fraction'),25);near(result(m,'portion'),2);
 const given=E.initializeUnitChoices(setup(E.newFormula('portion','volumePortion')));given.inputValues['formula:portion:V_total:volume']='8';
 const inverse=E.rearrangeFormula(given,'portion','inverse:volumePortion:f');assert.equal(inverse.formulas.length,1);assert.equal(inverse.formulas[0].resultUnit,'percent');
 inverse.inputValues['formula:portion:V_del:volume']='2';near(result(inverse,'portion'),25);
 const fresh=E.newFormula('inverse','inverse:volumePortion:f');assert.equal(fresh.resultUnit,'percent');
});

test('Qm mixture: known 64% flow finds total in place, then 20% and remaining 16% via live references',()=>{
 const source=E.newFormula('tank1','massFlow'),portion=E.newFormula('total','massFlowPortion');
 let m=E.initializeUnitChoices(setup(source,portion));
 m.inputValues={'formula:tank1:ρ:density':'1000','formula:tank1:Q_v:flow':'6.4','formula:total:f_qm:scalar':'64'};
 near(result(m,'tank1'),6.4);
 m=E.rearrangeFormula(m,'total','inverse:massFlowPortion:total');
 assert.equal(m.formulas.length,2);assert.equal(m.formulas[1].id,'total');assert.equal(E.resultUnit(m.formulas[1]).id,'ton_h');
 m.formulas[1].expression.args.given=E.ref('formula:tank1');
 const tank2=E.newFormula('tank2','massFlowPortion'),tank3=E.newFormula('tank3','massFlowPortion'),rest=E.newFormula('rest','percentageRemainder');
 tank2.expression.args.total=E.ref('formula:total');tank3.expression.args.total=E.ref('formula:total');tank3.expression.args.f=E.ref('formula:rest');
 m.formulas.push(tank2,tank3,rest);E.initializeUnitChoices(m);
 Object.assign(m.inputValues,{'formula:tank2:f_qm:scalar':'20','formula:rest:f_1:scalar':'64','formula:rest:f_2:scalar':'20'});
 near(result(m,'total'),10);near(result(m,'tank2'),2);near(result(m,'rest'),16);near(result(m,'tank3'),1.6);
 // Source and total output units do not alter the physical quantities in the chain.
 m.formulas[0].resultUnit='kg_s';m.formulas[1].resultUnit='kg_h';near(result(m,'total'),10000);near(result(m,'tank3'),1.6);
 m.inputValues['formula:tank1:Q_v:flow']='12.8';near(result(m,'total'),20000);near(result(m,'tank3'),3.2);
 const reopened=E.initializeUnitChoices(E.validateModel(E.clone(m)),false);near(result(reopened,'tank3'),3.2);
 m.inputValues['formula:total:f_qm:scalar']='0';assert.equal(E.evaluate(E.context(m).result('formula:total')).status,'error');
});

test('Qv and mass portions support local percent input, total and percentage inverses and compatible references',()=>{
 for(const [formula,dimension,symbol,fsym,unit,total]of [['flowPortion','flow','Qv','f_qv','m3_h',10],['massPortion','mass','m','f_m','kg',800]]){
  let m=E.initializeUnitChoices(setup(E.newFormula('part',formula)));
  assert.equal(E.resultUnit(m.formulas[0]).id,unit);
  m.inputValues[`formula:part:${symbol}_total:${dimension}`]=String(total);m.inputValues[`formula:part:${fsym}:scalar`]='25';near(result(m,'part'),total*.25);
  m=E.rearrangeFormula(m,'part','inverse:'+formula+':total');m.inputValues[`formula:part:${symbol}_del:${dimension}`]=String(total*.25);near(result(m,'part'),total);
  m=E.rearrangeFormula(m,'part','inverse:'+formula+':f');assert.equal(E.resultUnit(m.formulas[0]).id,'percent');near(result(m,'part'),25);
 }
});

test('remainder percentages retain percent defaults when used inline or inverted',()=>{
 const rest=E.newFormula('rest','inverse:percentageRemainder:f1'),part=E.newFormula('part','volumePortion');
 part.expression.args.f=E.newExpression('percentageRemainder');const m=E.initializeUnitChoices(setup(rest,part));
 assert.equal(m.inputUnits['formula:rest:f_rest:scalar'],'percent');assert.equal(m.inputUnits['formula:part:f_1:scalar'],'percent');
 m.inputValues={'formula:rest:f_rest:scalar':'16','formula:rest:f_2:scalar':'20','formula:part:V_total:volume':'10','formula:part:f_1:scalar':'64','formula:part:f_2:scalar':'20'};
 near(result(m,'rest'),64);near(result(m,'part'),1.6);
});
