'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const setup=(...ids)=>E.initializeUnitChoices({version:6,title:'Omskriv på stedet',tank:E.defaultTank(),shapes:[],formulas:ids.map(id=>E.newFormula(id,id)),connections:[],inputUnits:{},inputValues:{}});
const near=(a,b)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const value=(m,id)=>{const r=E.evaluate(E.context(m).result('formula:'+id));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;};
const set=(m,id,symbol,dimension,value)=>{m.inputValues[`formula:${id}:${symbol}:${dimension}`]=String(value);};
test('basic isolation keeps the same ID, row, group, custom name and other inputs',()=>{
 let m=setup('diameter','fillTime','flow');m=E.addFormulaGroup(m,'task','Opgave');m=E.assignFormulaGroup(m,'fillTime','task');
 const index=m.formulas.findIndex(f=>f.id==='fillTime');m.formulas[index].name='Min tank';m.formulas[index].resultUnit='min';
 set(m,'fillTime','Q_v','flow',12);set(m,'fillTime','t','time',5);const original=JSON.stringify(m),ids=m.formulas.map(f=>f.id);
 const next=E.rearrangeFormula(m,'fillTime','inverse:fillTime:V'),f=next.formulas[index];
 assert.equal(JSON.stringify(m),original);assert.deepEqual(next.formulas.map(f=>f.id),ids);assert.equal(f.id,'fillTime');assert.equal(f.name,'Min tank');assert.equal(f.groupId,'task');assert.equal(f.dimension,'volume');
 assert.equal(next.inputUnits['formula:fillTime:t:time'],'min');near(value(next,'fillTime'),1);
 assert.equal(next.inputValues['formula:fillTime:Q_v:flow'],'12');assert.deepEqual(E.validateModel(next),next);
});
test('references to the old result follow its known input, including repeated inversions',()=>{
 let m=setup('fillTime','distance');m.formulas[1].expression.args.t=E.ref('formula:fillTime');
 set(m,'distance','v','velocity',2);set(m,'fillTime','t','time',5);set(m,'fillTime','Q_v','flow',12);
 m=E.rearrangeFormula(m,'fillTime','inverse:fillTime:V');near(value(m,'distance'),10000);near(value(m,'fillTime'),1/60);
 assert.equal(m.formulas[1].expression.args.t.target,'formula:fillTime:quantity:fillTime:given');
 // The previous input's unit is still seconds. No cached numerical result is substituted.
 set(m,'fillTime','t','time',10);near(value(m,'distance'),20000);
 m=E.rearrangeFormula(m,'fillTime','fillTime');set(m,'fillTime','V','volume',1);near(value(m,'fillTime'),300);near(value(m,'distance'),600000);
 assert.equal(m.formulas.length,2);assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
 assert.doesNotThrow(()=>G.create(E.context(m),'formula:distance'));
});
test('same-dimension inversions keep diameter consumers on diameter, not radius',()=>{
 let m=setup('diameter','circleArea');m.formulas[1].expression.args.D=E.ref('formula:diameter');set(m,'diameter','D','length',1000);
 m=E.rearrangeFormula(m,'diameter','inverse:diameter:r');near(value(m,'diameter'),500);near(value(m,'circleArea'),Math.PI/4);
 set(m,'diameter','D','length',2000);near(value(m,'diameter'),1000);near(value(m,'circleArea'),Math.PI);
 const name=m.formulas[0].symbol;m=E.rearrangeFormula(m,'diameter','diameter');set(m,'diameter',name,'length',500);near(value(m,'circleArea'),Math.PI/4);
});
test('in-place inversion also works at the 40-formula limit and keeps references on known inputs',()=>{
 const m=setup('fillTime','flow');m.formulas[0].expression.args.Q=E.ref('formula:flow');for(let i=2;i<40;i++)m.formulas.push(E.newFormula('f'+i,'diameter'));
 const next=E.rearrangeFormula(m,'fillTime','inverse:fillTime:V');assert.equal(next.formulas.length,40);assert.equal(next.formulas[0].expression.args.Q.target,'formula:flow');
 assert.throws(()=>E.rearrangeFormula(m,'fillTime','inverse:fillTime:V','extra'),/40/);
});
function geometry(){
 const m=setup();m.shapes=[E.newShape('box','box',1)];m.formulas=[{id:'tank',name:'Tankens rumfang',symbol:'V_total',dimension:'volume',expression:E.assembly('volume',undefined,'box')},E.newFormula('time','fillTime')];
 m.formulas[1].expression.args.V=E.ref('formula:tank');E.initializeUnitChoices(m);
 m.inputValues={'shape:box:L_1:length':'3000','shape:box:B_1:length':'2000','shape:box:h_1:length':'9999','formula:tank:V_total:volume':'24','formula:time:Q_v:flow':'12'};return m;
}
test('figure isolation replaces the assembly without a self-reference and keeps volume consumers valid',()=>{
 const m=geometry(),before=JSON.stringify(m),next=E.isolateFigureFormula(m,'tank','shape:box:h_1:length');
 assert.equal(JSON.stringify(m),before);assert.equal(next.formulas.length,2);assert.equal(next.formulas[0].id,'tank');assert.equal(next.formulas[0].expression.source.kind,'assembly');
 near(value(next,'tank'),4000);near(value(next,'time'),7200);set(next,'tank','V_total','volume',30);near(value(next,'tank'),5000);near(value(next,'time'),9000);
 assert(!E.references(next.formulas[0].expression,next).includes('formula:tank'));
 const total=E.totalHeightFromMeasure(next,'tank','height');near(value(total,'height'),5); // helper returns base unit until UI defaults are assigned
 assert.deepEqual(E.validateModel(next),next);
});
test('existing dependent figure inversions retain the original geometric expression',()=>{
 let m=geometry();m=E.isolateFigureFormula(m,'tank','shape:box:B_1:length','width');set(m,'width','V_total','volume',24);
 m=E.isolateFigureFormula(m,'tank','shape:box:h_1:length');
 assert.equal(m.formulas[2].expression.source.target,'formula:tank:quantity:figure:source');
 near(value(m,'width'),24/(3*9.999)*1000);near(value(m,'tank'),4000);
 assert.deepEqual(E.validateModel(m),m);
});
test('figure isolation retains locally scoped terms and selected units in a custom source',()=>{
 const m=geometry();m.formulas[0].expression=E.customExpression('V_part + V_extra','volume',{V_part:{dimension:'volume',expression:E.assembly('volume',undefined,'box')},V_extra:{dimension:'volume',expression:E.symbol('V_extra')}});
 set(m,'tank','V_extra','volume',6);const next=E.isolateFigureFormula(m,'tank','shape:box:h_1:length');near(value(next,'tank'),3000);near(value(next,'time'),7200);
 const local=E.variables(E.context(next).target('formula:tank')).find(v=>v.symbol==='V_extra');assert.equal(local.scope,'formula:tank');assert.equal(local.inputValue,'6');
});
test('shape and custom consumers are rebound and missing quantity references fail clearly',()=>{
 let m=setup('diameter');m.shapes=[E.newShape('cylinder','shape',1)];m.shapes[0].inputs.D=E.ref('formula:diameter');m.formulas.push(E.newCustomFormula('sum'));m.formulas[1].expression=E.customExpression('D * 2','length',{D:{dimension:'length',expression:E.ref('formula:diameter')}});
 set(m,'diameter','D','length',1000);m=E.rearrangeFormula(m,'diameter','inverse:diameter:r');E.initializeUnitChoices(m);
 near(value(m,'sum'),2000);assert.equal(m.shapes[0].inputs.D.target,m.formulas[1].expression.args.D.expression.target);
 assert(E.usersOf(m,'formula','diameter').length>=2);
 m.formulas.shift();const error=E.context(m).safe('formula:sum');assert.equal(error.ok,false);assert.match(error.error,/reference mangler/);
});
test('production Isolér control changes the selected formula without allocating another ID',()=>{
 const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),handlers={};let saves=0;
 const scope=vm.createContext({E,model:setup('fillTime'),tutorial:null,expanded:false,save:()=>saves++,render:()=>{},notify:s=>{scope.message=s;},select:(type,id)=>{scope.activeId=id;},newId:()=>{throw Error('Must reuse the ID');},document:{addEventListener:(t,fn)=>handlers[t]=fn}});
 vm.runInContext(app.slice(app.indexOf("  document.addEventListener('change',event=>{"),app.indexOf("  document.addEventListener('input',event=>{")),scope);
 handlers.change({target:{value:'inverse:fillTime:V',dataset:{action:'rearrange-formula',id:'fillTime'}}});
 assert.equal(scope.model.formulas.length,1);assert.equal(scope.model.formulas[0].id,'fillTime');assert.equal(scope.model.formulas[0].dimension,'volume');assert.equal(scope.activeId,'fillTime');assert.equal(saves,1);assert.match(scope.message,/omskrevet/);
});
