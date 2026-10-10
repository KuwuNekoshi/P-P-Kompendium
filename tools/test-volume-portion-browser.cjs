/* Optional acceptance for volume percentages in both offline P&P editions. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html']){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   const action=a=>page.locator(`[data-action="${a}"]`),input=(s,d)=>page.locator(`[data-action="input-value"][data-id$=":${s}:${d}"]`);
   const add=async(id,query)=>{await action('add-formula').first().click();if(query)await page.locator('[data-formula-search]').fill(query);await page.locator(`#app-dialog [data-formula="${id}"]`).click();};
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   if(edition==='index.html'){await action('new').click();await action('confirm').click();}
   await add('boxVolume');for(const s of ['L','B','h'])await input(s,'length').fill('2000');await input('h','length').press('Tab');
   await action('result-unit').selectOption('L');
   await add('volumePortion','delvolumen');
   assert.equal(await action('input-unit').filter({has:page.locator('option[value="percent"]')}).inputValue(),'percent');
   const source=page.locator('[data-action="source"][data-symbol="V_total"]');
   const ref=await source.locator('option[value^="ref:formula:"]').first().getAttribute('value');assert(ref);await source.selectOption(ref);
   assert.equal(await action('result-unit').inputValue(),'m3');
   if(await page.locator('#calculator-toggle').getAttribute('aria-pressed')==='false')await page.locator('#calculator-toggle').click();
   for(const [p,expected]of [['25','2,000'],['0','0,000'],['100','8,000'],['25','2,000']]){
    await input('f_vol','scalar').fill(p);await input('f_vol','scalar').press('Tab');assert.equal(await page.locator('.result-value strong').innerText(),expected);
   }
   assert.match(await page.locator('#formula-preview').innerText(),/0,25/);
   await action('result-unit').selectOption('L');assert.equal(await page.locator('.result-value strong').innerText(),'2000,000');
   await action('result-unit').selectOption('m3');
   await page.reload();
   if(edition==='index.html'){await page.locator('#calculator-toggle').click();assert.equal(await input('f_vol','scalar').inputValue(),'25');assert.equal(await page.locator('.result-value strong').innerText(),'2,000');}
   else {assert.equal(await page.locator('.saved-formula-row').count(),0);assert.equal(await action('export').count(),0);}
   // User's three-tank workflow: 64% is known, the remainder becomes a live reference.
   await add('massFlowPortion','Qm');
   await input('f_qm','scalar').fill('64');await input('f_qm','scalar').press('Tab');
   const totalId=await action('rearrange-formula').getAttribute('data-id'),before=await page.locator('.saved-formula-row').count();
   await action('rearrange-formula').selectOption('inverse:massFlowPortion:total');
   assert.equal(await page.locator('.saved-formula-row').count(),before);
   assert.equal(await action('rearrange-formula').getAttribute('data-id'),totalId);
   await input('Qm_del','massFlow').fill('6,4');await input('Qm_del','massFlow').press('Tab');
   assert.equal(await page.locator('.result-value strong').innerText(),'10,000');
   await add('percentageRemainder','restandel');
   const restId=await action('rearrange-formula').getAttribute('data-id');
   await input('f_1','scalar').fill('64');await input('f_2','scalar').fill('20');await input('f_2','scalar').press('Tab');
   assert.equal(await page.locator('.result-value strong').innerText(),'16,000');
   assert.equal(await action('result-unit').inputValue(),'percent');
   await add('massFlowPortion','Qm');
   await page.locator('[data-action="source"][data-symbol="Qm_total"]').selectOption('ref:formula:'+totalId);
   await page.locator('[data-action="source"][data-symbol="f_qm"]').selectOption('ref:formula:'+restId);
   assert.equal(await page.locator('.result-value strong').innerText(),'1,600');
   // Collapsing groups hides both move buttons and Edit, then restores usable controls.
   for(const name of ['Tank 1','Tank 2']){
    await action('new-formula-group').click();await page.locator('[data-group-name]').fill(name);await action('save-formula-group').click();
   }
   const toggle=action('toggle-formula-group').first(),groupId=await toggle.getAttribute('data-id'),group=page.locator('.saved-group').filter({has:page.locator(`[data-action="toggle-formula-group"][data-id="${groupId}"]`)});
   await page.locator(`[data-action="formula-group"][data-id="${totalId}"]`).selectOption(groupId);
   const openHeight=(await group.boundingBox()).height;
   await group.locator('[data-action="toggle-formula-group"]').click();
   for(const selector of ['[data-action="move-formula-group"][data-part="up"]','[data-action="move-formula-group"][data-part="down"]','[data-action="edit-formula-group"]'])assert.equal(await group.locator(selector).isVisible(),false);
   assert((await group.boundingBox()).height<openHeight);
   await group.locator('[data-action="toggle-formula-group"]').click();
   assert.equal(await group.locator('[data-action="edit-formula-group"]').isVisible(),true);
   await group.locator('[data-action="move-formula-group"][data-part="down"]').click();
   assert.equal(await action('toggle-formula-group').last().getAttribute('data-id'),groupId);
   await group.locator('[data-action="edit-formula-group"]').click();await page.locator('[data-group-name]').fill('Blanding');await action('save-formula-group').click();
   assert.match(await group.innerText(),/Blanding/);
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P volume portion acceptance passed: formula search, live volume reference in litres, percent default, 0/25/100%, decimal formula display, m³/litres, saved units, exam reset, 64% Qm inversion, 16% remainder reference and collapsible group controls.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
