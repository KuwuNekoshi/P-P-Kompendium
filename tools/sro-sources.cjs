'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function sources(){
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 let units=read('dist/units.js').replace('const definitions={',`const definitions={
 voltage:[['V','V'],['mV','mV',1,1000],['kV','kV',1000]],
 current:[['A','A'],['mA','mA',1,1000],['uA','µA',1,1000000]],
 resistance:[['ohm','Ω'],['kohm','kΩ',1000],['Mohm','MΩ',1000000]],
 frequency:[['Hz','Hz'],['kHz','kHz',1000]],`)
 .replace("temperature:[['K','K'],['C','°C',1,1,'273.15']]","temperature:[['C','°C'],['K','K',1,1,'-273.15']]")
 .replace("power:[['W','W'],['kW','kW',1000],['MW','MW',1000000]]","power:[['W','W'],['kW','kW',1000],['MW','MW',1000000],['hk','hk (≈736 W)',736]]");
 let custom=read('dist/custom-formula.js').replace('const validSymbol=',`for(const vector of Object.values(dimensions))vector.push(0);
 Object.assign(dimensions,{voltage:[2,1,-3,0,-1],current:[0,0,0,0,1],resistance:[2,1,-3,0,-2],frequency:[0,0,-1,0,0]});
 const validSymbol=`);
 return [['sro/catalog.js',read('sro/catalog.js')],['units.js',units],['rearrange.js',read('dist/rearrange.js')],['sro/rearrange.js',read('sro/rearrange.js')],['fill-height.js',read('dist/fill-height.js')],['custom-formula.js',custom],['engine.js',read('dist/engine.js')],['sro/core.js',read('sro/core.js')],['sro/circuit.js',read('sro/circuit.js')]];
}
function load(){const c=vm.createContext({console});for(const [file,text]of sources())vm.runInContext(text,c,{filename:file});return c;}
module.exports={sources,load};
