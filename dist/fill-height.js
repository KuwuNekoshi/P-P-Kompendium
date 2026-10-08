/* Bottom-up fill profiles. Geometry follows the orientation of the tank preview. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PPFillHeight=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const c=value=>({type:'constant',value:String(value)});
  const op=(type,...children)=>({type,children});
  const add=(...xs)=>xs.length===0?c(0):xs.length===1?xs[0]:op('add',...xs);
  const mul=(...xs)=>op('mul',...xs),sub=(a,b)=>op('sub',a,b),div=(a,b)=>op('div',a,b);
  const pow=(a,n)=>op('pow',a,typeof n==='number'?c(n):n),sqrt=a=>op('sqrt',a);
  const derived=symbol=>({type:'derived',symbol});
  const TYPES=['cylinder','pipe','box','cone','frustum','sphere','hemisphere','halfCylinder','triangularPrism','pyramid','pyramidFrustum'];

  // Exact integral for a centred rectangular transition with linearly varying
  // length and width. Unlike h/3*(G+g+sqrt(G*g)), this also handles unequal tapers.
  const rectangularVolume=(L,B,l,b,h)=>mul(div(h,c(6)),add(mul(c(2),L,B),mul(L,b),mul(l,B),mul(c(2),l,b)));

  function ordered(model,shapeId,shapes,inverted=false){
    const anchor=model.shapes.find(s=>s.id===shapeId);
    if(!anchor)throw new Error('Vælg den tank, du vil finde Hx for.');
    const ids=new Set([shapeId]),todo=[shapeId];
    while(todo.length){const id=todo.shift();for(const j of model.connections||[]){
      if(j.a.shape!==id&&j.b.shape!==id)continue;
      const next=j.a.shape===id?j.b.shape:j.a.shape;
      if(!ids.has(next)){ids.add(next);todo.push(next);}
    }}
    const members=model.shapes.filter(s=>ids.has(s.id));
    const root=members.find(s=>['cylinder','box','pipe'].includes(s.type))||members[0];
    const positions=new Map([[root.id,{rank:0,orientation:inverted?-1:1}]]);todo.push(root.id);
    while(todo.length){
      const id=todo.shift(),parent=members.find(s=>s.id===id),position=positions.get(id);
      for(const j of model.connections||[]){
        if(j.a.shape!==id&&j.b.shape!==id)continue;
        const from=j.a.shape===id?j.a:j.b,to=j.a.shape===id?j.b:j.a;
        if(positions.has(to.shape))continue;
        const child=members.find(s=>s.id===to.shape),a=shapes[parent.type].faces[from.face],b=shapes[child.type].faces[to.face];
        if(!a?.direction||!b?.direction)throw new Error('Hx kræver dele stablet lodret over hinanden.');
        positions.set(child.id,{rank:position.rank+position.orientation*a.direction,orientation:-position.orientation*a.direction/b.direction});todo.push(child.id);
      }
    }
    const result=members.map(s=>({shape:s,...positions.get(s.id)})).sort((a,b)=>b.rank-a.rank);
    if(new Set(result.map(p=>p.rank)).size!==result.length)throw new Error('Hx kræver én sammenhængende lodret tank uden forgreninger.');
    return result;
  }
  function create(model,expr,shapes,inputTarget,expand){
    const children=[expand(expr.volume,'volume')];
    const parts=ordered(model,expr.shapeId,shapes,expr.inverted).map(({shape:s,orientation})=>{
      if(!TYPES.includes(s.type))throw new Error('Denne figur har endnu ingen Hx-profil.');
      const dimensions={};
      for(const key of Object.keys(shapes[s.type].inputs)){
        dimensions[key]=children.length;children.push(expand({kind:'ref',target:inputTarget(s,key)},'length'));
      }
      return {id:s.id,name:s.name,ordinal:s.ordinal,type:s.type,orientation,dimensions};
    });
    return {type:'fillHeight',children,parts,inverted:!!expr.inverted};
  }
  function geometry(part,children){
    const d=Object.fromEntries(Object.entries(part.dimensions).map(([k,i])=>[k,children[i]]));
    const R=d.D&&div(d.D,c(2)),area=R&&mul(c('π'),pow(R,2));
    // The pipe stores its length under h, with L as its displayed symbol.
    const h=part.type==='sphere'?d.D:['hemisphere','halfCylinder'].includes(part.type)?R:d.h;
    let capacity;
    switch(part.type){
      case 'cylinder':case 'pipe':capacity=mul(area,h);break;
      case 'box':capacity=mul(d.L,d.B,h);break;
      case 'cone':capacity=div(mul(area,h),c(3));break;
      case 'pyramid':capacity=div(mul(d.L,d.B,h),c(3));break;
      case 'pyramidFrustum':capacity=rectangularVolume(d.L,d.B,d.l,d.b,h);break;
      case 'triangularPrism':capacity=div(mul(d.L,d.B,h),c(2));break;
      case 'sphere':capacity=mul(div(c(4),c(3)),c('π'),pow(R,3));break;
      case 'hemisphere':capacity=mul(div(c(2),c(3)),c('π'),pow(R,3));break;
      case 'halfCylinder':capacity=div(mul(area,d.L),c(2));break;
      case 'frustum':capacity=mul(div(mul(c('π'),h),c(12)),add(pow(d.D,2),mul(d.D,d.d),pow(d.d,2)));break;
    }
    return {d,R,area,h,capacity};
  }
  // Stable circular-segment fraction: theta - sin(theta)cos(theta) loses
  // precision near the bottom, so use its series for small theta.
  function segmentFraction(u){
    const theta=2*Math.asin(Math.sqrt(Math.max(0,Math.min(1,u))/2));
    const t2=theta*theta;
    const area=theta<0.01?theta*t2*(2/3+t2*(-2/15+t2*(4/315-t2*2/2835))):theta-Math.sin(theta)*Math.cos(theta);
    return area/(Math.PI/2);
  }
  function fraction(part,d,u){
    if(u<=0)return 0;if(u>=1)return 1;
    const reversed=part.orientation<0;
    switch(part.type){
      case 'cylinder':case 'pipe':case 'box':return u;
      case 'cone':case 'pyramid':return reversed?u*(3-3*u+u*u):u*u*u;
      case 'triangularPrism':return reversed?u*(2-u):u*u;
      case 'sphere':return u*u*(3-2*u);
      // In the preview the hemisphere's default is a dome, not a bowl.
      case 'hemisphere':return reversed?u*u*(3-u)/2:u*(3-u*u)/2;
      case 'halfCylinder':return reversed?(2/Math.PI)*(Math.asin(u)+u*Math.sqrt(1-u*u)):segmentFraction(u);
      case 'frustum':{
        const scale=Math.max(d.D,d.d),bottom=(reversed?d.D:d.d)/scale,top=(reversed?d.d:d.D)/scale,k=top-bottom;
        return u*(bottom*bottom+bottom*k*u+k*k*u*u/3)/((bottom*bottom+bottom*top+top*top)/3);
      }
      case 'pyramidFrustum':{
        const ls=Math.max(d.L,d.l),bs=Math.max(d.B,d.b);
        const L0=(reversed?d.L:d.l)/ls,B0=(reversed?d.B:d.b)/bs,L1=(reversed?d.l:d.L)/ls,B1=(reversed?d.b:d.B)/bs;
        const L=L0*(1-u)+L1*u,B=B0*(1-u)+B1*u;
        return u*(2*L0*B0+L0*B+L*B0+2*L*B)/(2*L0*B0+L0*B1+L1*B0+2*L1*B1);
      }
    }
    throw new Error('Ukendt Hx-profil.');
  }
  function invert(part,d,ratio){
    if(ratio<=0)return 0;if(ratio>=1)return 1;
    let lo=0,hi=1;
    for(let i=0;i<180;i++){
      const mid=(lo+hi)/2;if(mid===lo||mid===hi)break;
      if(fraction(part,d,mid)<ratio)lo=mid;else hi=mid;
    }
    return (lo+hi)/2;
  }
  function analyze(ast,evaluate){
    const values=ast.children.map(evaluate),bad=values.find(v=>v.status==='error');
    if(bad)return bad;
    const parts=[];
    for(const part of ast.parts){
      const d={};for(const [key,index]of Object.entries(part.dimensions)){
        const value=values[index];if(value.status!=='ready')continue;
        const mayBeZero=(part.type==='frustum'&&key==='d')||(part.type==='pyramidFrustum'&&['l','b'].includes(key));
        if(value.value<0||(value.value===0&&!mayBeZero))return {status:'error',error:part.name+': De indvendige mål skal være positive (den lille keglediameter og pyramidestubbens bundmål må være 0).'};
        d[key]=value.value;
      }
      const g=geometry(part,ast.children),height=evaluate(g.h),capacity=evaluate(g.capacity);
      parts.push({...part,d,geometry:g,height:height.value,capacity:capacity.value});
    }
    if(values.some(v=>v.status==='incomplete'))return {status:'incomplete',parts};
    const volume=values[0].value,total=parts.reduce((sum,p)=>sum+p.capacity,0);
    if(!Number.isFinite(total)||total<=0||parts.some(p=>!Number.isFinite(p.height)||p.capacity<=0))return {status:'error',error:'Tankens mål giver ikke et gyldigt rumfang.'};
    if(volume<0)return {status:'error',error:'Produktets volumen må ikke være negativt.'};
    if(volume>total&&volume-total>total*32*Number.EPSILON)return {status:'error',error:'Produktets volumen overstiger tankens samlede rumfang. Der findes ingen Hx inde i tanken.'};
    let remaining=Math.min(volume,total),offset=0,active=parts.length-1;
    for(let i=0;i<parts.length;i++){
      const part=parts[i],tolerance=Math.max(remaining,part.capacity)*32*Number.EPSILON;
      if(remaining<=part.capacity+tolerance){active=i;remaining=Math.min(remaining,part.capacity);break;}
      remaining-=part.capacity;offset+=part.height;
    }
    const p=parts[active],local=p.height*invert(p,p.d,remaining/p.capacity);
    return {status:'ready',parts,volume,total,active,remaining,offset,local,value:offset+local};
  }
  function volumeAt(part,children,x){
    const {d,R,h,capacity,area}=geometry(part,children),reversed=part.orientation<0;
    const cap=y=>mul(c('π'),pow(y,2),sub(R,div(y,c(3))));
    const segment=y=>mul(d.L,sub(mul(pow(R,2),op('acos',div(sub(R,y),R))),mul(sub(R,y),sqrt(sub(mul(c(2),R,y),pow(y,2))))));
    if(['box','cylinder','pipe'].includes(part.type))return mul(div(capacity,h),x);
    if(['cone','pyramid','triangularPrism'].includes(part.type)){
      const n=part.type==='triangularPrism'?2:3,u=div(x,h);
      return mul(capacity,reversed?sub(c(1),pow(sub(c(1),u),n)):pow(u,n));
    }
    if(part.type==='sphere')return cap(x);
    if(part.type==='hemisphere')return reversed?cap(x):sub(capacity,cap(sub(R,x)));
    if(part.type==='halfCylinder')return reversed?sub(capacity,segment(sub(R,x))):segment(x);
    if(part.type==='pyramidFrustum'){
      const L0=reversed?d.L:d.l,B0=reversed?d.B:d.b,L1=reversed?d.l:d.L,B1=reversed?d.b:d.B;
      const L=add(L0,mul(sub(L1,L0),div(x,h))),B=add(B0,mul(sub(B1,B0),div(x,h)));
      return rectangularVolume(L0,B0,L,B,x);
    }
    if(part.type==='frustum'){
      const r0=div(reversed?d.D:d.d,c(2)),r1=div(reversed?d.d:d.D,c(2)),k=div(sub(r1,r0),h);
      return mul(c('π'),add(mul(pow(r0,2),x),mul(r0,k,pow(x,2)),div(mul(pow(k,2),pow(x,3)),c(3))));
    }
    return mul(area,x);
  }
  function inverse(part,children,volume,numeric,shortGeometry){
    const {d,R,area,h,capacity}=shortGeometry||geometry(part,children),reversed=part.orientation<0;
    if(['cylinder','pipe'].includes(part.type))return div(volume,area);
    if(part.type==='box')return div(volume,mul(d.L,d.B));
    if(['cone','pyramid','triangularPrism'].includes(part.type)){
      const root=a=>part.type==='triangularPrism'?sqrt(a):pow(a,div(c(1),c(3)));
      const ratio=div(volume,capacity);
      return mul(h,reversed?sub(c(1),root(sub(c(1),ratio))):root(ratio));
    }
    if(part.type==='frustum'&&Number.isFinite(numeric?.D)&&Number.isFinite(numeric?.d)){
      if(numeric.D===numeric.d)return div(volume,area);
      const bottom=div(reversed?d.D:d.d,c(2)),top=div(reversed?d.d:d.D,c(2));
      const radius=pow(add(pow(bottom,3),mul(sub(pow(top,3),pow(bottom,3)),div(volume,capacity))),div(c(1),c(3)));
      // Difference-of-cubes identity avoids a nearly zero radius difference
      // when the frustum is almost cylindrical.
      return div(mul(c(3),volume),mul(c('π'),add(pow(bottom,2),mul(bottom,radius),pow(radius,2))));
    }
    return null;
  }
  function branch(ast,index,numeric){
    const lower=ast.parts.slice(0,index).map(p=>geometry(p,ast.children));
    const below=add(...lower.map(p=>p.capacity)),offset=add(...lower.map(p=>p.h));
    const remaining=index?sub(ast.children[0],below):ast.children[0];
    const part=ast.parts[index],g=geometry(part,ast.children),local=inverse(part,ast.children,remaining,numeric);
    return {part,below,offset,remaining,...g,local,equation:volumeAt(part,ast.children,derived('h_del')),ast:add(...(index?[offset]:[]),local||derived('h_del'))};
  }
  function shortBranch(ast,index,numeric){
    const b=branch(ast,index,numeric),g=geometry(b.part,ast.children);
    const lower=ast.parts.slice(0,index);
    const below=add(...lower.map((p,i)=>derived('V_del'+(i+1))));
    const offset=add(...lower.map((p,i)=>derived('H_del'+(i+1))));
    const remaining=index?sub(ast.children[0],below):ast.children[0];
    const local=inverse(b.part,ast.children,derived('V_rest'),numeric,{...g,h:derived('H_del'+(index+1)),capacity:derived('V_del'+(index+1))});
    return {...b,below,offset,remaining,local,ast:index?add(derived('H_fyldt'),derived('h_del')):derived('h_del')};
  }
  function presentation(ast,evaluate){
    const state=analyze(ast,evaluate);
    if(state.status!=='ready')return add(derived('H_fyldt'),derived('h_del'));
    if(state.volume===0)return c(0);
    if(state.remaining===state.parts[state.active].capacity)return add(...ast.parts.slice(0,state.active+1).map(p=>geometry(p,ast.children).h));
    return branch(ast,state.active,state.parts[state.active].d).ast;
  }
  function find(ast){return (ast.type==='fillHeight'?[ast]:[]).concat((ast.children||[]).flatMap(find));}
  return {ordered,create,geometry,fraction,invert,analyze,volumeAt,inverse,branch,shortBranch,presentation,find};
});
