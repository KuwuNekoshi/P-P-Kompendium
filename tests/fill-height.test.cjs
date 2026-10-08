'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),F=E.FillHeight,G=require('../dist/geometry.js'),Guide=require('../dist/calculator-guide.js');
const close=(a,b,message='',eps=2e-11)=>assert(Math.abs(a-b)<=eps*Math.max(1,Math.abs(b)),`${message}: ${a} ≠ ${b}`);
function setup(type='cylinder'){
 const shape=E.newShape(type,'s',1),m={version:6,title:'Hx',tank:E.defaultTank(),shapes:[shape],connections:[],inputUnits:{},inputValues:{},formulas:[E.newFillHeight('hx','s')]};
 values(m,shape,{D:4,d:2,B:4,L:5,l:2,b:1,h:3});return m;
}
function values(m,s,d){for(const [key,e]of Object.entries(s.inputs))m.inputValues[`shape:${s.id}:${e.symbol}:length`]=String(d[key]);}
function product(m,v,id='hx'){m.inputValues[`formula:${id}:V_produkt:volume`]=v.toLocaleString("en-US",{useGrouping:false,maximumSignificantDigits:17});}
function tree(m,id='hx'){return E.context(m).target('formula:'+id);}
function result(m,id='hx'){const r=E.evaluate(tree(m,id));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;}
function cap(m,id='s'){return E.evaluate(E.context(m).target('shape:'+id+':volume')).value;}
function height(type,d){return type==='sphere'?d.D:['hemisphere','halfCylinder'].includes(type)?d.D/2:d.h;}
// Independent dimensional profile equations: volume up to x above the lowest point.
function partial(type,d,x,orientation=1){
 const r=d.D/2,H=height(type,d),flip=orientation<0;
 const sphere=y=>Math.PI*y*y*(r-y/3);
 const segment=y=>d.L*(r*r*Math.acos((r-y)/r)-(r-y)*Math.sqrt(2*r*y-y*y));
 const capacity={cylinder:Math.PI*r*r*H,pipe:Math.PI*r*r*H,box:d.L*d.B*H,cone:Math.PI*r*r*H/3,pyramid:d.L*d.B*H/3,triangularPrism:d.L*d.B*H/2,sphere:4*Math.PI*r*r*r/3,hemisphere:2*Math.PI*r*r*r/3,halfCylinder:Math.PI*r*r*d.L/2}[type];
 if(['box','cylinder','pipe'].includes(type))return capacity*x/H;
 if(['cone','pyramid','triangularPrism'].includes(type)){const n=type==='triangularPrism'?2:3;return flip?capacity*(1-((H-x)/H)**n):capacity*(x/H)**n;}
 if(type==='pyramidFrustum'){const L0=flip?d.L:d.l,B0=flip?d.B:d.b,kL=((flip?d.l:d.L)-L0)/H,kB=((flip?d.b:d.B)-B0)/H;return L0*B0*x+(L0*kB+B0*kL)*x*x/2+kL*kB*x*x*x/3;}
 if(type==='sphere')return sphere(x);
 if(type==='hemisphere')return flip?sphere(x):capacity-sphere(r-x);
 if(type==='halfCylinder')return flip?capacity-segment(r-x):segment(x);
 const rb=(flip?d.D:d.d)/2,rt=(flip?d.d:d.D)/2,rx=rb+(rt-rb)*x/H;
 return Math.PI*x*(rb*rb+rb*rx+rx*rx)/3;
}
for(const type of Object.keys(E.SHAPES))test('Hx: '+type+' follows its dimensional fill profile in both orientations',()=>{
 const m=setup(type),d={D:4,d:2,B:4,L:5,l:2,b:1,h:3},H=height(type,d),C=cap(m);
 for(const flipped of [false,true]){
  m.formulas[0].expression.inverted=flipped;
  for(const fraction of [0.001,0.17,0.5,0.83,0.999]){
   const x=H*fraction,v=partial(type,d,x,flipped?-1:1);product(m,v);
   close(result(m),x,type+' at '+fraction,fraction>0.99?1e-9:2e-11);
   const ast=tree(m),p=ast.parts[0],g=F.geometry(p,ast.children);
   close(E.evaluate(g.capacity).value,C,'capacity agrees with the existing catalogue');
   const b=F.branch(ast,0,d);
   if(b.local)close(E.evaluate(b.local).value,x,'displayed inverse',fraction>0.99?1e-9:2e-11);
   assert.doesNotThrow(()=>E.math(ast));assert.doesNotThrow(()=>E.tex(ast));
  }
  product(m,0);assert.equal(result(m),0);assert.equal(E.plain(tree(m)),'0');
  product(m,C);close(result(m),H,'full tank');
 }
});

