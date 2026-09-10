'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const G = require('../dist/geometry.js');
const S = require('../dist/solid-preview.js');

function model(...types) {
  return {version:4,title:'Samling',tank:E.defaultTank(),shapes:types.map((type,i)=>E.newShape(type,'part'+i,i+1)),formulas:[],connections:[]};
}
const end = (shape,face) => ({shape:'part'+shape,face});
const closeAll = m => {for(const s of m.shapes)for(const face of Object.keys(s.faces))s.faces[face]='closed';return m;};
// Numeric evaluation is deliberately test-only, to check the symbolic formulas
// against independent geometric examples. The application never evaluates them.
function value(ast,vars) {
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const a=ast.children.map(child=>value(child,vars));
  switch(ast.type){
    case 'add':return a.reduce((x,y)=>x+y,0);
    case 'sub':return a[0]-a[1];
    case 'mul':return a.reduce((x,y)=>x*y,1);
    case 'div':return a[0]/a[1];
    case 'pow':return a[0]**a[1];
    case 'sqrt':return Math.sqrt(a[0]);
    case 'group':return a[0];
    default:assert.fail(ast.type);
  }
}
function near(actual,expected){assert(Math.abs(actual-expected)<1e-8,`${actual} ≠ ${expected}`);}
const total=(m,dimension)=>E.context(m).expand(E.assembly(dimension),dimension);

test('cylinder and hemispherical tip share a diameter and exclude both meeting disks',()=>{
  let m=model('cylinder','hemisphere');
  m=E.connect(m,end(0,'bottom'),end(1,'base'),'joint');
  const vars={D_1:6,h_1:10};
  near(value(total(m,'volume'),vars),108*Math.PI);
  near(value(total(m,'area'),vars),78*Math.PI);
  assert.deepEqual(E.variables(total(m,'volume')).map(v=>v.symbol),['D_1','h_1']);
  const volume=E.plain(total(m,'volume'));
  m.shapes[0].faces.top='closed';
  near(value(total(m,'area'),vars),87*Math.PI);
  assert.equal(E.plain(total(m,'volume')),volume);
  assert.deepEqual(E.validateModel(E.clone(m)),m);
});

test('a cylinder with two hemispheres has no exposed plane end faces',()=>{
  let m=closeAll(model('cylinder','hemisphere','hemisphere'));
  m=E.connect(m,end(0,'bottom'),end(1,'base'),'bottom');
  m=E.connect(m,end(0,'top'),end(2,'base'),'top');
  near(value(total(m,'volume'),{D_1:6,h_1:10}),126*Math.PI);
  near(value(total(m,'area'),{D_1:6,h_1:10}),96*Math.PI);
  assert.equal(S.mesh(m).triangles.filter(t=>t.face!=='body').length,0);
});

test('shared dimensions keep following a formula substituted at their source',()=>{
  let m=E.connect(model('cylinder','hemisphere'),end(0,'bottom'),end(1,'base'),'joint');
  m.shapes[0].inputs.D=E.form('diameter',{r:E.symbol('r_common')});
  m=E.validateModel(m);
  assert.deepEqual(E.variables(total(m,'volume')).map(v=>v.symbol),['r_common','h_1']);
  near(value(total(m,'volume'),{r_common:3,h_1:10}),108*Math.PI);
  assert.equal(E.sharedInputs(m).canonical.get('shape:part1:input:D'),'shape:part0:input:D');
});

test('disconnecting and deleting restore saved dimensions and face choices',()=>{
  const original=model('cylinder','hemisphere');
  original.shapes[1].inputs.D=E.form('diameter',{r:E.symbol('r_tip')});
  const joined=E.connect(original,end(0,'bottom'),end(1,'base'),'joint');
  const apart=E.disconnect(joined,'joint');
  assert.deepEqual(apart.shapes,original.shapes);
  assert.equal(apart.connections.length,0);
  assert(E.variables(total(apart,'volume')).some(v=>v.symbol==='r_tip'));
  const removed=E.removeShape(joined,'part0');
  assert.equal(removed.connections.length,0);
  assert.deepEqual(removed.shapes[0],original.shapes[1]);
  near(value(total(removed,'volume'),{r_tip:2}),16*Math.PI/3);
  E.validateModel(removed);
});

