'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const symbol=name=>({type:'symbol',symbol:name});
const number=value=>({type:'constant',value:String(value)});
const op=(type,...children)=>({type,children});
const [a,b,c]=['a','b','c'].map(symbol);
const wrap=node=>op('group',op('group',node));
const near=(actual,expected,label)=>assert(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);

// Independently compare the AST with JavaScript's operator precedence after
// tokenizing trusted test output independently of the engine's evaluator.
function value(ast,vars){
  if(ast.type==='symbol')return vars[ast.symbol];
  if(ast.type==='constant')return ast.value==='π'?Math.PI:Number(ast.value);
  const children=ast.children.map(child=>value(child,vars));
  switch(ast.type){
    case 'group':return children[0];case 'sqrt':return Math.sqrt(children[0]);
    case 'add':return children.reduce((x,y)=>x+y);case 'sub':return children[0]-children[1];
    case 'mul':return children.reduce((x,y)=>x*y);case 'div':return children[0]/children[1];
    case 'pow':return children[0]**children[1];default:assert.fail(ast.type);
  }
}
function copiedValue(ast,vars){
  const text=E.plain(ast),tokens=text.match(/\d+(?:,\d+)?|[\p{L}_][\p{L}\p{N}_]*|[√()+−·\/^*-]/gu)||[];
  assert.equal(tokens.join(''),text.replace(/\s/g,''),'All copied tokens must be understood');
  const code=tokens.map(token=>{
    if(Object.hasOwn(vars,token))return '('+vars[token]+')';
    if(token==='π')return 'Math.PI';
    return {'√':'Math.sqrt','·':'*','−':'-','^':'**'}[token]||token.replace(',','.');
  }).join('');
  return Function('"use strict";return ('+code+');')();
}

test('groups around leaves, products and sum terms disappear in every format',()=>{
  const ast=wrap(op('mul',number(2),wrap(op('add',wrap(op('mul',a,b)),wrap(op('mul',a,c))))));
  const before=JSON.stringify(ast);
  assert.equal(E.plain(ast),'2 · (a · b + a · c)');
  assert.equal(E.tex(ast),'2 \\cdot \\left(a \\cdot b + a \\cdot c\\right)');
  const html=E.math(ast);
  assert.equal((html.match(/<mo>\(<\/mo>/g)||[]).length,1);
  assert(html.includes('aria-label="2 · (a · b + a · c)"'));
  assert.equal(E.plain(wrap(a)),'a');
  assert.equal(E.tex(wrap(a)),'a');
  assert.equal(JSON.stringify(ast),before);
});

test('linear fractions retain complete denominators while fraction bars provide their own boundaries',()=>{
  const cases=[
    [op('div',a,b),'a / b'],
    [op('div',op('mul',a,b),c),'a · b / c'],
    [op('div',a,op('mul',b,c)),'a / (b · c)'],
    [op('div',op('div',a,b),c),'a / b / c'],
    [op('div',a,op('div',b,c)),'a / (b / c)'],
    [op('div',op('add',a,b),op('sub',a,c)),'(a + b) / (a − c)']
  ];
  for(const [ast,expected]of cases)assert.equal(E.plain(wrap(ast)),expected);
  const fraction=wrap(op('div',wrap(op('add',a,b)),wrap(op('mul',b,c))));
  assert.equal(E.tex(fraction),'\\frac{a + b}{b \\cdot c}');
  assert.equal(E.mathBody(fraction),'<mfrac><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow><mrow><mi>b</mi><mo>·</mo><mi>c</mi></mrow></mfrac>');
});

test('subtraction retains right-hand sums and differences without grouping simple products',()=>{
  assert.equal(E.plain(op('sub',a,wrap(op('mul',b,c)))),'a − b · c');
  assert.equal(E.plain(op('sub',a,wrap(op('add',b,c)))),'a − (b + c)');
  assert.equal(E.plain(op('sub',a,wrap(op('sub',b,c)))),'a − (b − c)');
  assert.equal(E.plain(op('sub',wrap(op('sub',a,b)),c)),'a − b − c');
  assert.equal(E.tex(op('sub',a,wrap(op('sub',b,c)))),'a - \\left(b - c\\right)');
});

test('powers retain their complete base and exponent and radicals need no extra pair',()=>{
  const cases=[
    [op('pow',wrap(a),number(2)),'a^2'],
    [op('pow',wrap(op('mul',a,b)),number(2)),'(a · b)^2'],
    [op('pow',wrap(op('div',a,b)),number(2)),'(a / b)^2'],
    [op('pow',wrap(op('pow',a,b)),c),'(a^b)^c'],
    [op('pow',a,wrap(op('pow',b,c))),'a^(b^c)'],
    [op('pow',a,wrap(op('div',b,c))),'a^(b / c)'],
    [op('pow',number(-2),number(2)),'(-2)^2'],
    [op('sqrt',wrap(op('add',a,b))),'√(a + b)']
  ];
  for(const [ast,expected]of cases)assert.equal(E.plain(wrap(ast)),expected);
  assert.equal(E.tex(op('pow',a,wrap(op('add',b,c)))),'{a}^{b + c}');
  assert.equal(E.mathBody(op('pow',number(-2),number(2))),'<msup><mrow><mo>(</mo><mn>-2</mn><mo>)</mo></mrow><mn>2</mn></msup>');
  const root=wrap(op('sqrt',wrap(op('add',a,b))));
  assert.equal(E.tex(root),'\\sqrt{a + b}');
  assert(!E.mathBody(root).includes('<mo>(</mo>'));
});

test('copied expressions preserve numerical meaning across nested operator combinations',()=>{
  const binary=['add','sub','mul','div','pow'];
  const inner=[...binary.map(type=>op(type,a,b)),op('sqrt',op('add',a,b)),number(-2)];
  const vars={a:7,b:2,c:3};
  for(const parent of binary)for(const child of inner)for(const side of [0,1]){
    const ast=wrap(op(parent,...(side===0?[wrap(child),c]:[c,wrap(child)])));
    near(copiedValue(ast,vars),value(ast,vars),E.plain(ast));
  }
  // Real formulas also combine roots, fractions and powers beyond two levels.
  const m=E.example();m.shapes[0].diameter.basis='outer';
  m.inputUnits={'D_1:length':'mm','h_1:length':'cm','h_2:length':'cm','t_plade:length':'mm','ρ_mat:density':'ton_m3'};
  m.formulas.push(E.newTankMass(m,'mass'));m.formulas.at(-1).resultUnit='ton';
  const ast=E.context(m).result('formula:mass'),inputs={D_1:6000,h_1:1000,h_2:200,t_plade:2,ρ_mat:7.85};
  near(copiedValue(ast,inputs),value(ast,inputs),E.plain(ast));
});
