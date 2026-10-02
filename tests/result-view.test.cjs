'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js');
const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const resultCode=app.slice(app.indexOf('  function renderResult('),app.indexOf('  function unitOptions('));
const toggleCode=app.slice(app.indexOf('  function renderCalculatorToggle('),app.indexOf('  function render(keepFocus'));
const clickCode=app.slice(app.indexOf("  document.addEventListener('click',event=>{"),app.indexOf("  document.addEventListener('change',event=>{"));
function harness(){
  const events={},button={setAttribute(k,v){this[k]=v;}};
  const scope=vm.createContext({E,Intl,resultVisible:false,tutorial:null,
    esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    symbolHtml:s=>s,$:()=>button,
    document:{addEventListener:(type,fn)=>events[type]=fn},
    render:()=>scope.renderCalculatorToggle()});
  vm.runInContext(resultCode+toggleCode+clickCode,scope);
  const click=action=>events.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action}}:null}});
  return {scope,button,click,toggle:()=>click('toggle-calculator')};
}
test('visible calculator button toggles results and exposes the current state accessibly',()=>{
  const h=harness();h.scope.renderCalculatorToggle();assert.equal(h.button['aria-pressed'],'false');
  h.toggle();assert.equal(h.scope.resultVisible,true);assert.equal(h.button['aria-pressed'],'true');assert.equal(h.button['aria-label'],'Lommeregner: til');
  h.toggle();assert.equal(h.scope.resultVisible,false);assert.equal(h.button['aria-pressed'],'false');
});
test('hide result updates the same calculator toggle and tutorial prevents editing the task',()=>{
  const h=harness();h.toggle();h.click('hide-result');assert.equal(h.scope.resultVisible,false);assert.equal(h.button['aria-pressed'],'false');
  h.scope.tutorial={};h.toggle();assert.equal(h.scope.resultVisible,false);
});

test('result panel expands references, uses the selected unit and rounds only the final display from the first nonzero fractional digit',()=>{
  const h=harness(),m={version:5,inputUnits:{},inputValues:{'D:length':'500','n:rotationRate':'120'},title:'Visning',tank:E.defaultTank(),shapes:[],connections:[],formulas:[E.newFormula('speed','beltSpeed')]};
  m.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};m.formulas[0].resultUnit='m_min';
  assert.equal(h.scope.renderResult(E.context(m),m.formulas[0]),'');
  h.toggle();const output=h.scope.renderResult(E.context(m),m.formulas[0]);
  assert.match(output,/<strong>188,496<\/strong>/);assert.match(output,/>m\/min<\/span>/);
  assert.match(output,/3 cifre fra første ikke-nul efter kommaet/);
  const fake={safe:(target,mode,asResult)=>{assert.equal(mode,'expanded');assert.equal(asResult,true);return {ok:true,ast:{type:'constant',value:'50'}};}};
  assert.match(h.scope.renderResult(fake,m.formulas[0]),/<strong>50,000<\/strong>/);
  fake.safe=()=>({ok:true,ast:{type:'constant',value:'0.000000123456'}});
  assert.match(h.scope.renderResult(fake,m.formulas[0]),/<strong>0,000000123<\/strong>/);
});

test('missing values, invalid operations and broken references replace the previous output',()=>{
  const h=harness();h.toggle();const f=E.newFormula('area','rectangleArea');
  const show=ast=>h.scope.renderResult({safe:()=>({ok:true,ast})},f);
  let html=show({type:'symbol',symbol:'B',dimension:'length'});assert.match(html,/Udfyld de manglende værdier: B/);assert(!html.includes('<output'));
  html=show({type:'div',children:[{type:'constant',value:'1'},{type:'constant',value:'0'}]});assert.match(html,/dividere med 0/);assert(!html.includes('<output'));
  html=h.scope.renderResult({safe:()=>({ok:false,error:'Manglende reference <test>'})},f);assert.match(html,/Manglende reference &lt;test&gt;/);assert(!html.includes('<output'));
});

test('ordinary decimal result formatting keeps tiny volumes visible without E notation',()=>{
  const {scope}=harness();
  const example=.15*.07*.05+(Math.PI/8)*.07**2*.15;
  for(const [value,expected]of [[example,'0,000814'],[-example,'-0,000814'],[0,'0,000'],[50,'50,000'],[188.495559,'188,496'],[.00099999,'0,00100'],[1e-24,'0,'+'0'.repeat(23)+'100'],[1e21,'1000000000000000000000,000']]){
    const text=scope.formatResultValue(value);assert.equal(text,expected);assert(!/[eE]/.test(text));
  }
});


test('result precision skips leading fractional zeros, counts interior zeros and handles carries',()=>{
  const {scope}=harness();
  for(const [value,expected]of [
    [2.003234,'2,00323'],[2.003235,'2,00324'],[-2.003234,'-2,00323'],
    [0.000123456,'0,000123'],[0.000123556,'0,000124'],
    [2.0300234,'2,0300'],[2.1000234,'2,100'],[2.00010049,'2,000100'],
    [2.00099999,'2,00100'],[2.09999,'2,100'],[0.0099999,'0,0100'],
    [1.9995,'2,000'],[-1.9995,'-2,000'],[0.9995,'1,000'],[-0,'0,000'],
    [999.9995,'1000,000'],[Number.MIN_VALUE,'0,'+'0'.repeat(323)+'500']
  ])assert.equal(scope.formatResultValue(value),expected,String(value));
  const large=scope.formatResultValue(Number.MAX_VALUE);assert(!/[eE]/.test(large));assert(large.endsWith(',000'));
});

test('display rounding never alters formula values or later reference calculations',()=>{
  const h=harness();h.toggle();
  const m={version:6,title:'Precision',inputUnits:{},inputValues:{'formula:source:x:length':'2.003234','formula:next:L:length':'1000'},tank:E.defaultTank(),shapes:[],connections:[],formulas:[
    {id:'source',name:'Source',symbol:'B',dimension:'length',expression:E.symbol('x')},
    {...E.newFormula('next','rectangleArea'),expression:E.form('rectangleArea',{B:E.ref('formula:source'),L:E.symbol('L')})}
  ]};
  const before=JSON.stringify(m),ctx=E.context(m),source=ctx.target('formula:source');
  assert.match(h.scope.renderResult(ctx,m.formulas[0]),/<strong>2,00323<\/strong>/);
  assert.equal(E.plain(source,null,'values'),'2,003234');
  assert.equal(E.evaluate(source).value,2.003234);
  assert(Math.abs(E.evaluate(ctx.target('formula:next')).value-2003.234)<1e-10);
  assert.match(h.scope.renderResult(ctx,m.formulas[1]),/<strong>2003,234<\/strong>/);
  assert.equal(JSON.stringify(m),before);
});