test('cone, cylinder and upper hemisphere fill bottom-up across every boundary',()=>{
 let m=setup();m.shapes[0].name='Middle';
 const cone=E.newShape('cone','cone',2),dome=E.newShape('hemisphere','dome',3);m.shapes.push(cone,dome);values(m,cone,{D:9,h:2});values(m,dome,{D:9});
 m=E.connect(m,{shape:'s',face:'bottom'},{shape:'cone',face:'base'},'bottom');
 m=E.connect(m,{shape:'s',face:'top'},{shape:'dome',face:'base'},'top');
 const C=cap(m,'cone'),B=cap(m),T=cap(m,'dome');
 for(const [v,h]of [[C/8,1],[C,2],[C+1e-8,2+1e-8/(4*Math.PI)],[C+B/2,3.5],[C+B,5],[C+B+partial('hemisphere',{D:4},1),6],[C+B+T,7]]){product(m,v);close(result(m),h);}
 const ast=tree(m);assert.deepEqual(ast.parts.map(p=>p.id),['cone','s','dome']);
 const layout=G.layout(m,['cone','s','dome']);
 const visual=[...layout.parts].sort((a,b)=>(b.y+b.orientation*b.h/2)-(a.y+a.orientation*a.h/2));
 assert.deepEqual(ast.parts.map(p=>p.id),visual.map(p=>p.shape.id));
 m.formulas[0].expression.shapeId='dome';assert.deepEqual(tree(m).parts.map(p=>p.id),['cone','s','dome'],'any anchor selects the same assembly');
 m.formulas[0].expression.inverted=true;product(m,T/2);assert.deepEqual(tree(m).parts.map(p=>p.id),['dome','s','cone']);assert(result(m)<2);
});
for(const type of ['halfCylinder','triangularPrism','pyramid','pyramidFrustum'])test('box with '+type+' uses the shared rectangular join and remaining volume',()=>{
 let m=setup('box');const bottom=E.newShape(type,'bottom',2);m.shapes.push(bottom);values(m,bottom,{D:99,B:99,L:99,l:2,b:1,h:2});
 m=E.connect(m,{shape:'s',face:'bottom'},{shape:'bottom',face:'top'},'join');
 const d={D:4,B:4,L:5,l:2,b:1,h:2},C=cap(m,'bottom');
 for(const x of [0.2,1,1.8]){product(m,partial(type,d,x));close(result(m),x);}
 product(m,C+20*1.4);close(result(m),3.4);
 assert.deepEqual(tree(m).parts.map(p=>p.id),['bottom','s']);
});

test('a cylinder-shaped frustum and a pointed frustum use valid limiting cases',()=>{
 const m=setup('frustum');m.inputValues['shape:s:d_1:length']='4';product(m,6*Math.PI);close(result(m),1.5);
 assert(!E.plain(tree(m)).includes('−'),'equal radii do not generate 0/0');
 m.inputValues['shape:s:d_1:length']='0';product(m,cap(m)/8);close(result(m),1.5);
 for(const diameter of ['3.999999999999999','4.000000000000001']){m.inputValues['shape:s:d_1:length']=diameter;product(m,cap(m)/2);close(result(m),1.5);close(E.evaluate(F.branch(tree(m),0,{D:4,d:Number(diameter)}).local).value,1.5,'stable displayed inverse');}
});

test('Hx preconverts volume, outer diameter and thickness, then applies result units once',()=>{
 let m=setup();m=E.setDiameterBasis(m,'s','outer');
 m.inputValues['shape:s:D_1:length']='2200';m.inputUnits['shape:s:D_1:length']='mm';
 m.inputValues['tank:tank:t_plade:length']='100';m.inputUnits['tank:tank:t_plade:length']='mm';
 product(m,1000);m.inputUnits['formula:hx:V_produkt:volume']='L';m.formulas[0].resultUnit='cm';
 close(result(m),1/Math.PI);close(E.evaluate(E.context(m).result('formula:hx')).value,100/Math.PI);
 const text=E.plain(E.context(m).result('formula:hx'),null,'values');assert(!text.includes('2200'));assert(!text.includes('1000'));
});

