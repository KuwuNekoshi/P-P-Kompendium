'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/geometry.js'),S=require('../dist/solid-preview.js');
const types=['halfCylinder','triangularPrism','pyramid'];
const setup=(...types)=>({version:5,title:'Tankbund',inputUnits:{},tank:E.defaultTank(),shapes:types.map((type,i)=>E.newShape(type,'part'+i,i+1)),connections:[],formulas:[]});
const end=(i,face)=>({shape:'part'+i,face});
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
// Independent numerical expectations are test-only; the app stays symbolic.
function value(ast,vars){
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const a=ast.children.map(c=>value(c,vars));
  switch(ast.type){
    case 'add':return a.reduce((x,y)=>x+y,0);case 'sub':return a[0]-a[1];
    case 'mul':return a.reduce((x,y)=>x*y,1);case 'div':return a[0]/a[1];
    case 'pow':return a[0]**a[1];case 'sqrt':return Math.sqrt(a[0]);case 'group':return a[0];
    default:assert.fail(ast.type);
  }
}
const total=(m,dimension)=>E.context(m).expand(E.assembly(dimension),dimension);
const volumes={halfCylinder:45*Math.PI,triangularPrism:120,pyramid:80};
const faceAreas={
  halfCylinder:{top:60,front:4.5*Math.PI,back:4.5*Math.PI},
  triangularPrism:{top:60,front:12,back:12,left:50,right:50},
  pyramid:{top:60,front:3*Math.sqrt(41),back:3*Math.sqrt(41),left:25,right:25}
};

test('every open/closed combination counts only the selected plates and keeps the same capacity',()=>{
  for(const type of types){
    const m=setup(type),shape=m.shapes[0],faces=Object.keys(shape.faces),vars={D_1:6,B_1:6,L_1:10,h_1:4};
    for(let mask=0;mask<2**faces.length;mask++){
      let area=type==='halfCylinder'?30*Math.PI:0;
      for(const [i,key]of faces.entries()){shape.faces[key]=mask&(1<<i)?'closed':'open';if(shape.faces[key]==='closed')area+=faceAreas[type][key];}
      near(value(total(m,'area'),vars),area);
      near(value(total(m,'volume'),vars),volumes[type]);
      const mesh=S.mesh(m);
      for(const face of faces)assert.equal(mesh.triangles.some(t=>t.face===face),shape.faces[face]==='closed');
    }
    if(type!=='pyramid')near(value(E.context(m).target('shape:part0:crossSection'),vars),type==='halfCylinder'?4.5*Math.PI:12);
  }
});

test('each bottom shares the box length and width, excludes the internal rectangle and feeds T9',()=>{
  for(const type of types){
    let m=E.connect(setup('box',type),end(0,'bottom'),end(1,'top'),'joint');
    const vars={L_1:10,B_1:6,h_1:7,h_2:4,t_plade:0.002,ρ_mat:7850};
    const bottomArea=(type==='halfCylinder'?30*Math.PI:0)+Object.entries(faceAreas[type]).filter(([key])=>key!=='top').reduce((sum,[,area])=>sum+area,0);
    near(value(total(m,'volume'),vars),420+volumes[type]);
    near(value(total(m,'area'),vars),224+bottomArea);
    const c=E.context(m),widthKey=type==='halfCylinder'?'D':'B';
    assert.equal(c.map.get('shape:part1:input:L').sharedTarget,'shape:part0:input:L');
    assert.equal(c.map.get('shape:part1:input:'+widthKey).sharedTarget,'shape:part0:input:B');
    assert(!E.variables(total(m,'volume')).some(v=>['L_2','B_2','D_2'].includes(v.symbol)));
    m.formulas.push(E.newTankMass(m,'mass'));
    near(value(E.context(m).target('formula:mass'),vars),(224+bottomArea)*0.002*7850);
    m.shapes[0].faces.top='closed';
    near(value(total(m,'area'),vars),284+bottomArea);
    near(value(total(m,'volume'),vars),420+volumes[type]);
    const imported=E.validateModel(JSON.parse(JSON.stringify(m)));
    near(value(E.context(imported).target('formula:mass'),vars),value(E.context(m).target('formula:mass'),vars));
  }
});

test('outside diameter and a box width share the inside size in either connection order',()=>{
  for(const halfIsSource of [false,true]){
    let m=setup('box','halfCylinder');
    m.shapes[1].diameter.basis='outer';
    m.inputUnits={'D_2:length':'mm','B_1:length':'cm','t_plade:length':'mm'};
    m=halfIsSource?E.connect(m,end(1,'top'),end(0,'bottom'),'joint'):E.connect(m,end(0,'bottom'),end(1,'top'),'joint');
    const vars={D_2:6000,B_1:600,L_1:10,L_2:10,h_1:7,t_plade:2};
    const c=E.context(m),inside=halfIsSource?5.996:6;
    near(value(c.target('shape:part0:input:B'),vars),inside);
    near(value(c.target('shape:part1:inner:D'),vars),inside);
    near(value(c.target('shape:part1:input:D'),vars),halfIsSource?6:6.004);
    near(value(total(m,'volume'),vars),10*inside*7+Math.PI*(inside/2)**2*10/2);
    assert(!c.list.some(d=>!c.safe(d.target).ok));
    if(halfIsSource)assert.equal(c.map.get('shape:part0:input:B').symbol,'D_indre2');
  }
});

