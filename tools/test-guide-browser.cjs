/* Walk the real guide and verify its temporary examples restore the user's task. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  for(const edition of ['index.html','eksamen.html'])for(const width of [1512,390]){
   const context=await browser.newContext({viewport:{width:1512,height:982}}),page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
   await page.addInitScript(()=>{window.taskWrites=[];const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='pp-kompendium.symbolic.v2')window.taskWrites.push(value);return original.call(this,key,value);};});
   const action=a=>page.locator(`[data-action="${a}"]`),tab=view=>page.locator(`[data-view="${view}"]`).click(),input=(s,d)=>page.locator(`[data-action="input-value"][data-id$=":${s}:${d}"]`);
   const next=()=>page.locator('[data-tour="next"]').click(),title=()=>page.locator('#tour-title').innerText(),result=()=>page.locator('#formula-preview .result-value strong').innerText();
   const state=()=>page.evaluate(()=>({title:document.querySelector('#project-title').value,view:document.querySelector('[data-view][aria-selected="true"]').dataset.view,calculator:document.querySelector('#calculator-toggle').getAttribute('aria-pressed'),formulas:[...document.querySelectorAll('.saved-formula')].map(f=>({id:f.dataset.id,text:f.textContent})),results:[...document.querySelectorAll('#panel-results .result-card')].map(r=>({id:r.dataset.resultId,text:r.textContent})),stored:localStorage.getItem('pp-kompendium.symbolic.v2'),writes:window.taskWrites.length}));
   const screenshot=async name=>{if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,`guide-${name}-${width}-${edition}.png`),animations:'disabled'});};
   await page.goto(pathToFileURL(path.resolve(__dirname,'..',edition)).href);
   if(edition==='index.html'){await action('new').click();await action('confirm').click();await page.locator('#calculator-toggle').click();}
   await action('add-formula').first().click();await page.locator('#app-dialog [data-formula="gravityForce"]').click();await input('m','mass').fill('2');await input('m','mass').press('Tab');await action('mark-result').check();
   await page.locator('#project-title').fill('Min opgave før guiden');await page.locator('#project-title').press('Tab');
   await tab('standards');await action('add-standard').click();await page.locator('[data-standard-name]').fill('Min standard');await page.locator('[data-standard-value]').fill('1,23');await action('save-standard').click();
   await tab('results');await page.setViewportSize({width,height:width===390?844:982});const original=await state();assert.equal(original.results.length,1);
   await action('tutorial').click();const seen=new Set();let count=0;
   while(await page.locator('.tour-dialog').count()){
    assert(++count<80,'guide should finish');const heading=await title();
    const counter=await page.locator('.tour-counter').innerText();assert.match(counter,new RegExp('TRIN '+count+' AF '));
    let teaching=false;
    if(heading==='Find standarder og omregninger'){
     teaching=true;seen.add('standards');assert.equal(await page.locator('#tab-standards').getAttribute('aria-selected'),'true');assert.match(await page.locator('#panel-standards').innerText(),/9,82 m\/s²/);assert.match(await page.locator('#panel-standards').innerText(),/4,18 kJ\/\(kg·°C\)/);
    }else if(heading==='Vælg standardens enhed i dele'){
     teaching=true;seen.add('unit-parts');assert(await page.locator('#app-dialog').evaluate(d=>d.open));assert.equal(await page.locator('[data-action="standard-unit-part"][data-part="numerator"]').inputValue(),'kg');assert.equal(await page.locator('[data-action="standard-unit-part"][data-part="denominator"]').inputValue(),'L');await screenshot('unit-parts');
    }else if(heading==='Indsæt en standard i et talfelt'){
     teaching=true;seen.add('standard-input');assert(!(await page.locator('#app-dialog').evaluate(d=>d.open)));assert.equal(await input('ρ','density').inputValue(),'0.8');assert.equal(await page.locator('[data-action="input-unit-part"][data-part="denominator"]').inputValue(),'L');assert.equal(await result(),'1600,000');assert(await page.locator('[data-action="input-standard"] option[value="tutorial-sugar"]').count());
    }else if(heading==='Brug vandets varmekapacitet'){
     teaching=true;seen.add('water');assert.equal(await input('c_p','heatCapacity').inputValue(),'4.18');assert.equal(await page.locator('[data-action="input-unit-part"][data-id$=":c_p:heatCapacity"][data-part="numerator"]').inputValue(),'kJ');assert.equal(await page.locator('[data-action="input-unit-part"][data-id$=":c_p:heatCapacity"][data-part="denominator"]').inputValue(),'kg_C');assert.equal(await page.locator('[data-action="input-unit"][data-id$=":ΔT:temperatureChange"]').inputValue(),'C');assert.equal(await result(),'83,600');await screenshot('water');
    }else if(heading==='Markér et svar som resultat'){
     teaching=true;seen.add('marker');assert.equal(await result(),'1500,000');assert(await action('mark-result').isChecked());assert.equal(await page.locator('#calculator-toggle').getAttribute('aria-pressed'),'true');await screenshot('marker');
    }else if(heading==='Se resultaterne samlet efter gruppe'){
     teaching=true;seen.add('results');assert.equal(await page.locator('#tab-results').getAttribute('aria-selected'),'true');assert.deepEqual(await page.locator('.results-group h3').allTextContents(),['Arealer','Tider']);assert.deepEqual(await page.locator('#panel-results .result-value strong').allTextContents(),['1500,000','90,000']);assert.equal(await page.locator('.result-card-formula math').count(),2);await screenshot('results');
     await page.locator('[data-tour="previous"]').click();assert.equal(await title(),'Markér et svar som resultat');await next();assert.equal(await title(),heading);
    }
    if(teaching){
     const spotlight=await page.locator('.tour-spotlight').boundingBox(),card=await page.locator('.tour-card').boundingBox();assert(spotlight.width>20&&spotlight.height>20,'teaching target must be visible');assert(card.x>=0&&card.x+card.width<=width+1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    }
    await next();
   }
   assert.deepEqual([...seen],['standards','unit-parts','standard-input','water','marker','results']);assert.deepEqual(await state(),original);assert(!(await page.locator('#app-dialog').evaluate(d=>d.open)));
   await tab('standards');assert.match(await page.locator('#panel-standards').innerText(),/Min standard/);assert.equal(await action('edit-standard').count(),1);assert(!(await page.locator('#panel-standards').innerText()).includes('Sukker · opgavens densitet'));await tab('results');
   // Ending inside a nested example dialog must also restore the original view/data.
   await action('tutorial').click();for(let i=0;await title()!=='Vælg standardens enhed i dele';i++){assert(i<80);await next();}
   await page.keyboard.press('Escape');await page.locator('.tour-dialog').waitFor({state:'detached',timeout:3000});assert(!(await page.locator('#app-dialog').evaluate(d=>d.open)));assert.deepEqual(await state(),original);
   // Text help contains both features after restoring the user's own setup.
   await action('tutorial').click();await page.locator('[data-tour="help"]').click();assert.equal(await page.locator('.tour-dialog').count(),0);const help=await page.locator('#app-dialog').innerText();assert.match(help,/Standardværdier og egne standarder/);assert.match(help,/Markér og saml resultater/);assert.match(help,/tæller og nævner/);await action('close-dialog').first().click();assert.deepEqual(await state(),original);
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await context.close();
  }
  console.log('P&P guide browser acceptance passed in both editions on desktop/mobile: all steps, live standard/unit/water/result examples, backward navigation, completion/Escape/text help, exact task/view/calculator restoration and no task writes or network requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
