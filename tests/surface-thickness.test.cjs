'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const setup=(...types)=>({version:6,title:'Tykkelser',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:types.map((type,i)=>E.newShape(type,'part'+i,i+1)),connections:[],formulas:[]});
const near=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const value=(m,target)=>{const r=E.evaluate(E.context(m).target(target));assert.equal(r.status,'ready',r.error||JSON.stringify(r.missing));return r.value;};
const set=(m,scope,symbol,dimension,value,unit)=>{m.inputValues[scope+':'+symbol+':'+dimension]=String(value);if(unit)m.inputUnits[scope+':'+symbol+':'+dimension]=unit;};
test('box mass uses side, bottom, top and individual face thickness; open faces do not require a thickness',()=>{
 let m=setup('box');m.formulas.push(E.newTankMass(m,'mass'));
 m=E.setPlateThickness(m,'part0','side',E.symbol('t_side1'));m=E.setPlateThickness(m,'part0','bottom',E.symbol('t_bund1'));
 assert.equal(m.formulas[0].expression.formula,'tankMassSurfaces');
 for(const [symbol,v,u]of [['L_1',100,'cm'],['B_1',8.5,'dm'],['h_1',4500,'mm'],['t_side1',1.25,'mm'],['t_bund1',2.5,'mm']])set(m,'shape:part0',symbol,'length',v,u);
 set(m,'formula:mass','ρ_mat','density',8,'g_cm3');
 near(value(m,'formula:mass'),183.5);near(value(m,'shape:part0:volume'),3.825);
 assert.match(E.plain(E.context(m).target('formula:mass')),/2 · \(.*\) · 0,00125/);
 m=E.setPlateThickness(m,'part0','top',E.symbol('t_top1'));set(m,'shape:part0','t_top1','length',4,'mm');
 near(value(m,'formula:mass'),183.5);m.shapes[0].faces.top='closed';near(value(m,'formula:mass'),210.7);
 m=E.setPlateThickness(m,'part0','front',E.symbol('t_front1'));set(m,'shape:part0','t_front1','length',2,'mm');near(value(m,'formula:mass'),237.7);
 assert.deepEqual(E.validateModel(E.clone(m)),m);
 for(const key of Object.keys(m.shapes[0].faces))m.shapes[0].faces[key]='open';
 m.inputValues={'formula:mass:ρ_mat:density':'8'};near(value(m,'formula:mass'),0);
});
test('joined plates are excluded and their own thickness returns after disconnecting',()=>{
 let m=setup('box','halfCylinder');m.shapes[1].faces.top='closed';
 m=E.setPlateThickness(m,'part0','bottom',E.symbol('t_bund1'));set(m,'shape:part0','t_bund1','length',10,'mm');
 m=E.setPlateThickness(m,'part1','top',E.symbol('t_top2'));set(m,'shape:part1','t_top2','length',20,'mm');
 m=E.connect(m,{shape:'part0',face:'bottom'},{shape:'part1',face:'top'},'join');
 m.formulas.push(E.newTankMass(m,'mass'));set(m,'shape:part0','L_1','length',2);set(m,'shape:part0','B_1','length',1);set(m,'shape:part0','h_1','length',3);set(m,'tank:tank','t_plade','length',1,'mm');set(m,'formula:mass','ρ_mat','density',8000);
 const joined=value(m,'formula:mass');near(joined,(18+Math.PI+Math.PI/4)*.001*8000);
 const symbols=E.variables(E.context(m).target('formula:mass')).map(v=>v.symbol);assert(!symbols.includes('t_bund1'));assert(!symbols.includes('t_top2'));
 m=E.disconnect(m,'join');set(m,'shape:part1','L_2','length',2);set(m,'shape:part1','D_2','length',1);near(value(m,'formula:mass'),joined+2*(.01+.02)*8000);
});
test('side thickness follows the normal diameter reference while explicit and sloped diameter thicknesses remain separate',()=>{
 for(const type of ['cylinder','cone']){
  let m=setup(type);m=E.setDiameterBasis(m,'part0','outer');m=E.setPlateThickness(m,'part0','side',E.symbol('t_side1'));
  set(m,'shape:part0','D_1','length',100,'mm');set(m,'shape:part0','t_side1','length',2,'mm');set(m,'shape:part0','t_radial1','length',3,'mm');
  near(value(m,'shape:part0:inner:D'),type==='cylinder'?.096:.094);
 }
 let m=setup('cylinder');m.shapes[0].diameter.thickness=E.symbol('other');m=E.setPlateThickness(m,'part0','side',E.symbol('t_side1'));assert.equal(m.shapes[0].diameter.thickness.symbol,'other');
 assert.throws(()=>E.setPlateThickness(m,'part0','side',E.ref('shape:part0:plate:side')),/cirkulær/);
 assert.throws(()=>E.validateModel({...m,shapes:[{...m.shapes[0],plateThickness:{invalid:E.symbol('x')}}]}),/pladetykkelser/);
 assert.throws(()=>E.setPlateThickness(m,'part0','side',E.ref('shape:part0:volume')),/forkert størrelse/);
});
test('all shapes reduce to area times common thickness and support independent material references',()=>{
 for(const type of Object.keys(E.SHAPES)){
  const m=setup(type);for(const a of Object.values(E.SHAPES[type].inputs))set(m,'shape:part0',a.symbol+'_1','length',2);
  set(m,'tank:tank','t_plade','length',3,'mm');
  near(value(m,'shape:part0:materialVolume'),value(m,'shape:part0:area')*.003);
  assert(E.context(m).map.has('shape:part0:materialVolume'));
 }
});
