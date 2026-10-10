'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js');
const setup=(...ids)=>({version:6,title:'Standarder',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const close=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('new g inputs are filled in owners and nested/custom formulas; edits and clearing survive save/reopen',()=>{
 const m=setup('gravityForce');m.formulas.push(E.newCustomFormula('custom'));
 m.formulas[1].expression=E.customExpression('m * g','force',{m:{dimension:'mass',expression:E.symbol('m')},g:{dimension:'acceleration',expression:E.symbol('g')}});
 m.formulas.push({id:'nested',name:'Kraft',symbol:'F',dimension:'force',expression:E.newExpression('gravityForce')});
 E.initializeUnitChoices(m);
 for(const id of ['gravityForce','custom','nested'])assert.equal(m.inputValues[`formula:${id}:g:acceleration`],'9.82');
 m.inputValues['formula:gravityForce:m:mass']='10';
 close(E.evaluate(E.context(m).result('formula:gravityForce')).value,98.2);
 m.inputValues['formula:gravityForce:g:acceleration']='9.81';delete m.inputValues['formula:custom:g:acceleration'];
 E.initializeUnitChoices(m);const reopened=E.initializeUnitChoices(E.validateModel(E.clone(m)),false);E.initializeUnitChoices(reopened);
 assert.equal(reopened.inputValues['formula:gravityForce:g:acceleration'],'9.81');assert(!Object.hasOwn(reopened.inputValues,'formula:custom:g:acceleration'));
 const unrelated=setup('acceleration');E.initializeUnitChoices(unrelated);assert.deepEqual(unrelated.inputValues,{});
});

test('new heat-capacity fields/results prefer kJ/(kg·°C) and water converts once to SI',()=>{
 const m=E.initializeUnitChoices(setup('heatingEnergy','mixCapacity'));
 const key='formula:heatingEnergy:c_p:heatCapacity';assert.equal(m.inputUnits[key],'kJ_kgC');assert.equal(E.resultUnit(m.formulas[1]).id,'kJ_kgC');
 E.applyStandard(m,key,'standard-water-heat');m.inputValues['formula:heatingEnergy:m:mass']='2';m.inputValues['formula:heatingEnergy:ΔT:temperatureChange']='10';
 close(E.evaluate(E.context(m).target('formula:heatingEnergy')).value,83600);
 m.formulas[0].resultUnit='kJ';close(E.evaluate(E.context(m).result('formula:heatingEnergy')).value,83.6);
 const v={symbol:'c_p',dimension:'heatCapacity',scope:'formula:heatingEnergy'};
 assert.equal(E.inputValue(m,v),'4.18');assert.equal(E.inputUnit(m,v).label,'kJ/(kg·°C)');
});

test('imported implicit SI heat inputs and symbolic gravity retain their previous meaning',()=>{
 const old=setup('heatingEnergy','gravityForce');old.inputValues['formula:heatingEnergy:c_p:heatCapacity']='4180';
 const m=E.initializeUnitChoices(E.validateModel(old),false);E.initializeUnitChoices(m);
 assert.equal(m.inputUnits['formula:heatingEnergy:c_p:heatCapacity'],'J_kgK');assert.equal(m.inputValues['formula:heatingEnergy:c_p:heatCapacity'],'4180');
 assert(!Object.hasOwn(m.inputValues,'formula:gravityForce:g:acceleration'));
 m.formulas.push(E.newFormula('new','gravityForce'));E.initializeUnitChoices(m);assert.equal(m.inputValues['formula:new:g:acceleration'],'9.82');
});

test('custom standards round-trip, match only their dimension, and apply a freely editable copy with its unit',()=>{
 const m=E.initializeUnitChoices(setup('mass'));m.standards=[{id:'sugar',name:'Sukker · opgavens densitet',dimension:'density',value:'0.8',unit:'kg_L'}];
 const loaded=E.validateModel(E.clone(m));assert.deepEqual(loaded,m);
 assert.deepEqual(E.standardValues(loaded,'density').map(s=>s.id),['sugar']);assert(!E.standardValues(loaded,'heatCapacity').some(s=>s.id==='sugar'));
 E.applyStandard(loaded,'formula:mass:ρ:density','sugar');loaded.inputValues['formula:mass:V:volume']='2';
 close(E.evaluate(E.context(loaded).result('formula:mass')).value,1600);
 loaded.standards[0].value='1';assert.equal(loaded.inputValues['formula:mass:ρ:density'],'0.8');loaded.standards=[];
 close(E.evaluate(E.context(loaded).result('formula:mass')).value,1600);
 loaded.inputValues['formula:mass:ρ:density']='0.9';close(E.evaluate(E.context(loaded).result('formula:mass')).value,1800);
 assert.throws(()=>E.applyStandard(loaded,'formula:mass:ρ:density','standard-water-heat'),/passer ikke/);
});

test('standards reject invalid values, duplicate/reserved identities, wrong units and oversized lists',()=>{
 const m=setup(),s={id:'sugar',name:'Sukker',dimension:'density',value:'800',unit:'kg_m3'};
 for(const standards of [null,{},[s,s],[{...s,id:'standard-gravity'}],[{...s,name:' '}],[{...s,dimension:'unknown'}],[{...s,value:'NaN'}],[{...s,value:''}],[{...s,unit:'kJ_kgC'}],Array.from({length:101},(_,i)=>({...s,id:'s'+i}))])assert.throws(()=>E.validateModel({...m,standards}),/standard/);
 assert.equal(E.validateModel({...m,standards:[{...s,value:'0,8'}]}).standards[0].value,'0.8');
});

test('source menus prioritize own formulas, segregate all shape references, and preserve legacy expressions',()=>{
 const m=setup('volumePortion','boxVolume');m.shapes=[E.newShape('box','box',1)];
 const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const scope=vm.createContext({E,model:m,ownerTarget:()=> 'formula:volumePortion',esc,pretty:s=>s,pathAttr:()=>'',symbolHtml:E.mathSymbol,formulaTitle:f=>f.name,formulaSummary:()=>''});
 vm.runInContext(app.slice(app.indexOf('  function expressionEditor('),app.indexOf('  function inspectorHeader(')),scope);
 const html=scope.expressionEditor(E.symbol('V'),'volume',[],'V',E.context(m)),own=html.match(/<optgroup label="Brug en reference">(.*?)<\/optgroup>/s)[1],figures=html.match(/<optgroup label="Figur referencer">(.*?)<\/optgroup>/s)[1];
 assert(own.includes('ref:formula:boxVolume'));assert(!own.includes('ref:shape:'));assert(figures.includes('ref:shape:box:volume'));
 assert(html.indexOf('Egen formel')<html.indexOf('ref:formula:boxVolume'));assert(html.indexOf('ref:formula:boxVolume')<html.indexOf('Figur referencer'));
 assert(!html.includes('value="assembly"'));assert(!html.includes('value="material'));assert(!html.includes('Alle valgte beholderdele'));
 const legacy=scope.expressionEditor(E.assembly('volume','materialVolume'),'volume',[],'V',E.context(m));assert(legacy.includes('value="material" selected'));assert(legacy.includes('Tidligere plademateriale'));
 const saved=E.validateModel({...m,formulas:[{id:'legacy',name:'Gammel sum',dimension:'volume',symbol:'V',expression:E.assembly('volume','materialVolume')}]});assert.equal(saved.formulas[0].expression.property,'materialVolume');
});
