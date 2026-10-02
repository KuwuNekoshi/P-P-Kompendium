'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function model(){
 const s=E.newShape('box','s',1);s.name='<b>Min kasse</b>';
 return {version:6,title:'Mål',shapes:[s],tank:E.defaultTank(),connections:[],inputUnits:{},inputValues:{'shape:s:L_1:length':'3','shape:s:B_1:length':'2','shape:s:h_1:length':'4'},formulas:[{id:'total',name:'Samlet rumfang',symbol:'V_total',dimension:'volume',expression:E.assembly('volume',undefined,'s')}]};
}
function harness(m){
 const elements=new Map(),handlers={};let saves=0,uid=0;
 const get=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',hidden:false,classList:{toggle(){}},focus(){}});return elements.get(selector);};
 const scope=vm.createContext({E,model:m,activeId:'total',selected:{type:'formula',id:'total'},tutorial:null,valueDisplay:'both',expanded:true,libraryQuery:'',valueDrafts:new Map(),resultVisible:false,
  esc,pretty:s=>s,pathAttr:p=>esc(JSON.stringify(p)),symbolHtml:E.mathSymbol,displayMath:(ast,lhs,unit)=>E.math(ast,lhs,unit,scope.valueDisplay),formulaTitle:f=>f.name,schoolRef:()=>'',icon:()=>'',
  $:get,newId:prefix=>prefix+'-'+(++uid),save:()=>saves++,render:()=>{},notify:message=>{scope.lastMessage=message;},closeDialog:()=>{},select:(type,id)=>{scope.activeId=id;},
  active:()=>scope.model.formulas.find(f=>f.id===scope.activeId),quantityOwner:()=>'',
  renderResult:()=>'',valueDisplayControl:()=>'',rearrangeControl:()=>'',renderCalculatorGuide:()=>{},renderUnitGuide:()=>{},
  openDialog:(title,body)=>{scope.dialogBody=body;},document:{addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]}});
 scope.getAt=p=>p.reduce((a,k)=>a?.[k],scope.model);scope.setAt=(p,v)=>scope.getAt(p.slice(0,-1))[p.at(-1)]=v;
 const excerpt=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b));
 vm.runInContext(excerpt('  function ownerTarget(','  function notify(')+excerpt('  function formulaSummary(','  function renderSidebar(')+excerpt('  function expressionEditor(','  function inspectorHeader(')+excerpt('  function rearrangeControl(','  function valueDisplayControl(')+excerpt('  function renderLibraryResults(','  function changeView(')+excerpt('  function formulaPicker(','  function addShape(')+excerpt("  document.addEventListener('click',event=>{","  $('#file-input')?.addEventListener('change'"),scope);
 scope.render=()=>{};
 return {scope,get,saves:()=>saves,change:(action,value,path,extra={})=>handlers.change({target:{value,dataset:{action,path:JSON.stringify(path),...extra}}})};
}
test('figure inversions are searchable and the picker keeps the selected group',()=>{
 const h=harness(E.addFormulaGroup(model(),'task','Opgave'));h.scope.libraryQuery='isolér bredde';h.scope.renderLibraryResults();
 assert.match(h.get('.library-results').innerHTML,/data-formula="figureMeasure"/);
 h.scope.formulaPicker('task');assert.match(h.scope.dialogBody,/data-formula="figureMeasure" data-group="task"/);
 h.scope.addFormula('figureMeasure','task');const f=h.scope.model.formulas.at(-1);assert.equal(f.expression.kind,'isolatedMeasure');assert.equal(f.groupId,'task');assert.equal(f.expression.source.shapeId,'s');
});
test('a saved assembly exposes its physical dimensions and the action replaces it in place',()=>{
 const m=model(),h=harness(m),control=h.scope.rearrangeControl(m.formulas[0]);
 assert.match(control,/data-action="isolate-figure-formula"/);assert.match(control,/shape:s:h_1:length/);assert(control.includes('&lt;b&gt;Min kasse&lt;/b&gt;'));assert(!control.includes('<b>Min kasse'));
 h.change('isolate-figure-formula','shape:s:h_1:length',[],{id:'total'});const f=h.scope.model.formulas.at(-1);
 assert.equal(f.expression.unknown,'shape:s:h_1:length');assert.equal(f.expression.source.kind,'assembly');assert.equal(f.id,'total');assert.equal(h.scope.model.formulas.length,1);assert.equal(h.scope.activeId,f.id);
 assert.equal(h.scope.model.formulas[0].expression.kind,'isolatedMeasure');assert(h.saves()>0);
});
test('the editor selects the unknown, renames the result and only shows the remaining inputs',()=>{
 const m=model();m.formulas.push(E.newFigureMeasure(m,'measure'));const h=harness(m),path=['formulas',1,'expression'];
 h.change('measure-unknown','shape:s:B_1:length',path);const f=h.scope.model.formulas[1];assert.equal(f.symbol,'B_1');assert.match(f.name,/Bredde/);
 m.inputValues['formula:measure:V_total:volume']='24';
 const ast=E.context(m).target('formula:measure');assert(!E.variables(ast).some(v=>v.symbol==='B_1'));assert.equal(E.evaluate(ast).value,2);
 const html=h.scope.expressionEditor(f.expression,'length',path,f.symbol,E.context(m));assert.match(html,/Tidligere tal for det søgte mål bruges ikke/);assert.match(html,/Vælg figursamling/);
 assert.match(html,/Kendt samlet rumfang/);assert.match(html,/value="shape:s:B_1:length" selected/);assert.deepEqual(E.validateModel(m),m);
});
test('changing the selected assembly or known quantity resets stale unknowns',()=>{
 const m=model();m.formulas.push(E.newFigureMeasure(m,'measure'));const other=E.newShape('cylinder','other',2);m.shapes.push(other);const h=harness(m),path=['formulas',1,'expression'];
 h.change('measure-unknown','shape:s:h_1:length',path);h.change('assembly-scope','other',[...path,'source']);
 const expr=m.formulas[1].expression;assert.equal(expr.unknown,'');assert.equal(expr.source.shapeId,'other');
 h.change('measure-dimension','area',path);assert.equal(expr.sourceDimension,'area');assert.equal(expr.source.dimension,'area');assert.equal(expr.source.shapeId,'other');assert.equal(expr.given.symbol,'A_total');
 assert.match(h.scope.expressionEditor(expr,'length',path,'x',E.context(m)),/Kendt samlet areal/);
});
test('missing or unsupported dimensions remain visible with a reason and no guessed answer',()=>{
 let m=model();m.formulas.push(E.newFigureMeasure(m,'measure'));m.formulas[1].expression.unknown='shape:gone:h_1:length';const h=harness(m),path=['formulas',1,'expression'];
 let html=h.scope.expressionEditor(m.formulas[1].expression,'length',path,'x',E.context(m));assert.match(html,/Målet findes ikke længere/);
 m=E.example();const f={id:'total',name:'Pladeareal',symbol:'A',dimension:'area',expression:E.assembly('area')};m.formulas=[f];h.scope.model=m;
 html=h.scope.rearrangeControl(f);assert.match(html,/kræver en anden metode/);assert.match(html,/disabled/);assert.match(html,/Mål, der kræver en anden metode/);
});
