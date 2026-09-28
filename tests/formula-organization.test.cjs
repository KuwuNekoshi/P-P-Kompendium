'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const setup=()=>({version:6,title:'Grupper',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:['a','b','c','d'].map(id=>E.newFormula(id,'diameter'))});
const ids=m=>m.formulas.map(f=>f.id);
const sections=m=>E.formulaSections(m).map(g=>[g.id,g.formulas.map(f=>f.id)]);
test('formulas move up and down with bounded moves and preserve identity, units and live references',()=>{
 let m=setup();m.formulas[2].expression.args.r=E.ref('formula:a');
 m.inputValues={'formula:a:r:length':'2','formula:b:r:length':'7'};m.inputUnits={'formula:a:r:length':'cm'};
 const before=E.clone(m),value=E.evaluate(E.context(m).result('formula:c')).value;
 m=E.moveFormula(m,'a',1);assert.deepEqual(ids(m),['b','a','c','d']);
 m=E.moveFormula(m,'c',-1);assert.deepEqual(ids(m),['b','c','a','d']);
 assert.deepEqual(m.inputValues,before.inputValues);assert.deepEqual(m.inputUnits,before.inputUnits);
 assert.equal(E.evaluate(E.context(m).result('formula:c')).value,value);
 assert.deepEqual(E.moveFormula(m,'b',-1),m);assert.deepEqual(E.moveFormula(m,'d',1),m);
 assert.deepEqual(ids(before),['a','b','c','d']);assert.throws(()=>E.moveFormula(m,'missing',1),/findes ikke/);
 assert.throws(()=>E.moveFormula(m,'a',0),/op eller ned/);
});
test('groups have their own order, members move only within their group, and assignment appends to the destination',()=>{
 let m=E.addFormulaGroup(E.addFormulaGroup(setup(),'first','Opgave 1'),'second','Opgave 2');
 m=E.assignFormulaGroup(m,'a','first');m=E.assignFormulaGroup(m,'c','first');m=E.assignFormulaGroup(m,'b','second');
 assert.deepEqual(sections(m),[['first',['a','c']],['second',['b']],['',['d']]]);
 m=E.moveFormula(m,'c',-1);assert.deepEqual(sections(m)[0],['first',['c','a']]);
 assert.deepEqual(E.moveFormula(m,'a',1),m);
 m=E.moveFormulaGroup(m,'second',-1);assert.deepEqual(sections(m).map(g=>g[0]),['second','first','']);
 m.formulaGroups[0].collapsed=true;m=E.assignFormulaGroup(m,'a','second');assert.equal(m.formulaGroups[0].collapsed,false);
 assert.deepEqual(sections(m),[['second',['b','a']],['first',['c']],['',['d']]]);
 m=E.assignFormulaGroup(m,'b','');assert.deepEqual(sections(m).at(-1),['',['d','b']]);
 assert(!Object.hasOwn(m.formulas.find(f=>f.id==='b'),'groupId'));
 assert.throws(()=>E.assignFormulaGroup(m,'a','missing'),/findes ikke/);
});
test('removing and renaming groups preserve formulas and their relative member order',()=>{
 let m=E.addFormulaGroup(setup(),'group',' Første gruppe ');
 assert.equal(m.formulaGroups[0].name,'Første gruppe');m=E.assignFormulaGroup(m,'c','group');m=E.assignFormulaGroup(m,'a','group');
 m=E.renameFormulaGroup(m,'group','Nyt navn');assert.equal(m.formulaGroups[0].name,'Nyt navn');
 const before=E.clone(m),expressions=new Map(m.formulas.map(f=>[f.id,f.expression]));
 m=E.removeFormulaGroup(m,'group');assert.deepEqual(m.formulaGroups,[]);assert.deepEqual(ids(m),['b','d','c','a']);
 for(const f of m.formulas){assert.deepEqual(f.expression,expressions.get(f.id));assert(!f.groupId);}
 assert.equal(before.formulaGroups[0].name,'Nyt navn');assert.throws(()=>E.renameFormulaGroup(m,'group','Gone'),/findes ikke/);
});
test('save/open retains empty groups, collapsed state, membership and order while old setups stay compatible',()=>{
 let m=E.addFormulaGroup(E.addFormulaGroup(setup(),'empty','Tom gruppe'),'full','Opgave');m=E.assignFormulaGroup(m,'b','full');
 m.formulaGroups[1].collapsed=true;m=E.moveFormula(m,'d',-1);
 assert.deepEqual(E.validateModel(JSON.parse(JSON.stringify(m))),m);
 const old=setup();assert.deepEqual(E.validateModel(old),old);assert.deepEqual(sections(old),[['',['a','b','c','d']]]);
 for(const formulaGroups of [null,{},[{id:'x',name:'x',collapsed:true},{id:'x',name:'y',collapsed:false}],[{id:'bad:id',name:'x',collapsed:false}],[{id:'x',name:' ',collapsed:false}],[{id:'x',name:'x',collapsed:'yes'}],Array.from({length:41},(_,i)=>({id:'g'+i,name:'g',collapsed:false}))])assert.throws(()=>E.validateModel({...old,formulaGroups}),/formelgruppe/);
 assert.throws(()=>E.validateModel({...m,formulas:[{...m.formulas[0],groupId:'missing'}]}),/gruppe findes ikke/);
});
test('rearrangements inherit the source group and source values remain independent',()=>{
 let m=E.addFormulaGroup(setup(),'g','Omskrivninger');m=E.assignFormulaGroup(m,'a','g');m.inputValues={'formula:a:r:length':'2'};
 m=E.rearrangeFormula(m,'a','inverse:diameter:r','inverse');
 const inverse=m.formulas.find(f=>f.id==='inverse');assert.equal(inverse.groupId,'g');assert.equal(m.inputValues['formula:inverse:r:length'],'2');
 m.inputValues['formula:inverse:r:length']='5';assert.equal(m.inputValues['formula:a:r:length'],'2');
 assert.deepEqual(E.validateModel(E.clone(m)),m);
});
