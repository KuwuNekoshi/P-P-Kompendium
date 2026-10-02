'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../dist/engine.js');
const STORAGE='pp-kompendium.symbolic.v2';
const fixture=()=>E.initializeUnitChoices({...E.example(),title:'Min gemte opgave'});
// Run every script from each actual release artifact. Browser surfaces are small
// stand-ins; rendering, storage policy and event handlers are production code.
function boot(edition,stored=new Map(),storageBlocked=false){
 const html=fs.readFileSync(path.join(__dirname,'..',edition==='exam'?'eksamen.html':'index.html'),'utf8');
 const markup=html.slice(0,html.indexOf('<script>')),nodes=new Map(),events={},windowEvents={},reads=[],writes=[],downloads=[];
 const element=()=>({dataset:{},innerHTML:'',textContent:'',value:'',hidden:false,open:false,style:{},handlers:{},isConnected:true,scrollTop:0,scrollLeft:0,
   setAttribute(k,v){this[k]=v;},classList:{toggle(){}},focus(){},getContext:()=>null,
   addEventListener(type,fn){this.handlers[type]=fn;},querySelector:s=>query(s),querySelectorAll:()=>[],
   show(){this.open=true;},showModal(){this.open=true;},close(){this.open=false;},getClientRects:()=>[{}],
   click(){this.clicked=true;},remove(){}});
 for(const [,id]of markup.matchAll(/\bid="([^"]+)"/g))nodes.set('#'+id,element());
 function query(selector){
   if(selector==='#file-input'&&!nodes.has(selector))return null;
   if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);
 }
 const document={documentElement:{dataset:{edition}},activeElement:null,querySelector:query,querySelectorAll:()=>[],
   addEventListener:(type,fn)=>(events[type]||=[]).push(fn),createElement:()=>element(),body:{append(){}}};
 const sandbox={document,Blob,URL:{createObjectURL:blob=>{downloads.push(blob);return 'blob:task';},revokeObjectURL(){}},
   localStorage:{getItem(k){reads.push(k);if(storageBlocked)throw Error('Disabled');return stored.get(k)??null;},setItem(k,v){writes.push(k);if(storageBlocked)throw Error('Disabled');stored.set(k,v);}},
   matchMedia:()=>({matches:false}),setTimeout:()=>1,clearTimeout(){},scrollTo(){},scrollX:0,scrollY:0,
   addEventListener:(type,fn)=>(windowEvents[type]||=[]).push(fn)};
 sandbox.window=sandbox;const scope=vm.createContext(sandbox);
 for(const [,code]of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(code,scope);
 const emit=(type,target)=>{for(const fn of events[type]||[])fn({target});};
 const click=(action,extra={})=>emit('click',{closest:selector=>selector==='[data-action]'?{dataset:{action,...extra}}:null});
 const input=(id,value)=>emit('input',{id,value,dataset:{}});
 return {scope,markup,nodes,query,reads,writes,downloads,stored,click,input,
   pageshow:persisted=>(windowEvents.pageshow||[]).forEach(fn=>fn({persisted})),
   async import(model){const el=query('#file-input');assert(el);await el.handlers.change({target:{files:[{size:100,text:async()=>JSON.stringify(model)}],value:'chosen'}});click('confirm');}};
}
test('normal edition restores a task, exposes calculator toggle, and exports/imports complete tasks',async()=>{
 const model=fixture();model.inputValues={'formula:time:Q_v:flow':'87'};
 const h=boot('standard',new Map([[STORAGE,JSON.stringify(model)]]));
 assert.equal(h.query('#project-title').value,model.title);assert(h.reads.includes(STORAGE));
 assert.match(h.markup,/data-action="import"/);assert.match(h.markup,/data-action="export"/);
 assert.equal(h.query('#calculator-toggle')['aria-pressed'],'false');
 h.click('toggle-calculator');assert.equal(h.query('#calculator-toggle')['aria-pressed'],'true');assert.match(h.query('#formula-preview').innerHTML,/result-panel/);
 h.click('hide-result');assert.equal(h.query('#calculator-toggle')['aria-pressed'],'false');
 h.click('export');const exported=JSON.parse(await h.downloads[0].text());assert.deepEqual(exported,model);
 const imported={...model,title:'Opgave fra en anden computer'};await h.import(imported);
 assert.equal(h.query('#project-title').value,imported.title);assert.equal(JSON.parse(h.stored.get(STORAGE)).title,imported.title);
 h.click('export');assert.deepEqual(JSON.parse(await h.downloads[1].text()),imported);
 h.pageshow(true);assert.equal(h.query('#project-title').value,imported.title);
});
test('exam starts empty with calculation on and never reads or writes task storage',()=>{
 const saved=JSON.stringify(fixture()),stored=new Map([[STORAGE,saved]]);
 const h=boot('exam',stored);assert.equal(h.query('#project-title').value,'Ny opsætning');
 assert.equal(h.query('#formula-count').textContent,0);assert.match(h.query('#shape-count').textContent,/^0 figurer/);
 assert.equal(h.query('#calculator-toggle')['aria-pressed'],'true');assert(!h.reads.includes(STORAGE));
 assert(!/data-action="(?:import|export|example)"|id="file-input"/.test(h.markup));
 h.click('use-formula',{formula:'rectangleArea'});assert.equal(h.query('#formula-count').textContent,1);assert.match(h.query('#formula-preview').innerHTML,/Udfyld de manglende værdier/);
 h.input('project-title','Eksamensopgave');assert.match(h.query('#save-status').textContent,/gemmes ikke/);assert(!h.writes.includes(STORAGE));assert.equal(stored.get(STORAGE),saved);
 for(const action of ['import','export','example'])h.click(action);
 assert.equal(h.downloads.length,0);assert.equal(h.query('#formula-count').textContent,1);
 h.click('toggle-calculator');assert.equal(h.query('#calculator-toggle')['aria-pressed'],'false');
 const reopened=boot('exam',stored);assert.equal(reopened.query('#formula-count').textContent,0);assert.equal(reopened.query('#calculator-toggle')['aria-pressed'],'true');
 h.pageshow(false);assert.equal(h.query('#formula-count').textContent,1);
 h.pageshow(true);assert.equal(h.query('#formula-count').textContent,0);assert.equal(h.query('#project-title').value,'Ny opsætning');assert.equal(h.query('#calculator-toggle')['aria-pressed'],'true');
 assert.equal(boot('standard',stored).query('#project-title').value,'Min gemte opgave');
});
test('both editions work when browser storage is disabled',()=>{
 for(const edition of ['standard','exam']){
  const h=boot(edition,new Map(),true);h.click('use-formula',{formula:'rectangleArea'});h.input('project-title','Uden lagring');
  assert.equal(h.query('#calculator-toggle')['aria-pressed'],String(edition==='exam'));
  assert.match(h.query('#save-status').textContent,edition==='exam'?/gemmes ikke/:/som fil/);
 }
});
test('tutorial describes the current edition and restores its task and calculator state',()=>{
 for(const edition of ['standard','exam']){
  const h=boot(edition);const beforeCount=h.query('#formula-count').textContent,beforeTitle=h.query('#project-title').value;
  let tour;h.scope.PPTour.start=options=>{tour=options;return {close:()=>options.finish()};};
  h.click('tutorial');assert(tour);
  const last=tour.steps.at(-1).body;
  assert.match(last,edition==='exam'?/import og eksport er ikke tilgængelig/:/eksporterer/);
  assert(!last.includes('TI-30'));
  tour.prepare(tour.steps.find(step=>step.target==='#calculator-toggle'));
  assert.match(h.query('#formula-preview').innerHTML,/<strong>1500,000<\/strong>/);
  tour.finish();assert.equal(h.query('#project-title').value,beforeTitle);assert.equal(h.query('#formula-count').textContent,beforeCount);
  assert.equal(h.query('#calculator-toggle')['aria-pressed'],String(edition==='exam'));
  assert(!h.writes.includes(STORAGE));
 }
});
