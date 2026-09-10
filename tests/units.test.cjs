'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const U=E.Units;
// Evaluation exists only in the tests: compare symbolic output with independent examples.
function value(ast,vars={}){
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const c=ast.children.map(a=>value(a,vars));
  if(ast.type==='group')return c[0];
  if(ast.type==='add')return c.reduce((a,b)=>a+b);
  if(ast.type==='sub')return c[0]-c[1];
  if(ast.type==='mul')return c.reduce((a,b)=>a*b);
  if(ast.type==='div')return c[0]/c[1];
  if(ast.type==='pow')return c[0]**c[1];
  if(ast.type==='sqrt')return Math.sqrt(c[0]);
  assert.fail(ast.type);
}
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
function model(...ids){
  return {version:5,inputUnits:{},title:'Enheder',tank:E.defaultTank(),shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))};
}

test('unit factors distinguish powers, compound rates, pressure, heat and absolute temperature',()=>{
  const cases=[
    ['length','mm',1200,1.2],['area','mm2',1000000,1],['area','cm2',10000,1],
    ['volume','mm3',1000000000,1],['volume','L',2500,2.5],['volume','cm3',2000000,2],
    ['velocity','km_h',72,20],['flow','L_min',120,.002],['flow','m3_h',72,.02],
    ['massFlow','ton_h',3.6,1],['density','ton_m3',7.85,7850],['density','g_L',2,2],
    ['pressure','bar',2.5,250000],['rotationRate','rpm',180,3],['energy','kWh',2.5,9000000],
    ['heatCapacity','kJ_kgK',4.184,4184],['scalar','percent',80,.8],
    ['temperature','C',20,293.15],['temperatureChange','C',20,20]
  ];
  for(const [dimension,id,input,expected]of cases){
    const unit=U.get(dimension,id),ast={type:'symbol',symbol:'x',dimension};
    near(value(U.convert(ast,unit),{x:input}),expected);
    near(value(U.convert(ast,unit,'fromBase'),{x:expected}),input);
  }
  for(const dimension of Object.keys(E.DIMENSIONS)){
    assert.equal(U.base(dimension).numerator,1);assert.equal(U.base(dimension).denominator,1);
    assert.equal(U.base(dimension).offset,'0');
    assert.equal(new Set(U.choices(dimension).map(u=>u.id)).size,U.choices(dimension).length);
  }
});

