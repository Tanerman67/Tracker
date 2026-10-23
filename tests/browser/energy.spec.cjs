const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const DAY='2024-03-01';
async function ready(page){await page.goto('/');await expect(page.locator('body')).not.toHaveClass(/loading-data/)}
async function settle(page){await page.evaluate(async()=>{await saveCoordinationQueue;await vaultWriteQueue})}
async function seed(page){await page.evaluate(async date=>{
 data.logs={'2024-02-29':{weight:70},[date]:{steps:6800,gym:false},'2025-01-01':{weight:95}};
 data.nutrition.entries=[nutritionNormalizeRecord({id:'fictional-energy-food',date,meal:'lunch',name:'Fictional meal',source:'manual',nutrients:{calories:{value:2000,unit:'kcal',quality:'estimated'}}})];
 data.energyBalance={profile:{mode:'mifflin',heightCm:170,birthDate:'1990-03-01',variant:'plus5',routine:'seated',baselineIncludedSteps:800},workouts:[],days:{}};
 await save();setTodayDate(date);
},DAY);await settle(page)}
async function open(page){await page.evaluate(()=>energyOpen('2024-03-01'));await expect(page.locator('#moduleTitle')).toHaveText('Energy Balance')}
test('optional card, profile, shared calendar and existing editor routes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await expect(page.locator('[data-metric="energy"]')).toHaveCount(0);
 await page.locator('#todayCustomize').click();await page.getByRole('button',{name:'+ ◒ Energy Balance',exact:true}).click();await settle(page);await page.locator('#moduleBack').click();
 await expect(page.locator('[data-metric="energy"]')).toBeVisible();await page.locator('[data-metric="energy"]').click();await expect(page.locator('.energy-summary')).toContainText('Insufficient data');
 await page.getByRole('button',{name:'Profile',exact:true}).click();await expect(page.locator('#energyVariant')).toHaveValue('');await expect(page.locator('#energyHeight')).toHaveValue('');
 await page.locator('#energyHeight').fill('170');await page.locator('#energyBirth').fill('1990-03-01');await page.locator('#energyVariant').selectOption('plus5');await page.locator('#energyRoutine').selectOption('seated');await expect(page.locator('#energyBaselineSteps')).toHaveValue('800');await expect(page.locator('#energyBaselineSteps')).not.toBeVisible();await page.locator('#energySaveProfile').click();await expect(page.locator('#energyDate')).toBeVisible();await settle(page);
 await expect(page.locator('#moduleContent')).toContainText('Add weight through Body Check-in');await page.locator("[onclick=\"energyRoute('body')\"]").click();await expect(page.locator('#bodyCheckinModal')).toHaveClass(/show/);
 await page.evaluate(()=>{closeBodyCheckin();closeBody()});await seed(page);await open(page);await expect(page.locator('.energy-components')).toContainText('Extra: 6,000');await expect(page.locator('#moduleContent')).toContainText('70 kg');await expect(page.locator('#moduleContent')).toContainText('2024-02-29');
 await page.locator('[data-date-for="energyDate"]').click();await expect(page.locator('#sharedDatePicker .shared-calendar')).toBeVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Log steps',exact:true}).click();await expect(page.locator('#entryModal')).toHaveClass(/show/);expect(await page.evaluate(()=>activeTracker.id)).toBe('steps');
 await page.evaluate(()=>document.getElementById('entryModal').classList.remove('show'));await open(page);await page.getByRole('button',{name:'Log food',exact:true}).click();await expect(page.locator('#nutritionModal')).toHaveClass(/active/);await expect(page.locator('#nutritionDate')).toHaveValue(DAY);
 expect(await page.locator('.tabsin .tab').count()).toBe(4);expect(errors).toEqual([]);
});
test('simple workout input, live balance, total calories and step overlap',async({page})=>{
 await ready(page);await seed(page);await open(page);
 await expect(page.locator('.energy-view input[type=checkbox]')).toHaveCount(0);expect(await page.evaluate(()=>energyDay().usable)).toBe(true);
 const first=await page.evaluate(()=>energyDay().balance);
 await page.locator('.energy-workout-form>summary').click();await page.locator('#energyWorkoutType').selectOption('cycling');
 await expect(page.locator('#energyOverlap')).toHaveValue('none');await expect(page.locator('#energyOverlap')).not.toBeVisible();await expect(page.locator('#energyMinutes')).not.toBeVisible();
 expect(await page.locator('.energy-workout-form input:visible,.energy-workout-form select:visible').count()).toBe(2);
 await page.locator('#energyKcal').fill('300');await page.locator('#energySaveWorkout').click();await settle(page);
 expect(await page.evaluate(()=>data.energyBalance.workouts.length)).toBe(1);expect(await page.evaluate(()=>energyDay().exercise.value)).toBe(300);expect(await page.evaluate(()=>energyDay().balance)).toBe(first+300);await expect(page.locator('.energy-summary')).toContainText('Provisional');
 await page.locator('#moduleContent .module-history').click();await page.locator('#energyWorkoutAdvanced>summary').click();await page.locator('#energyEnergyType').selectOption('total');await expect(page.locator('#energyMinutes')).toBeVisible();
 await page.locator('#energySaveWorkout').click();await expect(page.locator('#moduleError')).toContainText('Enter workout duration');expect(await page.evaluate(()=>data.energyBalance.workouts[0].energyType)).toBe('active');
 await page.locator('#energyMinutes').fill('60');await page.locator('#energySaveWorkout').click();await settle(page);expect(await page.evaluate(()=>energyDay().exercise.value)).toBeCloseTo(300-1597.5/24);
 await page.locator('#moduleContent .module-history').click();await page.locator('#energyWorkoutType').selectOption('running');await page.locator('#energyEnergyType').selectOption('active');await page.locator('#energyWorkoutSteps').fill('4000');await page.locator('#energySaveWorkout').click();await settle(page);expect(await page.evaluate(()=>energyDay().walking.steps)).toBe(2000);
 await page.locator('#moduleContent .module-history').click();await page.locator('#energyWorkoutSteps').fill('');await page.locator('#energySaveWorkout').click();await settle(page);expect(await page.evaluate(()=>energyDay().walking.value)).toBe(0);expect(await page.evaluate(()=>energyDay().usable)).toBe(false);expect(await page.evaluate(()=>energyDay().balance)).not.toBe(null);
 await page.locator('#moduleContent .module-history').click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete workout',exact:true}).click();await settle(page);expect(await page.evaluate(()=>data.energyBalance.workouts.length)).toBe(0);
 const before=await page.evaluate(()=>energyDay().balance);await page.evaluate(async()=>{data.nutrition.entries[0].nutrients.calories.value=1900;await save()});expect(await page.evaluate(()=>energyDay().balance)).toBe(before+100);
 await page.evaluate(()=>energySwitch('history'));await expect(page.locator('.energy-summary')).toContainText('1/30');
 await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);await open(page);expect(await page.evaluate(()=>energyDay().balance)).toBe(before+100);await expect(page.locator('#energyFoodComplete')).toHaveCount(0);
});
test('RU/EN, light/dark, narrow screens, history and no personal network traffic',async({page})=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));await ready(page);await seed(page);await open(page);
 for(const language of ['en','ru'])for(const theme of ['dark','light'])for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await page.evaluate(({language,theme})=>{data.language=language;data.theme=theme;applyTheme();renderEnergy()},{language,theme});
  for(const tab of ['day','history','profile']){await page.evaluate(tab=>energySwitch(tab),tab);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.locator('.energy-view').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)}
  if(width===390&&theme==='dark'){await page.evaluate(()=>energySwitch('day'));await page.screenshot({path:test.info().outputPath(`energy-day-${language}.png`),fullPage:true})}
 }
 expect(requests.filter(r=>r.method!=='GET'||r.body)).toEqual([]);expect(requests.every(r=>new URL(r.url).origin==='http://127.0.0.1:8765')).toBe(true);expect(errors).toEqual([]);
});
test('energy backup, restore, vault and offline reload preserve existing records',async({page,browser})=>{
 await ready(page);await seed(page);await page.evaluate(async()=>{data.energyBalance.workouts=[{id:'fictional-bike',date:'2024-03-01',type:'cycling',source:'watch',scope:'workout',counting:'watch',energyType:'active',overlap:'none',kcal:200,minutes:30,steps:null}];data.energyBalance.days['2024-03-01']={foodSignature:MyRhythmEnergy.foodSignature(data,'2024-03-01'),activitySignature:MyRhythmEnergy.activitySignature(data,'2024-03-01')};await save()});await settle(page);
 await page.locator('#tabSettings').click();const download=page.waitForEvent('download');await page.locator('[onclick="exportBackup()"]').click();const backup=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));expect(backup.schemaVersion).toBe(3);
 const context=await browser.newContext(),second=await context.newPage();await second.goto('http://127.0.0.1:8765/');await expect(second.locator('body')).not.toHaveClass(/loading-data/);second.on('dialog',d=>d.type()==='confirm'?d.accept():d.dismiss());await second.locator('#tabSettings').click();await second.locator('#backupFile').setInputFiles({name:'fictional-energy-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(second.locator('#backupStatus')).toContainText('Backup');await settle(second);
 for(const key of ['energyBalance','logs','nutrition','bodyMeasurements'])expect(await second.evaluate(key=>data[key],key)).toEqual(backup.data[key]);
 const older=structuredClone(backup);delete older.data.energyBalance;
 await second.locator('#backupFile').setInputFiles({name:'fictional-older-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(older))});await expect(second.locator('#backupStatus')).toContainText('Backup');await settle(second);expect(await second.evaluate(()=>data.energyBalance)).toEqual(backup.data.energyBalance);
 await second.evaluate(async()=>{await navigator.serviceWorker.ready;await vaultWriteQueue});await second.reload();await expect(second.locator('body')).not.toHaveClass(/loading-data/);await second.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}))});
 await context.close();
 // Stop an actual server: WebKit's emulated offline flag can fail before a SW navigation.
 const root=path.resolve(__dirname,'../..'),server=http.createServer((req,res)=>{try{
  const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';if(file.includes('..'))throw Error();
  res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'text/plain');res.end(fs.readFileSync(path.join(root,file)));
 }catch(e){res.writeHead(404);res.end('missing')}});
 await new Promise(resolve=>server.listen(8876,'127.0.0.1',resolve));try{
  await page.goto('http://127.0.0.1:8876/');await expect(page.locator('body')).not.toHaveClass(/loading-data/);
  await page.evaluate(async snapshot=>{data=migrateData(snapshot);await save();await navigator.serviceWorker.ready;await vaultWriteQueue;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}))},backup.data);
  await new Promise(resolve=>server.close(resolve));await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);await open(page);expect(await page.evaluate(()=>energyDay().status)).toBe('provisional');
 }finally{if(server.listening)await new Promise(resolve=>server.close(resolve))}
});
test('independent tab edits merge workout IDs and update the open balance automatically',async({page,context})=>{
 await ready(page);await seed(page);const other=await context.newPage();await ready(other);
 await page.evaluate(async()=>{data.energyBalance.profile.heightCm=171;await save()});
 await other.evaluate(async()=>{data.energyBalance.workouts.push({id:'fictional-tab-workout',date:'2024-03-01',type:'cycling',source:'watch',scope:'workout',counting:'watch',energyType:'active',overlap:'none',kcal:200,minutes:30,steps:null});await save()});await settle(other);
 expect(await other.evaluate(()=>data.energyBalance.profile.heightCm)).toBe(171);expect(await other.evaluate(()=>data.energyBalance.workouts.length)).toBe(1);
 await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);await open(page);const before=await page.evaluate(()=>energyDay().balance);
 await other.evaluate(async()=>{data.nutrition.entries[0].nutrients.calories.value=1800;await save()});await expect.poll(()=>page.evaluate(()=>energyDay().balance)).toBe(before+200);await other.close();
});

