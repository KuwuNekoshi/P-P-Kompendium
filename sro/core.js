/* Shared SRO task model; independent scoped inputs and exact base-unit substitutions. */
(function(root){
 'use strict';const E=root.PP;
 const clone=E.clone;
 const uid=()=> 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
 function empty(){return {format:'sro-kompendium',version:1,model:{version:6,title:'Ny SRO-opgave',inputUnits:{},inputValues:{},tank:E.defaultTank(),shapes:[],connections:[],formulas:[],formulaGroups:[]},circuit:null,ioRows:[]};}
 function applyDefaults(model,expr,owner){
  if(expr.kind!=='formula')return;
  const def=E.FORMULAS[expr.formula];
  for(const [key,arg]of Object.entries(def.args)){
   const v=expr.args[key];if(v.kind!=='symbol'){applyDefaults(model,v,owner);continue;}
   const k=E.Units.key({scope:'formula:'+owner,symbol:v.symbol,dimension:arg.dimension});
   model.inputUnits[k]=arg.unit||E.Units.preferred(arg.dimension).id;
   if(arg.value!==undefined)model.inputValues[k]=String(arg.value);
  }
 }
 function add(task,type,options={}){
  const m=task.model;if(m.formulas.length>=40)throw Error('En opgave kan indeholde højst 40 formler.');
  const f=E.newFormula(options.id||uid(),type);Object.assign(f,options);f.resultUnit=options.resultUnit||E.FORMULAS[type].resultUnit||E.Units.preferred(f.dimension).id;
  m.formulas.push(f);applyDefaults(m,f.expression,f.id);return f;
 }
 function set(model,f,key,value,unit){
  const definition=E.FORMULAS[f.expression.formula].args[key],expr=f.expression.args[key];if(expr.kind!=='symbol')throw Error('Dette input er en reference.');
  const k=E.Units.key({scope:'formula:'+f.id,symbol:expr.symbol,dimension:definition.dimension});
  if(E.parseInputValue(String(value))===null)throw Error('Skriv ét tal.');model.inputValues[k]=String(value);
  if(unit){E.Units.get(definition.dimension,unit);model.inputUnits[k]=unit;}
 }
 function validate(input){
  if(!input||input.format!=='sro-kompendium'||input.version!==1)throw Error('Vælg en opgave eksporteret fra SRO-kompendiet.');
  const out=empty();out.model=E.validateModel(input.model);if(out.model.shapes.length||out.model.connections.length)throw Error('SRO-opgaver kan ikke indeholde tanke.');
  if(input.circuit)out.circuit=root.SROCircuit.validate(input.circuit,out.model);
  if(!Array.isArray(input.ioRows)||input.ioRows.length>100)throw Error('Ugyldig I/O-liste.');
  out.ioRows=input.ioRows.map(r=>{if(!r||!['DI','DO','AI','AO'].includes(r.type)||['address','name','note'].some(k=>typeof r[k]!=='string'||r[k].length>180))throw Error('Ugyldig I/O-række.');return {type:r.type,address:r.address,name:r.name,note:r.note};});
  return out;
 }
 function format(value){
  if(!Number.isFinite(value))return 'Ikke defineret';
  const [coefficient,exponent='0']=Math.abs(value).toString().split('e'),[whole,tail='']=coefficient.split('.'),digits=whole+tail,point=whole.length+Number(exponent);
  const integer=point<=0?'0':digits.slice(0,point)+'0'.repeat(Math.max(0,point-digits.length));
  const fraction=point<=0?'0'.repeat(-point)+digits:digits.slice(point),places=Math.max(0,fraction.search(/[1-9]/))+3;
  let rounded=BigInt(integer+fraction.slice(0,places).padEnd(places,'0'));if(fraction[places]>='5')rounded++;
  const text=rounded.toString().padStart(places+1,'0'),a=text.slice(0,-places),b=text.slice(-places),keep=Math.max(0,b.search(/[1-9]/))+3;
  return (value<0&&rounded!==0n?'-':'')+a+','+b.slice(0,keep);
 }
 function context(task){
  const c=E.context(task.model),safe=c.safe;
  c.safe=(target,mode='expanded',result=false)=>{
   if(task.circuit){let status;try{status=root.SROCircuit.reduce(task.circuit);}catch(e){status={ok:false,error:e.message};}const rootId='formula:'+task.circuit.resultId;
    const affected=target===rootId||E.dependsOn(task.model,target,rootId);
    if(affected&&!status.ok)return {ok:false,error:status.error};
    if(affected)for(const id of status.used||[]){const r=safe('formula:'+id);if(r.ok){const n=E.evaluate(r.ast);if(n.status==='ready'&&n.value<=0)return {ok:false,error:'Modstandene skal være større end 0 Ω. Brug en ledning til en kortslutning.'};}}
   }
   return safe(target,mode,result);
  };return c;
 }
 root.SRO={empty,uid,clone,add,set,applyDefaults,validate,format,context};
})(globalThis);
