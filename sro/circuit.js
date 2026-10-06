/* Real wire topology: union-find, series/parallel reduction and star–mesh elimination. */
(function(root){
 'use strict';const E=root.PP,S=root.SRO;
 function create(task){
  if(task.circuit)return task.circuit;
  if(task.model.formulas.length>37)throw Error('Lav plads til spændingskilden og den samlede modstand.');
  const voltage=S.add(task,'knownVoltage',{name:'Spændingskilde',symbol:'U_kilde'});voltage.expression.args.U.symbol='U_kilde';
  const result=S.add(task,'knownResistance',{name:'Kredsløb · samlet modstand',symbol:'R_total'});
  task.circuit={source:{id:'source',formulaId:voltage.id,x:110,y:250},resistors:[],junctions:[],wires:[],resultId:result.id};sync(task);return task.circuit;
 }
 function addResistor(task,x=420,y=180){
  const b=create(task);if(b.resistors.length>=12)throw Error('Kredsløbet kan have højst 12 modstande.');
  let i=1;while(b.resistors.some(r=>r.label==='R_'+i))i++;
  const f=S.add(task,'knownResistance',{name:'Modstand '+i,symbol:'R_'+i});f.expression.args.R.symbol=f.symbol;
  const r={id:S.uid(),formulaId:f.id,label:f.symbol,x,y,vertical:false};b.resistors.push(r);return r;
 }
 const terminals=b=>['source:plus','source:minus',...b.resistors.flatMap(r=>[r.id+':a',r.id+':b']),...b.junctions.map(j=>j.id)];
 function points(b){const out={'source:plus':{x:b.source.x,y:b.source.y-60},'source:minus':{x:b.source.x,y:b.source.y+60}};for(const r of b.resistors){out[r.id+':a']={x:r.x-(r.vertical?0:60),y:r.y-(r.vertical?60:0)};out[r.id+':b']={x:r.x+(r.vertical?0:60),y:r.y+(r.vertical?60:0)};}for(const j of b.junctions)out[j.id]={x:j.x,y:j.y};return out;}
 function wire(b,from,to){const ids=terminals(b);if(from===to||!ids.includes(from)||!ids.includes(to))throw Error('Vælg to forskellige tilslutninger.');if(b.wires.some(w=>w.from===from&&w.to===to||w.from===to&&w.to===from))return; if(b.wires.length>=60)throw Error('Højst 60 ledninger.');b.wires.push({id:S.uid(),from,to});}
 function graph(b){
  const parent=new Map(terminals(b).map(x=>[x,x]));const find=x=>{if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
  for(const w of b.wires)parent.set(find(w.from),find(w.to));
  const start=find('source:plus'),end=find('source:minus'),edges=b.resistors.map(r=>({a:find(r.id+':a'),b:find(r.id+':b'),expr:E.ref('formula:'+r.formulaId),id:r.formulaId}));
  const reachable=new Set([start]);let changed=true;while(changed){changed=false;for(const e of edges)if(reachable.has(e.a)!==reachable.has(e.b)){reachable.add(e.a);reachable.add(e.b);changed=true;}}
  return {start,end,edges,parent,find,reachable};
 }
 function reduce(b){
  const g=graph(b);if(g.start===g.end)return {ok:true,short:true,expression:E.newExpression('shortCircuit'),used:[],note:'Spændingskilden er kortsluttet af en ledning. R = 0; en ideal kildes strøm er ikke endelig.'};
  if(!g.reachable.has(g.end))return {ok:false,error:'Ingen sammenhængende strømbane mellem + og −. Forbind tilslutningerne med ledninger.'};
  let edges=g.edges.filter(e=>e.a!==e.b&&g.reachable.has(e.a));const used=edges.map(e=>e.id);let operations=0;
  function put(a,b,expr){if(a===b)return;const existing=edges.find(e=>e.a===a&&e.b===b||e.a===b&&e.b===a);if(existing)existing.expr=E.form('parallel2',{R1:existing.expr,R2:expr});else edges.push({a,b,expr});}
  const originals=edges;edges=[];originals.forEach(e=>put(e.a,e.b,e.expr));
  while(true){
   const nodes=[...new Set(edges.flatMap(e=>[e.a,e.b]))].filter(n=>n!==g.start&&n!==g.end);
   if(!nodes.length)break;
   nodes.sort((a,b)=>edges.filter(e=>e.a===a||e.b===a).length-edges.filter(e=>e.a===b||e.b===b).length);
   const node=nodes[0],incident=edges.filter(e=>e.a===node||e.b===node);edges=edges.filter(e=>!incident.includes(e));
   if(incident.length<2)continue;
   for(let i=0;i<incident.length;i++)for(let j=i+1;j<incident.length;j++){
    if(++operations>200)throw Error('Kredsløbet er for stort til at skrive ud som én formel.');
    const a=incident[i],c=incident[j],expr=incident.length===2?E.form('series2',{R1:a.expr,R2:c.expr}):E.form('mesh'+incident.length,{a:a.expr,b:c.expr,...Object.fromEntries(incident.map((e,k)=>['R'+(k+1),e.expr]))});
    put(a.a===node?a.b:a.a,c.a===node?c.b:c.a,expr);
   }
  }
  let count=0;function check(e,depth=0){if(++count>900||depth>10)throw Error('Kredsløbet giver en for stor formel. Del det i mindre kredsløb.');if(e.kind==='formula')Object.values(e.args).forEach(c=>check(c,depth+1));}check(edges[0].expr);
  return {ok:true,expression:edges[0].expr,used,note:operations?'Ledningerne er reduceret til en ækvivalent modstand. Serie/parallel og stjerne–maske bruges efter behov.':'Modstanden ses direkte mellem kildens tilslutninger.'};
 }
 function sync(task){
  const b=task.circuit;if(!b)return null;const f=task.model.formulas.find(f=>f.id===b.resultId);if(!f)throw Error('Kredsløbets resultatformel mangler.');
  let r;try{r=reduce(b);}catch(e){r={ok:false,error:e.message};}
  f.expression=r.ok?r.expression:E.symbol('R_afbrudt');
  // A stale scalar input must never turn an open circuit into a finite resistance.
  delete task.model.inputValues['formula:'+f.id+':R_afbrudt:resistance'];
  return r;
 }
 function preset(task,type){
  const b=create(task);if(b.resistors.length||b.wires.length)throw Error('Start et nyt kredsløb før du vælger en skabelon.');
  const add=(x,y)=>addResistor(task,x,y),w=(a,c)=>wire(b,a,c),a=r=>r.id+':a',z=r=>r.id+':b',p='source:plus',m='source:minus';
  if(type==='series'){const r=add(360,130),s=add(650,130);w(p,a(r));w(z(r),a(s));w(z(s),m);}
  if(type==='parallel'){const r=add(460,130),s=add(460,340);w(p,a(r));w(p,a(s));w(z(r),m);w(z(s),m);}
  if(type==='mixed'){const r=add(300,130),s=add(620,130),t=add(620,340);w(p,a(r));w(z(r),a(s));w(z(r),a(t));w(z(s),m);w(z(t),m);}
  if(type==='bridge'){const r=add(320,120),s=add(650,120),t=add(320,380),u=add(650,380),v=add(490,250);v.vertical=true;w(p,a(r));w(p,a(t));w(z(r),a(s));w(z(t),a(u));w(z(s),m);w(z(u),m);w(z(r),a(v));w(z(t),z(v));}
  sync(task);return b;
 }
 function validate(input,model){
  const b=E.clone(input),fail=()=>{throw Error('Ugyldigt kredsløb i filen.');},id=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(x),pos=o=>o&&Number.isFinite(o.x)&&Number.isFinite(o.y)&&o.x>=60&&o.x<=840&&o.y>=60&&o.y<=440;
  if(!b||!Array.isArray(b.resistors)||b.resistors.length>12||!Array.isArray(b.wires)||b.wires.length>60||!Array.isArray(b.junctions)||b.junctions.length>20||b.source?.id!=='source'||!pos(b.source))fail();
  const all=[b.source,...b.resistors,...b.junctions];if(all.some(o=>!id(o.id)||!pos(o))||new Set(all.map(o=>o.id)).size!==all.length)fail();
  const f=id=>model.formulas.find(f=>f.id===id);if(f(b.source.formulaId)?.dimension!=='voltage'||f(b.resultId)?.dimension!=='resistance')fail();
  if(new Set([b.source.formulaId,b.resultId,...b.resistors.map(r=>r.formulaId)]).size!==b.resistors.length+2)fail();
  if(b.resistors.some(r=>f(r.formulaId)?.dimension!=='resistance'||typeof r.vertical!=='boolean'||!E.CustomFormula.validSymbol(r.label)))fail();
  const valid=terminals(b);if(b.wires.some(w=>!id(w.id)||w.from===w.to||!valid.includes(w.from)||!valid.includes(w.to))||new Set(b.wires.map(w=>w.id)).size!==b.wires.length)fail();
  return b;
 }
 // Independent nodal analysis for per-branch values. It is never substituted into the symbolic formula.
 function solve(b,values,voltage){
  const g=graph(b);if(g.start===g.end)throw Error('Kortsluttet spændingskilde.');if(!g.reachable.has(g.end))throw Error('Afbrudt kredsløb.');
  const edges=g.edges.filter(e=>g.reachable.has(e.a)&&e.a!==e.b);for(const e of edges)if(!(values[e.id]>0)||!Number.isFinite(values[e.id]))throw Error('Indtast alle modstande som positive tal.');
  const nodes=[...new Set(edges.flatMap(e=>[e.a,e.b]))].filter(n=>n!==g.start&&n!==g.end),n=nodes.length,A=Array.from({length:n},()=>Array(n+1).fill(0));
  edges.forEach(e=>{const conductance=1/values[e.id];for(const [a,b]of [[e.a,e.b],[e.b,e.a]]){const i=nodes.indexOf(a);if(i<0)continue;A[i][i]+=conductance;const j=nodes.indexOf(b);if(j>=0)A[i][j]-=conductance;else if(b===g.start)A[i][n]+=conductance*voltage;}});
  for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(A[i][k])>Math.abs(A[p][k]))p=i;[A[p],A[k]]=[A[k],A[p]];if(Math.abs(A[k][k])<Number.MIN_VALUE)throw Error('Kredsløbet kan ikke løses.');const d=A[k][k];for(let j=k;j<=n;j++)A[k][j]/=d;for(let i=0;i<n;i++)if(i!==k){const c=A[i][k];for(let j=k;j<=n;j++)A[i][j]-=c*A[k][j];}}
  const potentials=new Map([[g.start,voltage],[g.end,0],...nodes.map((v,i)=>[v,A[i][n]])]);
  return Object.fromEntries(g.edges.map(e=>{const u=potentials.get(e.a)-potentials.get(e.b),r=values[e.id];return [e.id,Number.isFinite(u)&&r>0?{voltage:u,current:u/r,power:u*u/r}:null];}));
 }
 root.SROCircuit={create,addResistor,terminals,points,wire,graph,reduce,sync,preset,validate,solve};
})(globalThis);
