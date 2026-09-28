'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const setup=(...formulas)=>({version:6,title:'Uafhængige formler',inputUnits:{},inputValues:{},tank:E.defaultTank(),shapes:[],connections:[],formulas});
const result=(m,id)=>E.evaluate(E.context(m).result('formula:'+id));
const near=(actual,expected)=>{assert.equal(actual.status,'ready',actual.error);assert(Math.abs(actual.value-expected)<1e-10*Math.max(1,Math.abs(expected)),`${actual.value} != ${expected}`);};

test('independent formulas keep separate values and units for the same radius, including clearing and saving',()=>{
  const m=setup(E.newFormula('one','diameter'),E.newFormula('two','diameter'));
  m.inputValues={'formula:one:r:length':'2','formula:two:r:length':'50'};
  m.inputUnits={'formula:two:r:length':'cm'};
  near(result(m,'one'),4);near(result(m,'two'),1);
  m.inputValues['formula:one:r:length']='3';m.inputUnits['formula:one:r:length']='mm';
  near(result(m,'one'),.006);near(result(m,'two'),1);
  delete m.inputUnits['formula:one:r:length'];near(result(m,'one'),6);near(result(m,'two'),1);
  const saved=E.validateModel(JSON.parse(JSON.stringify(m)));assert.deepEqual(saved,m);
  saved.formulas.reverse();near(result(saved,'one'),6);near(result(saved,'two'),1);
  delete saved.inputValues['formula:one:r:length'];assert.equal(result(saved,'one').status,'incomplete');near(result(saved,'two'),1);
  saved.formulas.push(E.newFormula('three','diameter'));assert.equal(result(saved,'three').status,'incomplete');
});

test('inline subformulas share their enclosing formula while live references keep their source identity',()=>{
  const m=setup(E.newFormula('area','rectangleArea'),E.newFormula('diameter','diameter'));
  m.formulas[0].expression.args={L:E.newExpression('diameter'),B:E.newExpression('diameter')};
  m.inputValues={'formula:area:r:length':'2','formula:diameter:r:length':'3'};
  near(result(m,'area'),16);near(result(m,'diameter'),6);
  assert.equal(E.variables(E.context(m).target('formula:area')).length,1);
  m.formulas[0].expression.args.B=E.ref('formula:diameter');
  near(result(m,'area'),24);
  assert.deepEqual(E.variables(E.context(m).target('formula:area')).map(E.Units.key),['formula:area:r:length','formula:diameter:r:length']);
  m.inputValues['formula:diameter:r:length']='5';near(result(m,'area'),40);
  assert.equal(m.inputValues['formula:area:r:length'],'2');
  const consumer=E.newFormula('copy','areaSum');consumer.expression=E.ref('formula:area');m.formulas.push(consumer);
  near(result(m,'copy'),40);
});

test('equal symbols from different sources are never merged by simplification or TI intermediate steps',()=>{
  const m=setup(E.newFormula('one','sphereVolume'),E.newFormula('two','sphereVolume'),E.newFormula('sum','volumeSum'));
  m.inputValues={'formula:one:D:length':'2','formula:two:D:length':'4'};
  m.formulas[2].expression.args={V1:E.ref('formula:one'),V2:E.ref('formula:two')};
  near(result(m,'sum'),12*Math.PI);assert.equal(E.variables(E.context(m).result('formula:sum')).length,2);
  const ctx=E.context(m),ast={type:'add',assemblyParts:true,children:[ctx.result('formula:one'),ctx.result('formula:two')]};
  const plan=G.split(ast),known={};assert.equal(plan.steps.length,2);
  function substitute(node){
    if(node.type==='symbol'&&node.intermediate)return {type:'constant',value:String(known[node.symbol])};
    return node.children?{...node,children:node.children.map(substitute)}:node;
  }
  for(const step of plan.steps){const answer=E.evaluate(substitute(step.ast));assert.equal(answer.status,'ready');known[step.symbol]=answer.value;}
  near(E.evaluate(substitute(plan.final)),12*Math.PI);
  m.formulas[2].expression.args.V2=E.ref('formula:one');near(result(m,'sum'),8*Math.PI/3);
  assert.equal(E.variables(E.context(m).result('formula:sum')).length,1);
});

