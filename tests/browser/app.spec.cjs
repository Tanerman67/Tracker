const {test,expect}=require('@playwright/test');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const DAY='2024-01-02';
async function ready(page){await page.goto('/');await expect(page.locator('[data-metric="nutrition"]')).toBeVisible();await expect(page.locator('body')).not.toHaveClass(/loading-data/);await page.evaluate(()=>saveCoordinationQueue);}
async function settle(page){await page.evaluate(()=>saveCoordinationQueue);}
async function addFood(page,name='Fictional rice',calories='250'){
 await page.locator('#nutritionAddButton').click();await page.locator('#nutritionFoodName').fill(name);await page.locator('#nutritionFoodAmount').fill('100');await page.locator('#nutritionCalories').fill(calories);await page.locator('#nutritionProtein').fill('12');await page.locator('[onclick="nutritionSaveFood()"]').click();await settle(page);
}
async function addModule(page,name){await page.locator('#todayCustomize').click();await page.getByRole('button',{name}).click();await settle(page);await page.locator('#moduleBack').click();}

test('fresh app, four destinations, English locale and no seeded personal records',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await expect(page.locator('.tabsin .tab')).toHaveCount(4);await expect(page.locator('#tabNutrition')).toContainText('Nutrition');
 expect(await page.evaluate(()=>[data.smokeDate,data.alcoholTrackingStart,Object.keys(data.logs).length,data.cycle.enabled,data.englishActivity.entries.length])).toEqual(['','',0,false,0]);
 await expect(page.locator('#tabEnglish')).toHaveCount(0);await expect(page.locator('[data-metric="cycle"]')).toHaveCount(0);
 for(const id of ['tabProgress','tabSettings','tabToday'])await page.locator('#'+id).click();
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath('today.png'),fullPage:true});
});

test('dashboard add, move, expand, hide and refresh preserve records',async({page})=>{
 await ready(page);await addModule(page,'+ ◌ Cycle');await expect(page.locator('[data-metric="cycle"]')).toBeVisible();
 await page.locator('#todayCustomize').click();const row=page.locator('.layout-row').filter({hasText:'Cycle'});await row.getByRole('button',{name:'Move up',exact:true}).click();await settle(page);await row.getByRole('button',{name:'Expand',exact:true}).click();await settle(page);await page.locator('#moduleBack').click();await page.reload();await expect(page.locator('[data-metric="cycle"]')).toHaveClass(/block-expanded/);
 await page.locator('#todayCustomize').click();await page.locator('.layout-row').filter({hasText:'Cycle'}).getByRole('button',{name:'Hide',exact:true}).click();await settle(page);await page.locator('#moduleBack').click();await expect(page.locator('[data-metric="cycle"]')).toHaveCount(0);
});

test('nutrition save, edit, partial rings, favourite, reuse, scale and safe delete',async({page})=>{
 await ready(page);await page.locator('#tabNutrition').click();await page.locator('details:has(#nutritionGoal_calories) > summary').click();await page.locator('#nutritionGoal_calories').fill('200');await page.locator('[onclick="nutritionSaveGoals()"]').click();await settle(page);await addFood(page);
 await expect(page.locator('#nutritionSummary [data-nutrient="calories"]')).toContainText('125%');await expect(page.locator('#nutritionIncomplete')).toBeVisible();
 await page.locator('.nutrition-food').click();await page.locator('#nutritionFavorite').click();await settle(page);await page.locator('#nutritionFoodAmount').fill('150');await page.locator('[onclick="nutritionScaleForm()"]').click();await expect(page.locator('#nutritionCalories')).toHaveValue('375');await page.locator('[onclick="nutritionSaveFood()"]').click();await settle(page);
 await page.locator('summary').filter({hasText:'Favourites & frequent foods'}).click();await page.locator('#nutritionReuse button').first().click();await page.locator('[onclick="nutritionSaveFood()"]').click();await settle(page);await expect(page.locator('.nutrition-food')).toHaveCount(2);
 await page.locator('.nutrition-food').first().click();page.once('dialog',d=>d.accept());await page.locator('#nutritionDeleteFood').click();await settle(page);await expect(page.locator('.nutrition-food')).toHaveCount(1);
 expect(await page.evaluate(()=>data.nutrition.entries[0].nutrients.fat)).toBeUndefined();
});

test('cycle create, edit, delete, validation and escaped user text',async({page})=>{
 await ready(page);await addModule(page,'+ ◌ Cycle');await page.locator('[data-metric="cycle"]').click();await page.locator('#cycleStart').fill(DAY);await page.locator('#cycleEnd').fill('2024-01-05');await page.locator('#cycleSymptoms').fill('<img src=x onerror=alert(1)>');await page.locator('[onclick="saveCycle()"]').click();await settle(page);
 await expect(page.locator('.module-history')).toHaveCount(1);await expect(page.locator('#moduleContent img')).toHaveCount(0);await page.locator('.module-history').click();await page.locator('#cycleEnd').fill('2024-01-06');await page.locator('[onclick="saveCycle()"]').click();await settle(page);await expect(page.locator('.module-history')).toContainText('2024-01-06');
 await page.locator('.module-history').click();page.once('dialog',d=>d.accept());await page.locator('[onclick="deleteCycle()"]').click();await settle(page);await expect(page.locator('.module-history')).toHaveCount(0);
 await page.locator('#cycleStart').fill('2024-01-05');await page.locator('#cycleEnd').fill('2024-01-01');await page.locator('[onclick="saveCycle()"]').click();await expect(page.locator('#moduleError')).toContainText('Check dates');
});

