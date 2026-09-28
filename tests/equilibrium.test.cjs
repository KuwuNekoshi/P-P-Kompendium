'use strict';
const test=require('node:test'),assert=require('node:assert/strict');const E=require('../dist/engine.js');
const setup=()=>({version:6,title:'Ligevægt',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:[]});
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const set=(m,scope,symbol,dimension,value,unit)=>{m.inputValues[scope+':'+symbol+':'+dimension]=String(value);if(unit)m.inputUnits[scope+':'+symbol+':'+dimension]=unit;};
const value=(m,id)=>{const r=E.evaluate(E.context(m).result('formula:'+id));assert.equal(r.status,'ready',r.error);return r.value;};
test('moment balance handles mixed arm units, forces, total masses and each inverse',()=>{
 const m=setup();m.formulas=[E.newFormula('mass','balanceMass'),E.newFormula('force','balanceForce'),E.newFormula('liquid','balanceLiquidVolume')];
 for(const id of ['mass','force','liquid']){set(m,'formula:'+id,'l_A','length',150,'cm');set(m,'formula:'+id,'l_B','length',5);}
 set(m,'formula:mass','m_A','mass',500);set(m,'formula:force','F_A','force',2,'kN');set(m,'formula:liquid','m_A','mass',500);set(m,'formula:liquid','m_tankB','mass',50);set(m,'formula:liquid','ρ_B','density',1000);m.formulas[2].resultUnit='L';
 near(value(m,'mass'),150);near(value(m,'force'),600);near(value(m,'liquid'),100);
 for(const id of ['balanceMass','balanceForce','balanceLiquidVolume'])assert(E.rearrangements(id).every(o=>o.available));
 set(m,'formula:liquid','l_B','length',0);assert.equal(E.evaluate(E.context(m).result('formula:liquid')).status,'error');
});
test('the photographed box and cone can feed equilibrium through live material, filling and total-mass references',()=>{
 let m=setup();m.shapes=[E.newShape('box','box',1),E.newShape('cone','cone',2)];
 m=E.setPlateThickness(m,'box','side',E.symbol('t_side1'));m=E.setPlateThickness(m,'box','bottom',E.symbol('t_bund1'));m=E.setPlateThickness(m,'cone','side',E.symbol('t_side2'));
 for(const [scope,symbol,v,u]of [['box','L_1',100,'cm'],['box','B_1',8.5,'dm'],['box','h_1',4500,'mm'],['box','t_side1',1.25,'mm'],['box','t_bund1',2.5,'mm'],['cone','D_2',2000,'mm'],['cone','h_2',1.5,'m'],['cone','t_side2',6,'mm']])set(m,'shape:'+scope,symbol,'length',v,u);
 const box=E.newFormula('boxMass','tankMassSurfaces'),cone=E.newFormula('coneMass','tankMassSurfaces');box.expression.args.V=E.ref('shape:box:materialVolume');cone.expression.args.V=E.ref('shape:cone:materialVolume');m.formulas.push(box,cone);
 set(m,'formula:boxMass','ρ_mat','density',8,'g_cm3');set(m,'formula:coneMass','ρ_mat','density',8,'g_cm3');
 const fill=E.newFormula('fill','filledVolume');m.formulas.push(fill);set(m,'formula:fill','Q_v','flow',1120,'L_h');set(m,'formula:fill','t','time',167,'min');
 const total=E.newFormula('total','filledTankMass');total.expression.args.tank=E.ref('formula:boxMass');total.expression.args.V=E.ref('formula:fill');m.formulas.push(total);set(m,'formula:total','ρ_væske','density',1170);
 const balance=E.newFormula('balance','balanceLiquidVolume');balance.expression.args.m=E.ref('formula:total');balance.expression.args.tank=E.ref('formula:coneMass');balance.resultUnit='L';m.formulas.push(balance);set(m,'formula:balance','l_A','length',1.5);set(m,'formula:balance','l_B','length',500,'cm');set(m,'formula:balance','ρ_B','density',1000);
 const coneMass=Math.PI*Math.sqrt(1+1.5**2)*.006*8000,boxMass=2*(1+.85)*4.5*.00125*8000+1*.85*.0025*8000,totalA=boxMass+(1120/1000)*(167/60)*1170;
 near(value(m,'boxMass'),183.5);near(value(m,'coneMass'),coneMass);near(value(m,'total'),totalA);near(value(m,'balance'),totalA*1.5/5-coneMass);
 const text=E.plain(E.context(m).result('formula:balance'),null,'values');assert(!text.includes('4500'));assert(!text.includes('2000'));assert(text.includes('0,00125'));
 const restored=E.validateModel(JSON.parse(JSON.stringify(m)));near(value(restored,'balance'),value(m,'balance'));
 set(m,'shape:box','t_bund1','length',5,'mm');near(value(m,'balance'),value(restored,'balance')+17*.3);
});