test('joined dimensions follow formulas and disconnecting or removing restores original inputs',()=>{
  for(const type of types){
    const original=setup('box',type),raw=E.clone(original.shapes[1]);
    let m=E.connect(original,end(0,'bottom'),end(1,'top'),'joint');
    m.shapes[0].inputs.B=E.form('diameter',{r:E.symbol('r')});
    m.shapes[0].inputs.L=E.form('distance',{v:E.symbol('v'),t:E.symbol('t')});
    const vars={r:3,v:2,t:5,h_1:7,h_2:4};
    near(value(total(m,'volume'),vars),420+volumes[type]);
    const separated=E.disconnect(m,'joint');
    assert.deepEqual(separated.shapes[1],raw);
    const remaining=E.removeShape(m,'part0');
    assert.deepEqual(remaining.shapes[0],raw);assert.equal(remaining.connections.length,0);
  }
  const cyclic=setup('box','halfCylinder');
  cyclic.shapes[0].inputs.B=E.ref('shape:part1:input:D');
  assert.throws(()=>E.connect(cyclic,end(0,'bottom'),end(1,'top'),'joint'),/cirkulær/);
  assert(E.canConnect(setup('cylinder','pyramid'),end(0,'bottom'),end(1,'top')));
});

test('rectangular joins fit in both visual dimensions and keep every new mesh finite',()=>{
  for(const type of types)for(const face of ['top','bottom'])for(const reverse of [false,true]){
    const original=setup('box',type);
    const m=reverse?E.connect(original,end(1,'top'),end(0,face),'joint'):E.connect(original,end(0,face),end(1,'top'),'joint');
    const layout=G.layout(m,['part0','part1']),[box,bottom]=layout.parts;
    near(box.r,bottom.r);near(box.depth,bottom.depth);
    near(box.y+box.orientation*(face==='top'?0:box.h),bottom.y);
    const mesh=S.mesh(m);
    assert(!mesh.triangles.some(t=>(t.shape==='part0'&&t.face===face)||(t.shape==='part1'&&t.face==='top')));
    for(const t of mesh.triangles){assert(t.vertices.flat().every(Number.isFinite));near(Math.hypot(...t.normal),1);}
    const body=mesh.triangles.filter(t=>t.shape==='part1'),cutY=layout.height-30-bottom.y;
    for(const t of body)for(const p of t.vertices)assert((p[1]-cutY)*bottom.orientation<=1e-8);
    for(const x of [-box.r,box.r])for(const z of [-box.depth,box.depth]){
      assert(body.some(t=>t.vertices.some(p=>Math.abs(p[0]-x)<1e-8&&Math.abs(p[1]-cutY)<1e-8&&Math.abs(p[2]-z)<1e-8)));
    }
    assert(!/NaN|undefined/.test(G.render(m,['part0','part1'])));
  }
});

test('a V-bottom has a full length ridge while the pyramid has exactly one central tip',()=>{
  for(const type of ['triangularPrism','pyramid']){
    const m=setup(type),part=G.layout(m,['part0']).parts[0],mesh=S.mesh(m);
    const lowest=Math.min(...mesh.triangles.flatMap(t=>t.vertices.map(p=>p[1])));
    const tips=new Set(mesh.triangles.flatMap(t=>t.vertices).filter(p=>Math.abs(p[1]-lowest)<1e-8).map(p=>JSON.stringify(p)));
    assert.equal(tips.size,type==='pyramid'?1:2);
    for(const text of tips){const p=JSON.parse(text);near(p[0],0);near(Math.abs(p[2]),type==='pyramid'?0:part.depth);}
  }
});

test('half-cylinder end plates remain planar and its curved bottom is a true semicircle',()=>{
  const m=setup('halfCylinder'),layout=G.layout(m,['part0']),p=layout.parts[0],mesh=S.mesh(m);
  const cutY=layout.height-30-p.y;
  for(const face of ['front','back']){
    const vertices=mesh.triangles.filter(t=>t.face===face).flatMap(t=>t.vertices);
    assert(vertices.length);assert(vertices.every(v=>Math.abs(v[2]-vertices[0][2])<1e-8));
  }
  for(const vertex of mesh.triangles.filter(t=>t.face==='body').flatMap(t=>t.vertices)){
    near(vertex[0]**2+(vertex[1]-cutY)**2,p.r**2);assert(vertex[1]<=cutY+1e-8);
  }
});
