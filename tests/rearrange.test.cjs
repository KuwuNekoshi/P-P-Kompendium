'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const near=(a,b,label)=>assert(Number.isFinite(a)&&Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`);
// Independent numerical substitution into source equations, only in tests.
function templateValue(t,args){
  if(typeof t==='string')return Object.hasOwn(args,t)?args[t]:t==='π'?Math.PI:Number(t);
  const [op,...children]=t,a=children.map(c=>templateValue(c,args));
  switch(op){
    case 'group':return a[0];case 'add':return a.reduce((x,y)=>x+y);case 'sub':return a[0]-a[1];
    case 'mul':return a.reduce((x,y)=>x*y);case 'div':return a[0]/a[1];case 'pow':return a[0]**a[1];case 'sqrt':return Math.sqrt(a[0]);default:assert.fail(op);
  }
}
function value(ast,vars){
  if(ast.type==='symbol'){assert(Object.hasOwn(vars,ast.symbol),ast.symbol);return vars[ast.symbol];}
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  return templateValue([ast.type,...ast.children.map(c=>String(value(c,vars)))],{});
}
function inputs(f,scale=1){
  const defaults={scalar:2,length:3,time:4,area:8,volume:12,mass:5,density:1000,velocity:3,acceleration:2,flow:6,massFlow:4,pressure:20,force:12,power:15,energy:30,torque:9,massMoment:10,rotationRate:8,countPerLength:2,temperature:320,temperatureChange:25,heatCapacity:4200,specificEnergy:100};
  const named={D:6,d:2,R:5,r:1,L:5,B:3,h:4,s:7,G:20,g:6,m1:3,m2:5,cp1:4200,cp2:2300,T1:300,T2:360,end:350,start:290,large:8,small:2,fast:8,slow:2,eta:.8};
  return Object.fromEntries(Object.entries(f.args).map(([key,a])=>[key,(named[key]??defaults[a.dimension])*scale]));
}
const model=(...ids)=>({version:5,title:'Omskrivninger',tank:E.defaultTank(),inputUnits:{},shapes:[],connections:[],formulas:ids.map(id=>E.newFormula(id,id))});

test('every base formula and every input has an explicit rearrangement or a specific explanation',()=>{
  assert.equal(Object.keys(E.BASE_FORMULAS).length,128);
  const blocked=[];
  for(const [id,f]of Object.entries(E.BASE_FORMULAS)){
    const options=E.rearrangements(id);
    assert(options.some(o=>o.key!=='given'&&o.available),id);
    for(const key of ['given',...Object.keys(f.args)])assert(options.some(o=>o.key===key),id+':'+key);
    for(const o of options){if(!o.available){assert(o.reason.length>20);blocked.push(id+':'+o.key);}else assert(E.FORMULAS[o.id]);}
  }
  assert.deepEqual(blocked,['frustumMantle:D','frustumMantle:d']);
  for(const key of ['D','d'])assert(E.rearrangements('frustumMantleSlant').some(o=>o.key===key&&o.available));
});

test('every generated inverse satisfies its original equation for two independent input sets',()=>{
  let verified=0;
  for(const [id,f]of Object.entries(E.FORMULAS))if(f.rearranged){
    const base=E.BASE_FORMULAS[f.rearranged.base],key=f.rearranged.key;
    for(const scale of [1,1.31]){
      const args=inputs(base,scale),given=templateValue(base.template,args);
      const answer=templateValue(f.template,{...args,given});
      if(!f.rearranged.negative)near(answer,args[key],id);
      near(templateValue(base.template,{...args,[key]:answer}),given,id+' substituted back');
      const known={...args,given},bindings=new Map(Object.entries(f.args).map(([k,a])=>[E.Units.key(a),known[k]]));
      const ast=E.formulaAst(id);
      function annotate(node){
        if(node.type==='symbol')node.inputValue=bindings.get(E.Units.key(node)).toLocaleString('en-US',{useGrouping:false,maximumSignificantDigits:16});
        (node.children||[]).forEach(annotate);
      }
      annotate(ast);
      const computed=E.evaluate(ast);assert.equal(computed.status,'ready',id+': '+computed.error);
      near(computed.value,answer,id+' engine evaluation');
    }
    assert(E.math(E.formulaAst(id)).includes('<math'));assert(E.tex(E.formulaAst(id)).length);
    verified++;
  }
  assert.equal(verified,323);
});

