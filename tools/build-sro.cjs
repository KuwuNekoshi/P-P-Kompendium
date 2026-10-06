'use strict';
const fs=require('node:fs'),path=require('node:path'),{sources}=require('./sro-sources.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function build(){
 const css=read('sro/styles.css');if(/<\/style/i.test(css))throw Error('Invalid stylesheet.');
 const scripts=[...sources(),['tour.js',read('dist/tour.js')],['sro/knowledge.js',read('sro/knowledge.js')],['sro/app.js',read('sro/app.js')]];
 const inline=scripts.map(([name,source])=>{if(/<\/script/i.test(source))throw Error('Invalid script '+name);return '<script>\n/* '+name+' */\n'+source+'\n</script>';}).join('\n');
 let html=read('sro/index.html').replace('<!-- STYLES -->',()=>'<style>\n'+css+'\n</style>').replace('<!-- SCRIPTS -->',()=>inline);
 for(const [edition,name]of [['standard','sro.html'],['exam','sro-eksamen.html']]){
  let output=html;if(edition==='exam')output=output.replace('data-edition="standard"','data-edition="exam"').replace('SRO — Almindelig version','SRO — Eksamensversion').replace('Almindelig · offline','Eksamen · offline').replace('Gemmes på denne computer','Eksamen · gemmes ikke').replace('aria-pressed="false">Lommeregner <b>Fra</b>','aria-pressed="true">Lommeregner <b>Til</b>').replace(/<button\b[^>]*data-standard-only[^>]*>[\s\S]*?<\/button>/g,'').replace(/<input\b[^>]*data-standard-only[^>]*>/g,'');
  fs.writeFileSync(path.join(root,name),output);console.log('Built '+name+' ('+Buffer.byteLength(output)+' bytes).');
 }
}
if(require.main===module)build();module.exports={build};
