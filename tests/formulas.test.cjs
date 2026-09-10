'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const ungroup = ast => ast.type==='group'?ungroup(ast.children[0]):ast;

test('bassin: cylinder + cone use a shared diameter; pipe only supplies flow area', () => {
  const m = E.example(), c = E.context(m);
  assert.deepEqual(E.variables(c.target('formula:time')).map(v=>v.symbol), ['D_1','h_1','h_2','D_3','v']);
  const total = E.plain(c.target('formula:volume'));
  assert(total.includes('h_1') && total.includes('h_2'));
  assert(!total.includes('D_3') && !total.includes('L_3'));
  assert.equal(c.target('formula:time').type, 'div');
  assert.equal(ungroup(c.target('formula:time').children[0]).type, 'add');
  assert.equal(ungroup(c.target('formula:time').children[1]).type, 'mul');
  assert.match(E.tex(c.target('formula:time')), /\\frac\{1\}\{3\}/);
});

test('keeping a known flow symbol removes the unneeded pipe variables', () => {
  const m = E.example();
  m.formulas[2].expression.args.Q = E.symbol('Q_v');
  const c = E.context(m), vars = E.variables(c.target('formula:time')).map(v=>v.symbol);
  assert.deepEqual(vars, ['D_1','h_1','h_2','Q_v']);
  assert.equal(E.plain(c.target('formula:time','compact')), '(V_fyld) / (Q_v)');
});

