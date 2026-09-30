'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Guide=require('../dist/calculator-guide.js'),C=E.CustomFormula;
const close=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const value=(m,id)=>{const r=E.evaluate(E.context(m).target('formula:'+id));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;};
const empty=()=>({version:6,title:'Egne formler',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:[]});
function custom(m,id,text,dimension,args={}){
 const expression=E.customExpression(text,dimension,args),f={id,name:'Egen formel',symbol:'X',dimension,expression};m.formulas.push(f);return f;
}
function tank(){
 let m=empty();m.shapes=['cylinder','cone','cone'].map((type,i)=>E.newShape(type,['middle','bottom','top'][i],i+1));
 m=E.connect(m,{shape:'middle',face:'bottom'},{shape:'bottom',face:'base'},'bottom-join');
 m=E.connect(m,{shape:'middle',face:'top'},{shape:'top',face:'base'},'top-join');
 m.inputValues={'shape:middle:D_1:length':'2000','shape:middle:h_1:length':'99','shape:bottom:h_2:length':'100','shape:top:h_3:length':'500'};
 m.inputUnits={'shape:middle:D_1:length':'mm','shape:bottom:h_2:length':'cm','shape:top:h_3:length':'mm'};
 m.formulas=[{id:'volume',name:'Tankvolumen',dimension:'volume',symbol:'V',resultUnit:'L',expression:E.assembly('volume',undefined,'middle')}];
 m=E.isolateFigureFormula(m,'volume','shape:middle:h_1:length','height');
 m.inputValues['formula:height:V:volume']=String(Math.PI*4.5*1000);return m;
}
test('cone / cylinder / cone: solve middle height and link a custom total, in mixed units',()=>{
 let m=tank();close(value(m,'height'),4);
 m.formulas.find(f=>f.id==='height').resultUnit='mm';
 m=E.totalHeightFromMeasure(m,'height','total');close(value(m,'total'),5.5);
 assert.equal(m.formulas.at(-1).expression.args.h_1.expression.target,'formula:height');
 assert(E.dependsOn(m,'formula:total','formula:height'));
 const ast=E.context(m).target('formula:total');assert(!E.variables(ast).some(v=>E.Units.key(v)==='shape:middle:h_1:length'));
 // Editing the cone's actual input or the given total propagates through both formulas.
 m.inputValues['shape:bottom:h_2:length']='200';close(value(m,'height'),4-1/3);close(value(m,'total'),5.5+2/3);
 m.inputValues['formula:height:V:volume']=String(Math.PI*5.5*1000);close(value(m,'total'),5.5+2/3+1);
 assert.deepEqual(E.validateModel(E.clone(m)),m);
 assert.doesNotThrow(()=>Guide.create(E.context(m),'formula:total'));
 assert.match(E.plain(E.context(m).target('formula:total','compact')),/h_1/);
 assert.doesNotThrow(()=>E.math(ast));assert.doesNotThrow(()=>E.tex(ast));
});
test('total height stays in the source group and ignores other disconnected tanks',()=>{
 let m=tank();m=E.addFormulaGroup(m,'task','Opgave 1');m=E.assignFormulaGroup(m,'height','task');
 const box=E.newShape('box','other',4);m.shapes.push(box);for(const e of Object.values(box.inputs))m.inputValues['shape:other:'+e.symbol+':length']='100';
 m=E.totalHeightFromMeasure(m,'height','total');close(value(m,'total'),5.5);assert.equal(m.formulas.at(-1).groupId,'task');
 assert(!E.references(m.formulas.at(-1).expression,m).some(r=>r.includes('other')));
 const clone=E.validateModel(JSON.parse(JSON.stringify(m)));close(value(clone,'total'),5.5);
});
test('the shortcut includes half-cylinder or hemisphere heights as half a diameter',()=>{
 for(const [type,bottom,face]of [['box','halfCylinder','top'],['cylinder','hemisphere','base']]){
  let m=empty();const a=E.newShape(type,'main',1),b=E.newShape(bottom,'base',2);m.shapes=[a,b];m=E.connect(m,{shape:'main',face:'bottom'},{shape:'base',face},'joint');
  for(const s of m.shapes)for(const e of Object.values(s.inputs))m.inputValues['shape:'+s.id+':'+e.symbol+':length']='2';
  const total=E.evaluate(E.context(m).expand(E.assembly('volume'),'volume')).value;
  m.formulas=[{id:'measure',name:'Højde',symbol:'h',dimension:'length',expression:E.isolatedMeasure(E.assembly('volume'),'volume','shape:main:h_1:length')}];
  m.inputValues['formula:measure:V_total:volume']=String(total);m=E.totalHeightFromMeasure(m,'measure','height');close(value(m,'height'),3);
 }
});
test('arithmetic precedence, parentheses, negative values, decimal comma, pi and roots',()=>{
 for(const [text,expected]of [['2 + 3 * 4',14],['(2 + 3) * 4',20],['8 / 2 / 2',2],['-2^2',-4],['2^-2',.25],['2^3^2',512],['sqrt(9) + 0,5',3.5],['pi * 2',Math.PI*2],['8^(1/3)',2],['1 - (2 - 3)',2]]){
  const m=empty();custom(m,'f',text,'scalar');close(value(m,'f'),expected);
 }
});
test('dimensions are checked through products, division, powers and roots',()=>{
 for(const [text,output,bindings]of [['B * L','area',{B:'length',L:'length'}],['V / A','length',{V:'volume',A:'area'}],['sqrt(A)','length',{A:'area'}],['V^(1/3)','length',{V:'volume'}],['rho * V','mass',{rho:'density',V:'volume'}],['Q * t','volume',{Q:'flow',t:'time'}]]){
  const args=Object.fromEntries(Object.entries(bindings).map(([n,d])=>[n,{dimension:d,expression:E.symbol(n)}]));
  const expr=E.customExpression(text,output,args);assert.doesNotThrow(()=>C.check(C.parse(expr.text),expr.args,output));
 }
 const m=empty();custom(m,'f','L + t','length',{L:{dimension:'length',expression:E.symbol('L')},t:{dimension:'time',expression:E.symbol('t')}});
 assert.match(E.context(m).safe('formula:f').error,/samme enhed/);
 m.formulas[0].expression=E.customExpression('L * L','length');assert.match(E.context(m).safe('formula:f').error,/resultatets størrelse/);
 m.formulas[0].expression=E.customExpression('L ^ n','length');assert.match(E.context(m).safe('formula:f').error,/fast tal/);
});
test('custom inputs remain scoped; reference results convert from their source units exactly once',()=>{
 const m=empty();custom(m,'a','r * 2','length');custom(m,'b','r * 3','length');
 m.inputValues={'formula:a:r:length':'20','formula:b:r:length':'3'};m.inputUnits={'formula:a:r:length':'mm'};m.formulas[0].resultUnit='mm';
 custom(m,'sum','a + b','length',{a:{dimension:'length',expression:E.ref('formula:a')},b:{dimension:'length',expression:E.ref('formula:b')}});
 close(value(m,'sum'),9.04);m.inputValues['formula:a:r:length']='30';close(value(m,'b'),9);close(value(m,'sum'),9.06);
 assert.match(E.plain(E.context(m).target('formula:sum'),null,'values'),/0,03/);
 m.formulas[2].resultUnit='cm';close(E.evaluate(E.context(m).result('formula:sum')).value,906);
 assert.deepEqual(E.validateModel(m),m);
});
test('expression edits preserve named bindings and remove obsolete dependencies',()=>{
 const args={a:{dimension:'area',expression:E.ref('shape:plate:area')},old:{dimension:'length',expression:E.ref('formula:deleted')}};
 const expr=E.customExpression('a / h','length',args);assert.deepEqual(expr.args.a,args.a);assert.notEqual(expr.args.a,args.a);assert(!Object.hasOwn(expr.args,'old'));
 assert.deepEqual(E.references(expr,empty()),['shape:plate:area']);assert.equal(expr.args.h.dimension,'length');
});
test('references, deleted sources and cycles retain actionable errors and deletion warnings',()=>{
 const m=empty();custom(m,'a','x','length',{x:{dimension:'length',expression:E.ref('formula:b')}});custom(m,'b','x','length',{x:{dimension:'length',expression:E.ref('formula:a')}});
 assert(E.dependsOn(m,'formula:a','formula:b'));assert.match(E.context(m).safe('formula:a').error,/Cirkulær/);assert.equal(E.usersOf(m,'formula','b').length,1);
 m.formulas.pop();assert.match(E.context(m).safe('formula:a').error,/reference mangler/);
 const valid=E.validateModel(m);assert.equal(valid.formulas[0].expression.kind,'custom');
});
test('invalid syntax and dangerous or oversized input are rejected without evaluating code',()=>{
 for(const text of ['','a = b','alert(1)','globalThis.x','a; b','a[0]','a +','(a+b','a b','2h','a**2','a // b','constructor.constructor(1)','<script>','a'.repeat(501),'('.repeat(30)+'1'+')'.repeat(30)])assert.throws(()=>C.parse(text),undefined,text);
 const m=empty();custom(m,'f','a','length');m.formulas[0].expression.text='a +';assert.throws(()=>E.validateModel(m));
 m.formulas[0].expression=E.customExpression('a');m.formulas[0].expression.args.a.dimension='nonsense';assert.throws(()=>E.validateModel(m));
});
test('division by zero and negative roots do not produce invalid numeric answers',()=>{
 for(const expr of ['1 / 0','sqrt(-1)']){const m=empty();custom(m,'f',expr,'scalar');assert.equal(E.evaluate(E.context(m).target('formula:f')).status,'error');}
});
test('selecting a connected component includes only that tank and follows new joins',()=>{
 let m=tank();const box=E.newShape('box','box',4);m.shapes.push(box);for(const e of Object.values(box.inputs))m.inputValues['shape:box:'+e.symbol+':length']='2';
 custom(m,'part','V','volume',{V:{dimension:'volume',expression:E.assembly('volume',undefined,'box')}});close(value(m,'part'),8);
 const bottom=E.newShape('pyramid','pyramid',5);m.shapes.push(bottom);m.inputValues['shape:pyramid:h_5:length']='3';
 m=E.connect(m,{shape:'box',face:'bottom'},{shape:'pyramid',face:'top'},'box-join');close(value(m,'part'),12);
 assert(!E.references(m.formulas.at(-1).expression,m).some(r=>r.includes('middle')));
});