test('joining rejects occupied, incompatible, missing and cyclic end connections',()=>{
  const m=model('cylinder','cylinder','box','sphere');
  assert.match(E.canConnect(m,end(0,'bottom'),end(0,'top')),/sig selv/);
  assert.match(E.canConnect(m,end(0,'bottom'),end(2,'top')),/samme form/);
  assert.match(E.canConnect(m,end(0,'bottom'),end(3,'base')),/ikke den valgte flade/);
  const joined=E.connect(m,end(0,'bottom'),end(1,'top'),'joint');
  assert.match(E.canConnect(joined,end(0,'bottom'),end(1,'bottom')),/allerede sammenføjet/);
  assert.match(E.canConnect(joined,end(0,'top'),end(1,'bottom')),/samme samling/);
  const invalid=E.clone(joined);invalid.connections.push({...invalid.connections[0],id:'duplicate'});
  assert.throws(()=>E.validateModel(invalid),/allerede sammenføjet/);
  const malformed=E.clone(joined);delete malformed.shapes[0].faces.bottom;
  assert.throws(()=>E.validateModel(malformed),/ugyldige flader/);
});

test('a connection cannot create a circular dimension reference',()=>{
  const m=model('cylinder','hemisphere');
  m.shapes[0].inputs.D=E.ref('shape:part1:input:D');
  assert(E.context(m).safe('shape:part0:volume').ok);
  assert.throws(()=>E.connect(m,end(0,'bottom'),end(1,'base'),'joint'),/cirkulær målreference/);
  assert.equal(m.connections.length,0);
});

test('a frustum small end shares its small diameter, not its large diameter',()=>{
  const m=E.connect(model('frustum','hemisphere'),end(0,'bottom'),end(1,'base'),'joint');
  const c=E.context(m);
  assert.equal(c.map.get('shape:part1:input:D').sharedTarget,'shape:part0:input:d');
  near(value(c.target('shape:part1:volume'),{d_1:4}),16*Math.PI/3);
  assert(E.variables(c.target('shape:part0:volume')).some(v=>v.symbol==='D_1'));
});

test('box faces can be chosen independently, including no remaining faces',()=>{
  const m=model('box'),s=m.shapes[0];
  for(const key of Object.keys(s.faces))s.faces[key]='open';
  assert.equal(E.plain(total(m,'area')),'0');
  s.faces.front='closed';
  near(value(total(m,'area'),{L_1:5,h_1:7}),35);
  s.faces.left='closed';
  near(value(total(m,'area'),{L_1:5,B_1:3,h_1:7}),56);
  assert.equal(S.mesh(m).triangles.length,4);
});

test('legacy surface presets migrate without changing their areas or references',()=>{
  for(const [type,definition]of Object.entries(E.SHAPES))for(const [surface,[,formula]]of Object.entries(definition.surfaces)){
    const legacy=model(type);legacy.version=2;delete legacy.connections;
    legacy.shapes[0].surface=surface;delete legacy.shapes[0].faces;
    const migrated=E.validateModel(legacy);
    assert.equal(migrated.version,5);assert.deepEqual(migrated.connections,[]);
    const vars={D_1:8,d_1:4,h_1:11,L_1:7,B_1:5};
    // Pipe length has the symbol L rather than h.
    const rawVars=Object.fromEntries(Object.entries(definition.inputs).map(([key,a])=>[E.FORMULAS[formula].args[key]?.symbol||a.symbol,vars[a.symbol+'_1']]));
    near(value(E.context(migrated).target('shape:part0:area'),vars),value(E.formulaAst(formula),rawVars));
  }
  const old=model('cylinder','cone');old.version=2;delete old.connections;
  for(const s of old.shapes){s.surface='mantle';delete s.faces;}
  old.shapes[1].inputs.D=E.ref('shape:part0:input:D');
  const migrated=E.validateModel(old);
  assert.deepEqual(migrated.shapes[1].inputs.D,old.shapes[1].inputs.D);
  assert.equal(E.variables(total(migrated,'volume')).filter(v=>v.symbol.startsWith('D')).length,1);
});

