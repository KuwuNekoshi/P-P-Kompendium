/* Additional linear rational rearrangements, e.g. slip and transmitter endpoints. */
(function(root){
 'use strict';
 const old=root.PPRearrange,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const add=(a,b)=>a==='0'?b:b==='0'?a:['add',a,b];
 const sub=(a,b)=>eq(a,b)?'0':b==='0'?a:['sub',a,b];
 const mul=(a,b)=>a==='0'||b==='0'?'0':a==='1'?b:b==='1'?a:['mul',a,b];
 const div=(a,b)=>b==='1'?a:['div',a,b];
 const trim=a=>{while(a.length>1&&a.at(-1)==='0')a.pop();return a;};
 const plus=(a,b,minus=false)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(minus?sub:add)(a[i]||'0',b[i]||'0')));
 const times=(a,b)=>{if(a.length+b.length>5)throw Error('Graden er for høj.');const r=Array(a.length+b.length-1).fill('0');a.forEach((v,i)=>b.forEach((w,j)=>r[i+j]=add(r[i+j],mul(v,w))));return trim(r);};
 function rational(t,key){
  if(typeof t==='string')return t===key?{n:['0','1'],d:['1']}:{n:[t],d:['1']};
  const [op,...xs]=t;if(op==='group')return rational(xs[0],key);
  if(op==='sqrt'||op==='pow'){if(!JSON.stringify(t).includes('"'+key+'"'))return {n:[t],d:['1']};throw Error('Rodudtryk.');}
  return xs.map(x=>rational(x,key)).reduce((a,b)=>op==='add'||op==='sub'?{n:plus(times(a.n,b.d),times(b.n,a.d),op==='sub'),d:times(a.d,b.d)}:op==='mul'?{n:times(a.n,b.n),d:times(a.d,b.d)}:{n:times(a.n,b.d),d:times(a.d,b.n)});
 }
 root.PPRearrange={...old,build(base){
  const result=old.build(base);
  for(const [id,options]of Object.entries(result.options))for(const option of options)if(!option.available){
   try{
    const f=base[id],r=rational(f.template,option.key),p=plus(r.n,times(['given'],r.d),true);if(p.length!==2||p[1]==='0')continue;
    const arg=f.args[option.key],derived='inverse:'+id+':'+option.key;
    result.formulas[derived]={...f,name:(f.name+' → '+arg.label).slice(0,120),symbol:arg.symbol,dimension:arg.dimension,args:{given:{symbol:f.symbol,label:f.name,dimension:f.dimension},...Object.fromEntries(Object.entries(f.args).filter(([k])=>k!==option.key))},template:div(sub('0',p[0]),p[1]),note:'Nævnere skal være forskellige fra 0. Kontrollér løsningen i grundformlen. '+(f.note||''),constraints:[],rearranged:{base:id,key:option.key,negative:false}};
    Object.assign(option,{id:derived,available:true});delete option.reason;
   }catch{}
  }
  return result;
 }};
})(globalThis);
