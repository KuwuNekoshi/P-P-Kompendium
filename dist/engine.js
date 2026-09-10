/* Symbolic composition only. This module does not evaluate numbers. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./catalog.js'));
  else root.PP = factory(root.PPCatalog);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
  'use strict';
  const { FORMULAS, SHAPES, DIMENSIONS } = catalog;
  const clone = value => JSON.parse(JSON.stringify(value));
  const symbol = name => ({ kind: 'symbol', symbol: name });
  const ref = target => ({ kind: 'ref', target });
  const form = (formula, args) => ({ kind: 'formula', formula, args });
  const assembly = dimension => ({ kind: 'assembly', dimension });
  const own = (object, key) => Object.hasOwn(object, key);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function newExpression(id) {
    const f = FORMULAS[id];
    if (!f) throw new Error('Ukendt formel.');
    return form(id, Object.fromEntries(Object.entries(f.args).map(([k, a]) => [k, symbol(a.symbol)])));
  }
  function newShape(type, id, ordinal) {
    const s = SHAPES[type];
    if (!s) throw new Error('Ukendt figur.');
    return { id, type, ordinal, name: s.name, include: type !== 'pipe', surface: s.surfaceDefault,
      inputs: Object.fromEntries(Object.entries(s.inputs).map(([k, a]) => [k, symbol(a.symbol + '_' + ordinal)])) };
  }
  function newFormula(id, formulaId) {
    const f = FORMULAS[formulaId];
    if (!f) throw new Error('Ukendt formel.');
    return { id, name: f.name, symbol: f.symbol, dimension: f.dimension, expression: newExpression(formulaId) };
  }
  function example() {
    const cylinder = newShape('cylinder', 'cylinder', 1); cylinder.surface = 'mantle';
    const cone = newShape('cone', 'cone', 2); cone.name = 'Keglebund'; cone.inputs.D = ref('shape:cylinder:input:D');
    const pipe = newShape('pipe', 'pipe', 3); pipe.name = 'Indløbsrør';
    return { version: 2, title: 'Bassin med keglebund', shapes: [cylinder, cone, pipe], formulas: [
      { id: 'volume', name: 'Samlet rumfang', symbol: 'V_fyld', dimension: 'volume', expression: assembly('volume') },
      { id: 'flow', name: 'Volumenflow', symbol: 'Q_v', dimension: 'flow', expression: form('flow', { A: ref('shape:pipe:crossSection'), v: symbol('v') }) },
      { id: 'time', name: 'Fyldetid', symbol: 't', dimension: 'time', expression: form('fillTime', { V: ref('formula:volume'), Q: ref('formula:flow') }) }
    ] };
  }
  function descriptors(model) {
    const list = [];
    for (const s of model.shapes) {
      const type = SHAPES[s.type];
      for (const [key, a] of Object.entries(type.inputs)) list.push({ target: `shape:${s.id}:input:${key}`, name: `${s.name} · ${a.label}`, symbol: a.symbol + '_' + s.ordinal, dimension: a.dimension, expression: s.inputs[key], ownerType: 'shape', ownerId: s.id, input: key });
      const addOutput = (key, label, fId, sym) => {
        const f = FORMULAS[fId];
        list.push({ target: `shape:${s.id}:${key}`, name: `${s.name} · ${label}`, symbol: key === 'crossSection' ? 'A_t' + s.ordinal : sym + '_' + s.ordinal, dimension: f.dimension,
          expression: form(fId, Object.fromEntries(Object.keys(f.args).map(k => [k, ref(`shape:${s.id}:input:${k}`)]))), ownerType: 'shape', ownerId: s.id, output: key });
      };
      addOutput('volume', 'Rumfang', type.volume, 'V');
      addOutput('area', 'Overflade', type.surfaces[s.surface][1], 'A');
      if (type.crossSection) addOutput('crossSection', 'Tværsnitsareal', type.crossSection, 'A_t' + s.ordinal);
    }
    for (const f of model.formulas) list.push({ target: `formula:${f.id}`, name: f.name, symbol: f.symbol, dimension: f.dimension, expression: f.expression, ownerType: 'formula', ownerId: f.id });
    return list;
  }
  function references(expr, model) {
    if (expr.kind === 'ref') return [expr.target];
    if (expr.kind === 'formula') return Object.values(expr.args).flatMap(e => references(e, model));
    if (expr.kind === 'assembly') return model.shapes.filter(s => s.include).map(s => `shape:${s.id}:${expr.dimension === 'volume' ? 'volume' : 'area'}`);
    return [];
  }
  function dependsOn(model, source, target) {
    const map = new Map(descriptors(model).map(d => [d.target, d])), seen = new Set();
    const visit = id => {
      if (id === target) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return map.has(id) && references(map.get(id).expression, model).some(visit);
    };
    return visit(source);
  }
  function usersOf(model, ownerType, ownerId) {
    const list = descriptors(model), removed = new Set(list.filter(d => d.ownerType === ownerType && d.ownerId === ownerId).map(d => d.target));
    return [...new Set(list.filter(d => !removed.has(d.target) && references(d.expression, model).some(r => removed.has(r))).map(d => d.name))];
  }
  const leaf = (name, dimension, label) => ({ type: 'symbol', symbol: name, dimension, label: label || '' });
  function instantiate(template, args) {
    if (typeof template === 'string') return own(args, template) ? args[template] : { type: 'constant', value: template };
    return { type: template[0], children: template.slice(1).map(t => instantiate(t, args)) };
  }
  function context(model) {
    const list = descriptors(model), map = new Map(list.map(d => [d.target, d]));
    function expand(expr, dimension, mode = 'expanded', stack = [], budget = { nodes: 0 }, depth = 0, label = '') {
      if (++budget.nodes > 1200 || depth > 48 || stack.length > 80) throw new Error('Formelkæden er for stor. Behold nogle dele som symboler.');
      if (expr.kind === 'symbol') return leaf(expr.symbol, dimension, label);
      if (expr.kind === 'ref') {
        const d = map.get(expr.target);
        if (!d) throw new Error('En reference mangler. Vælg en ny kilde i dropdown-menuen.');
        if (d.dimension !== dimension) throw new Error('Referencen passer ikke til denne størrelse.');
        if (stack.includes(d.target)) throw new Error('Cirkulær reference: en formel henviser tilbage til sig selv.');
        if (mode === 'compact') return leaf(d.symbol, dimension, d.name);
        return expand(d.expression, dimension, mode, [...stack, d.target], budget, depth + 1, d.name);
      }
      if (expr.kind === 'assembly') {
        if (!['volume', 'area'].includes(dimension) || expr.dimension !== dimension) throw new Error('Figursummen passer ikke til størrelsen.');
        const selected = model.shapes.filter(s => s.include);
        if (!selected.length) throw new Error('Vælg mindst én figur, der indgår i beholderen.');
        const children = selected.map(s => expand(ref(`shape:${s.id}:${dimension === 'volume' ? 'volume' : 'area'}`), dimension, mode, stack, budget, depth + 1));
        return children.length === 1 ? children[0] : { type: 'add', children };
      }
      const f = own(FORMULAS, expr.formula) && FORMULAS[expr.formula];
      if (expr.kind !== 'formula' || !f || f.dimension !== dimension) throw new Error('Formlen passer ikke til størrelsen.');
      const args = Object.fromEntries(Object.entries(f.args).map(([k, a]) => [k, expand(expr.args[k], a.dimension, mode, stack, budget, depth + 1, a.label)]));
      return instantiate(f.template, args);
    }
    function target(id, mode = 'expanded') {
      const d = map.get(id);
      if (!d) throw new Error('Formlen findes ikke.');
      return expand(d.expression, d.dimension, mode, [id]);
    }
    function safe(id, mode = 'expanded') { try { return { ok: true, ast: target(id, mode) }; } catch (e) { return { ok: false, error: e.message }; } }
    function steps(id) {
      const seen = new Set(), visiting = new Set(), out = [];
      function walk(key) {
        if (visiting.has(key)) throw new Error('Cirkulær reference.');
        if (seen.has(key)) return;
        const d = map.get(key);
        if (!d) throw new Error('En reference mangler.');
        visiting.add(key);
        references(d.expression, model).forEach(walk);
        visiting.delete(key); seen.add(key);
        if (!d.input) out.push(d);
      }
      walk(id); return out;
    }
    return { list, map, expand, target, safe, steps };
  }

  function mathSymbol(s) {
    const i = s.indexOf('_');
    const base = i < 0 ? s : s.slice(0, i), sub = i < 0 ? '' : s.slice(i + 1);
    const mi = `<mi>${esc(base)}</mi>`;
    return sub ? `<msub>${mi}${/^\d+$/.test(sub) ? `<mn>${esc(sub)}</mn>` : `<mtext>${esc(sub)}</mtext>`}</msub>` : mi;
  }
  function mathBody(ast) {
    if (ast.type === 'symbol') return mathSymbol(ast.symbol);
    if (ast.type === 'constant') return /^\d+$/.test(ast.value) ? `<mn>${esc(ast.value)}</mn>` : `<mi>${esc(ast.value)}</mi>`;
    const c = ast.children;
    if (ast.type === 'div') return `<mfrac>${mathBody(c[0])}${mathBody(c[1])}</mfrac>`;
    if (ast.type === 'pow') return `<msup>${['add','sub','mul'].includes(c[0].type) ? '<mrow><mo>(</mo>' + mathBody(c[0]) + '<mo>)</mo></mrow>' : mathBody(c[0])}${mathBody(c[1])}</msup>`;
    if (ast.type === 'sqrt') return `<msqrt>${mathBody(c[0])}</msqrt>`;
    if (ast.type === 'group') return `<mrow><mo>(</mo>${mathBody(c[0])}<mo>)</mo></mrow>`;
    const operator = { mul: '·', add: '+', sub: '−' }[ast.type];
    if (!operator) throw new Error('Ukendt formeloperator.');
    return '<mrow>' + c.map((child, i) => {
      const group = (ast.type === 'mul' && ['add','sub'].includes(child.type)) || (ast.type === 'sub' && i > 0 && ['add','sub'].includes(child.type));
      return (group ? '<mrow><mo>(</mo>' : '') + mathBody(child) + (group ? '<mo>)</mo></mrow>' : '');
    }).join(`<mo>${operator}</mo>`) + '</mrow>';
  }
  function plain(ast) {
    if (ast.type === 'symbol') return ast.symbol;
    if (ast.type === 'constant') return ast.value;
    const c = ast.children.map(plain);
    if (ast.type === 'div') return `(${c[0]}) / (${c[1]})`;
    if (ast.type === 'pow') return `(${c[0]})^${c[1]}`;
    if (ast.type === 'sqrt') return `√(${c[0]})`;
    if (ast.type === 'group') return `(${c[0]})`;
    return '(' + c.join({ mul:' · ', add:' + ', sub:' − ' }[ast.type]) + ')';
  }
  function tex(ast) {
    if (ast.type === 'symbol') {
      const [b,...s] = ast.symbol.split('_');
      const greek = { 'ρ':'\\rho', 'η':'\\eta', 'ΔV':'\\Delta V', 'Δp':'\\Delta p' };
      const base = greek[b] || (/^[A-Za-z]+$/.test(b) ? b : '\\mathrm{' + b + '}');
      return s.length ? base + '_{' + s.join('_').replace(/[^\p{L}\p{N}]/gu, '') + '}' : base;
    }
    if (ast.type === 'constant') return ast.value === 'π' ? '\\pi' : ast.value;
    const c = ast.children.map(tex);
    if (ast.type === 'div') return '\\frac{' + c[0] + '}{' + c[1] + '}';
    if (ast.type === 'pow') return '{' + (['add','sub','mul'].includes(ast.children[0].type) ? '\\left(' + c[0] + '\\right)' : c[0]) + '}^{' + c[1] + '}';
    if (ast.type === 'sqrt') return '\\sqrt{' + c[0] + '}';
    if (ast.type === 'group') return '\\left(' + c[0] + '\\right)';
    return ast.children.map((child,i) => {
      const group = (ast.type === 'mul' && ['add','sub'].includes(child.type)) || (ast.type === 'sub' && i > 0 && ['add','sub'].includes(child.type));
      return group ? '\\left(' + c[i] + '\\right)' : c[i];
    }).join({ mul:' \\cdot ', add:' + ', sub:' - ' }[ast.type]);
  }
  function math(ast, lhs) {
    const label = (lhs ? lhs + ' = ' : '') + plain(ast);
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="${esc(label)}"><mrow>${lhs ? mathSymbol(lhs) + '<mo>=</mo>' : ''}${mathBody(ast)}</mrow></math>`;
  }
  function variables(ast) {
    const found = new Map();
    function visit(node) {
      if (node.type === 'symbol') {
        const key = node.symbol + ':' + node.dimension;
        if (!found.has(key)) found.set(key, node);
      }
      for (const c of node.children || []) visit(c);
    }
    visit(ast); return [...found.values()];
  }
  function formulaAst(id) {
    const f = FORMULAS[id];
    return instantiate(f.template, Object.fromEntries(Object.entries(f.args).map(([k,a]) => [k, leaf(a.symbol,a.dimension,a.label)])));
  }

  function validateModel(input) {
    const fail = message => { throw new Error('Ugyldig opsætning: ' + message); };
    const str = (value, max = 120) => typeof value === 'string' && value.length > 0 && value.length <= max;
    const validSymbol = value => str(value,24) && /^[\p{L}\p{N}]+(?:_[\p{L}\p{N}]+)?$/u.test(value);
    if (!input || input.version !== 2 || !str(input.title) || !Array.isArray(input.shapes) || !Array.isArray(input.formulas) || input.shapes.length > 24 || input.formulas.length > 40) fail('formatet genkendes ikke, eller opsætningen er for stor.');
    const ids = new Set(), ordinals = new Set();
    function identity(item) {
      if (!item || !str(item.id,64) || !/^[a-zA-Z0-9_-]+$/.test(item.id) || ids.has(item.id) || !str(item.name)) fail('ugyldigt navn eller id.');
      ids.add(item.id);
    }
    let count = 0;
    function cleanExpr(e, dimension, depth = 0) {
      if (!e || typeof e !== 'object' || ++count > 3000 || depth > 12) fail('formlen er for dyb eller ufuldstændig.');
      if (e.kind === 'symbol') { if (!validSymbol(e.symbol)) fail('ugyldigt symbol.'); return symbol(e.symbol); }
      if (e.kind === 'ref') { if (!str(e.target,160)) fail('ugyldig reference.'); return ref(e.target); }
      if (e.kind === 'assembly') { if (!['volume','area'].includes(dimension) || e.dimension !== dimension) fail('ugyldig figursum.'); return assembly(dimension); }
      const f = own(FORMULAS,e.formula) && FORMULAS[e.formula];
      if (e.kind !== 'formula' || !f || f.dimension !== dimension) fail('formlen passer ikke til størrelsen.');
      return form(e.formula,Object.fromEntries(Object.entries(f.args).map(([k,a]) => [k,cleanExpr(e.args?.[k],a.dimension,depth+1)])));
    }
    const model = { version:2,title:input.title,shapes:[],formulas:[] };
    for (const s of input.shapes) {
      identity(s);
      const type = own(SHAPES,s.type) && SHAPES[s.type];
      if (!type || !own(type.surfaces,s.surface) || typeof s.include !== 'boolean' || !Number.isInteger(s.ordinal) || s.ordinal < 1 || s.ordinal > 10000 || ordinals.has(s.ordinal)) fail('ugyldig figur.');
      ordinals.add(s.ordinal);
      model.shapes.push({ id:s.id,type:s.type,name:s.name,ordinal:s.ordinal,include:s.include,surface:s.surface,inputs:Object.fromEntries(Object.entries(type.inputs).map(([k,a])=>[k,cleanExpr(s.inputs?.[k],a.dimension)])) });
    }
    for (const f of input.formulas) {
      identity(f);
      if (!own(DIMENSIONS,f.dimension) || !validSymbol(f.symbol)) fail('ugyldigt formelsymbol.');
      model.formulas.push({ id:f.id,name:f.name,symbol:f.symbol,dimension:f.dimension,expression:cleanExpr(f.expression,f.dimension) });
    }
    const map = new Map(descriptors(model).map(d=>[d.target,d]));
    function check(e,dimension) {
      if (e.kind === 'ref' && map.has(e.target) && map.get(e.target).dimension !== dimension) fail('en reference har forkert størrelse.');
      if (e.kind === 'formula') for (const [k,a] of Object.entries(FORMULAS[e.formula].args)) check(e.args[k],a.dimension);
    }
    for (const d of map.values()) check(d.expression,d.dimension);
    // Missing references and cycles remain visible as actionable errors, never guessed away.
    return model;
  }
  return { FORMULAS, SHAPES, DIMENSIONS, clone, symbol, ref, form, assembly, newExpression, newShape, newFormula, example, descriptors, references, dependsOn, usersOf, context, math, mathSymbol, mathBody, plain, tex, variables, formulaAst, validateModel };
});
