'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const file of ['sro.html','sro-eksamen.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)],markup=html.slice(0,html.indexOf('<script>'));
 assert.equal(scripts.length,12,file);scripts.forEach((s,i)=>new vm.Script(s[1],{filename:file+':'+i}));
 assert(!/<script[^>]+src=|<link[^>]+rel="stylesheet"|@import\b/.test(html));
 assert(html.includes("connect-src 'none'"));assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(html));
 const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert(markup.includes('id="calculator-toggle"'));assert(markup.includes('id="help-button"'));
 if(file.includes('eksamen')){assert(markup.includes('data-edition="exam"'));assert(!/data-action="(?:import|export)"|id="file-input"/.test(markup));assert(markup.includes('aria-pressed="true">Lommeregner <b>Til</b>'));}
 else assert(markup.includes('data-edition="standard"'));
}
console.log('SRO: both self-contained editions, script syntax, CSP and exam controls passed.');