test('belt speed can find n or D with minute units and preserves existing formulas and references',()=>{
  const m=model('beltSpeed','distance');m.inputUnits={'D:length':'mm','n:rotationRate':'rpm'};
  m.formulas[0].resultUnit='m_min';
  // Use a dimensionally compatible downstream consumer of the original speed.
  m.formulas[1]=E.newFormula('distance','distance');m.formulas[1].expression.args.v=E.ref('formula:beltSpeed');
  const before=JSON.stringify(m),next=E.rearrangeFormula(m,'beltSpeed','inverse:beltSpeed:n','motor');
  assert.equal(JSON.stringify(m),before);assert.deepEqual(next.formulas.slice(0,2),m.formulas);
  const n=next.formulas.at(-1);assert.equal(n.dimension,'rotationRate');assert.equal(n.resultUnit,'rpm');
  assert.equal(next.inputUnits['v:velocity'],'m_min');assert.equal(n.expression.args.given.kind,'symbol');
  const ast=E.context(next).result('formula:motor');assert(!E.plain(ast).includes('60'));
  near(value(ast,{v:60*Math.PI,D:500}),120,'rpm');
  const restored=E.validateModel(JSON.parse(JSON.stringify(next)));
  assert.equal(E.plain(E.context(restored).result('formula:motor')),E.plain(ast));
  const diameter=E.rearrangeFormula(next,'motor','inverse:beltSpeed:D','diameter');
  near(value(E.context(diameter).result('formula:diameter'),{v:60*Math.PI,n:120}),500,'diameter in mm');
  const back=E.rearrangeFormula(next,'motor','beltSpeed','back');
  assert.equal(back.formulas.at(-1).resultUnit,'m_min');
  near(value(E.context(back).result('formula:back'),{D:500,n:120}),60*Math.PI,'back to speed');
});

test('other bound inputs remain live and the original result becomes a known quantity',()=>{
  const m=model('beltSpeed','diameter');
  m.formulas[0].expression.args.D=E.ref('formula:diameter');m.formulas[1].expression.args.r=E.symbol('r_tromle');
  const next=E.rearrangeFormula(m,'beltSpeed','inverse:beltSpeed:n','n');
  assert.deepEqual(next.formulas.at(-1).expression.args.D,E.ref('formula:diameter'));
  near(value(E.context(next).result('formula:n'),{v:6*Math.PI,r_tromle:.5}),6,'live radius');
  next.formulas[1].expression.args.r=E.symbol('ny_radius');
  assert(E.variables(E.context(next).result('formula:n')).some(v=>v.symbol==='ny_radius'));
  assert.throws(()=>E.rearrangeFormula(m,'beltSpeed','inverse:mass:V','bad'),/findes ikke/);
});

test('cube roots and quadratic alternatives keep their exact exponents and stated conditions',()=>{
  const cube=E.FORMULAS['inverse:sphereVolume:D'];
  assert(E.plain(E.formulaAst('inverse:sphereVolume:D')).includes('^(1 / 3)'));
  near(templateValue(cube.template,{given:36*Math.PI}),6,'cube root');
  const options=E.rearrangements('generalDistance').filter(o=>o.key==='t');assert.equal(options.length,2);
  const times=options.map(o=>templateValue(E.FORMULAS[o.id].template,{given:8,v:6,a:-2})).sort((a,b)=>a-b);
  near(times[0],2,'first positive time');near(times[1],4,'second positive time');
  assert(options.every(o=>E.FORMULAS[o.id].note.includes('a = 0')));
  assert(E.FORMULAS['inverse:coneClosed:h'].note.includes('Krav før kvadrering:'));
});

test('pyramid and V-bottom inverses handle square bases and degenerate quadratic coefficients',()=>{
  for(const id of ['rectangularPyramidOpen','rectangularPyramidClosed','triangularPrismOpen','triangularPrismClosed']){
    const f=E.BASE_FORMULAS[id];
    for(const args of [{L:3,B:3,h:4},{L:3,B:6,h:2},{L:3,B:2,h:0}]){
      const given=templateValue(f.template,args);
      for(const key of Object.keys(f.args))near(templateValue(E.FORMULAS['inverse:'+id+':'+key].template,{...args,given}),args[key],id+':'+key);
    }
  }
});

test('inverted temperature and efficiency formulas retain affine and percentage conversions',()=>{
  const m=model('temperatureDifference');m.formulas[0].resultUnit='C';
  m.inputUnits={'T_start:temperature':'C','T_slut:temperature':'C'};
  const next=E.rearrangeFormula(m,'temperatureDifference','inverse:temperatureDifference:end','end');
  near(value(E.context(next).result('formula:end'),{'ΔT':30,T_start:20}),50,'Celsius result');
  const power=model('inputPower');power.inputUnits={'P_teo:power':'kW','η:scalar':'percent'};power.formulas[0].resultUnit='kW';
  const efficiency=E.rearrangeFormula(power,'inputPower','inverse:inputPower:eta','efficiency');
  near(value(E.context(efficiency).result('formula:efficiency'),{P_teo:8,P_virk:10}),80,'percentage');
});