test('every supported pair meets at one plane with matching size and opposite normals',()=>{
  const ports=Object.entries(E.SHAPES).flatMap(([type,s])=>Object.entries(s.faces).filter(([,f])=>f.join).map(([key,f])=>({type,key,...f})));
  for(const a of ports)for(const b of ports)if(a.kind===b.kind){
    const m=E.connect(model(a.type,b.type),end(0,a.key),end(1,b.key),'joint');
    const parts=G.layout(m,['part0','part1']).parts;
    const plane=(p,f)=>p.y+p.orientation*(f.direction===-1?0:p.h);
    near(plane(parts[0],a),plane(parts[1],b));
    near(a.direction*parts[0].orientation,-b.direction*parts[1].orientation);
    near(a.direction===-1?parts[0].r:parts[0].bottom,b.direction===-1?parts[1].r:parts[1].bottom);
    const triangles=S.mesh(m).triangles;
    assert(!triangles.some(t=>(t.shape==='part0'&&t.face===a.key)||(t.shape==='part1'&&t.face===b.key)));
  }
});

test('3D openings remove only the chosen caps and all mesh coordinates stay finite',()=>{
  const m=closeAll(model('cylinder'));
  const closed=S.mesh(m),capCount=closed.triangles.filter(t=>t.face==='top').length;
  assert(capCount>0);
  m.shapes[0].faces.top='open';
  const open=S.mesh(m);
  assert.equal(closed.triangles.length-open.triangles.length,capCount);
  assert(open.triangles.some(t=>t.face==='bottom'));
  assert(open.edges.some(e=>e.state==='open'));
  const all=S.mesh(model(...Object.keys(E.SHAPES)));
  assert(all.triangles.length>0&&all.radius>0);
  for(const t of all.triangles){assert(t.vertices.flat().every(Number.isFinite));near(Math.hypot(...t.normal),1);}
  near(Math.hypot(...S.rotate([1,2,3],{yaw:.7,pitch:.4})),Math.sqrt(14));
});

test('sketch labels escape user-supplied names and expose face choices accessibly',()=>{
  const m=model('cylinder');m.shapes[0].name='<img src=x onerror=bad>';
  const svg=G.render(m,['part0'],'part0');
  assert(!svg.includes('<img'));assert(svg.includes('&lt;img'));
  assert(svg.includes('Åben')&&svg.includes('Lukket'));
  assert(svg.includes('data-action="inspect-face"')&&svg.includes('tabindex="0"'));
});

test('T9 tank mass follows actual joined surfaces, plate thickness and material density',()=>{
  let m=E.connect(model('cylinder','hemisphere','pipe'),end(0,'bottom'),end(1,'base'),'joint');
  const f=E.newTankMass(m,'tank-mass');m.formulas.push(f);
  const vars={D_1:2,h_1:3,t_plade:.003,'ρ_mat':7850};
  const mass=()=>value(E.context(m).target('formula:tank-mass'),vars);
  near(mass(),8*Math.PI*.003*7850);
  m.shapes[0].faces.top='closed';
  near(mass(),9*Math.PI*.003*7850);
  vars.t_plade=.006;
  near(mass(),9*Math.PI*.006*7850);
  const before=mass();m=E.removeShape(m,'part2');near(mass(),before);
  m=E.removeShape(m,'part1');
  near(mass(),8*Math.PI*.006*7850); // Cylinder mantle plus two exposed disks.
  assert.deepEqual(E.validateModel(E.clone(m)),m);
});

test('own mass and liquid mass keep different densities and actual liquid volume',()=>{
  const m=model('cylinder');m.formulas.push(E.newTankMass(m,'tank'));
  const full=E.newFilledTankMass(m,'full');m.formulas.push(full);
  assert.deepEqual(full.expression.args.tank,E.ref('formula:tank'));
  assert.deepEqual(full.expression.args.V,E.symbol('V_væske'));
  const vars={D_1:2,h_1:3,t_plade:.003,'ρ_mat':7850,'ρ_væske':1000,'V_væske':.8};
  near(value(E.context(m).target('formula:full'),vars),7*Math.PI*.003*7850+800);
  const labels=E.variables(E.context(m).target('formula:full')).map(v=>v.symbol);
  assert(labels.includes('ρ_mat')&&labels.includes('ρ_væske'));
  m.formulas[0].expression.args.thickness=E.ref('formula:full');
  assert.throws(()=>E.validateModel(m),/forkert størrelse/);
});

test('tank mass supports an explicitly known plate area and a box with all faces open',()=>{
  const empty=model();empty.formulas.push(E.newTankMass(empty,'tank'));
  near(value(E.context(empty).target('formula:tank'),{A_plade:5,t_plade:.002,'ρ_mat':8000}),80);
  const m=model('box');for(const key of Object.keys(m.shapes[0].faces))m.shapes[0].faces[key]='open';
  m.formulas.push(E.newTankMass(m,'tank'));
  near(value(E.context(m).target('formula:tank'),{t_plade:.002,'ρ_mat':8000}),0);
});

