'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
for (const [, file] of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (file.startsWith('data:')) continue;
  assert(!/^(?:https?:)?\/\//i.test(file), 'External asset: ' + file);
  assert(fs.existsSync(path.join(root, 'dist', file)), 'Missing asset: ' + file);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(!/<script[^>]+src=/i.test(html), 'Standalone scripts must be inline.');
assert(!/<link[^>]+rel="stylesheet"/i.test(html), 'Standalone styles must be inline.');
assert(html.includes("connect-src 'none'"), 'Offline page must block network connections.');
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(html), 'Unexpected network API.');
assert(!/type="number"|inputmode="decimal"/.test(html), 'This is a symbolic compendium, not a numeric calculator.');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 6);
for (const [i, [, script]] of scripts.entries()) new vm.Script(script, { filename: 'inline-' + i + '.js' });
assert(html.indexOf('<script>') > html.indexOf('id="app-dialog"'), 'Inline app must run after its markup.');
const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate static element IDs.');
const app = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8');
for (const [, id] of app.matchAll(/\$\('#([\w-]+)'\)/g)) assert(ids.includes(id), 'Missing static element #' + id);
const config = JSON.parse(fs.readFileSync(path.join(root, '.openai/hosting.json'), 'utf8'));
assert.equal(config.static.directory, 'dist');
console.log('Static entry points, inline script order, JavaScript syntax, asset references and offline constraints passed.');
