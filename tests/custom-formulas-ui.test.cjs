'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function model(){
 const s=E.newShape('box','s',1);s.name='<b>Min kasse</b>';
 return {version:6,title:'Mål',shapes:[s],tank:E.defaultTank(),connections:[],inputUnits:{},inputValues:{'shape:s:L_1:length':'3','shape:s:B_1:length':'2','shape:s:h_1:length':'4'},formulas:[{id:'total',name:'Samlet rumfang',symbol:'V_total',dimension:'volume',expression:E.assembly('volume',undefined,'s')}]};
}
function harness(m){
 const elements=new Map(),handlers={},fields=new Map();let saves=0,uid=0;
 const get=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',hidden:false,classList:{toggle(){}},focus(){}});return elements.get(selector);};
 const scope=vm.createContext({E,model:m,activeId:'total',selected:{type:'formula',id:'total'},tutorial:null,valueDisplay:'both',expanded:true,libraryQuery:'',valueDrafts:new Map(),resultVisible:false,
  esc,pretty:s=>s,pathAttr:p=>esc(JSON.stringify(p)),symbolHtml:E.mathSymbol,displayMath:(ast,lhs,unit)=>E.math(ast,lhs,unit,scope.valueDisplay),formulaTitle:f=>f.name,schoolRef:()=>'',icon:()=>'',
  $:get,newId:prefix=>prefix+'-'+(++uid),save:()=>saves++,render:()=>{},notify:message=>{scope.lastMessage=message;},closeDialog:()=>{},select:(type,id)=>{scope.activeId=id;},
  active:()=>scope.model.formulas.find(f=>f.id===scope.activeId),quantityOwner:()=>'',
  renderResult:()=>'',valueDisplayControl:()=>'',rearrangeControl:()=>'',renderCalculatorGuide:()=>{},renderUnitGuide:()=>{},
  openDialog:(title,body)=>{scope.dialogBody=body;},document:{addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]}});
 scope.getAt=p=>p.reduce((a,k)=>a?.[k],scope.model);scope.setAt=(p,v)=>scope.getAt(p.slice(0,-1))[p.at(-1)]=v;
 const excerpt=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b));
 vm.runInContext(excerpt('  function ownerTarget(','  function notify(')+excerpt('  function formulaSummary(','  function renderSidebar(')+excerpt('  function expressionEditor(','  function inspectorHeader(')+excerpt('  function rearrangeControl(','  function valueDisplayControl(')+excerpt('  function renderLibraryResults(','  function changeView(')+excerpt('  function useAssembly(','  function replaceSetup(')+excerpt('  function customFormulaDialog(','  function addShape(')+excerpt("  document.addEventListener('click',event=>{","  $('#file-input')?.addEventListener('change'"),scope);
 scope.render=()=>{};
 scope.fields=fields;get('#app-dialog').querySelector=selector=>{if(!fields.has(selector))fields.set(selector,{value:'',textContent:'',focus(){}});return fields.get(selector);};
 return {scope,get,saves:()=>saves,click:(action,extra={})=>handlers.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action,...extra}}:null}}),change:(action,value,path,extra={})=>handlers.change({target:{value,dataset:{action,path:JSON.stringify(path),...extra}}})};
}
test('custom formulas are discoverable, grouped, and expose per-variable sources',()=>{
 const m=E.addFormulaGroup(model(),'task','Opgave'),h=harness(m);h.scope.libraryQuery='egen formel';h.scope.renderLibraryResults();
 assert.match(h.get('.library-results').innerHTML,/data-formula="custom"/);
 h.scope.formulaPicker('task');assert.match(h.scope.dialogBody,/data-formula="custom" data-group="task"/);
 h.scope.addFormula('custom','task');const f=h.scope.model.formulas.at(-1);assert.equal(f.groupId,'task');assert.equal(f.expression.kind,'custom');
 const html=h.scope.expressionEditor(f.expression,'length',['formulas',1,'expression'],f.symbol,E.context(h.scope.model));
 assert.match(html,/Redigér udtryk og resultat/);assert.match(html,/Størrelse for h_top/);assert.match(html,/ref:shape:s:input:h/);
});
test('saving custom expressions preserves bindings; syntax errors preserve the existing model',()=>{
 const m=model(),f=E.newCustomFormula('custom');m.formulas.push(f);f.expression.args.h_top.expression=E.ref('shape:s:input:h');
 const h=harness(m),path=['formulas',1,'expression'];h.scope.customFormulaDialog(path,'length');
 assert.match(h.scope.dialogBody,/data-custom-result/);assert.match(h.scope.dialogBody,/h_top \+ h_midte \+ h_bund/);
 h.scope.fields.get('[data-custom-text]').value='h_top + ekstra';
 h.get('#app-dialog').querySelector('[data-custom-symbol]').value='H_total';h.get('#app-dialog').querySelector('[data-custom-result]').value='length';
 h.scope.saveCustomFormula(path,'length');const next=h.scope.model.formulas[1];
 assert.equal(next.symbol,'H_total');assert.equal(next.expression.args.h_top.expression.target,'shape:s:input:h');assert.equal(next.expression.args.ekstra.dimension,'length');
 const before=JSON.stringify(h.scope.model);h.scope.fields.get('[data-custom-text]').value='h_top + (';h.scope.saveCustomFormula(path,'length');
 assert.equal(JSON.stringify(h.scope.model),before);assert(h.scope.fields.get('[data-custom-error]').textContent.length>0);
});
test('changing a custom symbol dimension and source uses the normal reference and unit machinery',()=>{
 const m=model();m.formulas.push(E.newCustomFormula('custom'));const h=harness(m),arg=['formulas',1,'expression','args','h_top'];
 h.change('custom-dimension','volume',arg,{symbol:'h_top'});assert.equal(m.formulas[1].expression.args.h_top.dimension,'volume');
 h.change('source','ref:formula:total',[...arg,'expression'],{dimension:'volume',symbol:'h_top'});
 assert.equal(m.formulas[1].expression.args.h_top.expression.target,'formula:total');
 assert.match(h.scope.expressionEditor(m.formulas[1].expression,'length',['formulas',1,'expression'],'H',E.context(m)),/samme enhed/);
});
test('connected components have individual source choices and buttons preserve existing global formulas',()=>{
 let m=model();m.shapes.push(E.newShape('halfCylinder','bottom',2),E.newShape('box','other',3));m=E.connect(m,{shape:'s',face:'bottom'},{shape:'bottom',face:'top'},'joint');
 const h=harness(m),path=['formulas',0,'expression'];
 const html=h.scope.expressionEditor(E.assembly('volume'),'volume',path,'V',E.context(m));
 assert.match(html,/value="assembly:s"/);assert.match(html,/value="assembly:other"/);assert(!html.includes('value="assembly:bottom"'));assert(html.includes('&lt;b&gt;Min kasse&lt;/b&gt;'));
 h.change('source','assembly:other',path,{dimension:'volume',symbol:'V'});assert.equal(m.formulas[0].expression.shapeId,'other');
 h.scope.useAssembly('volume','s');const f=h.scope.model.formulas.at(-1);assert.equal(f.expression.shapeId,'s');assert.equal(h.scope.model.formulas[0].expression.shapeId,'other');
 const count=h.scope.model.formulas.length;h.scope.useAssembly('volume','bottom');assert.equal(h.scope.model.formulas.length,count,'another anchor in the same component reuses its formula');
 h.scope.useAssembly('area','other');assert.equal(h.scope.model.formulas.at(-1).dimension,'area');assert.equal(h.scope.model.formulas.at(-1).expression.shapeId,'other');
});
test('the isolated height offers a total-height action wired to live references',()=>{
 let m=model();m=E.isolateFigureFormula(m,'total','shape:s:h_1:length','height');const h=harness(m);
 assert.match(h.scope.rearrangeControl(m.formulas[1]),/data-action="total-height"/);h.click('total-height',{id:'height'});
 const f=h.scope.model.formulas.at(-1);assert.equal(f.expression.kind,'custom');assert(E.references(f.expression,h.scope.model).includes('formula:height'));
});