test('English activity selected date, editing, deletion and reload',async({page})=>{
 await ready(page);await page.locator('#heroDate').click();await page.locator('#todayDateInput').fill(DAY);await addModule(page,'+ A English Activity');await page.locator('[data-metric="english"]').click();await expect(page.locator('#activityDate')).toHaveValue(DAY);await page.locator('#activityMinutes').fill('30');await page.locator('#activityType').selectOption('reading');await page.locator('[onclick="saveActivity()"]').click();await settle(page);await page.locator('.module-history').click();await page.locator('#activityMinutes').fill('40');await page.locator('[onclick="saveActivity()"]').click();await settle(page);await page.reload();expect(await page.evaluate(()=>englishMinutesForDate('2024-01-02'))).toBe(40);
 await page.locator('[data-metric="english"]').click();await page.locator('.module-history').click();page.once('dialog',d=>d.accept());await page.locator('[onclick="deleteActivity()"]').click();await settle(page);await expect(page.locator('.module-history')).toHaveCount(0);
});

test('settings dates remain editable after history and survive refresh',async({page})=>{
 await ready(page);await page.locator('#tabSettings').click();await page.locator('#settings details:has(#smokeDate) > summary').click();await page.locator('#smokeDate').fill('2020-02-29');await page.locator('#alcoholDate').fill('2024-01-01');await page.locator('[onclick="saveSettings()"]').click();await settle(page);
 await page.evaluate(()=>{data.alcoholHistory['2024-01-03']=true;return save()});await page.locator('#alcoholDate').fill('2023-12-01');await page.locator('[onclick="saveSettings()"]').click();await settle(page);await page.reload();await page.locator('#tabSettings').click();await expect(page.locator('#alcoholDate')).toHaveValue('2023-12-01');expect(await page.evaluate(()=>data.alcoholHistory['2024-01-03'])).toBe(true);
});

test('JSON nutrition import preview, repeat import and intentional identical meals',async({page})=>{
 await ready(page);await page.locator('#tabNutrition').click();const record=id=>({id,date:DAY,meal:'lunch',name:'Fictional meal',nutrients:{protein:{value:10,unit:'g',quality:'estimated'}}});const payload={format:'my-rhythm-nutrition-import-v1',entries:[record('same-a'),record('same-b')]};
 for(let i=0;i<2;i++){
  await page.locator('#nutritionFile').setInputFiles({name:'fictional-food.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await expect(page.locator('#nutritionImportPreview')).toHaveClass(/show/);await page.locator('[onclick="nutritionConfirmImport()"]').click();await settle(page);
 }
 expect(await page.evaluate(()=>data.nutrition.entries.length)).toBe(2);expect(await page.evaluate(()=>nutritionAggregate('2024-01-02').protein.value)).toBe(20);
});

test('full backup export and second-profile import preserve layout, cycle and archive',async({page,browser})=>{
 await ready(page);await page.evaluate(()=>{data.cycle={enabled:true,periods:[{id:'fictional-period',start:'2024-01-02',end:'2024-01-05',notes:'example',symptoms:''}]};data.englishLearning.customItems=[{id:'custom-fixture',title:'Fictional learning content'}];data.dashboard.blocks.push({id:'cycle',size:'expanded'});return save()});
 await page.locator('#tabSettings').click();const dl=page.waitForEvent('download');await page.locator('[onclick="exportBackup()"]').click();const file=await (await dl).path();const backup=JSON.parse(fs.readFileSync(file,'utf8'));expect(backup.schemaVersion).toBe(3);
 const second=await browser.newContext();const p=await second.newPage();await p.goto('http://127.0.0.1:8765/');await expect(p.locator('[data-metric="cycle"]')).toHaveCount(0);await p.locator('#tabSettings').click();p.on('dialog',d=>d.type()==='confirm'?d.accept():d.dismiss());await p.locator('input[onchange="importBackupFile(event)"]').setInputFiles({name:'synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(p.locator('#backupStatus')).toContainText('Backup');await settle(p);expect(await p.evaluate(()=>data.cycle.periods)).toEqual(backup.data.cycle.periods);expect(await p.evaluate(()=>data.englishLearning.customItems)).toEqual(backup.data.englishLearning.customItems);await second.close();
});

test('multiple tabs merge independent edits and retain a draft for conflicts',async({page,context})=>{
 await ready(page);const second=await context.newPage();await ready(second);
 await page.evaluate(()=>{ensureDay('2024-01-02').steps=100;return save()});await second.evaluate(()=>{ensureDay('2024-01-02').sleep=8;return save()});expect(await second.evaluate(()=>data.logs['2024-01-02'])).toEqual({steps:100,sleep:8});
 await page.reload();await second.reload();await page.evaluate(()=>{data.logs['2024-01-02'].steps=200;return save()});const dialog=second.waitForEvent('dialog');const saving=second.evaluate(()=>{data.logs['2024-01-02'].steps=300;return save()});await (await dialog).dismiss();await saving;
 expect(await second.evaluate(()=>JSON.parse(localStorage.getItem('my-rhythm-conflict-draft')).logs['2024-01-02'].steps)).toBe(300);expect(await second.evaluate(()=>data.logs['2024-01-02'].steps)).toBe(200);
});

test('offline PWA reload retains records and sends only public asset requests',async({page})=>{
 // Stop the real local server rather than relying on an emulated offline flag.
 const root=path.resolve(__dirname,'../..');
 const server=http.createServer((req,res)=>{try{const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';if(file.includes('..'))throw Error();const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg'})[ext]||'text/plain');res.end(fs.readFileSync(path.join(root,file)))}catch(e){res.writeHead(404);res.end('missing')}});
 await new Promise(resolve=>server.listen(8878,'127.0.0.1',resolve));
 const requests=[];page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
 try{await page.goto('http://127.0.0.1:8878/');await expect(page.locator('[data-metric="nutrition"]')).toBeVisible();await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));ensureDay('2024-01-02').steps=123;await save()});
 await new Promise(resolve=>server.close(resolve));await page.reload();await expect(page.locator('[data-metric="nutrition"]')).toBeVisible();expect(await page.evaluate(()=>data.logs['2024-01-02'].steps)).toBe(123);expect(requests.every(r=>r.url.startsWith('http://127.0.0.1:8878/')&&r.method==='GET'&&r.body===null)).toBe(true);
 }finally{if(server.listening)await new Promise(resolve=>server.close(resolve))}
});

