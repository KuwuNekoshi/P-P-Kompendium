'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');
const setup=(...formulas)=>({version:6,title:'Felter',inputUnits:{},inputValues:{},tank:E.defaultTank(),shapes:[],connections:[],formulas});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function harness(model){
  const handlers={},guide={innerHTML:''};
  const scope=vm.createContext({E,model,tutorial:null,expanded:true,valueDisplay:'both',valueDrafts:new Map(),
    esc,pretty:s=>s.replace(/_/g,''),pathAttr:p=>esc(JSON.stringify(p)),symbolHtml:E.mathSymbol,displayMath:E.math,formulaTitle:f=>f.name,
    $:()=>guide,save:()=>{},render:()=>{},notify:()=>{},
    ownerTarget:path=>'formula:'+model.formulas[path[1]].id,
    document:{addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]}});
  scope.getAt=path=>path.reduce((value,key)=>value?.[key],scope.model);
  scope.setAt=(path,value)=>scope.getAt(path.slice(0,-1))[path.at(-1)]=value;
  const excerpt=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end));
  vm.runInContext(excerpt('  function ownerTarget(','  function notify(')+excerpt('  function plateEditor(','  function renderTankInspector(')+excerpt('  function formulaSummary(','  function renderSidebar(')+
    excerpt('  function unitOptions(','  function inspectorHeader(')+
    excerpt("  document.addEventListener('click',event=>{","  $('#file-input')?.addEventListener('change'"),scope);
  const input=(key,value)=>handlers.input({target:{value,dataset:{action:'input-value',id:key}}});
  const change=element=>handlers.change({target:element});
  const clear=key=>{const button={dataset:{action:'clear-value',id:key}};handlers.click({target:{closest:selector=>selector==='[data-action]'?button:null}});};
  return {scope,guide,input,change,clear};
}

test('production input, clear and unit controls modify only the field owner and keep its typing draft separate',()=>{
  const m=setup(E.newFormula('one','diameter'),E.newFormula('two','diameter')),h=harness(m);
  const first='formula:one:r:length',second='formula:two:r:length';
  h.input(first,'2');h.input(second,'50');
  assert.equal(m.inputValues[first],'2');assert.equal(m.inputValues[second],'50');
  h.change({value:'cm',dataset:{action:'input-unit',id:second,symbol:'r',dimension:'length'}});
  assert.equal(m.inputUnits[second],'cm');assert.equal(m.inputUnits[first],undefined);
  h.input(first,'-');assert.equal(m.inputValues[first],undefined);assert.equal(m.inputValues[second],'50');
  assert.equal(h.scope.valueDrafts.get(first),'-');assert.equal(h.scope.valueDrafts.get(second),'50');
  h.input(first,'3');h.clear(first);assert.equal(m.inputValues[first],undefined);assert.equal(m.inputValues[second],'50');
  assert.equal(h.scope.valueDrafts.has(first),false);assert.equal(E.evaluate(E.context(m).result('formula:two')).value,1);
});

test('compound-unit controls use the current owner unit for each numerator and denominator change',()=>{
  const m=setup(E.newFormula('one','flow'),E.newFormula('two','flow')),h=harness(m);
  const first='formula:one:v:velocity',second='formula:two:v:velocity';
  m.inputUnits={[first]:'m_min',[second]:'km_h'};
  h.change({value:'cm',dataset:{action:'input-unit-part',id:first,symbol:'v',dimension:'velocity',part:'numerator'}});
  assert.equal(m.inputUnits[first],E.Units.combine('velocity','cm','min').id);assert.equal(m.inputUnits[second],'km_h');
  h.change({value:'s',dataset:{action:'input-unit-part',id:second,symbol:'v',dimension:'velocity',part:'denominator'}});
  assert.equal(m.inputUnits[second],E.Units.combine('velocity','km','s').id);
  assert.equal(m.inputUnits[first],E.Units.combine('velocity','cm','min').id);
});

test('referenced duplicate symbols have separate labelled controls and previews use their source values',()=>{
  const m=setup(E.newFormula('one','diameter'),E.newFormula('two','diameter'),E.newFormula('area','rectangleArea'));
  m.inputValues={'formula:one:r:length':'2','formula:two:r:length':'5'};
  m.formulas[0].name=m.formulas[1].name='Radius <kendt>';
  m.formulas[2].expression.args={L:E.ref('formula:one'),B:E.ref('formula:two')};
  const h=harness(m),ctx=E.context(m);
  h.scope.renderUnitGuide(ctx.target('formula:area'),m.formulas[2]);
  assert.match(h.guide.innerHTML,/data-id="formula:one:r:length" value="2"/);
  assert.match(h.guide.innerHTML,/data-id="formula:two:r:length" value="5"/);
  assert.match(h.guide.innerHTML,/Radius &lt;kendt&gt; \(formel 1\)/);assert.match(h.guide.innerHTML,/Radius &lt;kendt&gt; \(formel 2\)/);
  assert(!h.guide.innerHTML.includes('Radius <kendt>'));
  for(const id of ['one','two']){
    const d=ctx.map.get('formula:'+id),html=h.scope.formulaSummary(d.expression,d.dimension,ctx,d.symbol,d.target);
    assert.match(html,new RegExp('<mn>'+(id==='one'?'2':'5')+'</mn>'));
  }
});