test('diameter conversion happens inside the square, before conversion of the complete area',()=>{
  const m=model('circleArea');m.inputUnits['D:length']='mm';m.formulas[0].resultUnit='cm2';
  const c=E.context(m),ast=c.result('formula:circleArea');
  near(value(c.target('formula:circleArea'),{D:200}),Math.PI*.01);
  near(value(ast,{D:200}),Math.PI*100);
  assert.match(E.tex(ast),/\\left\(\\frac\{D\}\{1000\}\\right\)/);
  assert.match(E.math(ast),/<msup><mrow><mo>\(<\/mo>/);
  assert(E.plain(ast).includes('1000')&&E.plain(ast).includes('10000'));
  assert.deepEqual(E.variables(ast).map(U.key),['D:length']);
});

test('area in square millimetres and speed in millimetres per second produce litres per minute',()=>{
  const m=model('flow');m.inputUnits={'A:area':'mm2','v:velocity':'mm_s'};m.formulas[0].resultUnit='L_min';
  const ast=E.context(m).result('formula:flow');
  near(value(ast,{A:1000000,v:1000}),60000);
  assert.equal(E.variables(ast).length,2);
  assert(E.math(ast,'Q_v','L/min').includes('<mtext>[L/min]</mtext>'));
});

test('mixed input units and T9 still share one inside diameter and one plate-thickness conversion',()=>{
  const m=E.example();m.shapes[0].diameter.basis='outer';
  m.inputUnits={'D_1:length':'mm','h_1:length':'cm','h_2:length':'mm','t_plade:length':'mm','ρ_mat:density':'ton_m3'};
  const f=E.newTankMass(m,'tank');f.resultUnit='ton';m.formulas.push(f);
  const vars={D_1:1000,h_1:200,h_2:500,t_plade:10,'ρ_mat':7.85};
  const inside=.98,area=Math.PI*inside*2+Math.PI*(inside/2)*Math.hypot(inside/2,.5);
  const c=E.context(m);
  near(value(c.target('shape:cylinder:inner:D'),vars),inside);
  near(value(c.target('shape:cone:inner:D'),vars),inside);
  near(value(c.result('formula:tank'),vars),area*.01*7.85);
  assert.equal(E.variables(c.result('formula:tank')).filter(v=>v.symbol==='t_plade').length,1);
});

test('litre and litre-per-minute results remain correct when referenced by a fill-time formula',()=>{
  const m=E.example();m.inputUnits={'D_1:length':'cm','D_3:length':'mm'};
  m.formulas[0].resultUnit='L';m.formulas[1].resultUnit='L_min';m.formulas[2].resultUnit='min';
  const values={D_1:200,h_1:3,h_2:1,D_3:50,v:2},c=E.context(m);
  near(value(c.result('formula:volume'),values),10000*Math.PI/3);
  near(value(c.result('formula:flow'),values),75*Math.PI);
  const expected=400/9;
  near(value(c.result('formula:time'),values),expected);
  const compact=c.result('formula:time','compact');
  near(value(compact,{V_fyld:10000*Math.PI/3,Q_v:75*Math.PI}),expected);
  assert(E.plain(compact).includes('V_fyld [L]'));
  assert(E.tex(compact).includes('\\text{L/min}'));
  assert(E.math(compact).includes('<mrow><msub><mi>V</mi>'));
  // Output preferences must not scale the canonical value consumed by expanded references.
  m.formulas[0].resultUnit='cm3';m.formulas[1].resultUnit='m3_h';
  near(value(E.context(m).result('formula:time'),values),expected);
});

test('temperature offsets apply to absolute temperatures, never to temperature differences',()=>{
  const m=model('mixTemperature','massFromHeat');
  m.inputUnits={'T_1:temperature':'C','T_2:temperature':'K','q:energy':'kJ','c_p:heatCapacity':'kJ_kgK','ΔT:temperatureChange':'C'};
  m.formulas[0].resultUnit='C';
  const c=E.context(m),ast=c.result('formula:mixTemperature');
  near(value(ast,{c_p1:4200,m_1:1,T_1:20,c_p2:4200,m_2:3,T_2:353.15}),65);
  assert(E.math(ast).includes('<mn>273,15</mn>'));
  assert(E.plain(ast).includes('273,15'));
  assert(E.tex(ast).includes('273{,}15'));
  const mass=c.result('formula:massFromHeat');
  near(value(mass,{q:84,c_p:4.2,'ΔT':20}),1);
  assert(!E.plain(mass).includes('273'));
});

test('percent inputs and percent results each scale at the correct boundary',()=>{
  const m=model('inputPower','efficiency');
  m.inputUnits={'P_teo:power':'kW','P_nyttig:power':'kW','P_ind:power':'kW','η:scalar':'percent'};
  m.formulas[0].resultUnit='kW';m.formulas[1].resultUnit='percent';
  const c=E.context(m);
  near(value(c.result('formula:inputPower'),{P_teo:10,'η':80}),12.5);
  near(value(c.result('formula:efficiency'),{P_nyttig:8,P_ind:10}),80);
});

test('known symbol references and formula copies preserve units without applying them twice',()=>{
  const m=model('diameter');m.inputUnits['r:length']='cm';
  const input=E.newFormula('radius','diameter');input.expression=E.symbol('r');m.formulas.push(input);
  m.formulas[0].expression.args.r=E.ref('formula:radius');
  const c=E.context(m);
  near(value(c.target('formula:diameter'),{r:50}),1);
  near(value(c.target('formula:diameter','compact'),{r:50}),1);
  m.formulas[0].expression.args.r=E.clone(input.expression);
  near(value(E.context(m).target('formula:diameter'),{r:50}),1);
});

test('unit choices survive saving and migration while incompatible or malformed units are rejected',()=>{
  const m=E.example();m.inputUnits={'D_1:length':'mm','v:velocity':'km_h'};m.formulas[2].resultUnit='h';
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
  const old=E.example();old.version=4;delete old.inputUnits;
  const migrated=E.validateModel(old);assert.equal(migrated.version,5);assert.deepEqual(migrated.inputUnits,{});
  assert.equal(E.plain(E.context(migrated).target('formula:time')),E.plain(E.context(old).target('formula:time')));
  const bad=E.clone(m);bad.inputUnits['D_1:length']='kPa';assert.throws(()=>E.validateModel(bad),/inputenhed/);
  const result=E.clone(m);result.formulas[2].resultUnit='L';assert.throws(()=>E.validateModel(result),/resultatenheden/);
  const malformed=E.clone(m);malformed.inputUnits={'<img>:length':'mm'};assert.throws(()=>E.validateModel(malformed),/ugyldig størrelse/);
  const removed=E.removeShape(m,'cylinder');assert.deepEqual(E.validateModel(removed).inputUnits,m.inputUnits);
});

test('numerator and denominator changes are independent and preserve older unit selections',()=>{
  let unit=U.get('massFlow','kg_h');
  assert.deepEqual(unit.parts,{numerator:'kg',denominator:'h'});
  unit=U.withPart('massFlow',unit.id,'numerator','mg');
  assert.equal(unit.label,'mg/h');
  unit=U.withPart('massFlow',unit.id,'denominator','min');
  assert.equal(unit.label,'mg/min');
  near(value(U.convert({type:'symbol',symbol:'x'},unit),{x:60000000}),1);
  unit=U.withPart('massFlow',unit.id,'numerator','kg');
  assert.equal(unit.id,'kg_min');
  assert.equal(U.combine('density','ton','m3').id,'ton_m3');
  assert.equal(U.combine('density','g','cm3').id,'g_cm3');
  assert.equal(U.combine('flow','L','min').id,'L_min');
  assert.equal(U.combine('rotationRate','rev','min').id,'rpm');
  assert.equal(U.combine('heatCapacity','kJ','kg_K').id,'kJ_kgK');
  assert.throws(()=>U.combine('density','kg','h'),/passer ikke/);
  assert.throws(()=>U.withPart('massFlow','kg_h','numerator','L'),/passer ikke/);
  assert.throws(()=>U.withPart('massFlow','kg_h','power','min'),/valgte del/);
});

test('new density and flow combinations give consistent mass-flow results and survive saving',()=>{
  const m=model('massFlow');
  m.inputUnits={'ρ:density':U.combine('density','mg','mL').id,'Q_v:flow':U.combine('flow','cL','min').id};
  m.formulas[0].resultUnit=U.combine('massFlow','g','h').id;
  // 2 mg/mL × 30 mL/min = 60 mg/min = 3.6 g/h.
  near(value(E.context(m).result('formula:massFlow'),{'ρ':2,Q_v:3}),3.6);
  const saved=E.validateModel(JSON.parse(JSON.stringify(m)));
  assert.deepEqual(saved,m);
  assert.deepEqual(E.resultUnit(saved.formulas[0]).parts,{numerator:'g',denominator:'h'});
  const invalid=E.clone(m);invalid.inputUnits['Q_v:flow']='ratio:kg:h';
  assert.throws(()=>E.validateModel(invalid),/inputenhed/);
});

test('squared time and grouped mass-temperature denominators retain their physical exponents',()=>{
  const acceleration=U.combine('acceleration','cm','min2');
  near(value(U.convert({type:'symbol',symbol:'a'},acceleration),{a:360000}),1);
  const m=model('heatingEnergy');
  m.inputUnits={'m:mass':'g','c_p:heatCapacity':U.combine('heatCapacity','Wh','g_C').id,'ΔT:temperatureChange':'C'};
  m.formulas[0].resultUnit='kJ';
  // 2 g × 0.5 Wh/(g·°C) × 10 °C = 10 Wh = 36 kJ.
  const ast=E.context(m).result('formula:heatingEnergy');
  near(value(ast,{m:2,c_p:.5,'ΔT':10}),36);
  assert.equal(U.get('heatCapacity',m.inputUnits['c_p:heatCapacity']).label,'Wh/(g·°C)');
  assert(!E.plain(ast).includes('273'));
});

test('references accept a result unit composed from independently selected parts',()=>{
  const m=model('flowFromVolume','massFlow');
  m.formulas[0].resultUnit=U.combine('flow','mL','h').id;
  m.formulas[1].expression.args.Q=E.ref('formula:flowFromVolume');
  m.formulas[1].resultUnit=U.combine('massFlow','g','min').id;
  const c=E.context(m),inputs={V:.001,t:60,'ρ':1000};
  near(value(c.result('formula:flowFromVolume'),inputs),60000);
  near(value(c.result('formula:massFlow'),inputs),1000);
  const compact=c.result('formula:massFlow','compact');
  near(value(compact,{'ρ':1000,Q_v:60000}),1000);
  assert(E.plain(compact).includes('[mL/h]'));
});
