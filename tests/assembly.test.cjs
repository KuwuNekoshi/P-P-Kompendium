'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const G = require('../dist/geometry.js');
const S = require('../dist/solid-preview.js');

function model(...types) {
  return {version:3,title:'Samling',shapes:types.map((type,i)=>E.newShape(type,'part'+i,i+1)),formulas:[],connections:[]};
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
    assert.equal(migrated.version,3);assert.deepEqual(migrated.connections,[]);
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