test('symbolic substitution retains the correct precedence in all export formats', () => {
  const m = { version:2,title:'Flow',shapes:[],formulas:[E.newFormula('flow','flow')] };
  m.formulas[0].expression.args.A = E.form('areaSum',{A1:E.symbol('A_1'),A2:E.symbol('A_2')});
  const ast = E.context(m).target('formula:flow');
  assert.equal(E.plain(ast),'((A_1 + A_2) · v)');
  assert.match(E.math(ast,'Q_v'), /<mo>\(<\/mo>/);
  assert.equal(E.tex(ast),'\\left(A_{1} + A_{2}\\right) \\cdot v');
  const difference = {type:'sub',children:[{type:'symbol',symbol:'a'}, {type:'add',children:[{type:'symbol',symbol:'b'},{type:'symbol',symbol:'c'}]}]};
  assert.equal(E.plain(difference),'(a − (b + c))');
  assert.match(E.tex(difference), /- \\left\(b \+ c\\right\)/);
});

test('replacing a reference with a formula copy keeps its child references live', () => {
  const m = E.example(), c = E.context(m);
  const before = E.plain(c.target('formula:time'));
  m.formulas[2].expression.args.Q = E.clone(m.formulas[1].expression);
  assert.equal(E.plain(E.context(m).target('formula:time')),before);
  m.shapes[2].inputs.D = E.symbol('d_pipe');
  assert(E.plain(E.context(m).target('formula:time')).includes('d_pipe'));
  m.formulas[1].expression = E.newExpression('flowFromVolume');
  assert(E.plain(E.context(m).target('formula:time')).includes('d_pipe'));
});

test('disconnecting the cone restores its independent diameter symbol', () => {
  const m = E.disconnect(E.example(),'basin-joint');
  assert(E.variables(E.context(m).target('formula:time')).some(v=>v.symbol==='D_2'));
});

test('assembly follows included shapes and reports an empty selection', () => {
  const m = E.example();
  const s = E.newShape('box','box',4);m.shapes.push(s);
  assert(E.plain(E.context(m).target('formula:volume')).includes('B_4'));
  E.setIncluded(m,'cone',false);
  assert(!E.plain(E.context(m).target('formula:volume')).includes('h_2'));
  assert(!m.shapes[0].include);
  assert(m.shapes.find(s=>s.id==='box').include);
  for(const shape of m.shapes)shape.include=false;
  assert.match(E.context(m).safe('formula:volume').error,/mindst én figur/);
});

test('the default open basin surface consists of cylinder and cone mantles only', () => {
  const m = E.example();
  const ast = E.context(m).expand(E.assembly('area'),'area');
  assert.equal(ast.type,'add');
  assert.equal(ast.children.length,2);
  assert.equal(ungroup(ast.children[0]).type,'mul');
  assert.equal(ungroup(ast.children[1]).type,'mul');
  m.shapes[0].faces.top='closed';
  assert.equal(ungroup(E.context(m).expand(E.assembly('area'),'area').children[0]).type,'add');
});

test('removed sources are errors and never silently become plausible formulas', () => {
  const m = E.example();
  m.shapes = m.shapes.filter(s=>s.id!=='pipe');
  const r = E.context(m).safe('formula:time');
  assert.equal(r.ok,false);assert.match(r.error,/reference mangler/);
  assert(E.usersOf(E.example(),'shape','pipe').includes('Volumenflow'));
});

test('direct and indirect cycles are detected, including through an assembly', () => {
  const m = E.example();
  m.formulas[0].expression = E.ref('formula:volume');
  assert.match(E.context(m).safe('formula:time').error,/Cirkulær/);
  const m2=E.example();
  const diameter=E.newFormula('diameter','diameter');
  diameter.expression.args.r=E.ref('shape:cone:input:D');m2.formulas.push(diameter);
  m2.shapes[0].inputs.D=E.ref('formula:diameter');
  assert.match(E.context(m2).safe('formula:time').error,/Cirkulær/);
  assert(E.dependsOn(E.example(),'formula:time','shape:cylinder:input:D'));
  assert(!E.dependsOn(E.example(),'shape:pipe:input:D','formula:time'));
});

test('imports preserve the symbolic model and reject incompatible references', () => {
  const m=E.example();assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
  m.formulas[2].expression.args.Q=E.ref('formula:volume');
  assert.throws(()=>E.validateModel(m),/forkert størrelse/);
  const invalid=E.example();invalid.shapes[0].inputs.D=E.symbol('<script>');
  assert.throws(()=>E.validateModel(invalid),/ugyldigt symbol/);
  const repeated=E.example();repeated.shapes[1].ordinal=1;
  assert.throws(()=>E.validateModel(repeated),/ugyldig figur/);
});

test('all catalogue templates use declared arguments and dimensionally consistent operations', () => {
  // Exponents of length, mass, time and temperature.
  const dims = { scalar:[0,0,0,0],length:[1,0,0,0],area:[2,0,0,0],volume:[3,0,0,0],time:[0,0,1,0],velocity:[1,0,-1,0],acceleration:[1,0,-2,0],flow:[3,0,-1,0],mass:[0,1,0,0],density:[-3,1,0,0],massFlow:[0,1,-1,0],pressure:[-1,1,-2,0],force:[1,1,-2,0],power:[2,1,-3,0],energy:[2,1,-2,0],torque:[2,1,-2,0],massMoment:[1,1,0,0],rotationRate:[0,0,-1,0],countPerLength:[-1,0,0,0],temperature:[0,0,0,1],temperatureChange:[0,0,0,1],heatCapacity:[2,0,-2,-1],specificEnergy:[2,0,-2,0] };
  assert.deepEqual(Object.keys(E.DIMENSIONS).sort(),Object.keys(dims).sort());
  function dimension(t,args){
    if(typeof t==='string'){
      if(Object.hasOwn(args,t))return dims[args[t].dimension];
      assert(/^(?:π|\d+)$/.test(t),'Unknown template token: '+t);return [0,0,0,0];
    }
    const [op,...children]=t,values=children.map(c=>dimension(c,args));
    if(op==='group')return values[0];
    if(op==='sqrt')return values[0].map(v=>v/2);
    if(op==='pow')return values[0].map(v=>v*Number(children[1]));
    if(op==='add'||op==='sub'){for(const d of values)assert.deepEqual(d,values[0]);return values[0];}
    if(op==='mul')return values.reduce((a,b)=>a.map((v,i)=>v+b[i]),[0,0,0,0]);
    if(op==='div')return values[0].map((v,i)=>v-values[1][i]);
    assert.fail('Unexpected operator '+op);
  }
  for(const [id,f]of Object.entries(E.FORMULAS)){
    assert.deepEqual(dimension(f.template,f.args),dims[f.dimension],id);
    const m={version:2,title:'Formel',shapes:[],formulas:[E.newFormula('f',id)]};
    E.validateModel(m);const r=E.context(m).safe('formula:f');assert(r.ok,id+': '+r.error);
    assert(E.math(r.ast,f.symbol).startsWith('<math'));assert(E.tex(r.ast).length>0);
  }
});

test('untrusted names and symbols are escaped in mathematical markup', () => {
  const html=E.math({type:'symbol',symbol:'<img onerror="alert(1)">',dimension:'length'},'x');
  assert(!html.includes('<img'));assert(html.includes('&lt;img'));
});

test('overly deep imported formula trees are bounded', () => {
  const m=E.example();let expr=E.symbol('V');
  for(let i=0;i<15;i++)expr=E.form('volumeSum',{V1:expr,V2:E.symbol('V_2')});
  m.formulas[0].expression=expr;
  assert.throws(()=>E.validateModel(m),/for dyb/);
});

test('nested formulas and assembly sums have explicit boundaries in all three formats',()=>{
  const m=E.example();m.formulas.push(E.newTankMass(m,'tank'));
  const ast=E.context(m).target('formula:tank');
  assert.equal(ast.type,'mul');
  assert.equal(ast.children[0].type,'group');
  assert.equal(ast.children[0].children[0].type,'add');
  for(const part of ast.children[0].children[0].children)assert.equal(part.type,'group');
  const html=E.math(ast),latex=E.tex(ast),plain=E.plain(ast);
  assert.match(html,/<mo>\(<\/mo><mrow>/);
  assert(latex.startsWith('\\left(')&&latex.includes('\\right) \\cdot t_{plade}'));
  assert(plain.startsWith('(((')&&plain.endsWith(' · t_plade · ρ_mat)'));
  const time=E.context(m).target('formula:time');
  assert.equal(time.children[0].type,'group');assert.equal(time.children[1].type,'group');
});

test('inline fractions, subtraction and exponent substitutions remain unambiguous',()=>{
  const m={version:3,title:'Parenteser',shapes:[],connections:[],formulas:[E.newFormula('rho','density')]};
  m.formulas[0].expression.args.V=E.form('volumeDifference',{end:E.symbol('V_total'),start:E.form('volumeSum',{V1:E.symbol('V_1'),V2:E.symbol('V_2')})});
  const ast=E.context(m).target('formula:rho');
  assert.equal(E.plain(ast),'(m) / (V_total − (V_1 + V_2))');
  assert.equal(E.tex(ast),'\\frac{m}{\\left(V_{total} - \\left(V_{1} + V_{2}\\right)\\right)}');
  const circle=E.newFormula('circle','circleArea');circle.expression.args.D=E.form('diameter',{r:E.symbol('r')});m.formulas.push(circle);
  const result=E.context(m).target('formula:circle');
  assert(E.plain(result).includes('(2 · r)^2'));
  assert(E.math(result).includes('<msup><mrow><mo>(</mo>'));
  const x={type:'symbol',symbol:'x'},y={type:'symbol',symbol:'y'};
  assert.equal(E.plain({type:'pow',children:[x,{type:'div',children:[x,y]}]}),'(x)^((x) / (y))');
});

test('school catalogue covers T1 to T39 and every page reference is within the supplied PDF',()=>{
  const found=new Set();
  for(const f of Object.values(E.FORMULAS))if(f.source){
    assert(f.source.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=13));
    f.source.triangles.forEach(t=>found.add(t));
  }
  assert.deepEqual([...found].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1))),Array.from({length:39},(_,i)=>'T'+(i+1)));
});
