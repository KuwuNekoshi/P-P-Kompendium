'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine.js'),U=E.Units;
const model=(...formulas)=>({version:6,title:'Tid',tank:E.defaultTank(),shapes:[],connections:[],formulas,inputUnits:{},inputValues:{}});
const key=(id,symbol)=>`formula:${id}:${symbol}:time`;
const result=(m,id)=>{const value=E.evaluate(E.context(m).result('formula:'+id));assert.equal(value.status,'ready');return value.value;};
test('TMS parses durations exactly, accepts fractional seconds and does not wrap at midnight',()=>{
 for(const [input,seconds]of [['8:00:00','28800'],['12:20:24','44424'],['125:59:59,123456789','453599.123456789'],['−00:01:30,25','-90.25'],['00:00:00','0'],['00:00:00,000001','0.000001'],['','']]){
  assert.equal(U.parseTime(input),seconds,input);assert.equal(U.parseTime(U.timeInput(seconds)),seconds);
 }
 for(const input of ['12,34','12:34','1:60:00','1:00:60','1:-1:00','1:02:03:04','1:2:3','1:00:02x','1:00:01,2.3'])assert.equal(U.parseTime(input),null,input);
});
test('TMS display rounds only fractional seconds and carries into minutes and unbounded hours',()=>{
 for(const [seconds,output]of [[73224,'20:20:24'],[90061,'25:01:01'],[-90.25,'-00:01:30,25'],[59.99999,'00:01:00'],[3599.99999,'01:00:00'],[86399.99999,'24:00:00'],[2.003234,'00:00:02,00323'],[.0008136,'00:00:00,000814'],[1e-10,'00:00:00,0000000001'],[0,'00:00:00']])assert.equal(U.formatTime(seconds),output);
 assert.equal(U.timeInput('3599.999999999999'),'00:59:59,999999999999');
});
test('TMS is available for durations but never generated as a denominator for rates',()=>{
 assert.equal(U.get('time','tms').format,'tms');assert.equal(U.arithmetic(U.get('time','tms')).id,'s');
 for(const dim of ['flow','massFlow','rotationRate','velocity','acceleration']){
  assert(!U.ratio(dim).denominator.some(u=>u.id.startsWith('tms')));
  assert(!U.choices(dim).some(u=>u.label.includes('TMS')));
 }
});
test('switching between TMS and decimal units preserves the duration',()=>{
 const tms=U.get('time','tms'),h=U.get('time','h'),min=U.get('time','min');
 assert.equal(U.switchTimeFormat('12.34',h,tms),'44424');assert.equal(U.switchTimeFormat('44424',tms,h),'12.34');
 assert.equal(U.switchTimeFormat('90.25',tms,min),'1.504166666666667');
 assert.equal(U.switchTimeFormat('8',h,min),'8'); // ordinary dropdown behavior is unchanged
});
for(const [name,engine]of [['P&P',E],['SRO',require('../tools/sro-sources.cjs').load().PP]]){
 test(name+': decimal hours sum to TMS, mixed inputs and saved references retain seconds',()=>{
  const a=engine.newFormula('a','timeSum'),b=engine.newFormula('b','timeSum'),m=model(a,b);
  m.inputUnits={[key('a','t_1')]:'h',[key('a','t_2')]:'h',[key('b','t_2')]:'tms'};
  m.inputValues={[key('a','t_1')]:'8',[key('a','t_2')]:'12.34',[key('b','t_2')]:U.parseTime('5:00:00')};
  b.expression.args.t1=engine.ref('formula:a');
  const restored=engine.validateModel(JSON.parse(JSON.stringify(m)));
  const ctx=engine.context(restored),value=id=>engine.evaluate(ctx.result('formula:'+id)).value;
  assert.equal(a.resultUnit,'tms');assert.equal(U.formatTime(value('a')),'20:20:24');assert.equal(U.formatTime(value('b')),'25:20:24');
  assert.match(engine.plain(ctx.result('formula:b'),null,'values'),/18000/);
  assert(!engine.math(ctx.result('formula:b')).includes('TMS'));
  const compact=ctx.result('formula:b','compact');assert.match(engine.plain(compact),/t_sum/);assert(!engine.math(compact).includes('TMS'));
  b.resultUnit='h';assert(Math.abs(engine.evaluate(engine.context(m).result('formula:b')).value-25.34)<1e-10);
 });
}
test('time conversion and subtraction work with negative durations and SI consumers',()=>{
 const a=E.newFormula('a','timeConvert'),b=E.newFormula('b','timeDifference'),m=model(a,b);
 m.inputUnits={[key('a','t_ind')]:'tms',[key('b','t_1')]:'min',[key('b','t_2')]:'tms'};
 m.inputValues={[key('a','t_ind')]:U.parseTime('0:01:30'),[key('b','t_1')]:'3',[key('b','t_2')]:U.parseTime('0:01:30')};
 assert.equal(result(m,'a'),90);assert.equal(U.formatTime(result(m,'b')),'-00:01:30');
 // A custom rate uses the time result as a reference, still in seconds.
 const rate=E.newCustomFormula('rate');rate.dimension='flow';rate.resultUnit='m3_h';rate.expression=E.customExpression('V / t','flow',{V:{dimension:'volume',expression:E.symbol('V')},t:{dimension:'time',expression:E.ref('formula:a')}});m.formulas.push(rate);m.inputValues['formula:rate:V:volume']='1';
 assert.equal(result(m,'rate'),40);
});
test('isolating a time term in place preserves TMS input/output units',()=>{
 const f=E.newFormula('sum','timeSum'),m=model(f);m.inputUnits[key('sum','t_1')]='tms';m.inputUnits[key('sum','t_2')]='h';m.inputValues[key('sum','t_2')]='12.34';
 const option=E.rearrangements('timeSum').find(o=>E.FORMULAS[o.id]?.rearranged?.key==='t1');assert(option);
 const next=E.rearrangeFormula(m,'sum',option.id);next.inputValues[key('sum','t_sum')]=U.parseTime('20:20:24');
 assert.equal(next.formulas.length,1);assert.equal(next.formulas[0].resultUnit,'tms');assert.equal(next.inputUnits[key('sum','t_sum')],'tms');assert.equal(U.formatTime(result(next,'sum')),'08:00:00');
});