test('school transport and heat formulas agree with their minute, hour and kilo-unit versions',()=>{
  near(value(E.formulaAst('screwFlow'),{D:.3,d:.1,s:.2,n:60/60,'η':.4})*3600,
    Math.PI/4*(.3**2-.1**2)*.2*60*60*.4);
  near(value(E.formulaAst('beltSpeed'),{D:.2,n:90/60})*60,Math.PI*.2*90);
  near(value(E.formulaAst('heatingEnergy'),{m:10,c_p:4190,'ΔT':30})/1000,10*4.19*30);
  near(value(E.formulaAst('heatFlowPower'),{Q_m:2,c_p:4190,'ΔT':30})/1000,2*4.19*30);
  near(value(E.formulaAst('phasePower'),{Q_m:2,H_f:2260000})/1000,2*2260);
  near(value(E.formulaAst('headFromPressure'),{'Δp':98100,'ρ':1000,g:9.81}),10);
});

test('school mixing and head-sign formulas keep their physical meaning',()=>{
  near(value(E.formulaAst('mixTemperature'),{c_p1:4190,m_1:2,T_1:293.15,c_p2:4190,m_2:1,T_2:353.15}),313.15);
  near(value(E.formulaAst('totalHeadSuction'),{H:10,H_m:2,H_i:1,H_s:3}),16);
  near(value(E.formulaAst('totalHeadInlet'),{H:10,H_m:2,H_i:1,H_s:3}),10);
  const m=model();m.formulas.push(E.newFormula('absolute','mixTemperature'),E.newFormula('heat','heatingEnergy'));
  m.formulas[1].expression.args.dT=E.ref('formula:absolute');
  assert.throws(()=>E.validateModel(m),/forkert størrelse/);
  assert.equal(E.FORMULAS.massMoment.dimension,'massMoment');
  assert.equal(E.FORMULAS.torque.dimension,'torque');
});

test('outside diameter converts once to inside diameter for cylinders, pipes and spherical parts',()=>{
  for(const [type,expected]of [['cylinder',3*Math.PI],['pipe',3*Math.PI],['sphere',4*Math.PI/3],['hemisphere',2*Math.PI/3]]){
    const m=E.setDiameterBasis(model(type),'part0','outer');
    const vars={D_1:2.2,h_1:3,L_1:3,t_plade:.1},c=E.context(m);
    near(value(c.target('shape:part0:inner:D'),vars),2);
    near(value(c.target('shape:part0:outer:D'),vars),2.2);
    near(value(c.target('shape:part0:volume'),vars),expected);
    assert.match(E.plain(c.target('shape:part0:volume')),/D_1 − \(2 · t_plade\)/);
    if(type==='pipe')near(value(c.target('shape:part0:crossSection'),vars),Math.PI);
  }
});

test('joined inside and outside declarations share the bore rather than raw diameter labels',()=>{
  let m=E.setDiameterBasis(model('cylinder','hemisphere'),'part0','outer');
  m=E.connect(m,end(0,'bottom'),end(1,'base'),'joint');
  let vars={D_1:2.02,h_1:3,t_plade:.01};
  near(value(total(m,'volume'),vars),11*Math.PI/3);
  near(value(E.context(m).target('shape:part1:input:D'),vars),2);
  m.shapes[1].diameter.thickness=E.symbol('t_tip');vars.t_tip=.02;
  m=E.setDiameterBasis(m,'part1','outer');
  near(value(E.context(m).target('shape:part1:input:D'),vars),2.04);
  near(value(E.context(m).target('shape:part1:inner:D'),vars),2);
  near(value(total(m,'volume'),vars),11*Math.PI/3);
  assert.deepEqual(E.validateModel(E.clone(m)),m);
});

test('a pipe can use its own wall thickness without replacing the tank plate thickness',()=>{
  let m=E.setDiameterBasis(model('cylinder','pipe'),'part1','outer');
  m.shapes[1].diameter.thickness=E.symbol('t_pipe');
  const vars={D_1:2,h_1:3,D_2:.06,t_pipe:.005,t_plade:.02,'ρ_mat':7850};
  m.formulas.push(E.newTankMass(m,'tank'));
  near(value(E.context(m).target('shape:part1:crossSection'),vars),Math.PI/4*.05**2);
  near(value(E.context(m).target('formula:tank'),vars),7*Math.PI*.02*7850);
});

