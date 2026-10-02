'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const E=require('../dist/engine.js'),U=E.Units,app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const setup=(...ids)=>({version:6,title:'Standardenheder',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const close=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const answer=(m,id)=>{const r=E.evaluate(E.context(m).result('formula:'+id));assert.equal(r.status,'ready',r.error);return r.value;};
test('new quantities use mm, rpm, m3/h and ton/h while the equation basis remains SI',()=>{
 const m=E.initializeUnitChoices(setup('screwFlow','massFlow','gearedSpeed','diameter'));
 assert.equal(m.inputUnits['formula:screwFlow:D:length'],'mm');assert.equal(m.inputUnits['formula:screwFlow:n:rotationRate'],'rpm');
 assert.equal(m.inputUnits['formula:massFlow:Q_v:flow'],'m3_h');
 assert.equal(E.resultUnit(m.formulas[0]).id,'m3_h');assert.equal(E.resultUnit(m.formulas[1]).id,'ton_h');
 assert.equal(E.resultUnit(m.formulas[2]).id,'rpm');assert.equal(E.resultUnit(m.formulas[3]).id,'mm');
 for(const [d,base]of [['length','m'],['flow','m3_s'],['massFlow','kg_s'],['rotationRate','rev_s']])assert.equal(U.base(d).id,base);
 assert.deepEqual(E.validateModel(m),m);
});
test('the screw example accepts millimetres and rpm and returns cubic metres per hour by default',()=>{
 const m=E.initializeUnitChoices(setup('screwFlow','gearedSpeed'));
 m.formulas[0].expression.args.n=E.ref('formula:gearedSpeed');
 m.inputValues={'formula:screwFlow:D:length':'400','formula:screwFlow:d:length':'110','formula:screwFlow:s:length':'150','formula:screwFlow:η:scalar':'0.73','formula:gearedSpeed:n_ind:rotationRate':'720','formula:gearedSpeed:f:scalar':'15'};
 close(answer(m,'gearedSpeed'),48);close(answer(m,'screwFlow'),36.63234007525732);
 close(E.evaluate(E.context(m).target('formula:screwFlow')).value,36.63234007525732/3600);
});
test('a flow reference keeps full SI precision and mass flow comes out in tonnes per hour',()=>{
 const m=setup('flow','massFlow');m.formulas[1].expression.args.Q=E.ref('formula:flow');E.initializeUnitChoices(m);
 m.inputValues={'formula:flow:A:area':'1','formula:flow:v:velocity':'1','formula:massFlow:ρ:density':'1000'};
 close(answer(m,'flow'),3600);close(answer(m,'massFlow'),3600);
 m.formulas[1].expression.args.Q=E.symbol('Q_v');E.initializeUnitChoices(m);m.inputValues['formula:massFlow:Q_v:flow']='12';
 close(answer(m,'massFlow'),12);
});
test('defaults reach custom inputs, nested formulas, Hx, isolated values and separate surface thicknesses',()=>{
 const m=setup();m.shapes=[E.newShape('box','box',1)];m.shapes[0].plateThickness={bottom:E.symbol('t_bund')};
 const f=E.newCustomFormula('own');f.dimension='massFlow';f.expression=E.customExpression('a + b','massFlow',{a:{dimension:'massFlow',expression:E.symbol('Q_a')},b:{dimension:'massFlow',expression:E.newExpression('massFlow')}});m.formulas.push(f,E.newFillHeight('hx','box'),E.newFigureMeasure(m,'height'));
 // Use the catalog's volume formula ID, independent of its UI name.
 const candidate=Object.entries(E.FORMULAS).find(([,f])=>f.dimension==='volume'&&f.args.Q?.dimension==='flow'&&f.args.t?.dimension==='time');
 m.formulas[1].expression.volume=E.newExpression(candidate[0]);
 E.initializeUnitChoices(m);
 assert.equal(m.inputUnits['shape:box:h_1:length'],'mm');assert.equal(m.inputUnits['shape:box:t_bund:length'],'mm');assert.equal(m.inputUnits['tank:tank:t_plade:length'],'mm');
 assert.equal(m.inputUnits['formula:own:Q_a:massFlow'],'ton_h');assert.equal(m.inputUnits['formula:own:Q_v:flow'],'m3_h');
 assert.equal(m.inputUnits['formula:hx:'+candidate[1].args.Q.symbol+':flow'],'m3_h');assert.equal(E.resultUnit(m.formulas[1]).id,'mm');assert.equal(E.resultUnit(m.formulas[2]).id,'mm');
 assert.deepEqual(E.validateModel(m),m);
});
test('loading old implicit SI units preserves numbers, result units and subsequent new defaults',()=>{
 const old=setup('diameter','gearedSpeed','flow');old.inputValues={'formula:diameter:r:length':'2','formula:gearedSpeed:n_ind:rotationRate':'12','formula:gearedSpeed:f:scalar':'3','formula:flow:A:area':'1','formula:flow:v:velocity':'1'};
 old.shapes=[E.newShape('box','box',1)];
 const loaded=E.initializeUnitChoices(E.validateModel(JSON.parse(JSON.stringify(old))),false);
 close(answer(loaded,'diameter'),4);close(answer(loaded,'gearedSpeed'),4);close(answer(loaded,'flow'),1);
 assert.equal(loaded.inputUnits['shape:box:h_1:length'],'m');
 loaded.formulas.push(E.newFormula('new','diameter'));E.initializeUnitChoices(loaded);
 assert.equal(loaded.inputUnits['formula:new:r:length'],'mm');assert.equal(E.resultUnit(loaded.formulas.at(-1)).id,'mm');
 close(answer(loaded,'diameter'),4);assert.equal(E.resultUnit(loaded.formulas[2]).id,'m3_s');
 const reopened=E.initializeUnitChoices(E.validateModel(E.clone(loaded)),false);assert.deepEqual(reopened,loaded);
});
test('explicit selections, including SI units, survive initialization, copying and reopening',()=>{
 const m=E.initializeUnitChoices(setup('diameter','flow'));
 m.inputUnits['formula:diameter:r:length']='m';m.formulas[0].resultUnit='cm';m.formulas[1].resultUnit='m3_s';
 m.formulas.push(E.newFormula('copy','diameter'));E.copyInputs(m,'formula:diameter','formula:copy');E.initializeUnitChoices(m);
 assert.equal(m.inputUnits['formula:diameter:r:length'],'m');assert.equal(m.inputUnits['formula:copy:r:length'],'m');assert.equal(E.resultUnit(m.formulas[0]).id,'cm');assert.equal(E.resultUnit(m.formulas[1]).id,'m3_s');
 const saved=JSON.stringify(m);E.initializeUnitChoices(m);assert.equal(JSON.stringify(m),saved);
});
test('production save persists new defaults and changing back to metres stays selected',()=>{
 const m=setup('diameter'),handlers={},stored=new Map(),scope=vm.createContext({E,EXAM:false,model:m,tutorial:null,expanded:false,STORAGE:'setup',localStorage:{setItem:(k,v)=>stored.set(k,v)},$:()=>({}),render:()=>{},notify:()=>{},document:{addEventListener:(name,fn)=>handlers[name]=fn}});
 const excerpt=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b));
 vm.runInContext(excerpt('  function save() {','  function setTheme() {')+excerpt("  document.addEventListener('change',event=>{","  document.addEventListener('input',event=>{"),scope);
 scope.save();assert.equal(JSON.parse(stored.get('setup')).inputUnits['formula:diameter:r:length'],'mm');
 handlers.change({target:{value:'m',dataset:{action:'input-unit',id:'formula:diameter:r:length',symbol:'r',dimension:'length'}}});
 assert.equal(JSON.parse(stored.get('setup')).inputUnits['formula:diameter:r:length'],'m');scope.save();assert.equal(m.inputUnits['formula:diameter:r:length'],'m');
 // Persistence being unavailable must not prevent the defaults reaching the UI.
 scope.model=setup('massFlow');scope.localStorage.setItem=()=>{throw Error('unavailable');};scope.save();assert.equal(E.resultUnit(scope.model.formulas[0]).id,'ton_h');
});
