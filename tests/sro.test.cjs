'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load,sources}=require('../tools/sro-sources.cjs');
const c=load(),E=c.PP,S=c.SRO,C=c.SROCircuit;
const near=(x,y)=>assert.ok(Number.isFinite(x)&&Math.abs(x-y)<1e-7*Math.max(1,Math.abs(y)),`${x} ≠ ${y}`);
function result(t,f){const r=S.context(t).safe('formula:'+f.id,'expanded',false);assert.equal(r.ok,true,r.error);const n=E.evaluate(r.ast);assert.equal(n.status,'ready',JSON.stringify(n));return n.value;}
function set(t,f,k,v,u){S.set(t.model,f,k,String(v),u||E.Units.base(E.FORMULAS[f.expression.formula].args[k].dimension).id);}
function circuit(type,values){const t=S.empty();C.preset(t,type);t.circuit.resistors.forEach((r,i)=>set(t,t.model.formulas.find(f=>f.id===r.formulaId),'R',values[i]));C.sync(t);return t;}
test('SRO modules contain 49 visible formula families with valid units and inverse choices',()=>{
 assert.equal(Object.values(E.BASE_FORMULAS).filter(f=>!f.hidden).length,49);
 for(const [id,f]of Object.entries(E.BASE_FORMULAS)){
  const t=S.empty(),q=S.add(t,id);assert.doesNotThrow(()=>S.validate(t),id);
  for(const a of Object.values(f.args))if(a.unit)assert.doesNotThrow(()=>E.Units.get(a.dimension,a.unit));
  if(!f.hidden)assert.equal(E.rearrangements(id).filter(o=>!o.available).length,0,id);
 }
});
test('SRO electrical units and all visible inverse formulas round-trip a nondegenerate sample',()=>{
 for(const [id,def]of Object.entries(E.BASE_FORMULAS))if(!def.hidden){
  const t=S.empty(),f=S.add(t,id),values={};let i=0;
  for(const [key,a]of Object.entries(def.args)){values[key]=a.dimension==='scalar'?0.3+(++i)/30:10+(++i)*7;set(t,f,key,values[key]);}
  // Ordered ranges and positive root samples.
  if(values.D&&values.d)values.D=100,values.d=20;
  if(values.ns&&values.n)values.ns=50,values.n=48;
  if(values.high&&values.low)values.high=100,values.low=0;
  if(values.Il&&values.Ih)values.Il=.004,values.Ih=.020;
  if('I' in values&&'Il' in values)values.I=.012;
  for(const key of Object.keys(values))set(t,f,key,values[key]);
  const y=result(t,f);
  for(const choice of E.rearrangements(id).filter(o=>o.key!=='given'&&o.available)){
   const inv=S.add(t,choice.id);set(t,inv,'given',y);for(const [key,value]of Object.entries(values))if(key!==choice.key)set(t,inv,key,value);
   near(result(t,inv),values[choice.key]);t.model.formulas.pop();
  }
 }
});
test('milliamps, percent, Celsius/Kelvin, bar and rpm use exact base conversions',()=>{
 let t=S.empty(),f=S.add(t,'ohm');set(t,f,'R',2,'kohm');set(t,f,'I',10,'mA');near(result(t,f),20);
 const p=S.add(t,'shaftPower');set(t,p,'P1',5,'kW');set(t,p,'eta',87,'percent');near(result(t,p),4350);
 const temp=S.add(t,'pt100');set(t,temp,'t',293.15,'K');near(result(t,temp),107.73);
 const ns=S.add(t,'syncSpeed');near(result(t,ns),25);const out=S.context(t).safe('formula:'+ns.id,'expanded',true);near(E.evaluate(out.ast).value,1500);
 const force=S.add(t,'cylinderForce');set(t,force,'p',6,'bar');set(t,force,'A',10,'cm2');near(result(t,force),600);
});
test('transmitters and error percentages reproduce supplied examples',()=>{
 const t=S.empty(),f=S.add(t,'temperatureTransmitter');set(t,f,'low',0,'C');set(t,f,'high',100,'C');set(t,f,'I',12,'mA');near(result(t,f),50);
 const e=S.add(t,'signalError');set(t,e,'measured',16.6,'mA');set(t,e,'expected',16,'mA');near(result(t,e),.0375);
 const sum=S.add(t,'combinedError2');set(t,sum,'f1',3.75,'percent');set(t,sum,'f2',.25,'percent');near(result(t,sum),Math.hypot(.0375,.0025));
});
test('circuit wires determine series, parallel and mixed resistance, independent of geometry',()=>{
 for(const [type,values,want]of [['series',[100,200],300],['parallel',[100,200],200/3],['mixed',[100,200,300],220]]){
  const t=circuit(type,values),f=t.model.formulas.find(f=>f.id===t.circuit.resultId);near(result(t,f),want);
  t.circuit.resistors.forEach(r=>{r.x=440;r.y=250;r.vertical=true;});C.sync(t);near(result(t,f),want);
 }
});
test('bridge reduction agrees with independent nodal analysis, including unbalanced bridge',()=>{
 for(const values of [[100,100,100,100,100],[100,200,330,470,560],[.01,1e3,1e4,50,.2]]){
  const t=circuit('bridge',values),b=t.circuit,r=result(t,t.model.formulas.find(f=>f.id===b.resultId)),map=Object.fromEntries(b.resistors.map((r,i)=>[r.formulaId,values[i]])),n=C.solve(b,map,12);
  const total=n[b.resistors[0].formulaId].current+n[b.resistors[2].formulaId].current;near(r,12/total);
 }
});
test('open paths, short circuits, zero/negative resistances and deleted components do not yield stale finite results',()=>{
 const t=circuit('series',[100,200]),b=t.circuit,f=t.model.formulas.find(f=>f.id===b.resultId);
 b.wires.pop();C.sync(t);assert.equal(S.context(t).safe('formula:'+f.id).ok,false);
 C.wire(b,'source:plus','source:minus');C.sync(t);near(result(t,f),0);assert.throws(()=>C.solve(b,{},12),/Kortsluttet/);
 const negative=circuit('series',[100,-200]);assert.equal(S.context(negative).safe('formula:'+negative.circuit.resultId).ok,false);
});
test('independent formulas have local values while referenced resistance follows circuit edits',()=>{
 const t=circuit('parallel',[100,100]),f=S.add(t,'inverse:ohm:I');f.expression.args.R=E.ref('formula:'+t.circuit.resultId);set(t,f,'given',12,'V');near(result(t,f),.24);
 const r=t.model.formulas.find(f=>f.id===t.circuit.resistors[0].formulaId);set(t,r,'R',300);near(result(t,f),.16);
 const own=S.add(t,'ohm'),other=S.add(t,'ohm');set(t,own,'R',10);set(t,own,'I',2);set(t,other,'R',30);set(t,other,'I',3);near(result(t,own),20);near(result(t,other),90);
});
test('custom SRO formula dimensional checks distinguish amps and volts',()=>{
 assert.doesNotThrow(()=>E.CustomFormula.check(E.CustomFormula.parse('U / R'),{U:{dimension:'voltage'},R:{dimension:'resistance'}},'current'));
 assert.throws(()=>E.CustomFormula.check(E.CustomFormula.parse('U + I'),{U:{dimension:'voltage'},I:{dimension:'current'}},'voltage'));
});
test('task import round trip preserves circuits, local units, groups and IO; malformed wires rejected',()=>{
 const t=circuit('mixed',[10,20,30]);t.model=E.addFormulaGroup(t.model,'electric','Elektricitet');t.model=E.assignFormulaGroup(t.model,t.circuit.resultId,'electric');t.ioRows=[{type:'AI',address:'IW64',name:'Tryk',note:'4–20 mA'}];
 const recovered=S.validate(JSON.parse(JSON.stringify(t)));C.sync(recovered);near(result(recovered,recovered.model.formulas.find(f=>f.id===recovered.circuit.resultId)),22);
 const broken=S.clone(t);broken.circuit.wires[0].to='unknown';assert.throws(()=>S.validate(broken),/Ugyldigt kredsløb/);
 assert.throws(()=>S.validate({...t,format:'pp-kompendium'}),/SRO/);
});
test('result display counts digits after leading fractional zeros and never uses E notation',()=>{
 assert.equal(S.format(2.003234),'2,00323');assert.equal(S.format(.0008136),'0,000814');assert.equal(S.format(.009999),'0,0100');assert.equal(S.format(0),'0,000');assert.equal(S.format(1e-25),'0,000000000000000000000000100');
});