test('charts support sparse history in every range and Russian switch',async({page})=>{
 await ready(page);await page.evaluate(()=>{data.logs={'2021-01-01':{steps:0,weight:70},'2024-01-02':{steps:5000,weight:72}};return save()});await page.locator('#tabProgress').click();for(const id of ['trendRange7Btn','trendRange30Btn','trendRange90Btn','trendRange365Btn','trendRangeAllBtn']){await page.locator('#'+id).click();await expect(page.locator('#trendChartHost')).toBeVisible()}
 await page.locator('#tabSettings').click();await page.locator('#languageToggleBtn').click();await settle(page);await page.locator('#tabToday').click();await expect(page.locator('#todayCustomize')).toContainText('Настроить');await expect(page.locator('#tabNutrition')).toContainText('Питание');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('upgrade from actual 6.13 assets keeps existing records and local recovery cache',async({page,context})=>{
 const root=path.resolve(__dirname,'../..'),base='46ee50a4413b8d7c5ee89172e53f193446f5392c';let upgraded=false;
 const server=http.createServer((req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';if(relative.includes('..')){res.writeHead(400);return res.end()};const content=upgraded?fs.readFileSync(path.join(root,relative)):execFileSync('git',['show',base+':'+relative],{cwd:root,maxBuffer:2e6});const ext=path.extname(relative);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'})[ext]||'text/plain');res.setHeader('Cache-Control','no-cache');res.end(content)}catch(e){res.writeHead(404);res.end('missing')}});
 await new Promise(resolve=>server.listen(8877,'127.0.0.1',resolve));try{
 await page.goto('http://127.0.0.1:8877/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;data.logs={'2024-01-02':{steps:321,protein:0,gym:false}};data.englishLearning.customItems=[{id:'custom-synthetic',title:'Retain this'}];data.language='ru';save();await vaultWriteQueue});
 upgraded=true;await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});await page.reload();await expect(page.locator('#todayCustomize')).toBeVisible();await expect(page.locator('#appVersionText')).toHaveText('V7.1.0',{timeout:15000});expect(await page.evaluate(()=>data.logs['2024-01-02'])).toEqual({steps:321,protein:0,gym:false});expect(await page.evaluate(()=>data.englishLearning.customItems[0].title)).toBe('Retain this');expect(await page.evaluate(()=>data.language)).toBe('ru');expect(await page.evaluate(async()=>(await caches.keys()).includes('my-rhythm-data-vault-v1'))).toBe(true);
 await new Promise(resolve=>server.close(resolve));await page.reload();await expect(page.locator('#todayCustomize')).toBeVisible();expect(await page.evaluate(()=>data.logs['2024-01-02'].steps)).toBe(321);
 }finally{if(server.listening)await new Promise(resolve=>server.close(resolve))}
});

test('IndexedDB coordination fallback preserves edits without Web Locks',async({page,context})=>{
 await context.addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined,configurable:true}));await ready(page);const other=await context.newPage();await ready(other);
 await Promise.all([page.evaluate(()=>{ensureDay('2024-01-02').steps=555;return save()}),other.evaluate(()=>{ensureDay('2024-01-02').sleep=7;return save()})]);await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);expect(await page.evaluate(()=>data.logs['2024-01-02'])).toEqual({steps:555,sleep:7});
});
