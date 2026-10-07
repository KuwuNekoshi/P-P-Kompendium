/* SRO browser UI. Entire app works from file:// without network access. */
(function(){
 'use strict';
 const E=window.PP,S=window.SRO,C=window.SROCircuit,K=window.SROKnowledge;
 const $=q=>document.querySelector(q),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sym=s=>'<math>'+E.mathSymbol(s)+'</math>',EXAM=document.documentElement.dataset.edition==='exam',STORAGE='sro-kompendium-task-v1';
 let task=S.empty(),selected='',tab='formula',display='both',expanded=true,calculator=EXAM,component='',pending='',history=[],tour=null,drag=null;
 const view={section:'regulation',motor:'star',net:'400',plate:'400-690',reverse:false,transmitter:'temperature',low:'0',high:'100',signal:'12',process:'cool',valve:'NC',change:'up',logicA:false,logicB:false,valveActive:false,ip1:'5',ip2:'4',insulation:'F'};
 const current=()=>task.model.formulas.find(f=>f.id===selected),model=()=>task.model;
 const visible=f=>!E.BASE_FORMULAS[f.rearranged?.base]?.hidden&&!f.hidden;
 function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,6000);}
 function persist(){if(EXAM)return;try{localStorage.setItem(STORAGE,JSON.stringify(task));$('#save-status').textContent='Gemmes på denne computer';}catch{$('#save-status').textContent='Kun i denne fane · eksportér for at gemme';}}
 function checkpoint(){history.push(S.clone(task));if(history.length>30)history.shift();}
 function commit(){if(task.circuit)C.sync(task);persist();render();}
 function selectedLocked(){return task.circuit?.resultId===selected;}
 function circuitIds(){return task.circuit?[task.circuit.source.formulaId,task.circuit.resultId,...task.circuit.resistors.map(r=>r.formulaId)]:[];}
 function pathGet(path){return path.split('/').filter(Boolean).reduce((o,k)=>o[k],current().expression);}
 function pathSet(path,value){const parts=path.split('/').filter(Boolean);if(!parts.length){current().expression=value;return;}const last=parts.pop();let parent=current().expression;parts.forEach(k=>parent=parent[k]);parent[last]=value;}
 function option(value,label,chosen){return `<option value="${esc(value)}" ${value===chosen?'selected':''}>${esc(label)}</option>`;}
 function unitSelector(dimension,unit,action,key){
  const ratio=E.Units.ratio(dimension),attrs=`data-action="${action}" data-key="${esc(key)}" data-dimension="${dimension}"`;
  if(!ratio)return `<div class="unit-choice"><select ${attrs} aria-label="Enhed">${E.Units.choices(dimension).map(u=>option(u.id,u.label,unit.id)).join('')}</select></div>`;
  return `<div class="unit-choice">${['numerator','denominator'].map((part,i)=>(i?'<span>/</span>':'')+`<select ${attrs} data-part="${part}" aria-label="Enhedens ${i?'nævner':'tæller'}" ${ratio[part].length===1?'disabled':''}>${ratio[part].map(u=>option(u.id,u.label,unit.parts[part])).join('')}</select>`).join('')}</div>`;
 }
 function renderTasks(){
  $('#task-title').value=model().title;
  $('#task-list').innerHTML=E.formulaSections(model()).map(g=>`<div class="group-heading"><strong>${esc(g.name)}</strong>${g.id?`<button class="tiny" data-action="group-up" data-id="${g.id}" aria-label="Flyt gruppen op">↑</button><button class="tiny" data-action="group-down" data-id="${g.id}" aria-label="Flyt gruppen ned">↓</button><button class="tiny" data-action="group-rename" data-id="${g.id}" aria-label="Omdøb gruppe">✎</button><button class="tiny" data-action="group-delete" data-id="${g.id}" aria-label="Opløs gruppe">×</button>`:''}</div>${g.formulas.map(f=>`<div class="task-row ${f.id===selected?'selected':''}"><button class="task-select" data-action="select" data-id="${f.id}"><span>${sym(f.symbol)}</span><span>${esc(f.name)}</span></button><div class="task-reorder"><button class="tiny" data-action="up" data-id="${f.id}" aria-label="Flyt ${esc(f.name)} op">↑</button><button class="tiny" data-action="down" data-id="${f.id}" aria-label="Flyt ${esc(f.name)} ned">↓</button></div></div>`).join('')}`).join('');
 }
 function expressionEditor(expr,dimension,path,label,ctx,depth=0){
  if(depth>9)return '<p class="note">Vælg kilden i opgavelisten for at redigere dybere niveauer.</p>';
  const value=expr.kind==='symbol'?'symbol':expr.kind==='ref'?'ref:'+expr.target:expr.kind==='formula'?'formula:'+expr.formula:'custom';
  const references=ctx.list.filter(d=>d.ownerType==='formula'&&d.dimension===dimension&&(!d.quantity||d.target===expr.target)&&d.target!=='formula:'+selected&&!E.dependsOn(model(),d.target,'formula:'+selected));
  let options=option('symbol','Kendt størrelse · '+label,value);
  if(expr.kind==='custom')options+=option('custom','Egen formel',value);
  if(references.length)options+='<optgroup label="Reference · følger sin kilde">'+references.map(d=>option('ref:'+d.target,'↗ '+d.name+' · '+d.symbol,value)).join('')+'</optgroup>';
  const fs=Object.entries(E.FORMULAS).filter(([id,f])=>f.dimension===dimension&&visible(f));
  options+='<optgroup label="Indsæt en underformel">'+fs.map(([id,f])=>option('formula:'+id,f.name,value)).join('')+'</optgroup>';
  let html=`<div class="expression"><select data-action="source" data-path="${esc(path)}" data-dimension="${dimension}" data-symbol="${esc(label)}" aria-label="Kilde til ${esc(label)}">${options}</select>`;
  if(expr.kind==='ref')html+=`<button class="text-button source-ref" data-action="reference" data-target="${esc(expr.target)}">↗ Tilpas kilden</button>`;
  if(expr.kind==='formula'){
   const f=E.FORMULAS[expr.formula];html+='<div class="args">'+Object.entries(f.args).map(([key,a])=>`<div class="arg"><div class="arg-label">${sym(a.symbol)} ${esc(a.label)}</div>${expressionEditor(expr.args[key],a.dimension,path+'/args/'+key,a.symbol,ctx,depth+1)}</div>`).join('')+'</div>';
  }
  if(expr.kind==='custom')html+=customArgs(expr,path,ctx,depth);
  return html+'</div>';
 }
 function customArgs(expr,path,ctx,depth){return '<div class="args">'+Object.entries(expr.args).map(([key,a])=>`<div class="arg"><div class="arg-label">${sym(key)}</div><select data-action="custom-dimension" data-path="${esc(path+'/args/'+key)}" aria-label="Størrelse for ${esc(key)}">${Object.entries(E.DIMENSIONS).map(([id,d])=>option(id,d.name+' · '+d.unit,a.dimension)).join('')}</select>${expressionEditor(a.expression,a.dimension,path+'/args/'+key+'/expression',key,ctx,depth+1)}</div>`).join('')+'</div>';}
 function renderInspector(){
  const f=current();if(!f){$('#inspector').innerHTML='<div class="overline">TILPAS FORMLENS DELE</div><h2>Vælg en formel eller komponent</h2><p class="note">Her forbinder du kendte størrelser med underformler eller resultater fra din opgave. Hver selvstændig formel har sine egne tal.</p><button data-action="tutorial">Vis introduktion →</button>';return;}
  const ctx=S.context(task),lock=selectedLocked(),def=f.expression.kind==='formula'?E.FORMULAS[f.expression.formula]:null;
  let html=`<div class="overline">TILPAS FORMLENS DELE</div><input class="inspector-title" data-action="rename" value="${esc(f.name)}" maxlength="120" aria-label="Formlens navn"><div class="row"><label class="label">Resultatets symbol<input data-action="symbol" value="${esc(f.symbol)}" maxlength="24"></label><label class="label">Gruppe<select data-action="assign-group">${option('','Uden gruppe',f.groupId||'')}${(model().formulaGroups||[]).map(g=>option(g.id,g.name,f.groupId)).join('')}</select></label></div>`;
  if(lock)html+='<p class="info">Denne formel følger kredsløbets ledninger. Ret forbindelserne under Kredsløb for at ændre sammensætningen.</p>';
  else if(def){
   if(!E.BASE_FORMULAS[def.rearranged?.base||f.expression.formula]?.hidden)html+=`<label class="label" id="isolate-control">Find / isolér<select data-action="isolate">${E.rearrangements(f.expression.formula).filter(o=>o.available).map(o=>option(o.id,o.symbol+' · '+o.label,f.expression.formula)).join('')}</select></label>`;
   html+='<div id="source-editor">'+Object.entries(def.args).map(([k,a])=>`<div class="arg"><div class="arg-label">${sym(a.symbol)} ${esc(a.label)}</div>${expressionEditor(f.expression.args[k],a.dimension,'args/'+k,a.symbol,ctx)}</div>`).join('')+'</div>';
  }else if(f.expression.kind==='custom')html+=`<label class="label">Højreside<textarea data-action="custom-text" maxlength="500">${esc(f.expression.text)}</textarea></label><label class="label">Resultatets størrelse<select data-action="custom-result">${Object.entries(E.DIMENSIONS).map(([id,d])=>option(id,d.name,f.dimension)).join('')}</select></label><p class="note">Brug +, −, *, /, ^ og sqrt(...). Vælg størrelser og referencer nedenfor.</p>${customArgs(f.expression,'',ctx,0)}`;
  else html+=expressionEditor(f.expression,f.dimension,'',f.symbol,ctx);
  html+=`<div class="inspector-footer"><p class="note">Referencer følger deres kilde. En underformel deler input med den formel, den er indsat i.</p>${circuitIds().includes(selected)?'<p class="note">Kredsløbets komponenter fjernes på tegningen.</p>':'<button class="danger" data-action="delete-formula">Fjern denne formel</button>'}</div>`;
  $('#inspector').innerHTML=html;
 }
 function formulaPreview(f){
  const ctx=S.context(task),r=ctx.safe('formula:'+f.id,expanded?'expanded':'compact',true),full=ctx.safe('formula:'+f.id,'expanded',true);
  let html=r.ok?`<div class="math-wrap">${E.math(r.ast,f.symbol,E.Units.arithmetic(E.resultUnit(f)).label,display)}</div>`:`<p class="error-box">${esc(r.error)}</p>`;
  if(calculator){
   const answer=full.ok?E.evaluate(full.ast):{status:'error',error:full.error};
   html+='<div class="result">';
   if(answer.status==='ready'){const unit=E.resultUnit(f),tms=unit.format==='tms';html+=`${sym(f.symbol)} = <strong>${esc(tms?E.Units.formatTime(answer.value):S.format(answer.value))}</strong> ${esc(tms?'timer:minutter:sekunder':unit.label)}<small>${tms?'Formlen bruger sekunder. Sekundernes decimaler: ':''}3 cifre fra første ikke-nul efter kommaet. Mellemregninger beholder præcisionen.</small>`;}
   else if(answer.status==='incomplete')html+='<p class="note">Indtast de manglende tal nedenfor for at se resultatet.</p>';
   else html+=`<p class="error-box">${esc(answer.error||answer.message||'Beregningen er ikke defineret. Kontrollér nævnere og forudsætninger.')}</p>`;
   html+='</div>';
  }return html;
 }
 function formulaCard(f){return `<div class="card formula-card"><div class="formula-toolbar"><span class="overline" style="margin:0">DIN FORMEL</span><div class="segments" aria-label="Visning af tal"><button data-action="display" data-value="values" class="${display==='values'?'active':''}">Værdier</button><button data-action="display" data-value="units" class="${display==='units'?'active':''}">Symboler</button><button data-action="display" data-value="both" class="${display==='both'?'active':''}">Begge</button></div><button class="text-button" data-action="expand">${expanded?'Vis referencer kort':'Fold referencer ud'}</button></div><div id="formula-preview">${formulaPreview(f)}</div></div>`;}
 function quantities(f){
  const r=S.context(task).safe('formula:'+f.id,'expanded',true);if(!r.ok)return '';
  const variables=E.variables(r.ast).filter(v=>!v.reference);
  return `<section id="quantity-guide"><h2>Størrelserne i formlen</h2><p class="note">Skriv tallet som i opgaven og vælg enhed. Omregningen udføres, før tallet vises i formlen. Et tomt felt beholder symbolet. TMS skrives som tt:mm:ss, fx 02:47:00. Formlen bruger sekunder, mens resultatet kan vises i TMS.</p><div class="input-grid">${variables.map(v=>{
   const unit=E.inputUnit(model(),v),key=E.Units.key(v),value=E.inputValue(model(),v),tms=unit.format==='tms',owner=model().formulas.find(f=>'formula:'+f.id===v.scope),converted=E.Units.convertedValue(value,unit);
   return `<div class="quantity"><div class="quantity-head">${sym(v.symbol)}<span>${esc(v.label||E.DIMENSIONS[v.dimension].name)}${owner&&owner.id!==f.id?`<small>↗ ${esc(owner.name)}</small>`:''}</span></div><div class="value-entry"><input type="text" inputmode="${tms?'text':'decimal'}" data-action="input-value" data-key="${esc(key)}" data-dimension="${v.dimension}" value="${esc(tms?E.Units.timeInput(value):value.replace('.',','))}" placeholder="${tms?'02:47:00':esc(v.symbol)}" aria-label="Tal for ${esc(v.symbol)}" maxlength="32" autocomplete="off"><button data-action="clear-value" data-key="${esc(key)}" aria-label="Ryd ${esc(v.symbol)}">×</button></div>${unitSelector(v.dimension,unit,'input-unit',key)}<span class="note" data-conversion="${esc(key)}">${converted?esc((unit.id==='percent'?E.percentToDecimal(value):converted.value).replace('.',','))+' '+esc(E.Units.base(v.dimension).label)+' i formlen':'→ '+esc(E.Units.base(v.dimension).label)+' i grundformlen'}</span></div>`;
  }).join('')}</div><div class="result-unit"><span>Resultatets enhed</span>${unitSelector(f.dimension,E.resultUnit(f),'result-unit',f.id)}</div></section>`;
 }
 function renderFormula(){
  const f=current();if(!f)return `<div class="empty-state"><div class="overline">STYRING · REGULERING · OVERVÅGNING</div><h1>Forbind idéerne.<br>Find formlen.</h1><p class="muted">Byg en opgave af formler og kredsløb. Brug resultater som referencer, vælg dine enheder, og behold overblikket hele vejen.</p><div class="empty-actions"><button class="primary" data-action="library">Vælg første formel →</button><button data-action="tab" data-tab="circuit">Byg kredsløb</button></div><div class="feature-cards"><button data-action="tab" data-tab="circuit"><strong>01 / Kredsløb</strong><span>Modstande, ledninger og forbindelser.</span></button><button data-action="tab" data-tab="tools"><strong>02 / Motor & måling</strong><span>Stjerne/trekant og transmittere.</span></button><button data-action="tab" data-tab="knowledge"><strong>03 / Opslag</strong><span>Komponenter, PID og I/O.</span></button></div></div>`;
  const def=f.expression.kind==='formula'?E.FORMULAS[f.expression.formula]:null;
  return `<div class="row between"><div><div class="overline">${esc(def?.group||'DIN OPGAVE')}</div><h1>${esc(f.name)}</h1></div><span class="chip">${esc(E.DIMENSIONS[f.dimension].name)}</span></div>${formulaCard(f)}${def?.note?'<p class="note">'+esc(def.note)+'</p>':''}${quantities(f)}${def?.source?.image?`<details class="source-detail"><summary>Formelgrundlag</summary><p>Din SRO-formelsamling · ${esc(def.source.image)}. Forbehold og faglige præciseringer står ved formlen.</p></details>`:''}`;
 }
 function componentText(f){const r=S.context(task).safe('formula:'+f.id,'expanded',true);if(!r.ok)return '';const answer=E.evaluate(r.ast);return calculator&&answer.status==='ready'?S.format(answer.value)+' '+E.resultUnit(f).label:'';}
 function boardSvg(){
  const b=task.circuit;if(!b)return '';const points=C.points(b),f=id=>model().formulas.find(f=>f.id===id);
  function direction(id){if(id==='source:plus')return [0,-1];if(id==='source:minus')return [0,1];const r=b.resistors.find(r=>id.startsWith(r.id+':'));if(!r)return [0,0];const sign=id.endsWith(':a')?-1:1;return r.vertical?[0,sign]:[sign,0];}
  function route(w){
   const a=points[w.from],z=points[w.to],[ax,ay]=direction(w.from),[zx,zy]=direction(w.to),s={x:a.x+ax*25,y:a.y+ay*25},t={x:z.x+zx*25,y:z.y+zy*25};
   let d=`M${a.x} ${a.y} L${s.x} ${s.y}`;
   if(ax&&zy)d+=` V${t.y} H${t.x}`;
   else if(ay&&zx)d+=` H${t.x} V${t.y}`;
   else if(ay||zy)d+=` V${(s.y+t.y)/2} H${t.x} V${t.y}`;
   else if(s.y===t.y&&((ax>0&&s.x>t.x)||(ax<0&&s.x<t.x)))d+=` V${Math.max(20,s.y-65)} H${t.x} V${t.y}`;
   else d+=` H${(s.x+t.x)/2} V${t.y} H${t.x}`;
   return d+` L${z.x} ${z.y}`;
  }
  const wires=b.wires.map(w=>`<g data-wire="${w.id}"><path class="wire ${component===w.id?'selected':''}" d="${route(w)}"/><path class="wire-hit" d="${route(w)}" tabindex="0" role="button" aria-label="Vælg ledning"/></g>`).join('');
  const components=b.resistors.map(r=>`<g class="component ${component===r.id?'selected':''}" data-component="${r.id}" transform="translate(${r.x} ${r.y})" tabindex="0" role="button" aria-label="Flyt og tilpas ${esc(r.label)}"><g transform="rotate(${r.vertical?90:0})"><path class="part" d="M-60 0 H-35 M35 0 H60"/><rect class="part" x="-35" y="-14" width="70" height="28"/></g><text x="${r.vertical?25:0}" y="${r.vertical?-15:-28}" text-anchor="${r.vertical?'start':'middle'}">${esc(r.label.replace('_',''))}</text><text class="c-value" x="${r.vertical?25:0}" y="${r.vertical?10:38}" text-anchor="${r.vertical?'start':'middle'}">${esc(componentText(f(r.formulaId)))}</text></g>`).join('');
  const source=`<g class="component ${component==='source'?'selected':''}" data-component="source" transform="translate(${b.source.x} ${b.source.y})" tabindex="0" role="button" aria-label="Flyt og tilpas spændingskilde"><path class="part" d="M0 -60 V-32 M0 32 V60"/><circle class="part" r="32"/><text y="-6" text-anchor="middle">+</text><text y="20" text-anchor="middle">−</text><text x="-45" y="0" text-anchor="end">U</text><text class="c-value" x="0" y="86" text-anchor="middle">${esc(componentText(f(b.source.formulaId)))}</text></g>`;
  const junctions=b.junctions.map(j=>`<g class="component ${component===j.id?'selected':''}" data-component="${j.id}" transform="translate(${j.x} ${j.y})" tabindex="0" role="button" aria-label="Flyt knudepunkt"><circle class="part" r="14"/><text x="20" y="-12">●</text></g>`).join('');
  const terms=Object.entries(points).map(([id,p])=>`<circle class="terminal ${pending===id?'pending':''}" data-terminal="${id}" cx="${p.x}" cy="${p.y}" r="6" tabindex="0" role="button" aria-label="Forbind ${esc(id==='source:plus'?'+ på kilden':id==='source:minus'?'− på kilden':(b.resistors.find(r=>id.startsWith(r.id+':'))?.label||'knudepunkt')+' '+id.split(':').at(-1))}"/>`).join('');
  return `<svg class="circuit-board" id="circuit-board" viewBox="0 0 900 500" role="group" aria-label="Kredsløbsbygger"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="var(--border)"/></pattern></defs><rect width="900" height="500" fill="url(#grid)"/>${wires}${components}${source}${junctions}${terms}</svg>`;
 }
 function renderCircuit(){
  const b=task.circuit;
  let html='<div class="overline">ELEKTRICITET</div><h1>Byg dit kredsløb</h1><p class="note">Indsæt modstande. Træk dem på plads, og klik på to blå tilslutninger for at tegne en ledning. Krydsende ledninger er ikke forbundet uden et fælles tilslutningspunkt.</p>';
  html+=`<div class="board-toolbar" id="board-toolbar"><button class="primary" data-action="add-resistor">+ Modstand</button><button data-action="add-junction">+ Knudepunkt</button><button data-action="rotate" ${!b?.resistors.some(r=>r.id===component)?'disabled':''}>Drej 90°</button><button data-action="delete-component" ${!component||component==='source'?'disabled':''}>Fjern valgt</button><button data-action="undo" ${history.length?'':'disabled'}>Fortryd</button><button data-action="clear-circuit" ${b?'':'disabled'}>Ryd kredsløb</button></div>`;
  if(!b||(!b.resistors.length&&!b.wires.length))html+='<div class="row"><span class="note">Start med en kobling uden tal:</span>'+[['series','Serie'],['parallel','Parallel'],['mixed','Blandet'],['bridge','Brokobling']].map(([id,n])=>`<button data-action="preset" data-value="${id}">${n}</button>`).join('')+'</div>';
  if(!b)return html+'<div class="card empty-state"><h2>Din tegning starter her</h2><p class="note">Den første modstand tilføjer også en spændingskilde og en formel for den samlede modstand.</p></div>';
  html+=`<div class="circuit-scroll" id="circuit-wrap">${boardSvg()}</div><p class="circuit-status" id="circuit-status">${pending?'Vælg den anden tilslutning. Esc annullerer.':'Tip: vælg en komponent og brug piletasterne for at flytte den. Ledninger følger med.'}</p>`;
  let status;try{status=C.reduce(b);}catch(e){status={ok:false,error:e.message};}
  html+=`<p class="${status.ok?'note':'error-box'}">${esc(status.ok?status.note:status.error)}</p><div class="row"><button data-action="circuit-result">Tilpas samlet modstand</button><button data-action="circuit-current" ${!status.ok||status.short?'disabled':''}>+ Formel for samlet strøm</button></div>`;
  const f=model().formulas.find(f=>f.id===b.resultId);html+=`<div id="circuit-summary"><div class="card formula-card"><h2>Samlet modstand</h2>${formulaPreview(f)}</div>`;
  if(calculator){
   try{const ctx=S.context(task),values=Object.fromEntries(b.resistors.map(r=>{const out=ctx.safe('formula:'+r.formulaId);return [r.formulaId,out.ok?E.evaluate(out.ast).value:undefined];})),v=ctx.safe('formula:'+b.source.formulaId),u=v.ok?E.evaluate(v.ast).value:undefined;
    if(Number.isFinite(u)){const results=C.solve(b,values,u);html+='<div class="card table-scroll"><h2>Fordeling i kredsløbet</h2><table><thead><tr><th>Modstand</th><th>Spænding / V</th><th>Strøm / A</th><th>Effekt / W</th></tr></thead><tbody>'+b.resistors.map(r=>{const n=results[r.formulaId];return `<tr><td>${sym(r.label)}</td><td>${n?S.format(n.voltage):'—'}</td><td>${n?S.format(n.current):'—'}</td><td>${n?S.format(n.power):'—'}</td></tr>`;}).join('')+'</tbody></table><p class="note">Fortegnet følger retningen fra første til anden tilslutning (venstre → højre, eller top → bund). Ideelle ledninger og DC-modstande. Frakoblede dele vises som —.</p></div>';}
   }catch{}
  }
  html+='</div>';
  if(current()&&circuitIds().includes(selected)&&!selectedLocked())html+=`<h2>${esc(current().name)}</h2>${quantities(current())}`;
  return html;
 }
 function render(){
  renderTasks();document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  $('#calculator-toggle').setAttribute('aria-pressed',String(calculator));$('#calculator-toggle').innerHTML='Lommeregner <b>'+(calculator?'Til':'Fra')+'</b>';
  $('#content').innerHTML=tab==='formula'?renderFormula():tab==='circuit'?renderCircuit():tab==='tools'?K.tools(view,calculator):K.knowledge(view,task.ioRows);
  renderInspector();if(EXAM)$('#save-status').textContent='Eksamen · gemmes ikke';
 }
 function dialog(title,html){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=html;if(!$('#app-dialog').open)$('#app-dialog').showModal();}
 function library(query=''){
  const fs=Object.entries(E.BASE_FORMULAS).filter(([id,f])=>!f.hidden&&[f.name,f.group,f.symbol,f.note,...(f.aliases||[])].join(' ').toLocaleLowerCase('da').includes(query.toLocaleLowerCase('da')));
  const groups=[...new Set(fs.map(([,f])=>f.group))];
  const list=groups.map(g=>`<h3 class="library-group">${esc(g)}</h3><div class="library-grid">${fs.filter(([,f])=>f.group===g).map(([id,f])=>`<button class="library-item" data-action="add-formula" data-id="${id}"><strong>${esc(f.name)}</strong>${E.math(E.formulaAst(id),f.symbol,'','units')}</button>`).join('')}</div>`).join('')||'<p class="note">Ingen formler matcher. Prøv fx motor, strøm eller transmitter.</p>';
  if($('#library-results')&&$('#app-dialog').open)$('#library-results').innerHTML=list;else dialog('Find en formel',`<input type="search" id="library-search" class="library-search" data-action="search" placeholder="Søg i SRO-formlerne…" aria-label="Søg formler"><p class="note">Vælg grundformlen og brug Find / isolér for at vælge den ukendte.</p><div id="library-results">${list}</div>`);
 }
 function addFormula(id){checkpoint();const f=S.add(task,id);selected=f.id;tab='formula';$('#app-dialog').close();commit();}
 function removeFormula(id){const users=E.usersOf(model(),'formula',id);if(users.length&&!confirm('Andre formler bruger denne reference. De vil vise en manglende kilde. Fjern alligevel?'))return;checkpoint();model().formulas=model().formulas.filter(f=>f.id!==id);if(selected===id)selected=model().formulas.at(-1)?.id||'';commit();}
 function clearCircuit(){
  if(!task.circuit)return;const ids=circuitIds();if(!confirm('Fjern kredsløbet og dets komponentformler? Andre formler, der bruger dem, vil mangle en reference.'))return;
  checkpoint();model().formulas=model().formulas.filter(f=>!ids.includes(f.id));if(ids.includes(selected))selected='';task.circuit=null;pending='';component='';commit();
 }
 const tutorialSteps=[
  {target:'.task-panel',title:'Din SRO-arbejdsbog',body:'<p>Byg opgaven af selvstændige formler. Flyt dem med pilene, og saml dem i navngivne grupper.</p>',tab:'formula'},
  {target:'.task-actions',title:'Find den rigtige formel',body:'<p>Tryk <strong>+ Formel</strong> for at søge i elektricitet, motorer, måling, trykluft og PID. Du kan også skrive en egen formel.</p>',tab:'formula'},
  {target:'.formula-card',title:'Se din samlede formel',body:'<p>Vælg Værdier, Symboler eller Begge. “Vis referencer kort” viser mellemresultater som symboler; “Fold referencer ud” viser hele kæden.</p>',tab:'formula'},
  {target:'#source-editor',title:'Forbind formlens dele',body:'<p>Hver størrelse kan være kendt, en indsat underformel eller en <strong>reference</strong> til en anden formel. Referencer følger deres kilde, mens to uafhængige formler har egne værdier.</p>',tab:'formula'},
  {target:'#isolate-control',title:'Vælg det ukendte',body:'<p>“Find / isolér” vender den aktuelle formel. Den udskiftes på stedet, så opgaven ikke får en ekstra kopi.</p>',tab:'formula'},
  {target:'#quantity-guide',title:'Dine tal og enheder',body:'<p>Skriv fx 20 og vælg mm. Formlen får det omregnede tal. Procent omregnes også før indsættelse. Vælg svarets enhed nederst.</p>',tab:'formula'},
  {target:'#board-toolbar',title:'Byg et kredsløb',body:'<p>Tilføj modstande og knudepunkter. Træk komponenterne, drej en modstand 90°, eller vælg den og tryk “Fjern valgt”.</p>',tab:'circuit'},
  {target:'#circuit-board',title:'Tegn ledninger',body:'<p>Klik på en blå tilslutning og derefter en anden. Ledningen følger komponenterne. Kryds er ikke forbindelser: brug et fælles tilslutningspunkt eller et knudepunkt.</p>',tab:'circuit'},
  {target:'.circuit-status',title:'Brug kredsløbet i andre formler',body:'<p>Ledningerne bestemmer den samlede modstand. Brug resultatet som reference i fx Ohms lov. Afbrudte forbindelser og kortslutninger markeres.</p>',tab:'circuit'},
  {target:'.tabs',title:'Motorer, måling og opslag',body:'<p>Prøv stjerne/trekant, transmitterens 4–20 mA-signal og reguleringsretning. Opslagene indeholder komponenter, IP-klasser, isolering og en redigerbar I/O-liste.</p>',tab:'tools'},
  {target:'#calculator-toggle',title:'Vælg om resultater skal vises',body:'<p>Lommeregneren kan slås til og fra. Resultatet vises, når alle tal findes. Normalversionen kan gemme, importere og eksportere opgaver. Eksamensversionen starter altid tom med lommeregneren slået til.</p>',tab:'formula'}
 ];
 function tutorial(){
  if(tour)return;const saved={task:S.clone(task),selected,tab,calculator,component};$('#app-dialog').close();task=S.empty();C.preset(task,'mixed');const f=S.add(task,'ohm');f.expression.args.R=E.ref('formula:'+task.circuit.resultId);selected=f.id;calculator=false;
  tour=window.PPTour.start({steps:tutorialSteps.map(s=>({...s,section:'SRO'})),prepare(step){tab=step.tab;selected=f.id;render();return ()=>document.querySelector(step.target);},finish(){({task,selected,tab,calculator,component}=saved);tour=null;render();},help(){dialog('Sådan bruger du SRO',tutorialSteps.map(s=>`<h3>${s.title}</h3>${s.body}`).join(''));}});
 }
 function updatePreview(){if(tab==='formula'&&current()&&$('#formula-preview'))$('#formula-preview').innerHTML=formulaPreview(current());if(tab==='circuit'&&task.circuit){const holder=document.createElement('div');holder.innerHTML=renderCircuit();if($('#circuit-summary'))$('#circuit-summary').innerHTML=holder.querySelector('#circuit-summary').innerHTML;if($('#circuit-board'))$('#circuit-board').innerHTML=holder.querySelector('#circuit-board').innerHTML;}}
 document.addEventListener('input',event=>{
  const el=event.target,a=el.dataset.action;
  if(a==='search'){library(el.value);return;}
  if(a==='input-value'){
   const unit=E.Units.get(el.dataset.dimension,model().inputUnits[el.dataset.key]||E.Units.base(el.dataset.dimension).id),parsed=unit.format==='tms'?E.Units.parseTime(el.value):E.parseInputValue(el.value);el.setAttribute('aria-invalid',String(parsed===null));
   if(parsed===null||parsed==='')delete model().inputValues[el.dataset.key];else model().inputValues[el.dataset.key]=parsed;
   const c=E.Units.convertedValue(parsed,unit);
   document.querySelectorAll('[data-conversion]').forEach(n=>{if(n.dataset.conversion===el.dataset.key)n.textContent=c?(unit.id==='percent'?E.percentToDecimal(parsed):c.value).replace('.',',')+' '+E.Units.base(el.dataset.dimension).label+' i formlen':'→ '+E.Units.base(el.dataset.dimension).label+' i grundformlen';});
   persist();updatePreview();
  }
 });
 document.addEventListener('change',event=>{
  const el=event.target,a=el.dataset.action;if(!a||a==='search')return;
  try{
   if(a==='input-value'){const unit=E.Units.get(el.dataset.dimension,model().inputUnits[el.dataset.key]||E.Units.base(el.dataset.dimension).id),tms=unit.format==='tms';if((tms?E.Units.parseTime(el.value):E.parseInputValue(el.value))===null)toast(tms?'Skriv tt:mm:ss, fx 02:47:00. Minutter og sekunder skal være under 60.':'Skriv ét tal med komma eller punktum.');else {persist();updatePreview();}return;}
   if(a==='title'){model().title=el.value.trim()||'Ny SRO-opgave';persist();return;}
   if(a==='view'){view[el.dataset.key]=el.type==='checkbox'?el.checked:el.value;render();return;}
   if(a==='io-edit'){task.ioRows[Number(el.dataset.index)][el.dataset.key]=el.value;persist();return;}
   if(a==='file-input')return;
   const f=current();
   if(a==='rename'){f.name=el.value.trim()||'Formel';commit();}
   if(a==='symbol'){if(!E.CustomFormula.validSymbol(el.value))throw Error('Brug et symbol som R, U_net eller η.');f.symbol=el.value;commit();}
   if(a==='assign-group'){task.model=E.assignFormulaGroup(model(),selected,el.value);commit();}
   if(a==='isolate'){checkpoint();task.model=E.rearrangeFormula(model(),selected,el.value);commit();}
   if(a==='source'){
    checkpoint();const value=el.value;let expression;
    if(value==='symbol')expression=E.symbol(el.dataset.symbol);
    else if(value.startsWith('ref:'))expression=E.ref(value.slice(4));
    else if(value.startsWith('formula:')){expression=E.newExpression(value.slice(8));S.applyDefaults(model(),expression,selected);}
    else return;
    pathSet(el.dataset.path,expression);E.initializeUnitChoices(model());commit();
   }
   if(a==='custom-dimension'){const arg=pathGet(el.dataset.path);arg.dimension=el.value;arg.expression=E.symbol(el.dataset.path.split('/').at(-1));E.initializeUnitChoices(model());commit();}
   if(a==='custom-result'){f.dimension=el.value;f.resultUnit=E.Units.preferred(f.dimension).id;commit();}
   if(a==='custom-text'){const next=E.customExpression(el.value,f.dimension,f.expression.args);f.expression=next;E.initializeUnitChoices(model());commit();}
   if(a==='input-unit'||a==='result-unit'){
    const dim=el.dataset.dimension,key=el.dataset.key,old=a==='input-unit'?E.Units.get(dim,model().inputUnits[key]||E.Units.base(dim).id):E.resultUnit(f),unit=el.dataset.part?E.Units.withPart(dim,old.id,el.dataset.part,el.value):E.Units.get(dim,el.value);
    if(a==='input-unit'){const value=E.Units.switchTimeFormat(model().inputValues[key]||'',old,unit);if(value)model().inputValues[key]=value;model().inputUnits[key]=unit.id;}else f.resultUnit=unit.id;commit();
   }
  }catch(error){toast(error.message);render();}
 });
 document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.tagName==='SELECT'||el.tagName==='INPUT'||el.tagName==='TEXTAREA')return;
  const a=el.dataset.action;try{
   if(a==='library'){library();$('#library-search').focus();}
   else if(a==='close-dialog')$('#app-dialog').close();
   else if(a==='add-formula')addFormula(el.dataset.id);
   else if(a==='tab'){tab=el.dataset.tab;pending='';render();}
   else if(a==='select'){selected=el.dataset.id;tab='formula';render();}
   else if(a==='display'){display=el.dataset.value;try{localStorage.setItem('sro-display',display);}catch{}render();}
   else if(a==='expand'){expanded=!expanded;render();}
   else if(a==='calculator'){calculator=!calculator;render();}
   else if(a==='theme'){const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('sro-theme',theme);}catch{}}
   else if(a==='tutorial')tutorial();
   else if(a==='reference'){selected=el.dataset.target.split(':')[1];tab='formula';render();}
   else if(a==='up'||a==='down'){task.model=E.moveFormula(model(),el.dataset.id,a==='up'?-1:1);commit();}
   else if(a==='new-group'){const name=prompt('Gruppens navn');if(name){task.model=E.addFormulaGroup(model(),S.uid(),name);commit();}}
   else if(a==='group-rename'){const g=model().formulaGroups.find(g=>g.id===el.dataset.id),name=prompt('Gruppens navn',g.name);if(name){task.model=E.renameFormulaGroup(model(),g.id,name);commit();}}
   else if(a==='group-delete'){task.model=E.removeFormulaGroup(model(),el.dataset.id);commit();}
   else if(a==='group-up'||a==='group-down'){task.model=E.moveFormulaGroup(model(),el.dataset.id,a==='group-up'?-1:1);commit();}
   else if(a==='delete-formula')removeFormula(selected);
   else if(a==='clear-value'){delete model().inputValues[el.dataset.key];commit();}
   else if(a==='custom'){if(model().formulas.length>=40)throw Error('Højst 40 formler.');checkpoint();const f={id:S.uid(),name:'Egen formel',symbol:'R',dimension:'resistance',expression:E.customExpression('R_a + R_b','resistance')};model().formulas.push(f);E.initializeUnitChoices(model());selected=f.id;tab='formula';commit();}
   else if(a==='new-task'){if(!confirm('Start en tom opgave? Den nuværende opsætning erstattes.'))return;checkpoint();task=S.empty();selected='';component='';pending='';commit();}
   else if(a==='export'&&!EXAM){const blob=new Blob([JSON.stringify(task,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=(model().title.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,70)||'SRO-opgave')+'.sro.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
   else if(a==='import'&&!EXAM)$('#file-input').click();
   else if(a==='add-resistor'){checkpoint();const b=C.create(task),r=C.addResistor(task,300+b.resistors.length%3*210,150+Math.floor(b.resistors.length/3)*90);component=r.id;selected=r.formulaId;commit();}
   else if(a==='add-junction'){checkpoint();const b=C.create(task);if(b.junctions.length>=20)throw Error('Højst 20 knudepunkter.');const j={id:S.uid(),x:450,y:250};b.junctions.push(j);component=j.id;commit();}
   else if(a==='rotate'){const r=task.circuit?.resistors.find(r=>r.id===component);if(r){checkpoint();r.vertical=!r.vertical;commit();}}
   else if(a==='delete-component'){
    const b=task.circuit;if(!b||component==='source')return;checkpoint();const r=b.resistors.find(r=>r.id===component);
    if(r){b.resistors=b.resistors.filter(v=>v!==r);model().formulas=model().formulas.filter(f=>f.id!==r.formulaId);if(selected===r.formulaId)selected=b.resultId;}
    b.junctions=b.junctions.filter(j=>j.id!==component);b.wires=b.wires.filter(w=>w.id!==component&&w.from!==component&&w.to!==component&&!w.from.startsWith(component+':')&&!w.to.startsWith(component+':'));component='';pending='';commit();
   }
   else if(a==='clear-circuit')clearCircuit();
   else if(a==='undo'){if(history.length){task=history.pop();if(!current())selected=model().formulas[0]?.id||'';component='';pending='';commit();}}
   else if(a==='preset'){checkpoint();C.preset(task,el.dataset.value);selected=task.circuit.resistors[0].formulaId;component=task.circuit.resistors[0].id;commit();}
   else if(a==='circuit-result'){selected=task.circuit.resultId;render();}
   else if(a==='circuit-current'){checkpoint();const f=S.add(task,'inverse:ohm:I',{name:'Kredsløb · samlet strøm',symbol:'I_total'});f.expression.args.given=E.ref('formula:'+task.circuit.source.formulaId);f.expression.args.R=E.ref('formula:'+task.circuit.resultId);selected=f.id;tab='formula';commit();}
   else if(a==='knowledge-section'){view.section=el.dataset.value;render();}
   else if(a==='view-toggle'){view[el.dataset.key]=el.dataset.value||!view[el.dataset.key];render();}
   else if(a==='tool-formula'){checkpoint();const f=K.addTool(task,el.dataset.value,view);selected=f.id;tab='formula';commit();}
   else if(a==='io-add'){if(task.ioRows.length>=100)throw Error('Højst 100 I/O-rækker.');task.ioRows.push({type:'DI',address:'',name:'',note:''});commit();}
   else if(a==='io-delete'){task.ioRows.splice(Number(el.dataset.index),1);commit();}
   else if(a==='io-example'){if(task.ioRows.length&&!confirm('Erstat I/O-listen med eksemplet?'))return;task.ioRows=K.ioExample();commit();}
  }catch(error){toast(error.message);render();}
 });
 function terminal(id){if(!pending){pending=id;render();return;}if(pending===id){pending='';render();return;}checkpoint();C.wire(task.circuit,pending,id);pending='';commit();}
 function selectComponent(id){component=id;const b=task.circuit,o=id==='source'?b.source:b.resistors.find(r=>r.id===id);if(o)selected=o.formulaId;}
 document.addEventListener('pointerdown',event=>{
  if(tab!=='circuit')return;const target=event.target.closest('[data-terminal],[data-component],[data-wire]');if(!target)return;
  if(target.dataset.terminal){event.preventDefault();terminal(target.dataset.terminal);return;}
  if(target.dataset.wire){component=target.dataset.wire;render();return;}
  const b=task.circuit,id=target.dataset.component,o=[b.source,...b.resistors,...b.junctions].find(o=>o.id===id);selectComponent(id);checkpoint();
  const svg=$('#circuit-board'),rect=svg.getBoundingClientRect();drag={id,o,pointer:event.pointerId,x:event.clientX,y:event.clientY,ox:o.x,oy:o.y,scale:900/rect.width,moved:false};svg.setPointerCapture(event.pointerId);event.preventDefault();
 });
 document.addEventListener('pointermove',event=>{if(!drag||drag.pointer!==event.pointerId)return;const dx=(event.clientX-drag.x)*drag.scale,dy=(event.clientY-drag.y)*drag.scale;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;drag.o.x=Math.max(60,Math.min(840,Math.round((drag.ox+dx)/10)*10));drag.o.y=Math.max(60,Math.min(440,Math.round((drag.oy+dy)/10)*10));const svg=$('#circuit-board');if(svg){const holder=document.createElement('div');holder.innerHTML=boardSvg();svg.innerHTML=holder.firstElementChild.innerHTML;}});
 function endDrag(){if(!drag)return;drag=null;commit();}
 document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&pending){pending='';render();return;}
  const target=event.target.closest('[data-terminal],[data-component],[data-wire]');if(tab!=='circuit'||!target)return;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();if(target.dataset.terminal)terminal(target.dataset.terminal);else{component=target.dataset.wire||target.dataset.component;if(target.dataset.component)selectComponent(component);render();}return;}
  if(target.dataset.component&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
   event.preventDefault();const b=task.circuit,o=[b.source,...b.resistors,...b.junctions].find(o=>o.id===target.dataset.component);checkpoint();o.x=Math.max(60,Math.min(840,o.x+(event.key==='ArrowLeft'?-10:event.key==='ArrowRight'?10:0)));o.y=Math.max(60,Math.min(440,o.y+(event.key==='ArrowUp'?-10:event.key==='ArrowDown'?10:0)));const id=o.id;commit();document.querySelector('[data-component="'+id+'"]')?.focus();
  }
 });
 if(!EXAM)$('#file-input').addEventListener('change',async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  try{if(file.size>1500000)throw Error('Filen er for stor. Højst 1,5 MB.');const candidate=S.validate(JSON.parse(await file.text()));if(model().formulas.length&&!confirm('Erstat den åbne opgave med den importerede?'))return;checkpoint();task=candidate;if(task.circuit)C.sync(task);selected=model().formulas[0]?.id||'';component='';pending='';tab='formula';commit();toast('Opgaven er importeret.');}catch(e){toast('Kunne ikke importere: '+e.message);}
 });
 try{const theme=localStorage.getItem('sro-theme'),mode=localStorage.getItem('sro-display');if(['dark','light'].includes(theme))document.documentElement.dataset.theme=theme;if(['values','units','both'].includes(mode))display=mode;if(!EXAM){const stored=localStorage.getItem(STORAGE);if(stored){task=S.validate(JSON.parse(stored));if(task.circuit)C.sync(task);selected=model().formulas[0]?.id||'';}}}catch{toast('Den gemte opgave kunne ikke indlæses. En tom opgave er åbnet.');}
 if(EXAM)window.addEventListener('pageshow',event=>{if(event.persisted){tour?.close();task=S.empty();selected='';component='';pending='';history=[];calculator=true;tab='formula';render();}});
 render();
})();
