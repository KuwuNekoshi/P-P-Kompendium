/* Schematic cross-sections for joined parts. No physical simulation or numeric input. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));
  else root.PPGeometry=factory(root.PP);
})(typeof globalThis!=='undefined'?globalThis:this,function(E){
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function sizes(model) {
    const shared=E.sharedInputs(model),small=new Set();
    for(const s of model.shapes)if(s.type==='frustum')small.add(shared.canonical.get(`shape:${s.id}:input:d`));
    const radius=(s,key='D')=>small.has(shared.canonical.get(`shape:${s.id}:input:${key}`))?24:40;
    return new Map(model.shapes.map(s=>{
      const r=radius(s),bottom=s.type==='frustum'?radius(s,'d'):r;
      const h=({cylinder:110,cone:68,frustum:82,box:100,pipe:95,sphere:r*2,hemisphere:r})[s.type];
      return [s.id,{r:s.type==='box'?44:r,bottom:s.type==='box'?44:bottom,h}];
    }));
  }
  function localFace(shape,size,key) {
    const info=E.SHAPES[shape.type].faces[key];
    return {y:info.direction===-1?0:size.h,direction:info.direction};
  }
  function layout(model,ids) {
    const dimensions=sizes(model),members=model.shapes.filter(s=>ids.includes(s.id));
    if(!members.length)return {parts:[],height:0};
    const root=members.find(s=>s.type==='cylinder'||s.type==='box'||s.type==='pipe')||members[0];
    const positions=new Map([[root.id,{y:0,orientation:1}]]),todo=[root.id];
    while(todo.length){
      const id=todo.shift(),shape=members.find(s=>s.id===id),position=positions.get(id);
      for(const c of model.connections||[])if(c.a.shape===id||c.b.shape===id){
        const end=c.a.shape===id?c.a:c.b,other=E.otherEnd(c,id);
        if(!ids.includes(other.shape)||positions.has(other.shape))continue;
        const child=members.find(s=>s.id===other.shape),from=localFace(shape,dimensions.get(id),end.face),to=localFace(child,dimensions.get(child.id),other.face);
        const orientation=-position.orientation*from.direction/to.direction;
        positions.set(child.id,{y:position.y+position.orientation*from.y-orientation*to.y,orientation});todo.push(child.id);
      }
    }
    const raw=members.map(s=>({...positions.get(s.id),shape:s,...dimensions.get(s.id)}));
    const min=Math.min(...raw.map(p=>Math.min(p.y,p.y+p.orientation*p.h))),max=Math.max(...raw.map(p=>Math.max(p.y,p.y+p.orientation*p.h)));
    return {parts:raw.map(p=>({...p,y:p.y-min+30})),height:max-min+60};
  }
  function body(part) {
    const {shape:s,r,bottom:b,h}=part;
    let fill='',outline='';
    if(s.type==='cone'){fill=`M${-r} 0H${r}L0 ${h}Z`;outline=`M${-r} 0L0 ${h}L${r} 0`;}
    else if(s.type==='hemisphere'){fill=`M${-r} ${h}A${r} ${r} 0 0 1 ${r} ${h}Z`;outline=`M${-r} ${h}A${r} ${r} 0 0 1 ${r} ${h}`;}
    else if(s.type==='sphere')return `<circle class="sketch-fill" cx="0" cy="${r}" r="${r}"/><circle class="sketch-outline" cx="0" cy="${r}" r="${r}"/>`;
    else{fill=`M${-r} 0H${r}L${b} ${h}H${-b}Z`;outline=`M${-r} 0L${-b} ${h}M${r} 0L${b} ${h}`;}
    if(s.type==='box')return `<path class="sketch-fill" d="${fill}"/><path class="sketch-outline ${s.faces.left==='open'?'sketch-open':''}" d="M${-r} 0V${h}"/><path class="sketch-outline ${s.faces.right==='open'?'sketch-open':''}" d="M${r} 0V${h}"/>`;
    return `<path class="sketch-fill" d="${fill}"/><path class="sketch-outline" d="${outline}"/>`;
  }
  function render(model,ids,selectedId) {
    const positions=layout(model,ids),parts=positions.parts;
    const bodies=parts.map(p=>`<g transform="translate(95 ${p.y}) scale(1 ${p.orientation})" class="sketch-part ${p.shape.id===selectedId?'selected':''}" role="button" tabindex="0" data-action="select-shape" data-id="${esc(p.shape.id)}" aria-label="Vælg ${esc(p.shape.name)}">${body(p)}</g>`).join('');
    const labels=parts.map(p=>{
      const y=p.y+p.orientation*p.h/2,s=p.shape;
      return `<text class="sketch-name" x="158" y="${y-3}">${esc(s.name.length>24?s.name.slice(0,23)+'…':s.name)}</text><text class="sketch-subtitle" x="158" y="${y+16}">Figur ${s.ordinal}${s.type==='hemisphere'?' · kuglespids':''}</text>`;
    }).join('');
    const faces=parts.flatMap(p=>Object.entries(E.SHAPES[p.shape.type].faces).filter(([,f])=>f.direction).map(([key,info])=>{
      const connection=E.connectionAt(model,p.shape.id,key);
      if(connection&&connection.b.shape===p.shape.id)return '';
      const local=localFace(p.shape,p,key),y=p.y+p.orientation*local.y,r=info.direction===-1?p.r:p.bottom;
      const state=connection?'joined':p.shape.faces[key],label=state==='joined'?'Samling':state==='open'?'Åben':'Lukket';
      return `<g class="sketch-face ${state}" role="button" tabindex="0" data-action="inspect-face" data-id="${esc(p.shape.id)}" data-face="${key}" aria-label="${esc(p.shape.name+' · '+info.label+' · '+label)}"><title>${esc(p.shape.name+' · '+info.label+' · '+label)}</title><path class="face-hit" d="M${95-r} ${y}H${95+r}"/><path class="face-line" d="M${95-r} ${y}H${95+r}"/><text class="sketch-state" text-anchor="end" x="${85-r}" y="${y+4}">${label}</text></g>`;
    })).join('');
    return `<svg class="compound-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 345 ${positions.height}" style="height:${positions.height}px" role="group" aria-label="Skitse af sammenføjede figurer. Ikke målfast.">${bodies}${faces}${labels}</svg>`;
  }
  return {layout,render};
});