test('an existing bucket count can switch to the spacing formula through the production source dropdown',()=>{
  const m=setup(E.newFormula('bucket','bucketFlow'));m.formulas[0].expression.args.N=E.symbol('N_meter');
  m.inputValues={'formula:bucket:N_meter:countPerLength':'20'};
  const h=harness(m),path=['formulas',0,'expression','args','N'];
  const html=h.scope.expressionEditor(m.formulas[0].expression.args.N,'countPerLength',path,'N_meter',E.context(m));
  assert.match(html,/Afstand mellem kopper · N = 1 \/ s/);assert.match(html,/Kendt antal kopper pr. længdeenhed/);
  h.change({value:'formula:bucketCountFromSpacing',dataset:{action:'source',path:JSON.stringify(path),dimension:'countPerLength',symbol:'N_meter'}});
  assert.equal(m.formulas[0].expression.args.N.formula,'bucketCountFromSpacing');
  assert(E.variables(E.context(m).result('formula:bucket')).some(v=>v.symbol==='s_kop'&&v.dimension==='length'));
  assert(!E.variables(E.context(m).result('formula:bucket')).some(v=>v.symbol==='N_meter'));
  h.input('formula:bucket:s_kop:length','20');
  h.change({value:'cm',dataset:{action:'input-unit',id:'formula:bucket:s_kop:length',symbol:'s_kop',dimension:'length'}});
  const count=E.context(m).expand(m.formulas[0].expression.args.N,'countPerLength','expanded',['formula:bucket']);
  assert.equal(E.evaluate(count).value,5);
});

test('percentage inputs keep 87 in the field while showing 0.87 as the formula factor',()=>{
  const m=setup(E.newFormula('power','inputPower')),h=harness(m),key='formula:power:η:scalar';
  h.input(key,'87');h.change({value:'percent',dataset:{action:'input-unit',id:key,symbol:'η',dimension:'scalar'}});
  const ast=E.context(m).target('formula:power');h.scope.renderUnitGuide(ast,m.formulas[0]);
  assert.match(h.guide.innerHTML,/data-id="formula:power:η:scalar" value="87"/);
  assert.match(h.guide.innerHTML,/I formlen: 87 % → 0,87/);
  assert.equal(E.plain(ast,null,'values'),'P_teo / 0,87');
  h.change({value:'number',dataset:{action:'input-unit',id:key,symbol:'η',dimension:'scalar'}});h.input(key,'0,87');
  assert.equal(E.plain(E.context(m).target('formula:power'),null,'values'),'P_teo / 0,87');
});


test('production controls preview preconverted values and flag recurring decimals without altering inputs',()=>{
  const m=setup(E.newFormula('distance','distance')),h=harness(m),key='formula:distance:v:velocity';
  h.input(key,'20');h.change({value:'m_min',dataset:{action:'input-unit',id:key,symbol:'v',dimension:'velocity'}});
  const tree=E.context(m).target('formula:distance');h.scope.renderUnitGuide(tree,m.formulas[0]);
  assert.match(h.guide.innerHTML,/I formlen: 20 m\/min → ≈ 0,3333333333333333 m\/s/);
  assert.equal(m.inputValues[key],'20');assert.match(E.plain(tree,null,'values'),/0,3333333333333333/);
});

test('production surface controls assign local side and bottom thicknesses and retain nested formula edits',()=>{
  const m=setup();m.shapes=[E.newShape('box','box',1)];m.formulas=[E.newTankMass(m,'mass')];
  const h=harness(m),base=['shapes',0,'plateThickness'];
  let html=h.scope.plateEditor(m.shapes[0],0,E.context(m));assert.match(html,/t_bund/);assert.match(html,/Fælles for siderne/);
  for(const [key,symbol]of [['side','t_side1'],['bottom','t_bund1']])h.change({value:'symbol',dataset:{action:'source',path:JSON.stringify([...base,key]),dimension:'length',symbol}});
  assert.equal(h.scope.model.shapes[0].plateThickness.side.symbol,'t_side1');assert.equal(h.scope.model.shapes[0].plateThickness.bottom.symbol,'t_bund1');
  assert.equal(h.scope.model.formulas[0].expression.formula,'tankMassSurfaces');
  h.change({value:'formula:diameter',dataset:{action:'source',path:JSON.stringify([...base,'side']),dimension:'length',symbol:'t_side1'}});
  h.change({value:'symbol',dataset:{action:'source',path:JSON.stringify([...base,'side','args','r']),dimension:'length',symbol:'r_side'}});
  assert.equal(h.scope.model.shapes[0].plateThickness.side.formula,'diameter');assert.equal(h.scope.model.shapes[0].plateThickness.side.args.r.symbol,'r_side');
  const f=h.scope.model.formulas[0],expr=f.expression.args.V;
  html=h.scope.expressionEditor(expr,'volume',['formulas',0,'expression','args','V'],'V_mat',E.context(h.scope.model));
  assert.match(html,/value="material" selected/);assert.match(html,/plademateriale/);
});
