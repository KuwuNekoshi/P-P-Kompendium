'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/geometry.js'),S=require('../dist/solid-preview.js');
const close=(a,b)=>assert(Number.isFinite(a)&&Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const setup=(...types)=>({version:6,title:'Firkantet tank',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:types.map((t,i)=>E.newShape(t,'s'+i,i+1)),connections:[],formulas:[]});
function set(m,i,values){const s=m.shapes[i];for(const [key,value]of Object.entries(values))m.inputValues[`shape:${s.id}:${s.inputs[key].symbol}:length`]=String(value);}
function value(m,target){const r=E.evaluate(E.context(m).target(target));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;}
const end=(i,face)=>({shape:'s'+i,face});

test('rectangular frustum volume covers similar rectangles, unequal tapers, a box, a pyramid and a wedge',()=>{
 const m=setup('pyramidFrustum');
 // Independent expectations: classical frustum, Simpson integration, prism, pyramid and triangular prism.
 for(const [d,expected]of [
  [{L:4,B:2,l:2,b:1,h:3},14],
  [{L:4,B:3,l:2,b:1,h:2},(2*1+4*3*2+4*3)*2/6],
  [{L:4,B:3,l:4,b:3,h:2},24],
  [{L:4,B:3,l:0,b:0,h:2},8],
  [{L:4,B:3,l:4,b:0,h:2},12],
  [{L:2,B:1,l:4,b:3,h:2},38/3]
 ]){set(m,0,d);close(value(m,'shape:s0:volume'),expected);}
});

test('all 64 plate combinations match trapezoid areas, material thicknesses and 3D openings',()=>{
 const m=setup('pyramidFrustum'),s=m.shapes[0];set(m,0,{L:6,B:4,l:2,b:1,h:3});
 const areas={top:24,bottom:2,front:2.5*Math.sqrt(13),back:2.5*Math.sqrt(13),left:4*Math.sqrt(11.25),right:4*Math.sqrt(11.25)};
 m.inputValues['tank:tank:t_plade:length']='0.002';
 // setPlateThickness is immutable.
 let next=E.setPlateThickness(m,'s0','side',E.symbol('t_side'));
 next=E.setPlateThickness(next,'s0','bottom',E.symbol('t_bottom'));
 next.inputValues['shape:s0:t_side:length']='0.003';next.inputValues['shape:s0:t_bottom:length']='0.005';
 const faces=Object.keys(areas);
 for(let mask=0;mask<64;mask++){
  let area=0,material=0;
  for(const [i,key]of faces.entries()){
   const closed=!!(mask&(1<<i));next.shapes[0].faces[key]=closed?'closed':'open';
   if(closed){area+=areas[key];material+=areas[key]*(key==='top'?.002:key==='bottom'?.005:.003);}
  }
  close(value(next,'shape:s0:area'),area);close(value(next,'shape:s0:materialVolume'),material);close(value(next,'shape:s0:volume'),33);
  const mesh=S.mesh(next);for(const key of faces)assert.equal(mesh.triangles.filter(t=>t.face===key).length,next.shapes[0].faces[key]==='closed'?2:0);
 }
});

test('both rectangular ends fit boxes in either order and orientation, without hidden joint plates',()=>{
 for(const stubFace of ['top','bottom'])for(const boxFace of ['top','bottom'])for(const reverse of [false,true]){
  let m=setup('box','pyramidFrustum');set(m,0,{L:6,B:4,h:5});set(m,1,{L:6,B:4,l:2,b:1,h:3});
  m=reverse?E.connect(m,end(1,stubFace),end(0,boxFace),'j'):E.connect(m,end(0,boxFace),end(1,stubFace),'j');
  const [box,stub]=G.layout(m,['s0','s1']).parts,top=stubFace==='top';
  close(box.r,top?stub.r:stub.bottom);close(box.depth,top?stub.depth:stub.bottomDepth);
  close(box.y+box.orientation*(boxFace==='top'?0:box.h),stub.y+stub.orientation*(top?0:stub.h));
  const mesh=S.mesh(m);assert(!mesh.triangles.some(t=>(t.shape==='s0'&&t.face===boxFace)||(t.shape==='s1'&&t.face===stubFace)));
  for(const t of mesh.triangles){assert(t.vertices.flat().every(Number.isFinite));close(Math.hypot(...t.normal),1);}
  assert(!/NaN|undefined/.test(G.render(m,['s0','s1'])));assert.deepEqual(E.validateModel(E.clone(m)),m);
 }
});

test('a complete box–frustum–box stack shares two different rectangles and restores inputs when separated',()=>{
 let m=setup('box','pyramidFrustum','box');set(m,0,{L:6,B:4,h:5});set(m,1,{L:99,B:99,l:2,b:1,h:3});set(m,2,{L:77,B:77,h:1});
 const original=E.clone(m.shapes[2]);m=E.connect(m,end(0,'bottom'),end(1,'top'),'upper');m=E.connect(m,end(1,'bottom'),end(2,'top'),'lower');
 close(value(m,'shape:s0:volume')+value(m,'shape:s1:volume')+value(m,'shape:s2:volume'),155);
 const parts=G.layout(m,['s0','s1','s2']).parts;close(parts[0].r,parts[1].r);close(parts[2].r,parts[1].bottom);close(parts[2].depth,parts[1].bottomDepth);
 const volume=E.variables(E.context(m).target('shape:s2:volume')).map(v=>v.symbol);assert(volume.includes('l_2'));assert(volume.includes('b_2'));assert(!volume.includes('L_3'));
 assert.deepEqual(E.disconnect(m,'lower').shapes[2],original);assert.deepEqual(E.removeShape(m,'s1').shapes[1],original);
 m.formulas.push(E.newFillHeight('hx','s0'));
 // Bottom box holds 2 m³, then 1 m up the frustum (integral of (2+4x/3)*(1+x)).
 m.inputValues['formula:hx:V_produkt:volume']=String(2+2+5/3+4/9);close(value(m,'formula:hx'),2);
 m.inputValues['formula:hx:V_produkt:volume']='47';close(value(m,'formula:hx'),4.5);
 m.inputValues['formula:hx:V_produkt:volume']='163';assert.match(E.evaluate(E.context(m).target('formula:hx')).error,/overstiger/);
});

test('Hx limiting profiles and the displayed partial-volume equation agree in both directions',()=>{
 const m=setup('pyramidFrustum');m.formulas.push(E.newFillHeight('hx','s0'));
 for(const dims of [{L:4,B:2,l:2,b:1,h:3},{L:4,B:3,l:4,b:3,h:2},{L:4,B:3,l:0,b:0,h:2},{L:4,B:3,l:4,b:0,h:2}]){
  set(m,0,dims);
  for(const inverted of [false,true]){
   m.formulas[0].expression.inverted=inverted;
   const x=dims.h*.37,L0=inverted?dims.L:dims.l,B0=inverted?dims.B:dims.b,kL=((inverted?dims.l:dims.L)-L0)/dims.h,kB=((inverted?dims.b:dims.B)-B0)/dims.h;
   const volume=L0*B0*x+(L0*kB+B0*kL)*x*x/2+kL*kB*x*x*x/3;m.inputValues['formula:hx:V_produkt:volume']=String(volume);
   close(value(m,'formula:hx'),x);
   const ast=E.context(m).target('formula:hx'),equation=E.FillHeight.volumeAt(ast.parts[0],ast.children,{type:'constant',value:String(x)});
   close(E.evaluate(equation).value,volume);
  }
 }
});
