'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const setup=(...ids)=>E.initializeUnitChoices({version:6,title:'Resultater',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function harness(model){
 const panel={innerHTML:''},scope=vm.createContext({E,model,resultVisible:true,Intl,esc,symbolHtml:E.mathSymbol,$:()=>panel});
 const excerpt=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b));
 vm.runInContext(excerpt('  function renderResult(','  function unitOptions(')+excerpt('  function renderResults(','  function standardUnitControl('),scope);
 return {scope,show:ctx=>{scope.renderResults(ctx);return panel.innerHTML;}};
}

test('result markers round-trip strictly without changing old setups or calculations',()=>{
 const m=setup('gravityForce');m.formulas[0].isResult=true;m.inputValues['formula:gravityForce:m:mass']='2';
 const loaded=E.validateModel(JSON.parse(JSON.stringify(m)));assert.deepEqual(loaded,m);
 assert.equal(E.evaluate(E.context(loaded).result('formula:gravityForce')).value,19.64);
 delete loaded.formulas[0].isResult;assert(!Object.hasOwn(E.validateModel(loaded).formulas[0],'isResult'));
 for(const bad of ['true',1,null,{},[]])assert.throws(()=>E.validateModel({...m,formulas:[{...m.formulas[0],isResult:bad}]}),/resultatmarkering/);
});

test('copies need their own marker while in-place equation and figure isolation retain it',()=>{
 const m=setup('mass');m.formulas[0].isResult=true;
 const duplicate=E.duplicateFormula(m,'mass','copy');assert(duplicate.formulas[0].isResult);assert(!duplicate.formulas[1].isResult);
 assert(E.rearrangeFormula(m,'mass','inverse:mass:V').formulas[0].isResult);
 assert(!E.rearrangeFormula(m,'mass','inverse:mass:V','inverse').formulas.at(-1).isResult);
 const geometry=setup();geometry.shapes=[E.newShape('box','box',1)];geometry.formulas=[{id:'total',name:'Rumfang',symbol:'V',dimension:'volume',expression:E.assembly('volume'),isResult:true}];
 const key='shape:box:h_1:length';
 assert(E.isolateFigureFormula(geometry,'total',key).formulas[0].isResult);
 assert(!E.isolateFigureFormula(geometry,'total',key,'height').formulas.at(-1).isResult);
 assert(m.formulas[0].isResult);
});

test('overview follows group and formula order, includes only marked items, and escapes names',()=>{
 let m=setup('gravityForce','rectangleArea','mass','heatingEnergy');
 m=E.addFormulaGroup(m,'empty','Tom');m=E.addFormulaGroup(m,'forces','Kræfter <test>');m=E.addFormulaGroup(m,'areas','Areal');
 m=E.assignFormulaGroup(m,'gravityForce','forces');m=E.assignFormulaGroup(m,'mass','forces');m=E.assignFormulaGroup(m,'rectangleArea','areas');
 for(const f of m.formulas)f.isResult=f.id!=='rectangleArea';m.formulas[2].name='<script>test</script>';
 const h=harness(m),html=h.show();
 assert(!html.includes('<h3>Tom'));assert(!html.includes('<h3>Areal'));assert(!html.includes('data-result-id="rectangleArea"'));
 assert(html.indexOf('Kræfter &lt;test&gt;')<html.indexOf('Uden gruppe'));
 assert(html.indexOf('data-result-id="gravityForce"')<html.indexOf('data-result-id="mass"'));
 assert(html.includes('&lt;script&gt;test&lt;/script&gt;'));assert(!html.includes('<script>'));
 h.scope.model=E.moveFormula(m,'mass',-1);const moved=h.show();assert(moved.indexOf('data-result-id="mass"')<moved.indexOf('data-result-id="gravityForce"'));
 h.scope.model.formulas=[];assert.match(h.show(),/Ingen markerede resultater endnu/);
});

test('overview recalculates live references in the selected units without rounding stored inputs',()=>{
 const m=setup('rectangleArea');m.formulas[0].isResult=true;
 m.inputUnits['formula:rectangleArea:B:length']='m';m.inputUnits['formula:rectangleArea:L:length']='m';
 m.inputValues['formula:rectangleArea:B:length']='2.003234';m.inputValues['formula:rectangleArea:L:length']='1000';
 m.formulas.push({id:'next',name:'Næste resultat',symbol:'A2',dimension:'area',resultUnit:'cm2',expression:E.ref('formula:rectangleArea'),isResult:true});
 const h=harness(m),before=JSON.stringify(m),html=h.show();
 assert.match(html,/<strong>2003,234<\/strong>/);assert.match(html,/<strong>20032340,000<\/strong>/);assert.match(html,/>cm²<\/span>/);
 assert.match(html,/Kort formel/);assert(html.includes('result-card-formula'));assert.equal(JSON.stringify(m),before);
 m.inputValues['formula:rectangleArea:B:length']='3';assert.match(h.show(),/<strong>30000000,000<\/strong>/);
 delete m.inputValues['formula:rectangleArea:B:length'];const missing=h.show();assert.match(missing,/Udfyld de manglende værdier/);assert(!missing.includes('<output'));
 m.formulas[1].expression=E.ref('formula:missing');assert.match(h.show(),/inline-error/);
});

test('calculator-off overview never evaluates and TMS uses the same duration format as the builder',()=>{
 const m=setup('timeSum');m.formulas[0].isResult=true;m.inputValues['formula:timeSum:t_1:time']='3600';m.inputValues['formula:timeSum:t_2:time']='1800';
 const h=harness(m);assert.match(h.show(),/<strong>01:30:00<\/strong>/);
 h.scope.resultVisible=false;assert.match(h.show({safe:()=>{throw Error('must not evaluate');}}),/Slå lommeregneren til/);
 assert.equal(h.scope.renderResult(E.context(m),m.formulas[0]),'');
 h.scope.resultVisible=true;delete m.inputValues['formula:timeSum:t_1:time'];
 assert.match(h.scope.renderResult(E.context(m),m.formulas[0]),/data-action="mark-result"[^>]*checked/);
 delete m.formulas[0].isResult;assert.match(h.scope.renderResult(E.context(m),m.formulas[0]),/data-action="mark-result"[^>]*disabled/);
});
