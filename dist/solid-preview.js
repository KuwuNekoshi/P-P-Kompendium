/* A small offline 3D mesh viewer, projected and shaded on a local 2D canvas. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'),require('./geometry.js'));
  else root.PPSolidPreview=factory(root.PP,root.PPGeometry);
})(typeof globalThis!=='undefined'?globalThis:this,function(E,G){
  'use strict';
  const SEGMENTS=32;
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  function normalize(v){const length=Math.hypot(...v);return length?v.map(x=>x/length):[0,0,0];}
  function mesh(model){
    const triangles=[],edges=[];
    E.components(model).forEach((ids,group)=>{
      const layout=G.layout(model,ids);
      for(const p of layout.parts){
        const s=p.shape;
        const point=(x,y,z)=>[group*145+x*p.orientation,layout.height-30-p.y-p.orientation*y,z];
        const triangle=(a,b,c,face)=>{
          const normal=cross(sub(b,a),sub(c,a));if(Math.hypot(...normal)<1e-8)return;
          triangles.push({vertices:[a,b,c],normal:normalize(normal),shape:s.id,face,included:s.include});
        };
        const quad=(a,b,c,d,face)=>{triangle(a,b,c,face);triangle(a,c,d,face);};
        const edge=(a,b,state)=>edges.push({vertices:[a,b],state,shape:s.id});
        const ring=(r,y)=>Array.from({length:SEGMENTS},(_,i)=>point(r*Math.cos(i*2*Math.PI/SEGMENTS),y,r*Math.sin(i*2*Math.PI/SEGMENTS)));
        if(s.type==='box'){
          const r=p.r,z=r*.72,h=p.h;
          const v=[point(-r,0,-z),point(r,0,-z),point(r,0,z),point(-r,0,z),point(-r,h,-z),point(r,h,-z),point(r,h,z),point(-r,h,z)];
          const faceIndices={top:[0,1,2,3],bottom:[4,7,6,5],front:[3,2,6,7],back:[1,0,4,5],left:[0,3,7,4],right:[2,1,5,6]};
          for(const [key,indices]of Object.entries(faceIndices)){
            const joint=E.connectionAt(model,s.id,key),state=joint?'joined':s.faces[key];
            if(state==='closed')quad(...indices.map(i=>v[i]),key);
            if(!joint||joint.a.shape===s.id)for(let i=0;i<4;i++)edge(v[indices[i]],v[indices[(i+1)%4]],state);
          }
          continue;
        }
        let profile;
        if(s.type==='sphere'||s.type==='hemisphere'){
          const half=s.type==='hemisphere',rings=half?12:24,angle=half?Math.PI/2:Math.PI;
          profile=Array.from({length:rings+1},(_,i)=>({y:p.r*(1-Math.cos(i*angle/rings)),radius:p.r*Math.sin(i*angle/rings)}));
        }else profile=[{y:0,radius:p.r},{y:p.h,radius:s.type==='cone'?0:p.bottom}];
        for(let j=0;j<profile.length-1;j++){
          const a=ring(profile[j].radius,profile[j].y),b=ring(profile[j+1].radius,profile[j+1].y);
          for(let i=0;i<SEGMENTS;i++){const n=(i+1)%SEGMENTS;quad(a[i],a[n],b[n],b[i],'body');}
        }
        for(const [key,face]of Object.entries(E.SHAPES[s.type].faces)){
          const y=face.direction===-1?0:p.h,r=face.direction===-1?p.r:p.bottom;
          const rim=ring(r,y),center=point(0,y,0),joint=E.connectionAt(model,s.id,key),state=joint?'joined':s.faces[key];
          if(state==='closed')for(let i=0;i<SEGMENTS;i++)triangle(center,rim[i],rim[(i+1)%SEGMENTS],key);
          if(!joint||joint.a.shape===s.id)for(let i=0;i<SEGMENTS;i++)edge(rim[i],rim[(i+1)%SEGMENTS],state);
        }
      }
    });
    const points=[...triangles.flatMap(t=>t.vertices),...edges.flatMap(e=>e.vertices)];
    const min=[0,0,0],max=[0,0,0];
    for(const point of points)for(let i=0;i<3;i++){min[i]=Math.min(min[i],point[i]);max[i]=Math.max(max[i],point[i]);}
    const center=min.map((v,i)=>(v+max[i])/2);let radius=1;
    for(const point of points)radius=Math.max(radius,Math.hypot(...sub(point,center)));
    return {triangles,edges,center,radius};
  }
  function rotate(v,pose){
    const cy=Math.cos(pose.yaw),sy=Math.sin(pose.yaw),cp=Math.cos(pose.pitch),sp=Math.sin(pose.pitch);
    const x=cy*v[0]+sy*v[2],z=-sy*v[0]+cy*v[2];
    return [x,cp*v[1]-sp*z,sp*v[1]+cp*z];
  }
  function mount(canvas,model,selectedId,previousPose){
    const ctx=canvas.getContext('2d');if(!ctx)return null;
    const geometry=mesh(model),initial={yaw:-.55,pitch:.42,zoom:1},pose={...initial,...previousPose};
    let frame=0,drag=null,destroyed=false;
    const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
    function draw(){
      frame=0;if(destroyed)return;
      const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      const dark=document.documentElement.dataset.theme==='dark',distance=geometry.radius*3.8/pose.zoom,focal=Math.min(w,h)*1.25;
      function project(v){const r=rotate(sub(v,geometry.center),pose),scale=focal/(distance-r[2]);return [w/2+r[0]*scale,h/2-r[1]*scale,r[2]];}
      const light=normalize([-.4,.8,1]);
      const primitives=geometry.triangles.map(t=>{
        const points=t.vertices.map(project);let n=rotate(t.normal,pose);if(n[2]<0)n=n.map(v=>-v);
        const lighting=.43+.57*Math.max(0,n.reduce((sum,v,i)=>sum+v*light[i],0));
        const base=t.shape===selectedId?(dark?[108,169,251]:[140,183,236]):t.included?(dark?[117,143,172]:[194,211,230]):(dark?[145,150,159]:[205,210,218]);
        return {kind:'triangle',points,z:points.reduce((s,p)=>s+p[2],0)/3,color:`rgb(${base.map(v=>Math.round(v*lighting)).join(',')})`};
      });
      for(const edge of geometry.edges){const points=edge.vertices.map(project);primitives.push({kind:'edge',points,z:(points[0][2]+points[1][2])/2+geometry.radius*.001,state:edge.state});}
      primitives.sort((a,b)=>a.z-b.z);
      for(const p of primitives){
        ctx.beginPath();ctx.moveTo(p.points[0][0],p.points[0][1]);ctx.lineTo(p.points[1][0],p.points[1][1]);
        if(p.kind==='triangle'){
          ctx.lineTo(p.points[2][0],p.points[2][1]);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=.45;ctx.stroke();
        }else{
          ctx.strokeStyle=p.state==='open'?(dark?'#afd1ff':'#376fac'):p.state==='joined'?(dark?'#90b1d0':'#657d98'):(dark?'#65788e':'#8b9db0');
          ctx.lineWidth=p.state==='open'?1.7:.8;ctx.stroke();
        }
      }
    }
    function schedule(){if(!frame&&!destroyed)frame=requestAnimationFrame(draw);}
    const events=[];
    function on(target,event,fn,options){target.addEventListener(event,fn,options);events.push(()=>target.removeEventListener(event,fn,options));}
    on(canvas,'pointerdown',event=>{if(event.button!==0)return;drag={x:event.clientX,y:event.clientY,id:event.pointerId};canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});event.preventDefault();});
    on(canvas,'pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;pose.yaw+=(event.clientX-drag.x)*.009;pose.pitch=clamp(pose.pitch+(event.clientY-drag.y)*.008,-1.4,1.4);drag.x=event.clientX;drag.y=event.clientY;schedule();});
    const end=()=>{drag=null;};on(canvas,'pointerup',end);on(canvas,'pointercancel',end);on(canvas,'lostpointercapture',end);
    function zoom(factor){pose.zoom=clamp(pose.zoom*factor,.55,1.8);schedule();}
    on(canvas,'wheel',event=>{event.preventDefault();zoom(Math.exp(-event.deltaY*.0015));},{passive:false});
    function reset(){Object.assign(pose,initial);schedule();}
    on(canvas,'keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'].includes(event.key))return;
      event.preventDefault();
      if(event.key==='ArrowLeft')pose.yaw-=.15;if(event.key==='ArrowRight')pose.yaw+=.15;
      if(event.key==='ArrowUp')pose.pitch=clamp(pose.pitch-.12,-1.4,1.4);if(event.key==='ArrowDown')pose.pitch=clamp(pose.pitch+.12,-1.4,1.4);
      if(event.key==='+'||event.key==='=')zoom(1.15);if(event.key==='-')zoom(1/1.15);if(event.key.toLowerCase()==='r')reset();schedule();
    });
    let observer;if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(schedule);observer.observe(canvas);}else on(window,'resize',schedule);
    schedule();
    return {getPose:()=>({...pose}),reset,zoom,redraw:schedule,destroy(){destroyed=true;cancelAnimationFrame(frame);observer?.disconnect();events.forEach(remove=>remove());}};
  }
  return {mesh,rotate,mount};
});
