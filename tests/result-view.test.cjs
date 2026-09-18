'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js');
const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
// Run the production view and keyboard listener with small DOM stand-ins.
// This checks their behavior without a browser or a copy of the implementation.
const resultCode=app.slice(app.indexOf('  function renderResult('),app.indexOf('  function renderCalculatorGuide('));
const keyCode=app.slice(app.lastIndexOf("  document.addEventListener('keydown',event=>{"),app.indexOf("  $('#app-dialog').addEventListener('click'"));
const keys=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a','Enter'];
function harness(){
  const dialog={open:false},events=[],renders=[],scrolls=[];
  const scope=vm.createContext({E,Intl,resultVisible:false,entryKeys:[],tutorial:null,
    esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    symbolHtml:s=>s,$:()=>dialog,
    document:{addEventListener:(type,fn)=>events.push(fn),querySelector:()=>({scrollIntoView:options=>scrolls.push(options)})},
    changeView:view=>renders.push(view),render:()=>renders.push('render')});
  vm.runInContext(resultCode+keyCode,scope);
  const press=(key,extra={})=>{
    const event={key,target:{closest:()=>null},prevented:false,stopped:false,
      preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...extra};
    events[0](event);return event;
  };
  return {scope,dialog,renders,scrolls,press,sequence:(extra={})=>keys.map(key=>press(key,extra)).at(-1)};
}

test('exact key sequence toggles result visibility and consumes the final Enter only',()=>{
  const h=harness();assert.equal(h.scope.resultVisible,false);
  keys.slice(0,-1).forEach(key=>assert.equal(h.press(key).prevented,false));
  assert.equal(h.scope.resultVisible,false);
  const end=h.press('Enter');assert(end.prevented&&end.stopped);assert.equal(h.scope.resultVisible,true);
  assert.deepEqual(h.renders,['builder','render']);
  h.sequence();assert.equal(h.scope.resultVisible,false);
  h.press('x');h.press('ArrowUp');h.sequence();assert.equal(h.scope.resultVisible,true);
  assert.equal(harness().scope.resultVisible,false,'a new page starts with the mode off');
});

test('wrong order, repeats, input fields, composition, shortcuts, dialogs and tutorial cannot activate it',()=>{
  const reversed=[...keys];[reversed[4],reversed[5],reversed[6],reversed[7]]=['ArrowRight','ArrowLeft','ArrowRight','ArrowLeft'];
  const h=harness();reversed.forEach(key=>h.press(key));assert.equal(h.scope.resultVisible,false);
  for(const extra of [{repeat:true},{ctrlKey:true},{altKey:true},{metaKey:true},{isComposing:true},
    {target:{isContentEditable:true,closest:()=>null}},{target:{closest:()=>({tagName:'INPUT'})}}]){
    h.sequence(extra);assert.equal(h.scope.resultVisible,false);
  }
  h.dialog.open=true;h.sequence();assert.equal(h.scope.resultVisible,false);h.dialog.open=false;
  h.scope.tutorial={};h.sequence();assert.equal(h.scope.resultVisible,false);h.scope.tutorial=null;
  keys.slice(0,5).forEach(key=>h.press(key));h.press('x',{target:{closest:()=>({})}});
  keys.slice(5).forEach(key=>h.press(key));assert.equal(h.scope.resultVisible,false);
  h.sequence();assert.equal(h.scope.resultVisible,true);
});

test('result panel expands references, uses the selected unit and rounds only the final display to three decimals',()=>{
  const h=harness(),m={version:5,inputUnits:{},inputValues:{'D:length':'500','n:rotationRate':'120'},title:'Visning',tank:E.defaultTank(),shapes:[],connections:[],formulas:[E.newFormula('speed','beltSpeed')]};
  m.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};m.formulas[0].resultUnit='m_min';
  assert.equal(h.scope.renderResult(E.context(m),m.formulas[0]),'');
  h.sequence();const output=h.scope.renderResult(E.context(m),m.formulas[0]);
  assert.match(output,/<strong>188,496<\/strong>/);assert.match(output,/>m\/min<\/span>/);
  assert.match(output,/3 decimaler/);
  const fake={safe:(target,mode,asResult)=>{assert.equal(mode,'expanded');assert.equal(asResult,true);return {ok:true,ast:{type:'constant',value:'50'}};}};
  assert.match(h.scope.renderResult(fake,m.formulas[0]),/<strong>50,000<\/strong>/);
  fake.safe=()=>({ok:true,ast:{type:'constant',value:'0.000000123456'}});
  assert.match(h.scope.renderResult(fake,m.formulas[0]),/<strong>1,235E-7<\/strong>/);
});

test('missing values, invalid operations and broken references replace the previous output',()=>{
  const h=harness();h.sequence();const f=E.newFormula('area','rectangleArea');
  const show=ast=>h.scope.renderResult({safe:()=>({ok:true,ast})},f);
  let html=show({type:'symbol',symbol:'B',dimension:'length'});assert.match(html,/Udfyld de manglende værdier: B/);assert(!html.includes('<output'));
  html=show({type:'div',children:[{type:'constant',value:'1'},{type:'constant',value:'0'}]});assert.match(html,/dividere med 0/);assert(!html.includes('<output'));
  html=h.scope.renderResult({safe:()=>({ok:false,error:'Manglende reference <test>'})},f);assert.match(html,/Manglende reference &lt;test&gt;/);assert(!html.includes('<output'));
});
