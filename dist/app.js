(function () {
  'use strict';
  const E = window.PP;
  const STORAGE = 'pp-kompendium.symbolic.v2', THEME = 'pp-kompendium.theme';
  const $ = selector => document.querySelector(selector);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const pathAttr = p => esc(JSON.stringify(p));
  let model = E.example(), activeId = 'time', selected = { type:'formula', id:'time' };
  let view = 'builder', expanded = true, uid = 0, toastTimer, pending = null, dialogOrigin = null, notice = '';
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) { model = E.validateModel(JSON.parse(saved)); activeId = model.formulas.at(-1)?.id || null; selected = activeId ? { type:'formula',id:activeId } : null; }
  } catch (_) { notice = 'Den gemte opsætning kunne ikke åbnes. Bassin-eksemplet er indlæst.'; }
  let theme = 'light';
  try { theme = localStorage.getItem(THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (_) { /* Storage is optional. */ }
  if (!['light','dark'].includes(theme)) theme = 'light';
  const icons = {
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
  function shapeIcon(type) {
    const drawings = {
      cylinder:'<ellipse cx="25" cy="10" rx="16" ry="6"/><path d="M9 10v26c0 8 32 8 32 0V10"/><path d="M9 35c0-8 32-8 32 0" stroke-dasharray="3 3"/>',
      cone:'<ellipse cx="25" cy="10" rx="18" ry="6"/><path d="m7 10 18 33 18-33"/>',
      frustum:'<ellipse cx="25" cy="10" rx="18" ry="6"/><path d="m7 10 8 28c2 5 18 5 20 0l8-28"/><path d="M15 38c2-5 18-5 20 0" stroke-dasharray="3 3"/>',
      box:'<path d="m7 15 27-9 12 10-27 9-12-10Zm0 0v22l12 10 27-9V16M19 25v22"/><path d="M34 6v22L7 37m27-9 12 10" stroke-dasharray="3 3"/>',
      sphere:'<circle cx="25" cy="25" r="19"/><ellipse cx="25" cy="25" rx="19" ry="7"/><ellipse cx="25" cy="25" rx="8" ry="19" stroke-dasharray="3 3"/>',
      pipe:'<ellipse cx="11" cy="28" rx="7" ry="14"/><path d="m11 14 27-8c10 0 10 28 0 28l-27 8"/><path d="M38 6c-10 0-10 28 0 28" stroke-dasharray="3 3"/>'
    };
    return `<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" aria-hidden="true">${drawings[type]}</svg>`;
  }
  const symbolHtml = s => `<math xmlns="http://www.w3.org/1998/Math/MathML">${E.mathSymbol(s)}</math>`;
  const pretty = s => s.replace(/_/g, '');
  const active = () => model.formulas.find(f => f.id === activeId);
  const getAt = p => p.reduce((o,k) => o[k], model);
  function setAt(p,v) { getAt(p.slice(0,-1))[p.at(-1)] = v; }
  const newId = prefix => prefix + '-' + Date.now().toString(36) + '-' + (++uid);
  function ownerTarget(path) { return path[0] === 'shapes' ? `shape:${model.shapes[path[1]].id}:input:${path[3]}` : `formula:${model.formulas[path[1]].id}`; }
  function notify(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function save() {
    try { localStorage.setItem(STORAGE,JSON.stringify(model)); $('#save-status').textContent = 'Gemt på denne computer'; }
    catch (_) { $('#save-status').textContent = 'Gem opsætningen som fil'; }
  }
  function setTheme() {
    document.documentElement.dataset.theme = theme;
    $('#theme-toggle').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    const title = `Skift til ${theme === 'dark' ? 'lyst' : 'mørkt'} tema`;
    $('#theme-toggle').setAttribute('aria-label',title); $('#theme-toggle').title = title;
  }
  function formulaSummary(expression, dimension, ctx, lhs) {
    try { return E.math(ctx.expand(expression,dimension,'compact'),lhs); }
    catch (error) { return `<p class="inline-error">${esc(error.message)}</p>`; }
  }
  function renderSidebar() {
    $('#shape-library').innerHTML = Object.entries(E.SHAPES).map(([type,s]) => `<button class="shape-tool" data-action="add-shape" data-type="${type}" aria-label="Indsæt ${esc(s.name.toLowerCase())}" title="${esc(s.hint)}">${shapeIcon(type)}<span>${esc(s.name)}</span></button>`).join('');
    $('#formula-count').textContent = model.formulas.length;
    $('#saved-formulas').innerHTML = model.formulas.map(f => `<button class="saved-formula ${f.id === activeId ? 'active' : ''}" data-action="select-formula" data-id="${esc(f.id)}" ${f.id === activeId ? 'aria-current="true"' : ''}><span class="saved-symbol">${symbolHtml(f.symbol)}</span><span>${esc(f.name)}</span><span class="item-chevron" aria-hidden="true">›</span></button>`).join('');
  }
  function renderGoal() {
    $('#goal-select').innerHTML = (model.formulas.length ? '<optgroup label="Mine formler">' + model.formulas.map(f => `<option value="saved:${esc(f.id)}" ${f.id === activeId ? 'selected' : ''}>${esc(f.name)} · ${esc(pretty(f.symbol))}</option>`).join('') + '</optgroup>' : '<option value="" selected>Vælg en formel…</option>') + '<optgroup label="Tilføj en ny formel">' + Object.entries(E.FORMULAS).map(([id,f]) => `<option value="new:${id}">${esc(f.name)} · ${esc(pretty(f.symbol))}</option>`).join('') + '</optgroup>';
  }
  function renderFigures(ctx) {
    $('#shape-count').textContent = `${model.shapes.length} ${model.shapes.length === 1 ? 'figur' : 'figurer'}`;
    $('#figure-tray').innerHTML = model.shapes.length ? model.shapes.map(s => {
      const linked = Object.values(s.inputs).some(e => e.kind === 'ref');
      return `<button class="figure-tile ${selected?.type === 'shape' && selected.id === s.id ? 'selected' : ''}" data-action="select-shape" data-id="${esc(s.id)}" aria-pressed="${selected?.type === 'shape' && selected.id === s.id}"><span class="figure-number">${String(s.ordinal).padStart(2,'0')}</span><div class="figure-icon">${shapeIcon(s.type)}</div><span class="figure-name">${esc(s.name)}</span><span class="figure-role">${s.include ? 'Beholderdel' : 'Separat figur'}${linked ? ' · fælles mål' : ''}</span></button>`;
    }).join('') : '<div class="empty-figures">Indsæt en figur fra værktøjskassen, hvis din formel skal bruge et areal eller et rumfang.</div>';
    const included = model.shapes.filter(s => s.include);
    $('#construction-note').textContent = included.length ? included.map(s => s.name).join(' + ') + ' indgår i beholderens sum. Klik på en figur for at vælge flader og fælles mål.' : 'Du kan også bruge formlerne uden figurer. Behold de størrelser, du allerede kender, som symboler.';
  }
  function renderPreview(ctx) {
    const f = active();
    if (!f) {
      $('#formula-preview').innerHTML = '<div class="empty-preview"><span class="large-function">ƒ</span><h2>Find din næste formel</h2><p>Vælg, hvad du vil finde. Tilpas derefter formlens dele til det, du kender fra opgaven.</p><button class="button primary" data-action="add-formula">Vælg en formel</button></div>';
      $('#formula-chain').innerHTML = ''; $('#symbol-guide').innerHTML = ''; return;
    }
    const r = ctx.safe(`formula:${f.id}`,expanded ? 'expanded' : 'compact');
    const full = ctx.safe(`formula:${f.id}`);
    let note = f.expression.kind === 'formula' ? E.FORMULAS[f.expression.formula].note : '';
    if (f.expression.kind === 'assembly') note = f.dimension === 'volume' ? 'Læg kun rumfang sammen for dele, der ikke overlapper.' : 'Vælg kun de udvendige flader. Fælles endeflader skal udelades.';
    $('#formula-preview').innerHTML = `<div class="preview-header"><div><span class="eyebrow">DIN FORMEL</span><h2>${esc(f.name)}</h2></div><div class="segmented" role="group" aria-label="Udfoldning af formlen"><button data-action="expansion" data-expanded="false" aria-pressed="${!expanded}">Kort</button><button data-action="expansion" data-expanded="true" aria-pressed="${expanded}">Udfoldet</button></div></div><div class="formula-display">${r.ok ? E.math(r.ast,f.symbol) : `<div class="error-box">${esc(r.error)}</div>`}</div><div class="preview-footer"><span>${expanded ? 'Formlerne er sat ind i hinanden' : 'Referencer vises som symboler'}</span><button class="text-button copy-button" data-action="copy-formula" ${r.ok ? '' : 'disabled'}>${icon('copy')} Kopiér formel</button></div>${note ? `<p class="formula-assumption">${esc(note)}</p>` : ''}`;
    let steps;
    try { steps = ctx.steps(`formula:${f.id}`); } catch (_) { steps = []; }
    $('#formula-chain').innerHTML = steps.length ? `<details class="chain-details" data-detail-key="chain-${esc(f.id)}"><summary><span>Se formelkæden</span><span class="chain-count">${steps.length} ${steps.length === 1 ? 'formel' : 'formler'}</span></summary><ol class="chain-list">${steps.map(d => `<li><div class="chain-step-heading"><span>${esc(d.name)}</span><button class="text-button" data-action="inspect-reference" data-target="${esc(d.target)}">Tilpas</button></div><div class="chain-math">${formulaSummary(d.expression,d.dimension,ctx,d.symbol)}</div></li>`).join('')}</ol></details>` : '';
    if (!full.ok) { $('#symbol-guide').innerHTML = ''; return; }
    const vars = E.variables(full.ast);
    $('#symbol-guide').innerHTML = `<div class="guide-heading"><h2>Størrelserne i formlen</h2><span>Enheder ved brug af SI</span></div><dl class="symbol-list">${vars.map(v => `<div><dt>${symbolHtml(v.symbol)}<span>${esc(v.label || E.DIMENSIONS[v.dimension].name)}</span></dt><dd>${esc(E.DIMENSIONS[v.dimension].unit)}</dd></div>`).join('')}</dl>`;
  }
  function expressionEditor(expr, dimension, path, defaultSymbol, ctx, depth = 0) {
    if (depth > 12) return '<div class="error-box">Formlen er for dyb til at blive vist.</div>';
    const current = expr.kind === 'symbol' ? 'symbol' : expr.kind === 'assembly' ? 'assembly' : expr.kind + ':' + (expr.formula || expr.target);
    const owner = ownerTarget(path);
    const targets = ctx.list.filter(d => d.dimension === dimension && d.target !== owner && !E.dependsOn(model,d.target,owner));
    let options = `<option value="symbol">Kendt størrelse · ${esc(pretty(defaultSymbol))}</option>`;
    if (['volume','area'].includes(dimension)) options += `<option value="assembly">Fra beholderdelene · samlet ${dimension === 'volume' ? 'rumfang' : 'areal'}</option>`;
    const formulas = Object.entries(E.FORMULAS).filter(([,f]) => f.dimension === dimension);
    if (formulas.length) options += '<optgroup label="Indsæt en formel">' + formulas.map(([id,f]) => `<option value="formula:${id}">${esc(f.equation)} · ${esc(f.name)}</option>`).join('') + '</optgroup>';
    if (targets.length) options += '<optgroup label="Brug en reference">' + targets.map(d => `<option value="ref:${esc(d.target)}">↗ ${esc(d.name)}</option>`).join('') + '</optgroup>';
    if (expr.kind === 'ref' && !targets.some(d => d.target === expr.target)) options += `<option value="${esc(current)}">↗ ${esc(ctx.map.get(expr.target)?.name || 'Manglende reference')}</option>`;
    options = options.replace(`value="${esc(current)}"`,`value="${esc(current)}" selected`);
    let html = `<div class="expression"><select class="source-select" data-action="source" data-path="${pathAttr(path)}" data-dimension="${dimension}" data-symbol="${esc(defaultSymbol)}" aria-label="Kilde til ${esc(pretty(defaultSymbol))}">${options}</select>`;
    if (expr.kind === 'symbol') html += `<div class="known-symbol">${symbolHtml(expr.symbol)}<span>Behold den oplyste størrelse</span></div>`;
    else if (expr.kind === 'ref') {
      const source = ctx.map.get(expr.target);
      html += `<div class="reference-preview">${source ? formulaSummary(source.expression,source.dimension,ctx,source.symbol) : '<p class="inline-error">Vælg en ny reference.</p>'}</div>${source ? `<div class="reference-actions"><button class="text-button" data-action="inspect-reference" data-target="${esc(source.target)}">Tilpas kilde</button>${source.expression.kind !== 'symbol' ? `<button class="text-button" data-action="inline" data-path="${pathAttr(path)}" title="Indsætter en kopi af kildens formel, som du kan tilpasse her">Indsæt formlen her</button>` : ''}</div>` : ''}`;
    } else if (expr.kind === 'assembly') {
      html += `<div class="reference-preview">${formulaSummary(expr,dimension,ctx)}</div><p class="field-note">Følger de figurer, der er valgt som beholderdele.${dimension === 'area' ? ' Vælg flader på hver figur, så fælles endeflader ikke tælles med.' : ''}</p>`;
    } else {
      const f = E.FORMULAS[expr.formula];
      html += `<div class="expression-formula">${formulaSummary(expr,dimension,ctx)}</div><div class="formula-args">${Object.entries(f.args).map(([key,a]) => `<div class="input-group"><div class="input-label">${symbolHtml(a.symbol)}<span>${esc(a.label)}</span></div>${expressionEditor(expr.args[key],a.dimension,[...path,'args',key],a.symbol,ctx,depth+1)}</div>`).join('')}</div>`;
      if (depth && f.note) html += `<p class="field-note">${esc(f.note)}</p>`;
    }
    try { ctx.expand(expr,dimension,'expanded',[owner]); }
    catch (error) { html += `<p class="inline-error" role="status">${esc(error.message)}</p>`; }
    return html + '</div>';
  }
  function inspectorHeader(type, object, subtitle) {
    return `<div class="inspector-top"><span class="eyebrow">${type === 'shape' ? 'TILPAS FIGUREN' : 'TILPAS FORMLENS DELE'}</span><div class="inspector-heading"><div class="inspector-icon">${type === 'shape' ? shapeIcon(object.type) : symbolHtml(object.symbol)}</div><div style="min-width:0;flex:1"><input class="inspector-title" value="${esc(object.name)}" data-action="rename" data-type="${type}" data-id="${esc(object.id)}" maxlength="120" aria-label="${type === 'shape' ? 'Figurens' : 'Formlens'} navn"><p>${esc(subtitle)}</p></div></div></div>`;
  }
  function renderInspector(ctx) {
    if (!selected) { $('#inspector').innerHTML = '<div class="inspector-empty"><span class="large-function">ƒ</span><h2>Byg din formel</h2><p>Vælg en figur eller en formel for at tilpasse dens dele.</p></div>'; return; }
    if (selected.type === 'shape') {
      const i = model.shapes.findIndex(s => s.id === selected.id), s = model.shapes[i];
      if (!s) { selected = null; renderInspector(ctx); return; }
      const type = E.SHAPES[s.type];
      $('#inspector').innerHTML = inspectorHeader('shape',s,type.hint) + `<div class="inspector-content"><label class="include-choice"><input type="checkbox" data-action="include" data-id="${esc(s.id)}" ${s.include ? 'checked' : ''}><span>Indgår i beholderens sum</span></label><p class="field-note">Brug fx røret separat, når kun dets tværsnit skal bruges til flow.</p><div class="inspector-divider"></div><div class="section-kicker">Symboler og fælles mål</div>${Object.entries(type.inputs).map(([key,a]) => `<div class="input-group"><div class="input-label">${symbolHtml(a.symbol+'_'+s.ordinal)}<span>${esc(a.label)}</span></div>${expressionEditor(s.inputs[key],a.dimension,['shapes',i,'inputs',key],a.symbol+'_'+s.ordinal,ctx)}</div>`).join('')}<div class="inspector-divider"></div><label class="field-label" for="surface-select">Flader i overfladearealet</label><select id="surface-select" class="source-select" data-action="surface" data-id="${esc(s.id)}">${Object.entries(type.surfaces).map(([id,[name]]) => `<option value="${id}" ${s.surface === id ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select><p class="field-note">${esc(E.FORMULAS[type.surfaces[s.surface][1]].note || 'Vælg de flader, opgaven handler om.')}</p><details class="shape-formulas" data-detail-key="shape-${esc(s.id)}"><summary>Figurens formler</summary>${ctx.list.filter(d=>d.ownerId===s.id&&d.output).map(d=>`<div class="shape-formula"><span>${esc(d.name.split(' · ').at(-1))}</span><div>${formulaSummary(d.expression,d.dimension,ctx,d.symbol)}</div></div>`).join('')}</details><div class="inspector-actions"><button class="text-button" data-action="back-to-formula">Tilbage til formlen</button><button class="delete-button" data-action="delete" data-type="shape" data-id="${esc(s.id)}">${icon('trash')} Fjern figur</button></div></div>`;
    } else {
      const i = model.formulas.findIndex(f=>f.id===selected.id), f = model.formulas[i];
      if (!f) { selected = null; renderInspector(ctx); return; }
      $('#inspector').innerHTML = inspectorHeader('formula',f,E.DIMENSIONS[f.dimension].name) + `<div class="inspector-content"><p class="inspector-intro">Hvad kender du? Behold symbolet, eller vælg en formel eller reference i menuen.</p>${expressionEditor(f.expression,f.dimension,['formulas',i,'expression'],f.symbol,ctx)}<div class="inspector-actions">${f.id !== activeId ? '<button class="text-button" data-action="back-to-formula">Tilbage til hovedformlen</button>' : '<button class="text-button" data-action="add-formula">Tilføj en formel</button>'}<button class="delete-button" data-action="delete" data-type="formula" data-id="${esc(f.id)}">${icon('trash')} Fjern</button></div></div>`;
    }
  }
  function renderLibrary() {
    const groups = [...new Set(Object.values(E.FORMULAS).map(f=>f.group))];
    $('#panel-library').innerHTML = '<div class="library-intro"><h2>Formler, du kan bygge videre på.</h2><p>Vælg en formel. Erstat dens størrelser med det, du kender fra opgaven.</p></div>' + groups.map(group=>`<section class="formula-group"><h3>${esc(group)}</h3><div class="formula-grid">${Object.entries(E.FORMULAS).filter(([,f])=>f.group===group).map(([id,f])=>`<button class="formula-card" data-action="use-formula" data-formula="${id}"><h4>${esc(f.name)}</h4><div class="library-equation">${E.math(E.formulaAst(id),f.symbol)}</div>${f.note ? `<p>${esc(f.note)}</p>` : ''}<div class="formula-card-foot"><span>${esc(E.DIMENSIONS[f.dimension].name)}</span><span>Brug formel +</span></div></button>`).join('')}</div></section>`).join('');
  }
  function render(keepFocus = false) {
    const el = document.activeElement;
    const focus = keepFocus && el?.dataset.action ? { action:el.dataset.action,id:el.dataset.id,path:el.dataset.path,start:el.selectionStart,end:el.selectionEnd } : null;
    const open = [...document.querySelectorAll('details[open][data-detail-key]')].map(d=>d.dataset.detailKey);
    const ctx = E.context(model);
    $('#project-title').value = model.title;
    renderSidebar(); renderGoal(); renderFigures(ctx); renderPreview(ctx); renderInspector(ctx);
    for (const d of document.querySelectorAll('details[data-detail-key]')) if (open.includes(d.dataset.detailKey)) d.open = true;
    if (focus) {
      const next = [...document.querySelectorAll('[data-action]')].find(e=>e.dataset.action===focus.action && e.dataset.id===focus.id && e.dataset.path===focus.path);
      if (next) { next.focus({preventScroll:true}); if (focus.start != null && next.setSelectionRange) next.setSelectionRange(focus.start,focus.end); }
    }
  }
  function changeView(next) {
    view = next;
    for (const b of document.querySelectorAll('[data-view]')) { const yes=b.dataset.view===view; b.setAttribute('aria-selected',yes); b.tabIndex=yes?0:-1; }
    $('#panel-builder').hidden = view !== 'builder'; $('#panel-library').hidden = view !== 'library';
    $('.app-shell').classList.toggle('library-view',view==='library');
    if (view==='library') renderLibrary();
  }
  function select(type,id,scroll=false) {
    selected = {type,id};
    if (type==='formula') activeId=id;
    changeView('builder'); render();
    if (scroll && matchMedia('(max-width: 1000px)').matches) $('#inspector').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  function inspectReference(target) {
    const d = E.context(model).map.get(target);
    if (!d) return;
    selected = { type:d.ownerType, id:d.ownerId };
    changeView('builder'); render();
    if (matchMedia('(max-width: 1000px)').matches) $('#inspector').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  function openDialog(title,body,footer='') {
    dialogOrigin=document.activeElement;
    $('#dialog-content').innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-action="close-dialog" aria-label="Luk">${icon('close')}</button></div><div class="dialog-body">${body}</div>${footer?`<div class="dialog-footer">${footer}</div>`:''}`;
    $('#app-dialog').showModal();
  }
  function closeDialog() { $('#app-dialog').close(); pending=null; if(dialogOrigin?.isConnected)dialogOrigin.focus({preventScroll:true}); }
  function replaceSetup(candidate,title) {
    pending=()=>{model=candidate;activeId=model.formulas.at(-1)?.id||null;selected=activeId?{type:'formula',id:activeId}:null;save();changeView('builder');render();};
    openDialog(title,'<p>Din nuværende opsætning bliver erstattet. Gem den først, hvis du vil beholde den separat.</p>','<button class="button outline" data-action="close-dialog">Annullér</button><button class="button primary" data-action="confirm">Erstat opsætning</button>');
  }
  function formulaPicker() {
    const groups=[...new Set(Object.values(E.FORMULAS).map(f=>f.group))];
    openDialog('Hvad vil du finde?','<div class="dialog-formula-list">'+groups.map(group=>`<h3>${esc(group)}</h3>${Object.entries(E.FORMULAS).filter(([,f])=>f.group===group).map(([id,f])=>`<button class="dialog-formula-item" data-action="use-formula" data-formula="${id}"><span>${esc(f.name)}</span><span>${esc(f.equation)}</span></button>`).join('')}`).join('')+'</div>');
  }
  function addFormula(id) {
    if (model.formulas.length>=40) {notify('Der kan højst være 40 formler i én opsætning.');return;}
    const f=E.newFormula(newId('formula'),id);
    if(model.formulas.some(other=>other.symbol===f.symbol)){
      const base=f.symbol.replace(/_/g,'');let n=2;
      while(model.formulas.some(other=>other.symbol===base+'_'+n))n++;
      f.symbol=base+'_'+n;f.name+=' '+n;
    }
    // Reuse an unambiguous existing quantity for the two standard fill-time inputs.
    if(id==='fillTime')for(const [key,dim]of [['V','volume'],['Q','flow']]){
      const candidates=model.formulas.filter(other=>other.dimension===dim);
      if(candidates.length===1)f.expression.args[key]=E.ref('formula:'+candidates[0].id);
    }
    model.formulas.push(f);save();select('formula',f.id,true);
  }
  function addShape(type) {
    if(model.shapes.length>=24){notify('Der kan højst være 24 figurer i én opsætning.');return;}
    const ordinal=Math.max(0,...model.shapes.map(s=>s.ordinal))+1;
    const s=E.newShape(type,newId('shape'),ordinal), same=model.shapes.filter(other=>other.type===type).length;
    if(same)s.name+=' '+(same+1);
    model.shapes.push(s);save();select('shape',s.id,true);
  }
  function remove(type,id) {
    const list=type==='shape'?model.shapes:model.formulas, object=list.find(o=>o.id===id);
    if(!object)return;
    const users=E.usersOf(model,type,id);
    pending=()=>{list.splice(list.indexOf(object),1);if(activeId===id)activeId=model.formulas.at(-1)?.id||null;selected=activeId?{type:'formula',id:activeId}:null;save();render();};
    openDialog('Fjern '+object.name+'?',users.length?`<p>Disse formler bruger elementet:</p><ul>${users.map(name=>`<li>${esc(name)}</li>`).join('')}</ul><p>Figursummer følger de resterende beholderdele. Direkte referencer til det fjernede element markeres, så du kan vælge en ny kilde.</p>`:'<p>Elementet fjernes fra opsætningen.</p>','<button class="button outline" data-action="close-dialog">Annullér</button><button class="button danger" data-action="confirm">Fjern</button>');
  }
  function exportSetup() {
    const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=(model.title.replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-|-$/g,'')||'opsaetning')+'.pp.json';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('Opsætningen er hentet som en fil.');
  }
  async function copyFormula() {
    const f=active();if(!f)return;
    const r=E.context(model).safe('formula:'+f.id,expanded?'expanded':'compact');if(!r.ok)return;
    const text=f.symbol+' = '+E.plain(r.ast);
    try { if(!navigator.clipboard?.writeText)throw new Error('Unavailable');await navigator.clipboard.writeText(text);notify('Formlen er kopieret.'); }
    catch(_) {
      const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();let success=false;
      try{success=document.execCommand('copy');}catch(_){}area.remove();
      if(success)notify('Formlen er kopieret.');
      else openDialog('Kopiér formlen',`<p>Markér teksten og tryk Ctrl+C:</p><textarea class="copy-fallback" readonly aria-label="Formel til kopiering">${esc(text)}</textarea>`);
    }
  }
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-view]');if(tab){changeView(tab.dataset.view);return;}
    const b=event.target.closest('[data-action]');if(!b)return;
    const a=b.dataset.action;
    if(a==='theme'){theme=theme==='dark'?'light':'dark';setTheme();try{localStorage.setItem(THEME,theme);}catch(_){}}
    else if(a==='select-formula')select('formula',b.dataset.id,true);
    else if(a==='select-shape')select('shape',b.dataset.id,true);
    else if(a==='add-shape')addShape(b.dataset.type);
    else if(a==='add-formula')formulaPicker();
    else if(a==='use-formula'){if($('#app-dialog').open)closeDialog();addFormula(b.dataset.formula);}
    else if(a==='expansion'){expanded=b.dataset.expanded==='true';render(true);}
    else if(a==='back-to-formula'){if(activeId)select('formula',activeId,true);}
    else if(a==='inspect-reference')inspectReference(b.dataset.target);
    else if(a==='inline'){
      const path=JSON.parse(b.dataset.path),old=E.clone(getAt(path)),d=E.context(model).map.get(old.target);
      if(d){setAt(path,E.clone(d.expression));try{E.validateModel(model);save();render();notify('Formlen er indsat som en kopi. Dens underreferencer er bevaret.');}catch(_){setAt(path,old);notify('Formlen bliver for dyb. Behold referencen.');}}
    }
    else if(a==='delete')remove(b.dataset.type,b.dataset.id);
    else if(a==='export')exportSetup();
    else if(a==='import')$('#file-input').click();
    else if(a==='copy-formula')void copyFormula();
    else if(a==='new')replaceSetup({version:2,title:'Ny opsætning',shapes:[],formulas:[]},'Start en tom opsætning?');
    else if(a==='example')replaceSetup(E.example(),'Indlæs bassin-eksemplet?');
    else if(a==='close-dialog')closeDialog();
    else if(a==='confirm'){const action=pending;closeDialog();if(action)action();}
    else if(a==='help')openDialog('Sådan bruger du kompendiet','<h3>Fra opgave til formel</h3><ol><li>Vælg, hvad du vil finde, fx fyldetid, rumfang eller flow.</li><li>Indsæt de figurer, opgaven består af. Vælg, hvilke der indgår i beholderen.</li><li>Ved hver størrelse vælger du <strong>Kendt størrelse</strong>, en <strong>formel</strong> eller en <strong>reference</strong>. Du beholder de størrelser, du kender, som symboler.</li><li>Skift mellem <strong>Kort</strong> og <strong>Udfoldet</strong>, og se den samlede formel. Under <strong>Se formelkæden</strong> kan du følge de enkelte formler.</li></ol><h3>Eksempel: bassin med keglebund</h3><p>Fyldetiden bruger t = V / Qᵥ. Rumfanget hentes fra cylinder + keglebund. Flowet kan beholdes som Qᵥ, eller foldes ud til A · v, hvor A kommer fra rørets diameter. Klik på keglebunden for at se dens fælles diameter med cylinderen.</p><h3>Figurer og symboler</h3><p>Hver figur får et nummer. D₁ er diameteren på figur 1, h₂ er højden på figur 2. En reference følger kilden, når du ændrer den. <strong>Indsæt formlen her</strong> kopierer kildens aktuelle formel, så du kan tilpasse den herfra.</p><p>Ved overfladeareal skal du vælge de rigtige flader. For et åbent bassin med keglebund bruges cylinderkappe + keglekappe. Fælles endeflader skal ikke tælles med. Rumfang må kun summeres for dele, der ikke overlapper.</p><h3>Offline og gemte opsætninger</h3><p>Åbn <strong>index.html</strong> fra den downloadede mappe. Den indeholder hele kompendiet og virker uden installation, internet, login eller AI. Der er ingen talindtastning eller udregning af resultater.</p><p><strong>Gem opsætning</strong> henter en fil med dine figurer og formelvalg. Åbn den igen med <strong>Åbn opsætning</strong>. Gem som fil, før du flytter til en anden computer; browserens lokale lagring er en ekstra bekvemmelighed.</p><p>Formlerne omfatter geometri, overflade, flow, tid, masse, tryk og pumpeeffekt. Følg opgavens forudsætninger og brug ensartede enheder.</p>');
  });
  document.addEventListener('change',event=>{
    const el=event.target,a=el.dataset.action;
    if(el.id==='goal-select'){
      if(el.value.startsWith('saved:'))select('formula',el.value.slice(6));
      else if(el.value.startsWith('new:'))addFormula(el.value.slice(4));return;
    }
    if(a==='source'){
      const path=JSON.parse(el.dataset.path),old=getAt(path);
      const next=el.value==='symbol'?E.symbol(el.dataset.symbol):el.value==='assembly'?E.assembly(el.dataset.dimension):el.value.startsWith('formula:')?E.newExpression(el.value.slice(8)):E.ref(el.value.slice(4));
      setAt(path,next);try{E.validateModel(model);save();render(true);}catch(_){setAt(path,old);render(true);notify('Formlen bliver for dyb. Tilføj en separat formel og brug en reference.');}
    }else if(a==='include'){model.shapes.find(s=>s.id===el.dataset.id).include=el.checked;save();render(true);}
    else if(a==='surface'){model.shapes.find(s=>s.id===el.dataset.id).surface=el.value;save();render(true);}
  });
  document.addEventListener('input',event=>{
    const el=event.target;
    if(el.id==='project-title'){model.title=el.value.trim()||'Ny opsætning';save();}
    else if(el.dataset.action==='rename'){
      const list=el.dataset.type==='shape'?model.shapes:model.formulas,item=list.find(o=>o.id===el.dataset.id);
      if(el.value.trim()){item.name=el.value;save();render(true);}
    }
  });
  $('#file-input').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    if(file.size>1000000){notify('Filen er for stor. Maksimum er 1 MB.');return;}
    try{const candidate=E.validateModel(JSON.parse(await file.text()));replaceSetup(candidate,'Åbn '+candidate.title+'?');}
    catch(error){openDialog('Opsætningen kunne ikke åbnes',`<p>${esc(error instanceof SyntaxError?'Filen er ikke gyldig JSON. Vælg en fil gemt fra kompendiet.':error.message)}</p>`);}
  });
  $('#app-dialog').addEventListener('cancel',()=>{pending=null;});
  $('#app-dialog').addEventListener('click',event=>{if(event.target===$('#app-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
  $('.brand').addEventListener('click',event=>{event.preventDefault();changeView('builder');});
  $('.view-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    const tabs=[...document.querySelectorAll('[data-view]')],i=tabs.indexOf(document.activeElement),n=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+1)%tabs.length;
    changeView(tabs[n].dataset.view);tabs[n].focus();
  });
  setTheme();render();if(notice)notify(notice);
  // Deliberately no network requests, AI integration, or numeric evaluation.
})();