test('legacy global values migrate to each existing owner without a fallback into cleared or newly added formulas',()=>{
  const old=setup(E.newFormula('one','diameter'),E.newFormula('two','diameter'));old.version=5;
  old.inputValues={'r:length':'2'};old.inputUnits={'r:length':'cm'};
  const before=JSON.stringify(old),m=E.validateModel(old);assert.equal(JSON.stringify(old),before);
  assert.equal(m.version,6);assert.deepEqual(m.inputValues,{'formula:one:r:length':'2','formula:two:r:length':'2'});
  assert.deepEqual(m.inputUnits,{'formula:one:r:length':'cm','formula:two:r:length':'cm'});
  near(result(m,'one'),.04);near(result(m,'two'),.04);
  m.inputValues['formula:one:r:length']='7';near(result(m,'one'),.14);near(result(m,'two'),.04);
  delete m.inputValues['formula:one:r:length'];delete m.inputUnits['formula:one:r:length'];
  assert.equal(result(m,'one').status,'incomplete');near(result(m,'two'),.04);
  m.formulas.push(E.newFormula('three','diameter'));assert.equal(result(m,'three').status,'incomplete');
  assert.equal(E.inputUnit(m,{symbol:'r',dimension:'length',scope:'formula:three'}).id,'m');
  assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
});

test('shape values remain local and joined dimensions follow the host until disconnected',()=>{
  let m=setup();m.shapes=[E.newShape('cylinder','one',1),E.newShape('hemisphere','two',2)];
  m.shapes.forEach(s=>s.inputs.D=E.newExpression('diameter'));
  m.inputValues={'shape:one:r:length':'2','shape:two:r:length':'5'};
  const diameter=id=>E.evaluate(E.context(m).target('shape:'+id+':inner:D'));
  near(diameter('one'),4);near(diameter('two'),10);
  m=E.connect(m,{shape:'one',face:'bottom'},{shape:'two',face:'base'},'joint');
  near(diameter('two'),4);m.inputValues['shape:one:r:length']='3';near(diameter('two'),6);
  m=E.disconnect(m,'joint');near(diameter('one'),6);near(diameter('two'),10);
});

test('formula copies and rearrangements copy local input settings without coupling later edits',()=>{
  const m=setup(E.newFormula('one','diameter'),E.newFormula('two','diameter'));
  m.inputValues={'formula:one:r:length':'20'};m.inputUnits={'formula:one:r:length':'cm'};
  E.copyInputs(m,'formula:one','formula:two');near(result(m,'two'),.4);
  m.inputValues['formula:two:r:length']='30';near(result(m,'two'),.6);near(result(m,'one'),.4);
  E.copyInputs(m,'formula:one','formula:two');assert.equal(m.inputValues['formula:two:r:length'],'30');
  m.inputValues['formula:one:D:length']='.4';
  const inverse=E.rearrangeFormula(m,'one','inverse:diameter:r','inverse');
  near(result(inverse,'inverse'),20);assert.equal(inverse.formulas.at(-1).resultUnit,'cm');
  inverse.inputValues['formula:inverse:D:length']='.6';near(result(inverse,'inverse'),30);near(result(inverse,'one'),.4);
});

test('scoped imports reject global, malformed and mismatched input keys',()=>{
  const m=setup(E.newFormula('one','diameter'));
  for(const key of ['r:length','formula:one:r:unknown','bad:one:r:length','formula:<script>:r:length','tank:other:r:length','formula:one:r:length:extra'])
    assert.throws(()=>E.validateModel({...m,inputValues:{[key]:'2'}}),/ugyldig størrelse/);
  assert.throws(()=>E.validateModel({...m,inputUnits:{'formula:one:r:length':'kg'}}),/inputenhed/);
});
