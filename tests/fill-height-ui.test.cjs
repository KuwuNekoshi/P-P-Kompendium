'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function model(type='halfCylinder'){
 const s=E.newShape(type,'s',1);s.name='<b>Min tank</b>';
 return {version:6,title:'Hx',shapes:[s],tank:E.defaultTank(),connections:[],inputUnits:{},inputValues:{'shape:s:D_1:length':'2','shape:s:L_1:length':'3','shape:s:h_1:length':'3','formula:hx:V_produkt:volume':'1'},formulas:[E.newFillHeight('hx','s')]};
}
function harness(m){
 const elements=new Map(),handlers={};let saves=0,uid=0;
 const get=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',hidden:false,classList:{toggle(){}},focus(){}});return elements.get(selector);};
 const scope=vm.createContext({E,model:m,activeId:'hx',selected:{type:'formula',id:'hx'},tutorial:null,valueDisplay:'both',expanded:true,libraryQuery:'',valueDrafts:new Map(),resultVisible:false,
  esc,pretty:s=>s,pathAttr:p=>esc(JSON.stringify(p)),symbolHtml:E.mathSymbol,displayMath:(ast,lhs,unit)=>E.math(ast,lhs,unit,scope.valueDisplay),formulaTitle:f=>f.name,schoolRef:()=>'',icon:()=>'',
  $:get,newId:prefix=>prefix+'-'+(++uid),save:()=>saves++,render:()=>{},notify:message=>{scope.lastMessage=message;},closeDialog:()=>{},select:(type,id)=>{scope.activeId=id;},
  active:()=>scope.model.formulas.find(f=>f.id===scope.activeId),quantityOwner:()=>'',
  renderResult:()=>'',valueDisplayControl:()=>'',rearrangeControl:()=>'',renderCalculatorGuide:()=>{},renderUnitGuide:()=>{},
  openDialog:(title,body)=>{scope.dialogBody=body;},document:{addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]}});
 scope.getAt=p=>p.reduce((a,k)=>a?.[k],scope.model);scope.setAt=(p,v)=>scope.getAt(p.slice(0,-1))[p.at(-1)]=v;
 const excerpt=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b));
 vm.runInContext(excerpt('  function ownerTarget(','  function notify(')+excerpt('  function formulaSummary(','  function renderSidebar(')+excerpt('  function expressionEditor(','  function inspectorHeader(')+excerpt('  function renderPreview(','  function valueDisplayControl(')+excerpt('  function renderLibraryResults(','  function changeView(')+excerpt('  function formulaPicker(','  function addShape(')+excerpt("  document.addEventListener('click',event=>{","  $('#file-input').addEventListener('change'"),scope);
 scope.render=()=>{};
 return {scope,get,saves:()=>saves,change:(action,value,path,extra={})=>handlers.change({target:{value,dataset:{action,path:JSON.stringify(path),...extra}}})};
}
test('Hx is discoverable in the picker and search, and new formulas follow the current group',()=>{
 const m=E.addFormulaGroup(model(),'task','Opgave'),h=harness(m);h.scope.formulaPicker('task');assert.match(h.scope.dialogBody,/data-formula="fillHeight" data-group="task"/);
 h.scope.libraryQuery='Hx';h.scope.renderLibraryResults();assert.match(h.get('.library-results').innerHTML,/data-formula="fillHeight"/);assert(!h.get('.library-results').innerHTML.includes('Ingen formler'));
 h.scope.libraryQuery='nogetsomikkefindes';h.scope.renderLibraryResults();assert.match(h.get('.library-results').innerHTML,/Ingen formler matcher/);
 h.scope.addFormula('fillHeight','task');const f=h.scope.model.formulas.at(-1);assert.equal(f.expression.kind,'fillHeight');assert.equal(f.groupId,'task');assert.equal(f.expression.shapeId,'s');assert.equal(h.scope.activeId,f.id);
 assert(h.saves()>0);
});
test('tank, orientation and volume controls edit the intended Hx expression and round-trip',()=>{
 const m=model(),h=harness(m),path=['formulas',0,'expression'];
 const render=()=>h.scope.expressionEditor(m.formulas[0].expression,'length',path,'H_x',E.context(m));
 const html=render();assert.match(html,/aria-label="Vælg samlet tank til Hx"/);assert(html.includes('&lt;b&gt;Min tank&lt;/b&gt;'));assert(!html.includes('<b>Min tank'));
 h.change('fill-orientation','inverted',path);assert.equal(m.formulas[0].expression.inverted,true);
 const second=E.newShape('box','second',2);m.shapes.push(second);h.change('fill-tank','second',path);assert.equal(m.formulas[0].expression.shapeId,'second');
 h.change('source','formula:filledVolume',[...path,'volume'],{dimension:'volume',symbol:'V_produkt'});
 assert.equal(m.formulas[0].expression.volume.formula,'filledVolume');
 assert.deepEqual(E.validateModel(m),m);assert.match(render(),/Produktets volumen/);
});
test('the Hx guide shows the active part and defines implicit heights with RAD guidance',()=>{
 const m=model(),h=harness(m),ast=E.context(m).target('formula:hx'),html=h.scope.fillHeightGuide(ast);
 assert.match(html,/Væskeoverfladen ligger i del 1/);assert.match(html,/fill-active/);assert.match(html,/acos/);assert.match(html,/radianer/);assert.match(html,/Halvér intervallet/);
 assert.match(html,/indvendige punkt/);assert.match(html,/Åbne sider eller bunde/);assert(!html.includes('<b>Min tank'));
 assert(!E.variables(ast).some(v=>v.symbol==='h_del'),'derived height is never presented as an input field');
 const copied=h.scope.fillHeightCopy(ast);assert.match(copied,/Find 0 ≤ h_del/);assert.match(copied,/V_rest =/);assert.match(copied,/Hx \[m\]/);
});
test('the preview handles incomplete and invalid Hx, and its derived quantities are defined',()=>{
 const m=model('cylinder'),h=harness(m);delete m.inputValues['formula:hx:V_produkt:volume'];
 h.scope.renderPreview(E.context(m));let html=h.get('#formula-preview').innerHTML;assert.match(html,/Angiv produktets volumen/);assert.match(html,/Delvis fyldning/);assert.match(html,/H_fyldt/);
 m.inputValues['formula:hx:V_produkt:volume']='9999';h.scope.renderPreview(E.context(m));html=h.get('#formula-preview').innerHTML;assert.match(html,/overstiger/);assert(!html.includes('fill-active'));
 m.formulas[0].expression.shapeId='missing';h.scope.renderPreview(E.context(m));assert.match(h.get('#formula-preview').innerHTML,/Vælg den tank/);
 const editor=h.scope.expressionEditor(m.formulas[0].expression,'length',['formulas',0,'expression'],'H_x',E.context(m));assert.match(editor,/Manglende figur/);
});
test('nested Hx can be selected from a length source and uses its own product volume',()=>{
 const m=model('cylinder'),f=E.newFormula('area','rectangleArea');m.formulas.push(f);const h=harness(m),path=['formulas',1,'expression','args','L'];
 h.change('source','fillHeight',path,{dimension:'length',symbol:'L'});assert.equal(f.expression.args.L.kind,'fillHeight');assert.equal(f.expression.args.L.shapeId,'s');
 const html=h.scope.expressionEditor(f.expression,'area',['formulas',1,'expression'],'A',E.context(m));assert.match(html,/Tank til Hx/);
 m.inputValues['formula:area:V_produkt:volume']='2';m.inputValues['formula:area:B:length']='3';
 const r=E.evaluate(E.context(m).target('formula:area'));assert.equal(r.status,'ready');assert(Math.abs(r.value-6/Math.PI)<1e-12);
});
