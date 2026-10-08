/* Optional acceptance for P&P formula search, references and named downloads. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  const context=await browser.newContext({viewport:{width:1512,height:982},acceptDownloads:true}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  const go=name=>page.goto(pathToFileURL(path.resolve(__dirname,'..',name)).href),action=a=>page.locator(`[data-action="${a}"]`),search=()=>page.locator('[data-formula-search]'),visible=()=>page.locator('.dialog-formula-item:not([hidden])'),data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pp-kompendium.symbolic.v2')));
  await go('index.html');await page.evaluate(()=>localStorage.clear());await page.reload();
  // Formula picker: aliases, symbols, exact T references, empty results and Enter.
  await action('add-formula').first().click();assert.equal(await search().evaluate(e=>e===document.activeElement),true);
  await search().fill('T9');assert.ok(await visible().count()>0);assert.equal(await page.locator('.dialog-formula-list h3:not([hidden])').count(),1);
  await search().fill('xyzingenformel');assert.equal(await visible().count(),0);assert.equal(await page.locator('[data-formula-search-empty]').isVisible(),true);
  await search().fill('Qv');assert.ok(await visible().count()>0);
  await search().fill('Læg tider sammen');await search().press('Enter');assert.equal((await data()).formulas.at(-1).expression.formula,'timeSum');
  const count=(await data()).formulas.length;
  // Goal search selects an existing task without duplicating it.
  await action('search-goal').click();await search().fill('Fyldetid');await page.locator('[data-value="saved:time"]').click();assert.equal((await data()).formulas.length,count);
  assert.match(await page.locator('#formula-preview h2').innerText(),/Fyldetid/);
  // References are above inline formulas; the same safe choices feed the search.
  const source=page.locator('select[data-action="source"][data-symbol="V"]').first();
  const groups=await source.locator('optgroup').evaluateAll(nodes=>nodes.map(n=>n.label));assert.ok(groups.indexOf('Brug en reference')<groups.indexOf('Indsæt en formel'));
  await source.locator('..').locator('[data-action="search-source"]').click();
  const headings=await page.locator('.dialog-formula-list h3').allTextContents();assert.ok(headings.indexOf('Brug en reference')<headings.indexOf('Indsæt en formel'));
  const allowed=await page.locator('[data-action="choose-formula-option"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.value));assert(!allowed.includes('formula:circleArea'),'area must not be offered for a volume input');
  await search().fill('Samlet rumfang');await page.locator('[data-action="choose-formula-option"][data-value^="ref:formula:"]').filter({visible:true}).first().click();
  assert.equal((await data()).formulas.find(f=>f.id==='time').expression.args.V.kind,'ref');
  await source.locator('..').locator('[data-action="search-source"]').click();await search().fill('Cylinderens rumfang');await page.locator('[data-value="formula:cylinderVolume"]').click();
  assert.equal((await data()).formulas.find(f=>f.id==='time').expression.args.V.formula,'cylinderVolume');
  // Canceling a search preserves the expression; search only exposes valid sources.
  const before=JSON.stringify(await data());await action('search-source').first().click();await search().fill('kegle');await search().press('Escape');assert.equal(JSON.stringify(await data()),before);
  // Named download, empty validation, cancellation and round-trip actual file import.
  const downloads=[];page.on('download',d=>downloads.push(d));await action('export').click();assert.equal(downloads.length,0);
  await page.locator('[data-export-name]').fill('');await action('confirm-export').click();assert.match(await page.locator('[data-export-error]').innerText(),/filnavn/);assert.equal(downloads.length,0);
  await action('close-dialog').first().click();assert.equal(downloads.length,0);
  await action('export').click();await page.locator('[data-export-name]').fill('Opgave 8 – tank.pp.json');assert.equal(await page.locator('[data-export-preview]').innerText(),'Opgave 8 – tank.pp.json');
  const event=page.waitForEvent('download');await page.locator('[data-export-name]').press('Enter');const download=await event;assert.equal(download.suggestedFilename(),'Opgave 8 – tank.pp.json');
  const file=await download.path(),exported=JSON.parse(fs.readFileSync(file,'utf8'));assert.deepEqual(exported,JSON.parse(before));
  await action('new').click();await action('confirm').click();await page.locator('#file-input').setInputFiles(file);await action('confirm').click();assert.deepEqual(await data(),exported);
  // Screenshot and small-screen search.
  await action('search-goal').click();await search().fill('rumfang');
  if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'pp-formula-search.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await search().isVisible());await search().press('Escape');
  await action('export').click();await page.locator('[data-export-name]').fill('Min beregning');
  if(process.env.PP_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.PP_SCREENSHOT_DIR,'pp-named-save.png'),animations:'disabled'});
  await action('close-dialog').first().click();
  // Exam gets search, but still no task import/export and always an empty start.
  await go('eksamen.html');assert.equal(await action('export').count(),0);assert.equal(await action('import').count(),0);await action('search-goal').click();await search().fill('tid');await page.locator('[data-value="new:timeSum"]').click();assert.equal(await page.locator('.saved-formula-row').count(),1);await page.reload();assert.equal(await page.locator('.saved-formula-row').count(),0);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);console.log('P&P browser acceptance passed: search, reference order and scope, keyboard/cancel, named downloads/import, mobile and exam policy.');await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