test('missing steps recalculate old food days without mutating logs or backup data',async({page})=>{
 await ready(page);await seed(page);
 await page.evaluate(async()=>{delete data.logs['2024-03-01'].steps;await save()});await settle(page);
 const before=await page.evaluate(()=>structuredClone(data));await open(page);
 await expect(page.locator('.energy-issues')).toContainText('Steps not logged; usual activity used');
 await expect(page.locator('.energy-components')).toContainText('Usual allowance: 800');
 let d=await page.evaluate(()=>energyDay());expect(d.walking.value).toBe(0);expect(d.balance).toBeCloseTo(d.base-2000);
 await page.evaluate(()=>energySwitch('history'));await expect(page.locator('.energy-summary').first()).toContainText('1/30');
 await page.locator('details:has(.energy-history-list)>summary').click();await expect(page.locator('.energy-history-list')).toContainText('Steps not logged; usual activity used');
 expect(await page.evaluate(()=>data)).toEqual(before);
 await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);await open(page);
 expect(await page.evaluate(()=>Object.hasOwn(data.logs['2024-03-01'],'steps'))).toBe(false);
 await page.evaluate(async()=>{data.logs['2024-03-01'].steps=0;await save();renderEnergy()});await settle(page);
 await expect(page.locator('.energy-issues')).not.toContainText('Steps not logged');
 d=await page.evaluate(()=>energyDay());expect(d.walking.recorded).toBe(0);expect(d.walking.assumed).toBe(false);expect(d.walking.value).toBe(0);
 await page.locator('#moduleBack').click();await page.locator('#tabSettings').click();const download=page.waitForEvent('download');await page.locator('[onclick="exportBackup()"]').click();const backup=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));expect(backup.data.logs['2024-03-01'].steps).toBe(0);
 expect(backup.data.nutrition).toEqual(before.nutrition);
});