test('sloped parts use radial distance separately from normal plate thickness',()=>{
  let m=E.setDiameterBasis(model('frustum'),'part0','outer');
  const vars={D_1:4.2,d_1:2.2,h_1:3,t_radial1:.1,t_plade:.08};
  near(value(E.context(m).target('shape:part0:inner:D'),vars),4);
  near(value(E.context(m).target('shape:part0:inner:d'),vars),2);
  near(value(E.context(m).target('shape:part0:volume'),vars),7*Math.PI);
  assert(!E.variables(E.context(m).target('shape:part0:volume')).some(v=>v.symbol==='t_plade'));
  near(value(E.formulaAst('radialThickness'),{t_plade:.08,s:5,h:4}),.1);
  m=E.setDiameterBasis(model('cone'),'part0','outer');
  near(value(E.context(m).target('shape:part0:volume'),{D_1:2.2,h_1:3,t_radial1:.1}),Math.PI);
});

test('changing the shared plate thickness updates both outside-to-inside conversion and T9',()=>{
  const m=E.setDiameterBasis(model('cylinder'),'part0','outer');
  m.formulas.push(E.newTankMass(m,'tank'));
  m.tank.thickness=E.form('diameter',{r:E.symbol('t_half')});
  for(const half of [.005,.01]){
    const t=2*half,D=2.02-2*t,vars={D_1:2.02,h_1:3,t_half:half,'ρ_mat':7850};
    near(value(E.context(m).target('shape:part0:volume'),vars),Math.PI/4*D**2*3);
    near(value(E.context(m).target('formula:tank'),vars),(Math.PI*D*3+Math.PI/4*D**2)*t*7850);
  }
});

test('diameter toggles and disconnections preserve declared values and per-part conventions',()=>{
  const original=model('cylinder','hemisphere');
  const before=E.plain(total(original,'volume'));
  let m=E.setDiameterBasis(original,'part0','outer');
  assert.deepEqual(m.shapes[0].inputs,original.shapes[0].inputs);
  m=E.setDiameterBasis(m,'part0','inner');
  assert.equal(E.plain(total(m,'volume')),before);
  m=E.setDiameterBasis(m,'part1','outer');
  const unjoined=E.clone(m);
  m=E.connect(m,end(0,'bottom'),end(1,'base'),'joint');
  const detached=E.disconnect(m,'joint');
  assert.deepEqual(detached,unjoined);
  const removed=E.removeShape(m,'part0');
  near(value(E.context(removed).target('shape:part1:inner:D'),{D_2:1.2,t_plade:.1}),1);
});

test('version 3 setups retain inside diameters and reuse the existing T9 thickness',()=>{
  const old=model('cylinder');old.version=3;delete old.tank;delete old.shapes[0].diameter;
  const f=E.newFormula('tank','tankMass');f.expression.args.A=E.assembly('area');f.expression.args.thickness=E.symbol('s_plate');old.formulas.push(f);
  const migrated=E.validateModel(old);
  assert.equal(migrated.version,5);
  assert.equal(migrated.shapes[0].diameter.basis,'inner');
  assert.deepEqual(migrated.tank.thickness,E.symbol('s_plate'));
  assert.deepEqual(migrated.formulas[0].expression.args.thickness,E.ref('tank:thickness'));
  near(value(E.context(migrated).target('formula:tank'),{D_1:2,h_1:3,s_plate:.01,'ρ_mat':7850}),7*Math.PI*.01*7850);
  assert.deepEqual(E.validateModel(E.clone(migrated)),migrated);
});

test('invalid diameter bases, non-length thicknesses and newly circular conversions are rejected',()=>{
  const m=model('cylinder');m.shapes[0].diameter.basis='average';
  assert.throws(()=>E.validateModel(m),/indre\/ydre diameter/);
  m.shapes[0].diameter.basis='inner';m.formulas.push(E.newFormula('mass','mass'));
  m.shapes[0].diameter.thickness=E.ref('formula:mass');
  assert.throws(()=>E.validateModel(m),/forkert størrelse/);
  const cycle=model('cylinder');cycle.tank.thickness=E.ref('shape:part0:inner:D');
  assert(E.context(cycle).safe('shape:part0:volume').ok);
  assert.throws(()=>E.setDiameterBasis(cycle,'part0','outer'),/cirkulær målreference/);
  assert.equal(cycle.shapes[0].diameter.basis,'inner');
});
