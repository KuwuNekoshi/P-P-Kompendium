'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),G=require('../dist/calculator-guide.js');
const close=(a,b,label='')=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`);
const text=n=>n.toLocaleString('en-US',{useGrouping:false,maximumSignificantDigits:16});
function setup(type='box'){
 const s=E.newShape(type,'main',1),m={version:6,title:'Mål',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[s],connections:[],formulas:[]};
 set(m,s,{L:3.75,B:2.5,l:1.5,b:1,h:4,D:2.5,d:1});return m;
}
function set(m,s,values){for(const [key,e]of Object.entries(s.inputs))m.inputValues[`shape:${s.id}:${e.symbol}:length`]=text(values[key]);}
function source(m,dimension='volume',shapeId='main'){
 const f={id:'total',name:'Samlet '+dimension,symbol:dimension==='volume'?'V_total':'A_total',dimension,expression:E.assembly(dimension,undefined,shapeId)};
 m.formulas=m.formulas.filter(f=>f.id!=='total');m.formulas.push(f);return E.evaluate(E.context(m).target('formula:total')).value;
}
function solve(m,key,dimension='volume',expected){
 const given=source(m,dimension);m=E.isolateFigureFormula(m,'total',key,'answer');
 const f=m.formulas.at(-1);m.inputValues[`formula:answer:${f.expression.given.symbol}:${dimension}`]=text(given);
 delete m.inputValues[key];const ctx=E.context(m),ast=ctx.target('formula:answer'),result=E.evaluate(ast);
 assert.equal(result.status,'ready',result.error||JSON.stringify(result));
 if(expected!==undefined)close(result.value,expected,key);
 assert(!E.variables(ast).some(v=>E.Units.key(v)===key),'the unknown is not a required input');
 assert.doesNotThrow(()=>E.math(ast));assert.doesNotThrow(()=>E.tex(ast));assert.doesNotThrow(()=>G.create(ctx,'formula:answer'));
 assert.deepEqual(E.validateModel(E.clone(m)),m);
 return {m,ctx,ast,result};
}
for(const bottomType of ['halfCylinder','triangularPrism','pyramid','pyramidFrustum'])test('box + '+bottomType+': isolate shared length, width, box height and bottom height',()=>{
 let m=setup(),b=E.newShape(bottomType,'bottom',2);m.shapes.push(b);set(m,b,{L:99,B:99,l:1.5,b:1,D:99,h:2});
 m=E.connect(m,{shape:'main',face:'bottom'},{shape:'bottom',face:'top'},'join');
 const options=E.figureMeasureOptions(m,E.assembly('volume',undefined,'main'),'volume').options;
 assert(!options.some(o=>o.key.includes('bottom:L_2')||o.key.includes('bottom:B_2')||o.key.includes('bottom:D_2')),'shared face dimensions have one source');
 for(const [key,value]of [['L_1',3.75],['B_1',2.5],['h_1',4]])solve(E.clone(m),'shape:main:'+key+':length','volume',value);
 if(bottomType!=='halfCylinder')solve(E.clone(m),'shape:bottom:h_2:length','volume',2);
});

test('cylinder + cone: either height and their common diameter follow the whole volume formula',()=>{
 let m=setup('cylinder'),b=E.newShape('cone','bottom',2);m.shapes.push(b);set(m,b,{D:77,h:2});m=E.connect(m,{shape:'main',face:'bottom'},{shape:'bottom',face:'base'},'join');
 for(const [key,value]of [['shape:main:h_1:length',4],['shape:main:D_1:length',2.5],['shape:bottom:h_2:length',2]])solve(E.clone(m),key,'volume',value);
 const ast=solve(E.clone(m),'shape:main:h_1:length','volume',4).ast;
 assert.match(E.plain(ast),/V_total/);assert.match(E.plain(ast),/h_2/);
});

for(const type of Object.keys(E.SHAPES))test('independent '+type+' dimensions can be isolated from their volume',()=>{
 const m=setup(type);source(m);
 const options=E.figureMeasureOptions(m,E.ref('formula:total'),'volume').options;
 assert(options.length>0);assert(options.every(o=>o.available),options.filter(o=>!o.available).map(o=>o.reason).join());
 for(const option of options){const expected=Number(m.inputValues[option.key]);solve(E.clone(m),option.key,'volume',expected);}
});

test('surface-area inversion follows open faces and omits joined faces',()=>{
 let m=setup(),bottom=E.newShape('halfCylinder','bottom',2);m.shapes.push(bottom);set(m,bottom,{D:99,L:99});m=E.connect(m,{shape:'main',face:'bottom'},{shape:'bottom',face:'top'},'join');
 for(const state of ['open','closed']){m.shapes[0].faces.top=state;solve(E.clone(m),'shape:main:h_1:length','area',4);}
 const solved=solve(E.clone(m),'shape:main:L_1:length','area',3.75);
 const before=E.evaluate(solved.ctx.target('formula:answer')).value;
 solved.m.shapes[0].faces.top='open';const after=E.evaluate(E.context(solved.m).target('formula:answer')).value;
 assert(after>before,'same given area and fewer plates require a longer tank');
});

test('input units for the unknown never turn its solved SI value into a raw millimetre value',()=>{
 let m=setup();m.inputValues['shape:main:L_1:length']='3750';m.inputUnits['shape:main:L_1:length']='mm';
 m.inputValues['shape:main:B_1:length']='250';m.inputUnits['shape:main:B_1:length']='cm';
 const known=source(m);m.formulas[0].resultUnit='L';m=E.isolateFigureFormula(m,'total','shape:main:L_1:length','answer');
 m.inputValues['formula:answer:V_total:volume']=text(known*1000);delete m.inputValues['shape:main:L_1:length'];
 const ctx=E.context(m);close(E.evaluate(ctx.target('formula:answer')).value,3.75);close(E.evaluate(ctx.result('formula:answer')).value,3750);
 assert.match(E.plain(ctx.target('formula:answer'),null,'values'),/2,5/);assert(!E.plain(ctx.target('formula:answer'),null,'values').includes('250'));
 assert.equal(m.formulas.at(-1).resultUnit,'mm');
});

test('outer diameter inversion retains thickness, output units and the inside-volume equation',()=>{
 let m=setup('cylinder');m=E.setDiameterBasis(m,'main','outer');
 m.inputValues['shape:main:D_1:length']='2700';m.inputUnits['shape:main:D_1:length']='mm';m.inputValues['tank:tank:t_plade:length']='100';m.inputUnits['tank:tank:t_plade:length']='mm';
 const {ctx}=solve(m,'shape:main:D_1:length','volume',2.7);close(E.evaluate(ctx.result('formula:answer')).value,2700);
});

test('separate tanks and equal symbol names keep their identity; scoped sums round-trip',()=>{
 const m=setup(),other=E.newShape('box','other',2);m.shapes.push(other);set(m,other,{L:99,B:99,h:99});
 other.inputs.h=E.symbol('h_1');m.inputValues['shape:other:h_1:length']='99';
 solve(E.clone(m),'shape:main:h_1:length','volume',4);
 const all=E.figureMeasureOptions(m,E.assembly('volume'),'volume').options;
 assert(all.some(o=>o.key==='shape:main:h_1:length'));assert(all.some(o=>o.key==='shape:other:h_1:length'));
 const {m:saved}=solve(E.clone(m),'shape:main:h_1:length','volume',4);assert.deepEqual(E.validateModel(saved).formulas[0].expression,E.assembly('volume',undefined,'main'));
});

test('known volumes may reference other formulas; copied inversion retains source scopes and groups',()=>{
 let m=setup();source(m);m=E.addFormulaGroup(m,'task','Opgave');m=E.assignFormulaGroup(m,'total','task');
 const sourceFormula=m.formulas[0];sourceFormula.expression=E.form('volumeSum',{V1:E.assembly('volume',undefined,'main'),V2:E.symbol('V_extra')});m.inputValues['formula:total:V_extra:volume']='2';
 const volume=E.evaluate(E.context(m).target('formula:total')).value;m=E.isolateFigureFormula(m,'total','shape:main:h_1:length','answer');assert.equal(m.formulas.at(-1).groupId,'task');
 m.formulas.push({id:'given',name:'Kendt volumen',symbol:'V',dimension:'volume',expression:E.symbol('V_opgave'),resultUnit:'L'});
 m.inputValues['formula:given:V_opgave:volume']=text(volume);m.formulas.find(f=>f.id==='answer').expression.given=E.ref('formula:given');
 const ast=E.context(m).target('formula:answer');close(E.evaluate(ast).value,4);assert(E.variables(ast).some(v=>E.Units.key(v)==='formula:total:V_extra:volume'));
 assert(E.dependsOn(m,'formula:answer','formula:given'));assert(E.usersOf(m,'formula','total').includes(m.formulas.find(f=>f.id==='answer').name));
});

test('tautological known totals, removed unknowns, invalid dimensions and nonphysical results are explained',()=>{
 const {m}=solve(setup(),'shape:main:h_1:length','volume',4),f=m.formulas.at(-1);
 f.expression.given=E.ref('formula:total');assert.match(E.context(m).safe('formula:answer').error,/må ikke selv afhænge/);
 f.expression.given=E.symbol('V_total');m.inputValues['formula:answer:V_total:volume']='-1';assert.match(E.evaluate(E.context(m).target('formula:answer')).error,/større end 0/);
 f.expression.unknown='shape:gone:h_1:length';assert.match(E.context(m).safe('formula:answer').error,/findes ikke længere/);
 f.expression.unknown='formula:answer:V_total:volume';assert.throws(()=>E.validateModel(m),/ugyldigt figurmål/);
 f.expression.unknown='shape:main:h_1:length';m.formulas[0].expression.shapeId='gone';assert.match(E.context(m).safe('formula:answer').error,/samling mangler/);
});

test('complex repeated radical or mixed cubic dimensions are disabled rather than guessed',()=>{
 let m=setup('cylinder'),hemisphere=E.newShape('hemisphere','bottom',2);m.shapes.push(hemisphere);set(m,hemisphere,{D:99});m=E.connect(m,{shape:'main',face:'bottom'},{shape:'bottom',face:'base'},'join');
 const options=E.figureMeasureOptions(m,E.assembly('volume',undefined,'main'),'volume').options;
 assert.equal(options.find(o=>o.symbol==='h_1').available,true);assert.equal(options.find(o=>o.symbol==='D_1').available,false);assert.match(options.find(o=>o.symbol==='D_1').reason,/anden formel/);
 solve(m,'shape:main:h_1:length','volume',4);
});

test('squaring never permits a negative known mantle area to become a valid cone height',()=>{
 const m=setup('cone');m.shapes[0].faces.base='open';const {m:inverse}=solve(m,'shape:main:h_1:length','area',4);
 inverse.inputValues['formula:answer:A_total:area']='-100';const result=E.evaluate(E.context(inverse).target('formula:answer'));
 assert.equal(result.status,'error');assert.match(result.error,/rodkrav/);
});