test('Hx formulas have separate product volumes, references share their sources, and saves round-trip',()=>{
 const m=setup();m.formulas.push(E.newFillHeight('other','s'));product(m,1);product(m,2,'other');close(result(m,'other'),2*result(m));
 const flow=E.newFormula('vol','boxVolume');flow.expression.args={L:E.symbol('L'),B:E.symbol('B'),h:E.symbol('h')};m.formulas.push(flow);
 for(const key of ['L','B','h'])m.inputValues[`formula:vol:${key}:length`]='1';
 m.formulas[1].expression.volume=E.ref('formula:vol');flow.resultUnit='L';close(result(m,'other'),result(m));
 m.formulas.push(E.newFormula('area','rectangleArea'));m.formulas.at(-1).expression.args={B:E.ref('formula:other'),L:E.symbol('L')};m.inputValues['formula:area:L:length']='3';
 m.formulas[1].resultUnit='cm';close(E.evaluate(E.context(m).target('formula:area')).value,3*result(m));
 assert.deepEqual(E.validateModel(E.clone(m)),m);
 assert(E.dependsOn(m,'formula:area','formula:vol'));assert(E.usersOf(m,'shape','s').includes('Produkthøjde i tank (Hx)'));
});

test('separate tanks and inclusion in the generic tank sum never leak into Hx',()=>{
 const m=setup(),extra=E.newShape('box','unrelated',2);m.shapes.push(extra);values(m,extra,{L:999,B:999,h:999});
 m.shapes[0].include=false;product(m,1);close(result(m),1/(4*Math.PI));assert.equal(tree(m).parts.length,1);
 m.formulas[0].expression.shapeId='unrelated';close(result(m),1/(999*999));
});

test('invalid geometry, negative volume, overflow and missing anchors give actionable errors',()=>{
 const m=setup();product(m,-1);assert.match(E.evaluate(tree(m)).error,/negativt/);
 product(m,cap(m)+0.000001);assert.match(E.evaluate(tree(m)).error,/overstiger/);
 product(m,1);m.inputValues['shape:s:D_1:length']='0';assert.match(E.evaluate(tree(m)).error,/positive/);
 m.inputValues['shape:s:D_1:length']='-2';assert.match(E.evaluate(tree(m)).error,/positive/);
 m.formulas[0].expression.shapeId='missing';assert.match(E.context(m).safe('formula:hx').error,/Vælg den tank/);
 m.formulas[0].expression.shapeId='s';m.shapes[0].inputs.h=E.ref('formula:hx');assert.match(E.context(m).safe('formula:hx').error,/Cirkulær/);
 m.shapes[0].inputs.h=E.symbol('h_1');m.formulas[0].expression.volume=E.ref('formula:hx');assert.throws(()=>E.validateModel(m),/forkert størrelse/);
});

test('incomplete formulas retain all real inputs, offer symbolic branches and never invent a height',()=>{
 const m=setup('halfCylinder');delete m.inputValues['shape:s:D_1:length'];
 const ast=tree(m),state=F.analyze(ast,E.evaluate);assert.equal(state.status,'incomplete');assert.equal(E.evaluate(ast).status,'incomplete');
 assert.equal(E.plain(ast),'H_fyldt + h_del');assert.deepEqual(E.variables(ast).map(v=>v.symbol).sort(),['D_1','L_1','V_produkt']);
 assert.equal(Guide.create(E.context(m),'formula:hx'),null,'conditional profiles use their own TI plan');
 const b=F.shortBranch(ast,0);assert.equal(b.local,null);assert.match(E.plain(b.equation),/acos/);assert.match(E.math(b.equation),/acos/);
});

test('the circular-segment solver remains stable very near an empty tank',()=>{
 const m=setup('halfCylinder');
 product(m,cap(m)*1e-12);const h=result(m),state=F.analyze(tree(m),E.evaluate);
 assert(h>0&&h<0.000001);close(F.fraction(state.parts[0],state.parts[0].d,h/2)/1e-12,1,'tiny volume',1e-10);
});

test('24 joined cylinders fit the expansion budget and keep bottom-to-top ordering',()=>{
 let m=setup();for(let i=2;i<=24;i++){
  const s=E.newShape('cylinder','s'+i,i);m.shapes.push(s);values(m,s,{D:4,h:3});
  m=E.connect(m,{shape:i===2?'s':'s'+(i-1),face:'top'},{shape:s.id,face:'bottom'},'j'+i);
 }
 product(m,cap(m)*23.5);close(result(m),70.5);assert.equal(tree(m).parts.length,24);assert.equal(tree(m).parts[0].id,'s');
});

test('volume from minute-based flow and time cancels redundant unit factors inside Hx',()=>{
 const m=setup();m.formulas[0].expression.volume=E.newExpression('filledVolume');
 m.inputUnits['formula:hx:Q_v:flow']='m3_min';m.inputUnits['formula:hx:t:time']='min';
 const symbolic=E.plain(tree(m).children[0],null,'units');assert(!symbolic.includes('60'));
 m.inputValues['formula:hx:Q_v:flow']='2';m.inputValues['formula:hx:t:time']='3';close(result(m),6/(4*Math.PI));
});
