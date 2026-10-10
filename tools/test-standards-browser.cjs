/* Acceptance for constants, custom standards and compact figure/reference UI. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html']){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   const action=a=>page.locator(`[data-action="${a}"]`),input=(s,d)=>page.locator(`[data-action="input-value"][data-id$=":${s}:${d}"]`),standard=(s,d)=>page.locator(`[data-action="input-standard"][data-id$=":${s}:${d}"]`);
   const add=async id=>{await action('add-formula').first().click();await page.locator(`#app-dialog [data-formula="${id}"]`).click();return page.locator('.saved-formula.active').getAttribute('data-id');};
   const select=id=>page.locator(`[data-action="select-formula"][data-id="${id}"]`).click();
   const set=async(s,d,v)=>{await input(s,d).fill(v);await input(s,d).press('Tab');};
   const result=()=>page.locator('.result-value strong').innerText();
   const tab=view=>page.locator(`[data-view="${view}"]`).click();
   const sugar=async()=>{await tab('standards');await action('add-standard').click();await page.locator('[data-standard-name]').fill('Sukker · opgavens densitet');await page.locator('[data-standard-value]').fill('0,8');await page.locator('[data-action="standard-unit-part"][data-part="numerator"]').selectOption('kg');await page.locator('[data-action="standard-unit-part"][data-part="denominator"]').selectOption('L');assert.equal(await page.locator('[data-standard-unit]').getAttribute('data-unit'),'kg_L');await action('save-standard').click();return page.locator('[data-action="edit-standard"]').first().getAttribute('data-id');};
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   if(edition==='index.html'){await action('new').click();await action('confirm').click();await page.locator('#calculator-toggle').click();}
   const gravity=await add('gravityForce');assert.equal(await input('g','acceleration').inputValue(),'9.82');await set('m','mass','2');assert.equal(await result(),'19,640');
   await set('g','acceleration','9,7');assert.equal(await result(),'19,400');
   await page.locator('[data-action="clear-value"][data-id$=":g:acceleration"]').click();assert.equal(await input('g','acceleration').inputValue(),'');await set('m','mass','3');assert.equal(await input('g','acceleration').inputValue(),'');
   await standard('g','acceleration').selectOption('standard-gravity');assert.equal(await result(),'29,460');
   const heat=await add('heatingEnergy');
   assert.equal(await page.locator('[data-action="input-unit-part"][data-id$=":c_p:heatCapacity"][data-part="numerator"]').inputValue(),'kJ');
   assert.equal(await page.locator('[data-action="input-unit-part"][data-id$=":c_p:heatCapacity"][data-part="denominator"]').inputValue(),'kg_C');
   await standard('c_p','heatCapacity').selectOption('standard-water-heat');await set('m','mass','2');await set('ΔT','temperatureChange','10');await action('result-unit').selectOption('kJ');assert.equal(await result(),'83,600');
   await set('c_p','heatCapacity','2');assert.equal(await result(),'40,000');
   await tab('standards');assert(await page.locator('#panel-standards').isVisible());assert(!(await page.locator('#panel-library').isVisible()));
   assert.match(await page.locator('#panel-standards').innerText(),/9,82 m\/s²/);assert.match(await page.locator('#panel-standards').innerText(),/4,18 kJ\/\(kg·°C\)/);
   await action('add-standard').click();await page.locator('[data-standard-name]').fill('Fejl');await page.locator('[data-standard-value]').fill('abc');await action('save-standard').click();assert(await page.locator('#app-dialog').evaluate(d=>d.open));assert.match(await page.locator('[data-standard-error]').innerText(),/gyldig talværdi/);await action('close-dialog').first().click();
   const sugarId=await sugar();await tab('builder');const mass=await add('mass');
   assert(await standard('ρ','density').locator(`option[value="${sugarId}"]`).count());assert.equal(await standard('V','volume').count(),0);
   await standard('ρ','density').selectOption(sugarId);assert.equal(await input('ρ','density').inputValue(),'0.8');await set('V','volume','2');assert.equal(await result(),'1600,000');
   await tab('standards');await action('edit-standard').first().click();assert.equal(await page.locator('[data-action="standard-unit-part"][data-part="denominator"]').inputValue(),'L');await page.locator('[data-standard-value]').fill('1');await page.locator('[data-action="standard-unit-part"][data-part="numerator"]').selectOption('g');await page.locator('[data-action="standard-unit-part"][data-part="denominator"]').selectOption('cm3');assert.equal(await page.locator('[data-standard-unit]').getAttribute('data-unit'),'g_cm3');await action('save-standard').click();await tab('builder');assert.equal(await result(),'1600,000');await set('ρ','density','0,9');assert.equal(await result(),'1800,000');
   // Persist and round-trip standards through the actual normal-edition file controls.
   if(edition==='index.html'){
    await action('export').click();const downloading=page.waitForEvent('download');await action('confirm-export').click();const download=await downloading,file=await download.path(),saved=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.equal(saved.standards[0].value,'1');assert.equal(saved.standards[0].unit,'g_cm3');await action('new').click();await action('confirm').click();await action('import').click();await page.locator('#file-input').setInputFiles(file);await action('confirm').click();await select(mass);assert.equal(await result(),'1800,000');
   }
   await tab('standards');await action('remove-standard').first().click();await tab('builder');assert.equal(await standard('ρ','density').count(),0);assert.equal(await result(),'1800,000');
   await action('add-shape').filter({has:page.locator('svg')}).first().click();
   const volume=await add('boxVolume');for(const s of ['L','B','h'])await set(s,'length','1000');await select(mass);
   const source=page.locator('[data-action="source"][data-symbol="V"]');
   const groups=await source.locator('optgroup').evaluateAll(nodes=>nodes.map(n=>({label:n.label,values:[...n.children].map(o=>o.value)})));
   const own=groups.find(g=>g.label==='Brug en reference'),figures=groups.find(g=>g.label==='Figur referencer');assert(own.values.includes('ref:formula:'+volume));assert(!own.values.some(v=>v.startsWith('ref:shape:')));assert(figures.values.some(v=>v.startsWith('ref:shape:')));
   assert(!await source.locator('option[value="assembly"]').count());assert(!await source.locator('option[value^="material"]').count());
   const order=await source.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));assert.equal(order[0],'symbol');assert.equal(order[1],'custom');assert.equal(order[2],'ref:formula:'+volume);
   await source.selectOption('ref:formula:'+volume);assert.equal(await result(),'900,000');
   for(const key of ['insert-figures','choose-figures','assembly-figures'])await page.locator(`details[data-detail-key="${key}"]>summary`).click();
   await set('ρ','density','1');for(const key of ['insert-figures','choose-figures','assembly-figures'])assert.equal(await page.locator(`details[data-detail-key="${key}"]`).evaluate(d=>d.open),false);
   assert.equal(await result(),'1000,000');
   if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'folded-builder-'+edition+'.png'),fullPage:true});
   await page.locator('details[data-detail-key="assembly-figures"]>summary').focus();await page.keyboard.press('Enter');assert(await page.locator('.model-viewer-canvas').isVisible());
   await select(gravity);await select(heat);assert.equal(await result(),'40,000');
   await sugar();
   if(process.env.PP_SCREENSHOT_DIR){await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'standards-'+edition+'.png'),fullPage:true});}
   await action('theme').click();await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await action('add-standard').click();await page.locator('[data-standard-dimension]').selectOption('heatCapacity');assert.equal(await page.locator('[data-standard-unit]').getAttribute('data-unit'),'kJ_kgC');assert.equal(await page.locator('[data-action="standard-unit-part"][data-part="numerator"]').inputValue(),'kJ');assert.equal(await page.locator('[data-action="standard-unit-part"][data-part="denominator"]').inputValue(),'kg_C');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await action('close-dialog').first().click();
   if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'standards-mobile-'+edition+'.png'),fullPage:true});
   await page.reload();await tab('standards');
   if(edition==='index.html'){assert.equal(await action('edit-standard').count(),1);await tab('builder');await select(gravity);assert.equal(await input('g','acceleration').inputValue(),'9.82');}
   else{assert.equal(await action('edit-standard').count(),0);assert.equal(await action('select-formula').count(),0);}
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P standards browser acceptance passed in both editions: g default/edit/clear, water/SI, custom standards/edit/delete/filter, export/import/reopen, references, folding, keyboard/mobile/dark theme and exam reset; no network requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

