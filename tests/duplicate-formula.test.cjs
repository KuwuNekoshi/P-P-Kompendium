'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('../dist/engine.js');
const setup=(...formulas)=>({version:6,title:'Kopier',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas});
const value=(m,id)=>{const r=E.evaluate(E.context(m).result('formula:'+id));assert.equal(r.status,'ready',r.error||JSON.stringify(r));return r.value;};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('duplicates nested formulas with independent values and units next to the source in its group',()=>{
 const source=E.newFormula('original','volumePortion');source.expression.args.V=E.newExpression('boxVolume');source.resultUnit='L';
 let m=E.initializeUnitChoices(setup(source,E.newFormula('after','volumePortion')));
 m=E.assignFormulaGroup(E.addFormulaGroup(m,'g','Tank'),source.id,'g');
 m.inputValues={'formula:original:L:length':'2000','formula:original:B:length':'1000','formula:original:h:length':'4000','formula:original:f_vol:scalar':'25'};
 const before=E.clone(m);m=E.duplicateFormula(m,'original','copy');
 assert.equal(m.formulas[m.formulas.findIndex(f=>f.id==='original')+1].id,'copy');assert.equal(m.formulas.find(f=>f.id==='copy').groupId,'g');
 assert.equal(m.formulas.find(f=>f.id==='copy').resultUnit,'L');near(value(m,'copy'),2000);near(value(m,'original'),2000);
 m.inputValues['formula:copy:L:length']='3000';near(value(m,'copy'),3000);near(value(m,'original'),2000);
 m.inputUnits['formula:copy:L:length']='cm';near(value(m,'copy'),30000);near(value(m,'original'),2000);
 m.formulas.find(f=>f.id==='copy').expression.args.V.args.h.symbol='height';assert.equal(m.formulas.find(f=>f.id==='original').expression.args.V.args.h.symbol,'h');
 assert.deepEqual(before.inputValues,{'formula:original:L:length':'2000','formula:original:B:length':'1000','formula:original:h:length':'4000','formula:original:f_vol:scalar':'25'});
 assert.equal(before.formulas.length,2);
});

test('duplicates preserve live targets, allow retargeting independently and leave incoming references untouched',()=>{
 const a=E.newFormula('a','boxVolume'),b=E.newFormula('b','boxVolume'),portion=E.newFormula('part','volumePortion'),consumer=E.newFormula('consumer','volumePortion');
 portion.expression.args.V=E.ref('formula:a');consumer.expression.args.V=E.ref('formula:part');
 let m=E.initializeUnitChoices(setup(a,b,portion,consumer));
 m.inputValues={'formula:a:L:length':'2000','formula:a:B:length':'2000','formula:a:h:length':'2000','formula:b:L:length':'1000','formula:b:B:length':'1000','formula:b:h:length':'1000','formula:part:f_vol:scalar':'25','formula:consumer:f_vol:scalar':'50'};
 const before=E.clone(m);m=E.duplicateFormula(m,'part','copy');
 near(value(m,'copy'),2);near(value(m,'consumer'),1);
 m.inputValues['formula:a:h:length']='3000';near(value(m,'copy'),3);near(value(m,'part'),3);
 m.formulas.find(f=>f.id==='copy').expression.args.V.target='formula:b';m.inputValues['formula:copy:f_vol:scalar']='50';
 near(value(m,'copy'),.5);near(value(m,'part'),3);near(value(m,'consumer'),1.5);
 assert.equal(m.formulas.find(f=>f.id==='consumer').expression.args.V.target,'formula:part');
 assert.equal(before.formulas.find(f=>f.id==='part').expression.args.V.target,'formula:a');
 m=E.initializeUnitChoices(E.validateModel(E.clone(m)),false);near(value(m,'copy'),.5);near(value(m,'part'),3);
 m.formulas=m.formulas.filter(f=>f.id!=='part'&&f.id!=='consumer');near(value(m,'copy'),.5);
});

test('custom expressions, Hx and isolated figure formulas retain their own editable expression trees',()=>{
 const custom={id:'custom',name:'Egen volumen',symbol:'V',dimension:'volume',resultUnit:'L',expression:E.customExpression('a + b','volume',{a:{dimension:'volume',expression:E.symbol('a')},b:{dimension:'volume',expression:E.symbol('b')}})};
 let m=E.initializeUnitChoices(setup(custom));m.inputValues={'formula:custom:a:volume':'2','formula:custom:b:volume':'3'};
 m=E.duplicateFormula(m,'custom','customCopy');near(value(m,'customCopy'),5000);
 m.inputValues['formula:customCopy:a:volume']='4';near(value(m,'customCopy'),7000);near(value(m,'custom'),5000);
 const hx=E.newFillHeight('hx','tank');m.shapes.push(E.newShape('box','tank',1));m.formulas.push(hx);E.initializeUnitChoices(m);
 Object.assign(m.inputValues,{'shape:tank:L_1:length':'1000','shape:tank:B_1:length':'1000','shape:tank:h_1:length':'4000','formula:hx:V_produkt:volume':'2'});
 m=E.duplicateFormula(m,'hx','hxCopy');near(value(m,'hxCopy'),2000);
 m.inputValues['formula:hxCopy:V_produkt:volume']='3';near(value(m,'hxCopy'),3000);near(value(m,'hx'),2000);
 const isolated={id:'height',name:'Tankhøjde',symbol:'h',dimension:'length',resultUnit:'mm',expression:E.isolatedMeasure(E.assembly('volume',undefined,'tank'),'volume','shape:tank:h_1:length',E.symbol('V_kendt'))};
 m.formulas.push(isolated);m.inputValues['formula:height:V_kendt:volume']='2';E.initializeUnitChoices(m);
 m=E.duplicateFormula(m,'height','heightCopy');near(value(m,'heightCopy'),2000);
 m.inputValues['formula:heightCopy:V_kendt:volume']='3';near(value(m,'heightCopy'),3000);near(value(m,'height'),2000);
});

test('copy names and symbols remain distinct and bounded; capacity and ID errors never change the source',()=>{
 const source=E.newFormula('original','volumePortion');source.name='A'.repeat(120);source.symbol='X'.repeat(24);
 const original=setup(source),snapshot=JSON.stringify(original);
 let m=E.duplicateFormula(original,'original','copy');m=E.duplicateFormula(m,'copy','copy2');
 assert.equal(new Set(m.formulas.map(f=>f.name)).size,3);assert.equal(new Set(m.formulas.map(f=>f.symbol)).size,3);
 assert(m.formulas.every(f=>f.name.length<=120&&f.symbol.length<=24));assert.equal(JSON.stringify(original),snapshot);
 assert.throws(()=>E.duplicateFormula(original,'missing','x'),/findes ikke/);
 assert.throws(()=>E.duplicateFormula(original,'original','original'),/id/);
 assert.throws(()=>E.duplicateFormula(original,'original','invalid:id'),/id/);
 const full=setup(...Array.from({length:40},(_,i)=>E.newFormula('f'+i,'diameter'))),before=JSON.stringify(full);
 assert.throws(()=>E.duplicateFormula(full,'f0','copy'),/40 formler/);assert.equal(JSON.stringify(full),before);
});
