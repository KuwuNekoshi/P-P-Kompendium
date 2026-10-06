/* Optional real-browser acceptance checks. See SRO.md for environment variables. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1512,height:982},acceptDownloads:true}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});page.on('dialog',d=>d.accept());
 const root=path.resolve(__dirname,'..'),go=name=>page.goto(pathToFileURL(path.join(root,name)).href),click=(a)=>page.locator('[data-action="'+a+'"]');
 const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sro-kompendium-task-v1')));
 await go('sro.html');await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.locator('.tabs [data-tab="circuit"]').click();await click('add-resistor').click();await page.locator('[data-action="input-value"]').fill('100');await click('add-resistor').click();await page.locator('[data-action="input-value"]').fill('200');
 let saved=await data(),[r1,r2]=saved.circuit.resistors;assert.equal(saved.circuit.resistors.length,2);
 const terminal=id=>page.locator('[data-terminal="'+id+'"]');
 await terminal('source:plus').click();await terminal(r1.id+':a').click();await terminal(r1.id+':b').click();await terminal(r2.id+':a').click();await terminal(r2.id+':b').click();await terminal('source:minus').click();
 saved=await data();assert.equal(saved.circuit.wires.length,3);
 await click('calculator').click();assert.match(await page.locator('#circuit-summary').innerText(),/300,000/);
 const part=page.locator('[data-component="'+r1.id+'"] rect'),box=await part.boundingBox();await page.mouse.move(box.x+20,box.y+10);await page.mouse.down();await page.mouse.move(box.x+60,box.y+70,{steps:8});await page.mouse.up();
 saved=await data();assert.notEqual(saved.circuit.resistors[0].y,r1.y);assert.equal(saved.circuit.wires.length,3);
 await click('rotate').click();saved=await data();assert.equal(saved.circuit.resistors[0].vertical,true);
 await page.locator('[data-component="source"] circle.part').click();await page.locator('[data-action="input-value"]').fill('12');await click('circuit-current').click();assert.match(await page.locator('#formula-preview').innerText(),/0,0400/);
 const beforeCount=(await data()).model.formulas.length;await page.locator('[data-action="isolate"]').selectOption('ohm');assert.equal((await data()).model.formulas.length,beforeCount);assert.equal((await data()).model.formulas.at(-1).dimension,'voltage');
 await click('library').first().click();await page.locator('[data-action="search"]').fill('effekt');assert.ok(await page.locator('.library-item').count()>1);await click('close-dialog').click();
 await click('library').first().click();await page.locator('[data-action="add-formula"][data-id="shaftPower"]').click();
 await page.getByRole('textbox',{name:'Tal for P_1',exact:true}).fill('5');await page.locator('[data-action="input-unit"][data-dimension="power"]').selectOption('kW');await page.getByRole('textbox',{name:'Tal for η',exact:true}).fill('87');assert.match(await page.locator('#formula-preview').innerText(),/4350,000/);assert.match(await page.locator('#formula-preview').innerText(),/0,87/);
 await page.locator('.tabs [data-tab="tools"]').click();await page.locator('[data-action="view"][data-key="motor"]').selectOption('delta');await page.locator('[data-action="tool-formula"][data-value="motor-chain"]').click();assert.ok((await data()).model.formulaGroups.some(g=>g.name==='Motor'));
 await page.locator('.tabs [data-tab="tools"]').click();await page.locator('[data-action="tool-formula"][data-value="transmitter"]').click();assert.match(await page.locator('#formula-preview').innerText(),/50,000/);
 await page.locator('.tabs [data-tab="knowledge"]').click();await page.locator('[data-action="knowledge-section"][data-value="components"]').click();assert.equal(await page.locator('.atlas-card').count(),24);await page.locator('.atlas-card summary').first().click();await page.locator('[data-action="view-toggle"][data-key="logicA"]').click();assert.match(await page.locator('#content').innerText(),/OR: tryk på udgangen/);
 await page.locator('[data-action="knowledge-section"][data-value="io"]').click();await click('io-example').click();await page.locator('[data-action="io-edit"][data-index="0"][data-key="name"]').fill('Test start');await page.locator('h2').first().click();assert.equal((await data()).ioRows[0].name,'Test start');
 // Import/export is an actual browser download and upload.
 const downloadEvent=page.waitForEvent('download');await click('export').click();const download=await downloadEvent,downloadPath=await download.path();await click('new-task').click();assert.equal((await data()).model.formulas.length,0);await page.locator('#file-input').setInputFiles(downloadPath);await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sro-kompendium-task-v1')).model.formulas.length>0);assert.equal((await data()).ioRows[0].name,'Test start');
 const original=JSON.stringify(await data());await click('tutorial').click();for(let i=0;i<11;i++){assert.match(await page.locator('.tour-counter').innerText(),new RegExp('TRIN '+(i+1)+' AF 11'));await page.locator('[data-tour="next"]').click();}assert.equal(await page.locator('.tour-dialog').count(),0);assert.equal(JSON.stringify(await data()),original);
 await page.locator('.tabs [data-tab="circuit"]').click();await click('theme').click();if(process.env.SRO_SCREENSHOT_DIR){await page.screenshot({path:path.join(process.env.SRO_SCREENSHOT_DIR,'sro-circuit-dark.png'),animations:'disabled'});}await click('theme').click();
 // Deletion and undo change the topology and preserve references safely.
 saved=await data();r1=saved.circuit.resistors[0];await page.locator('[data-component="'+r1.id+'"] rect').click();await click('delete-component').click();assert.match(await page.locator('#circuit-summary').innerText(),/Ingen sammenhængende/);await click('undo').click();assert.equal((await data()).circuit.resistors.length,2);
 // Sticky inspector and phone layout.
 assert.equal(await page.locator('#inspector').evaluate(e=>getComputedStyle(e).position),'sticky');
 await page.setViewportSize({width:390,height:844});await page.locator('.tabs [data-tab="formula"]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(process.env.SRO_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SRO_SCREENSHOT_DIR,'sro-mobile.png'),fullPage:true});
 // Normal restores; exam starts empty every time without task import/export.
 await page.reload();assert.ok((await data()).model.formulas.length>0);await go('sro-eksamen.html');assert.equal(await page.locator('.task-row').count(),0);assert.equal(await click('export').count(),0);assert.equal(await click('import').count(),0);assert.equal(await click('calculator').getAttribute('aria-pressed'),'true');await click('library').first().click();await page.locator('[data-action="add-formula"][data-id="ohm"]').click();await page.reload();assert.equal(await page.locator('.task-row').count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);console.log('SRO browser acceptance passed: real wire clicks, dragging, rotation, references, units, inverse replacement, import/export, tutorial, mobile and exam reset; no network requests.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
