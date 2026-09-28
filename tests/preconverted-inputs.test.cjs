'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const near=(a,b)=>assert(Math.abs(a-b)<=1e-14*Math.max(Math.abs(b),1e-30),`${a} != ${b}`);
function ast(value,dimension,id){const unit=E.Units.get(dimension,id);return E.Units.convert({type:'symbol',symbol:'x',dimension,inputValue:value,valueUnit:unit.label},unit);}
test('all input unit families convert before display while retaining exact conversion operations for evaluation',()=>{
  const cases=[['20','length','mm','0.02'],['2.5','area','cm2','0.00025'],['20','volume','mm3','0.00000002'],['2','time','h','7200'],['72','velocity','km_h','20'],['3','acceleration','cm_s2','0.03'],['3600','flow','L_h','0.001'],['8','density','g_cm3','8000'],['2','mass','ton','2000'],['3600','massFlow','kg_h','1'],['2','pressure','bar','200000'],['2','force','kN','2000'],['2','power','kW','2000'],['2','energy','kWh','7200000'],['2','torque','N_mm','0.002'],['2','massMoment','kg_cm','0.02'],['120','rotationRate','rpm','2'],['1','countPerLength','per_cm','100'],['-10','temperature','C','263.15'],['-10','temperatureChange','C','-10'],['4.2','heatCapacity','kJ_kgK','4200'],['2','specificEnergy','kJ_kg','2000']];
  for(const [value,dimension,id,expected]of cases){
    const tree=ast(value,dimension,id),before=JSON.stringify(tree),converted=E.Units.convertedValue(value,E.Units.get(dimension,id));
    assert.equal(converted.value,expected);assert.equal(converted.approximate,false);
    assert.equal(E.plain(tree,null,'values'),expected.replace('.',','));near(E.evaluate(tree).value,Number(expected));
    assert.equal(E.variables(tree)[0].inputValue,value);assert.equal(JSON.stringify(tree),before);
    assert(E.math(tree).includes(expected.replace('.',',')));assert.equal(G.estimate(tree).max,expected.length);
  }
  const high='0.12345678901234567890123456789';assert.equal(E.Units.convertedValue(high,E.Units.get('length','mm')).value,'0.00012345678901234567890123456789');
});
test('recurring decimal conversions are labelled approximations, never E notation, with unrounded evaluation',()=>{
  for(const [value,dimension,id]of [['1','velocity','m_min'],['1','flow','L_h'],['-1','massFlow','kg_h']]){
    const tree=ast(value,dimension,id),display=E.displayAst(tree),unit=E.Units.get(dimension,id);
    assert.equal(display.approximate,true);assert(!/[eE]/.test(display.inputValue));
    near(Number(display.inputValue),Number(value)*unit.numerator/unit.denominator);
    assert.equal(E.evaluate(tree).value,Number(value)*unit.numerator/unit.denominator);
    assert.match(E.plain(tree,null,'units'),/x \/ /);
  }
  assert.equal(E.Units.convertedValue('',E.Units.get('length','mm')),null);
  assert.equal(E.Units.convertedValue('1+2',E.Units.get('length','mm')),null);
});
test('conversion shortens copying, fractions and the TI estimate without removing mathematical precedence',()=>{
  const tree={type:'div',children:[{type:'constant',value:'1'},ast('20','length','cm')]};
  assert.equal(E.plain(tree,null,'values'),'1 / 0,2');assert.equal((E.math(tree).match(/<mfrac>/g)||[]).length,1);
  assert.equal((E.math(tree,undefined,undefined,'units').match(/<mfrac>/g)||[]).length,2);
  assert.equal(G.estimate(tree).nesting,1);assert.equal(G.estimate(tree).max,5);
  const power={type:'pow',children:[ast('-20','length','mm'),{type:'constant',value:'2'}]};
  assert.equal(E.plain(power,null,'values'),'(-0,02)^2');near(E.evaluate(power).value,.0004);
});
