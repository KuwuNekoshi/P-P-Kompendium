/* Optional acceptance for independent formula duplicates in both offline P&P editions. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html']){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   const action=a=>page.locator(`[data-action="${a}"]`),input=(s,d)=>page.locator(`[data-action="input-value"][data-id$=":${s}:${d}"]`),row=id=>page.locator(`.saved-formula-row:has([data-action="select-formula"][data-id="${id}"])`);
   const selected=()=>page.locator('.saved-formula.active').getAttribute('data-id');
   const select=id=>page.locator(`[data-action="select-formula"][data-id="${id}"]`).click();
   const add=async id=>{await action('add-formula').first().click();await page.locator(`#app-dialog [data-formula="${id}"]`).click();return selected();};
   const set=async(s,d,v)=>{await input(s,d).fill(v);await input(s,d).press('Tab');};
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   if(edition==='index.html'){await action('new').click();await action('confirm').click();await page.locator('#calculator-toggle').click();}
   const small=await add('boxVolume');for(const s of ['L','B','h'])await set(s,'length','1000');
   const big=await add('boxVolume');for(const s of ['L','B','h'])await set(s,'length','2000');
   const original=await add('volumePortion');
   const source=()=>page.locator('[data-action="source"][data-symbol="V_total"]');
   await source().selectOption('ref:formula:'+big);await set('f_vol','scalar','25');
   assert.equal(await page.locator('.result-value strong').innerText(),'2,000');
   await row(original).locator('[data-action="formula-group"]').selectOption('+new');await page.locator('[data-group-name]').fill('Blanding');await action('save-formula-group').click();
   const groupId=await row(original).locator('[data-action="formula-group"]').inputValue();
   await row(original).locator('[data-action="duplicate-formula"]').click();const copy=await selected();assert.notEqual(copy,original);
   const order=await action('select-formula').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));assert.equal(order[order.indexOf(original)+1],copy);
   assert.equal(await row(copy).locator('[data-action="formula-group"]').inputValue(),groupId);
   assert.match(await row(copy).innerText(),/kopi/);assert.equal(await input('f_vol','scalar').inputValue(),'25');assert.equal(await source().inputValue(),'ref:formula:'+big);
   assert.equal(await page.locator('.result-value strong').innerText(),'2,000');
   await source().selectOption('ref:formula:'+small);await set('f_vol','scalar','50');await action('result-unit').selectOption('L');
   assert.equal(await page.locator('.result-value strong').innerText(),'500,000');
   await select(original);assert.equal(await source().inputValue(),'ref:formula:'+big);assert.equal(await input('f_vol','scalar').inputValue(),'25');assert.equal(await action('result-unit').inputValue(),'m3');assert.equal(await page.locator('.result-value strong').innerText(),'2,000');
   // Keyboard activation and the narrow sidebar both preserve usable controls.
   await page.setViewportSize({width:390,height:844});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await row(copy).locator('[data-action="duplicate-formula"]').focus();await page.keyboard.press('Enter');const third=await selected();assert.notEqual(third,copy);
   assert.equal(await source().inputValue(),'ref:formula:'+small);assert.equal(await page.locator('.result-value strong').innerText(),'500,000');
   const bounds=await row(third).locator('[data-action="duplicate-formula"]').boundingBox();assert(bounds&&bounds.width>=29&&bounds.height>=29);
   if(process.env.PP_SCREENSHOT_DIR){await page.setViewportSize({width:1512,height:982});await page.locator('.catalog').screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'duplicate-sidebar.png'),animations:'disabled'});}
   await page.reload();
   if(edition==='index.html'){
    await page.locator('#calculator-toggle').click();await select(original);assert.equal(await page.locator('.result-value strong').innerText(),'2,000');await select(copy);assert.equal(await page.locator('.result-value strong').innerText(),'500,000');
   }else assert.equal(await action('select-formula').count(),0);
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P duplicate browser acceptance passed: button, placement, group, deep copy, independent percent/reference/unit edits, keyboard/mobile, reopen and exam reset; no network requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
