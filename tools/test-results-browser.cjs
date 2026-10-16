/* Acceptance of marked results, group ordering, live updates and persistence. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html']){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   const action=a=>page.locator(`[data-action="${a}"]`),tab=view=>page.locator(`[data-view="${view}"]`).click(),input=(s,d)=>page.locator(`[data-action="input-value"][data-id$=":${s}:${d}"]`);
   const add=async id=>{await tab('builder');await action('add-formula').first().click();await page.locator(`#app-dialog [data-formula="${id}"]`).click();return page.locator('.saved-formula.active').getAttribute('data-id');};
   const select=id=>page.locator(`.saved-formula[data-id="${id}"]`).click(),set=async(s,d,v)=>{await input(s,d).fill(v);await input(s,d).press('Tab');};
   const row=id=>page.locator(`#panel-results [data-result-id="${id}"]`),value=id=>row(id).locator('.result-value strong').innerText(),mark=()=>action('mark-result').check();
   const group=async(name,id)=>{await page.locator(`[data-action="formula-group"][data-id="${id}"]`).selectOption('+new');await page.locator('[data-group-name]').fill(name);await action('save-formula-group').click();return page.locator(`[data-action="formula-group"][data-id="${id}"]`).inputValue();};
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   const officeMath=await page.evaluate(()=>globalThis.PPResultExport.omml('<mrow><mfrac><msub><mi>A</mi><mn>1</mn></msub><msqrt><mi>x</mi></msqrt></mfrac><mo>+</mo><msup><mi>y</mi><mn>2</mn></msup></mrow>',text=>new DOMParser().parseFromString(text,'application/xml').documentElement));
   for(const tag of ['m:f','m:num','m:den','m:sSub','m:rad','m:sSup'])assert(officeMath.includes('<'+tag+'>'),tag+' must remain a native Word equation element');
   if(edition==='index.html'){await action('new').click();await action('confirm').click();await page.locator('#calculator-toggle').click();}
   const gravity=await add('gravityForce');assert(await action('mark-result').isDisabled());await set('m','mass','2');
   const resultBox=await page.locator('.result-main').boundingBox(),markerBox=await page.locator('.result-marker').boundingBox();assert(markerBox.x>=resultBox.x+resultBox.width,'marker lies to the right of the result');
   await action('mark-result').focus();await page.keyboard.press('Space');assert(await action('mark-result').isChecked());
   const forceGroup=await group('Kræfter',gravity);
   await action('search-goal').click();assert.equal(await page.locator('[data-value^="saved:"]').count(),0);await page.locator('[data-formula-search]').fill('Fyldetid');await page.locator('[data-value="new:fillTime"]').click();const time=await page.locator('.saved-formula.active').getAttribute('data-id');
   await set('V','volume','2');await set('Q_v','flow','1');await action('result-unit').selectOption('tms');await mark();const timeGroup=await group('Tider',time);
   const area=await add('rectangleArea');await page.locator(`[data-action="formula-group"][data-id="${area}"]`).selectOption('');
   await page.locator('[data-action="input-unit"][data-symbol="B"]').selectOption('m');await page.locator('[data-action="input-unit"][data-symbol="L"]').selectOption('m');await set('B','length','2,003234');await set('L','length','1000');await mark();
   const unmarked=await add('gravityForce');await set('m','mass','3');
   await tab('results');assert.equal(await page.locator('#panel-results .result-card').count(),3);assert.deepEqual(await page.locator('.results-group h3').allTextContents(),['Kræfter','Tider','Uden gruppe']);assert.equal(await row(unmarked).count(),0);
   assert.equal(await value(gravity),'19,640');assert.equal(await value(time),'02:00:00');assert.equal(await value(area),'2003,234');
   if(edition==='eksamen.html')assert.equal(await action('export-results').count(),0);
   else for(const format of ['docx','pdf'])for(const mode of ['none','compact','simple','expanded']){
    await action('export-results').click();assert.equal(await page.locator('[data-result-mode]').inputValue(),'compact');
    assert.deepEqual(await page.locator('[data-result-mode] option').allTextContents(),['Ingen','Kort','Simpel','Fuld']);
    await page.locator('[data-result-format]').selectOption(format);await page.locator('[data-result-mode]').selectOption(mode);
    const downloading=page.waitForEvent('download');await action('confirm-result-export').click();const download=await downloading,bytes=fs.readFileSync(await download.path());
    assert(download.suggestedFilename().endsWith('-resultater.'+format));
    if(format==='docx'){
     assert.equal(bytes.readUInt32LE(0),0x04034b50);const text=bytes.toString('utf8');assert(text.includes('19,640'));assert(text.includes('02:00:00'));assert(text.includes('2003,234'));assert(text.includes('timer:minutter:sekunder'));assert.equal((text.match(/<m:oMath>/g)||[]).length,mode==='none'?3:6);assert(text.includes('<m:sSub>'),'output subscripts must be native Word subscripts');
    }else{assert.equal(bytes.subarray(0,8).toString(),'%PDF-1.4');assert(bytes.toString('latin1').includes('/Subtype /Image'));}
    if(process.env.PP_EXPORT_DIR){fs.mkdirSync(process.env.PP_EXPORT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.PP_EXPORT_DIR,mode+'.'+format),bytes);}
   }
   const left=await row(gravity).locator('.result-card-value').boundingBox(),right=await row(gravity).locator('.result-card-formula').boundingBox();assert(right.x>=left.x+left.width,'short formula is to the right');assert(await row(gravity).locator('math').count());
   await page.locator(`[data-action="move-formula-group"][data-id="${timeGroup}"][data-part="up"]`).click();assert.deepEqual(await page.locator('.results-group h3').allTextContents(),['Tider','Kræfter','Uden gruppe']);
   await row(gravity).locator('[data-action="select-formula"]').click();assert(await page.locator('#panel-builder').isVisible());await set('m','mass','5');await action('result-unit').selectOption('kN');await tab('results');assert.equal(await value(gravity),'0,0491');assert.match(await row(gravity).innerText(),/kN/);
   await page.locator('#calculator-toggle').click();assert.equal(await page.locator('#panel-results output').count(),0);assert.match(await page.locator('#panel-results').innerText(),/Slå lommeregneren til/);await page.locator('#panel-results [data-action="toggle-calculator"]').click();assert.equal(await value(gravity),'0,0491');
   await row(gravity).locator('[data-action="select-formula"]').click();await page.locator(`[data-action="duplicate-formula"][data-id="${gravity}"]`).click();assert(!(await action('mark-result').isChecked()));await tab('results');assert.equal(await page.locator('#panel-results .result-card').count(),3);
   await row(area).locator('[data-action="select-formula"]').click();await page.locator('[data-action="clear-value"][data-id$=":B:length"]').click();assert(await action('mark-result').isChecked());await tab('results');assert.equal(await row(area).locator('output').count(),0);assert.match(await row(area).innerText(),/manglende værdier/);
   await row(area).locator('[data-action="select-formula"]').click();await set('B','length','2,003234');await tab('results');assert.equal(await value(area),'2003,234');
   if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'results-'+edition+'.png'),fullPage:true});
   await page.locator('#tab-standards').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-results').getAttribute('aria-selected'),'true');
   await action('theme').click();await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'results-mobile-'+edition+'.png'),fullPage:true});
   await page.setViewportSize({width:1512,height:982});
   if(edition==='index.html'){
    await page.reload();await page.locator('#calculator-toggle').click();await tab('results');assert.equal(await page.locator('#panel-results .result-card').count(),3);assert.equal(await value(area),'2003,234');
    await action('export').click();const downloading=page.waitForEvent('download');await action('confirm-export').click();const file=await (await downloading).path(),saved=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(saved.formulas.filter(f=>f.isResult).length,3);
    await action('new').click();await action('confirm').click();await page.locator('#file-input').setInputFiles(file);await action('confirm').click();await tab('results');assert.equal(await page.locator('#panel-results .result-card').count(),3);
   }
   await row(time).locator('[data-action="remove-result"]').click();assert.equal(await row(time).count(),0);assert.equal(await page.locator(`[data-action="formula-group"][data-id="${time}"]`).inputValue(),timeGroup);
   await row(gravity).locator('[data-action="select-formula"]').click();await action('mark-result').uncheck();await tab('results');assert.equal(await row(gravity).count(),0);
   await row(area).locator('[data-action="select-formula"]').click();await page.locator(`#inspector [data-action="delete"][data-id="${area}"]`).click();await action('confirm').click();await tab('results');assert.match(await page.locator('#panel-results').innerText(),/Ingen markerede resultater endnu/);
   if(edition==='eksamen.html'){await page.reload();await tab('results');assert.equal(await page.locator('.saved-formula-row').count(),0);assert.match(await page.locator('#panel-results').innerText(),/Ingen markerede resultater endnu/);}
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P results browser acceptance passed in both editions: markers, new-formula search, groups/order, compact formulas, units/live values, calculator toggle, missing values, duplicate/removal/deletion, export/import/reopen, keyboard/mobile/dark theme and exam reset; no network requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
