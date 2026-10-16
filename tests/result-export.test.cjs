'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../dist/engine.js'),X=require('../dist/result-export.js');
const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),scope=vm.createContext({});
vm.runInContext(app.slice(app.indexOf('  function formatResultValue('),app.indexOf('  function unitOptions(')),scope);
const fixture=()=>{let m=E.initializeUnitChoices({version:6,title:'Opgave <A> & masse',tank:E.defaultTank(),inputUnits:{},inputValues:{},shapes:[],connections:[],formulas:[E.newFormula('area','rectangleArea')]});m.formulas[0].isResult=true;m.inputUnits['formula:area:B:length']='m';m.inputUnits['formula:area:L:length']='m';m.inputValues['formula:area:B:length']='2.003234';m.inputValues['formula:area:L:length']='1000';m.formulas.push({id:'next',name:'Referenceresultat',symbol:'A_2',dimension:'area',resultUnit:'cm2',expression:E.ref('formula:area'),isResult:true});m=E.addFormulaGroup(m,'g','Gruppe & <test>');m=E.assignFormulaGroup(m,'next','g');return m;};
function unzip(bytes){const b=Buffer.from(bytes),files={};let i=0;while(b.readUInt32LE(i)===0x04034b50){const size=b.readUInt32LE(i+18),n=b.readUInt16LE(i+26),extra=b.readUInt16LE(i+28),start=i+30+n+extra,name=b.subarray(i+30,i+30+n).toString();const content=b.subarray(start,start+size);assert.equal(X.crc32(content),b.readUInt32LE(i+14));files[name]=content.toString();i=start+size;}assert.equal(b.readUInt32LE(i),0x02014b50);assert.equal(b.readUInt32LE(b.length-22),0x06054b50);return files;}
for(const mode of Object.keys(X.modes))test('real DOCX '+mode+' preserves ordered marked results, units and precision',()=>{
 const m=fixture(),before=JSON.stringify(m),data=X.collect(E,m,mode,scope.formatResultValue);
 assert.deepEqual(data.groups.map(g=>g.name),['Gruppe & <test>','Uden gruppe']);assert.equal(data.groups[0].rows[0].value,'20032340,000');assert.equal(data.groups[0].rows[0].unit,'cm²');assert.equal(data.groups[1].rows[0].value,'2003,234');
 const row=data.groups[0].rows[0];if(mode==='none')assert.equal(row.text,undefined);else{assert(row.text);assert(row.math);if(mode==='compact')assert.match(row.text,/A/);if(mode==='simple')assert.match(row.text,/2003/);if(mode==='expanded')assert.match(row.text,/2,003234/);}
 const files=unzip(X.docx(data));assert.deepEqual(Object.keys(files).sort(),['[Content_Types].xml','_rels/.rels','word/_rels/document.xml.rels','word/document.xml','word/styles.xml'].sort());
 assert.match(files['word/document.xml'],/Opgave &lt;A&gt; &amp; masse/);assert.match(files['word/document.xml'],/20032340,000 cm²/);assert.equal(JSON.stringify(m),before);
});
test('missing inputs and bad references never export stale final values',()=>{
 const m=fixture();delete m.inputValues['formula:area:B:length'];for(const mode of Object.keys(X.modes)){const data=X.collect(E,m,mode,scope.formatResultValue);assert(data.groups.every(g=>g.rows.every(r=>r.status==='incomplete')));assert(!Buffer.from(X.docx(data)).toString().includes('20032340'));}
 m.formulas[1].expression=E.ref('formula:missing');const r=X.collect(E,m,'simple',scope.formatResultValue).groups[0].rows[0];assert.equal(r.status,'error');assert.match(r.value,/Beregningsfejl/);
});
test('empty and unmarked results, strict modes, safe filenames and XML',()=>{const m=fixture();m.formulas.forEach(f=>f.isResult=false);assert.deepEqual(X.collect(E,m,'none',String).groups,[]);assert.throws(()=>X.collect(E,m,'bad',String),/Ugyldigt/);assert.equal(X.filename('../CON','docx'),'Opgave-CON-resultater.docx');assert.equal(X.filename('<>:"/\\|?*','pdf'),'Resultater-resultater.pdf');assert.equal(X.xml('\u0000<&\ud800'),'&lt;&amp;�');});
test('negative, tiny and large final values use the view formatter',()=>{for(const v of [-2.003234,1e-20,100000000000000000000]){const m=fixture();m.formulas=[{id:'x',name:'Tal',symbol:'x',dimension:'scalar',expression:E.symbol('x'),isResult:true}];m.inputValues={'formula:x:x:scalar':v.toLocaleString('en-US',{useGrouping:false,maximumFractionDigits:20})};const r=X.collect(E,m,'none',scope.formatResultValue).groups[0].rows[0];assert.equal(r.value,scope.formatResultValue(v));}});
module.exports={fixture,unzip};



