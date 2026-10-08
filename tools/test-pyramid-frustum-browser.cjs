/* Optional offline acceptance for the rectangular pyramid frustum in P&P. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html']){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   const action=a=>page.locator(`[data-action="${a}"]`),number=(symbol)=>page.locator(`[data-action="input-value"][data-id$=":${symbol}:length"]`);
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   if(edition==='index.html'){await action('new').click();await action('confirm').click();}
   assert.equal(await page.locator('[data-action="add-shape"][data-type="pyramidFrustum"]').count(),1);
   await page.locator('[data-action="add-shape"][data-type="box"]').click();
   await page.locator('#inspector [data-action="join"][data-face="bottom"]').click();
   await action('join-target').selectOption('new:pyramidFrustum:top');await action('confirm-join').click();
   assert.match(await page.locator('#shape-count').innerText(),/1 figur · 2 dele/);
   assert.equal(await page.locator('#inspector .shared-measure').count(),2);
   const bottom=page.locator('#inspector [data-action="face-state"][data-face="bottom"]');await bottom.selectOption('open');
   assert.equal(await bottom.inputValue(),'open');await bottom.selectOption('closed');
   await page.locator('[data-action="use-assembly"][data-dimension="volume"][data-shape]').click();
   for(const [s,v]of Object.entries({L_1:'6000',B_1:'4000',h_1:'5000',l_2:'2000',b_2:'1000',h_2:'3000'}))await number(s).fill(v);
   await number('h_2').press('Tab');
   if(await page.locator('#calculator-toggle').getAttribute('aria-pressed')==='false')await page.locator('#calculator-toggle').click();
   assert.equal(await page.locator('.result-value strong').innerText(),'153,000');
   const isolation=action('isolate-figure-formula');assert.equal(await isolation.locator('option:disabled').count(),0);assert.equal(await isolation.locator('option').count(),7);
   await action('add-formula').first().click();await page.locator('[data-formula-search]').fill('Produkthøjde');await page.locator('#app-dialog [data-formula="fillHeight"]').click();
   await page.locator('[data-action="input-value"][data-id$=":V_produkt:volume"]').fill('45');await action('result-unit').selectOption('m');
   assert.equal(await page.locator('.result-value strong').innerText(),'3,500');
   // Verify the actual inverse step while the product is inside the taper.
   await page.locator('[data-action="input-value"][data-id$=":V_produkt:volume"]').fill(String(37/9));await page.locator('[data-action="input-value"][data-id$=":V_produkt:volume"]').press('Tab');
   assert.equal(await page.locator('.result-value strong').innerText(),'1,000');
   await page.locator('[data-action="geometry-view"][data-mode="sketch"]').click();assert.equal(await page.locator('.sketch-part').count(),2);
   await page.locator('[data-action="geometry-view"][data-mode="3d"]').click();assert.equal(await page.locator('.model-viewer-canvas').count(),1);
   await page.locator('.model-viewer-canvas').scrollIntoViewIfNeeded();await page.locator('.model-viewer-canvas').press('ArrowRight');
   if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'pyramid-frustum-'+edition+'.png'),animations:'disabled'});
   await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(edition==='eksamen.html'){assert.equal(await action('export').count(),0);await page.reload();assert.equal(await page.locator('.figure-card').count(),0);}
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P pyramid frustum acceptance passed in both offline editions: joining, independent bottom dimensions, plates, volume, isolation choices, partial/overflow Hx, 3D/sketch and mobile.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
