'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const setup=()=>({version:6,title:'Menu',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:['a','b','c'].map(id=>E.newFormula(id,'diameter'))});
function harness(model){
 const handlers={},elements=new Map(),focused=[],messages=[];let saves=0,serial=0;
 const input={value:'',focus(){focused.push('name');},reportValidity(){return Boolean(this.value);}};
 const dialog={open:false,querySelector:selector=>selector==='[data-group-name]'?input:{click(){click({action:'save-formula-group',id:''});}}};
 const get=selector=>{if(selector==='#app-dialog')return dialog;if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:''});return elements.get(selector);};
 const buttons=()=>[...get('#saved-formulas').innerHTML.matchAll(/<(button|select)\b([^>]*)>/g)].map(([,tag,attrs])=>({dataset:Object.fromEntries([...attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([,k,v])=>[k,v])),disabled:/\bdisabled/.test(attrs),focus(){focused.push(this.dataset);}}));
 const scope=vm.createContext({E,model,activeId:'a',selected:{type:'formula',id:'a'},tutorial:null,expanded:true,valueDisplay:'both',valueDrafts:new Map(),esc,symbolHtml:E.mathSymbol,pretty:s=>s,formulaTitle:f=>f.name,shapeIcon:()=>'',
 $:get,active:()=>scope.model.formulas.find(f=>f.id===scope.activeId),save:()=>saves++,notify:message=>messages.push(message),newId:prefix=>prefix+'-'+(++serial),
 changeView:()=>{},closeDialog:()=>{dialog.open=false;},openDialog:(title,body,footer)=>{dialog.open=true;scope.dialogTitle=title;scope.dialogBody=body;scope.dialogFooter=footer;input.value=(body.match(/data-group-name[^>]*value="([^"]*)"/)||[])[1]||'';},
 document:{addEventListener:(type,fn)=>(handlers[type]||=[]).push(fn),querySelectorAll:()=>buttons(),querySelector:()=>({focus(){focused.push('new-group');}})},matchMedia:()=>({matches:false})});
 const excerpt=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end));
 vm.runInContext(excerpt('  function renderSidebar(','  function renderFigures(')+excerpt('  function select(','  function inspectReference(')+excerpt('  function formulaPicker(','  function addShape(')+excerpt("  document.addEventListener('click',event=>{","  $('#file-input').addEventListener('change'"),scope);
 scope.render=()=>{scope.renderSidebar();scope.renderGoal();};scope.render();
 function click(dataset){const b={dataset};for(const fn of handlers.click||[])fn({target:{closest:selector=>selector==='[data-action]'?b:null}});}
 const change=(value,dataset)=>{for(const fn of handlers.change||[])fn({target:{value,dataset}});};
 return {scope,click,change,input,dialog,get,focused,messages,saves:()=>saves,buttons};
}
test('sidebar renders ordered groups, accessible controls, empty groups and escaped user names',()=>{
 let m=E.addFormulaGroup(setup(),'g','<img onerror=bad>');m=E.assignFormulaGroup(m,'a','g');m=E.assignFormulaGroup(m,'b','g');m=E.addFormulaGroup(m,'empty','Tom');m.formulaGroups[0].collapsed=true;
 const h=harness(m),html=h.get('#saved-formulas').innerHTML;
 assert(html.includes('&lt;img onerror=bad&gt;'));assert(!html.includes('<img'));
 assert.match(html,/aria-expanded="false" aria-controls="saved-group-g"/);assert.match(html,/id="saved-group-g" class="saved-group-items" hidden/);
 assert.match(html,/Ingen formler endnu/);assert.match(html,/Valgt formel/);
 assert.match(html,/aria-label="Flyt Diameter fra radius op"[^>]*disabled/);
 assert.match(html,/aria-label="Gruppe for Diameter fra radius"/);assert.match(html,/value="\+new"/);
 const goal=h.get('#goal-select').innerHTML;assert(goal.indexOf('saved:a')<goal.indexOf('saved:b'));assert(goal.indexOf('saved:b')<goal.indexOf('saved:c'));assert.match(goal,/optgroup label="Uden gruppe"/);
});
test('production move, assignment and collapse handlers preserve selection and save each change',()=>{
 let m=E.addFormulaGroup(setup(),'g','Opgave');const h=harness(m);
 h.click({action:'move-formula',id:'a',part:'down'});assert.deepEqual(Array.from(h.scope.model.formulas,f=>f.id),['b','a','c']);assert.equal(h.scope.activeId,'a');
 h.change('g',{action:'formula-group',id:'b'});h.change('g',{action:'formula-group',id:'a'});
 assert.deepEqual(E.formulaSections(h.scope.model).find(g=>g.id==='g').formulas.map(f=>f.id),['b','a']);
 h.click({action:'move-formula',id:'a',part:'up'});assert.equal(E.formulaSections(h.scope.model)[0].formulas[0].id,'a');
 assert.equal(h.focused.at(-1).action,'select-formula','disabled move-up falls back to the formula button');
 h.click({action:'toggle-formula-group',id:'g'});assert.equal(h.scope.model.formulaGroups[0].collapsed,true);
 h.scope.select('formula','b');assert.equal(h.scope.model.formulaGroups[0].collapsed,false);assert.equal(h.scope.activeId,'b');
 assert(h.saves()>=6);assert.deepEqual(E.validateModel(E.clone(h.scope.model)),E.clone(h.scope.model));
});
test('group creation from a formula, rename, cancel and removal keep the formula data',()=>{
 const h=harness(setup()),before=h.scope.model.formulas.map(f=>JSON.stringify(f.expression));
 h.change('+new',{action:'formula-group',id:'a'});assert.equal(h.dialog.open,true);assert.match(h.scope.dialogFooter,/data-formula="a"/);
 h.input.value='  Beregning A  ';h.click({action:'save-formula-group',id:'',formula:'a'});
 const id=h.scope.model.formulaGroups[0].id;assert.equal(h.scope.model.formulaGroups[0].name,'Beregning A');assert.equal(h.scope.model.formulas.find(f=>f.id==='a').groupId,id);
 h.click({action:'edit-formula-group',id});h.input.value='Nyt navn';h.click({action:'save-formula-group',id,formula:''});assert.equal(h.scope.model.formulaGroups[0].name,'Nyt navn');
 const saved=JSON.stringify(h.scope.model);h.click({action:'new-formula-group'});h.input.value='Annulleret';h.click({action:'close-dialog'});assert.equal(JSON.stringify(h.scope.model),saved);
 h.click({action:'edit-formula-group',id});h.click({action:'remove-formula-group',id});assert.equal(h.scope.model.formulaGroups.length,0);assert.equal(h.scope.model.formulas.length,3);assert(h.scope.model.formulas.every(f=>!f.groupId));
 assert.deepEqual(h.scope.model.formulas.map(f=>JSON.stringify(f.expression)),before);assert.equal(h.focused.at(-1),'new-group');
});
test('new formulas inherit the active group or an explicitly chosen empty group',()=>{
 let m=E.addFormulaGroup(E.addFormulaGroup(setup(),'g','Aktiv'),'empty','Tom');m=E.assignFormulaGroup(m,'a','g');const h=harness(m);
 h.scope.addFormula('circleArea');let f=h.scope.model.formulas.find(f=>f.id===h.scope.activeId);assert.equal(f.groupId,'g');
 h.scope.formulaPicker('empty');assert.match(h.scope.dialogBody,/data-group="empty"/);
 h.click({action:'use-formula',formula:'rectangleArea',group:'empty'});f=h.scope.model.formulas.find(f=>f.id===h.scope.activeId);assert.equal(f.groupId,'empty');assert.equal(h.dialog.open,false);
});
