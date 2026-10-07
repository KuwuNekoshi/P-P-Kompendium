/* Optional browser acceptance for duration formats in all four offline editions. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
 for(const file of ['index.html','eksamen.html','sro.html','sro-eksamen.html']){
  const sro=file.startsWith('sro'),exam=file.includes('eksamen'),context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(pathToFileURL(path.resolve(__dirname,'..',file)).href);
  if(sro){await page.locator('[data-action="library"]').first().click();await page.locator('[data-action="add-formula"][data-id="timeSum"]').click();}
  else{await page.locator('#tab-library').click();await page.locator('[data-action="use-formula"][data-formula="timeSum"]').click();}
  if(await page.locator('#calculator-toggle').getAttribute('aria-pressed')==='false')await page.locator('#calculator-toggle').click();
  const attr=sro?'data-key':'data-id',input=symbol=>page.locator(`input[data-action="input-value"][${attr}$=":${symbol}:time"]`),unit=symbol=>page.locator(`select[data-action="input-unit"][${attr}$=":${symbol}:time"]`),output=page.locator(sro?'.result strong':'.result-value strong');
  await unit('t_1').selectOption('h');await input('t_1').fill('8');await unit('t_2').selectOption('h');await input('t_2').fill('12,34');
  assert.equal(await output.innerText(),'20:20:24',file);
  await unit('t_2').selectOption('tms');assert.equal(await input('t_2').inputValue(),'12:20:24');assert.equal(await output.innerText(),'20:20:24');
  await input('t_2').fill('25:01:02,003234');assert.equal(await output.innerText(),'33:01:02,00323');
  assert.match(await page.locator(sro?'.math-wrap':'.formula-display').innerText(),/90062,003234/);
  await input('t_2').fill('25:60:00');assert.equal(await input('t_2').getAttribute('aria-invalid'),'true');assert.equal(await output.count(),0,'invalid TMS must not retain a previous answer');
  await input('t_2').fill('12:20:24');await page.locator('[data-action="result-unit"]').selectOption('h');assert.equal(await output.innerText(),'20,340');
  await page.locator('[data-action="result-unit"]').selectOption('tms');assert.equal(await output.innerText(),'20:20:24');
  if(!exam){
   const stored=await page.evaluate(sro=>JSON.parse(localStorage.getItem(sro?'sro-kompendium-task-v1':'pp-kompendium.symbolic.v2')),sro),m=sro?stored.model:stored,f=m.formulas.find(f=>f.expression.formula==='timeSum');
   assert.equal(f.resultUnit,'tms');assert.equal(m.inputValues[`formula:${f.id}:t_2:time`],'44424');
   if(process.env.TIME_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.TIME_SCREENSHOT_DIR,sro?'tms-sro.png':'tms-pp.png'),fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' fits a mobile viewport');
  if(exam){await page.reload();assert.equal(await page.locator(sro?'.task-row':'input[data-action="input-value"]').count(),0);}
  assert.deepEqual(errors,[],file);assert.deepEqual(requests,[],file);await context.close();console.log(file+': TMS, decimal hours, mixed formats, invalid input, precision, mobile and offline passed.');
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
