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
async function open(page){await page.evaluate(()=>energyWorkoutOpen('2024-03-01'));await expect(page.locator('#moduleTitle')).toHaveText('Workout')}
async function addCard(page){await page.evaluate(async()=>{if(!data.dashboard.blocks.some(b=>b.id==='energy'))data.dashboard.blocks.push({id:'energy',size:'expanded'});await save();renderToday()})}
test('Today has only automatic summary and Settings owns profile',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await seed(page);await addCard(page);
 const card=page.locator('[data-metric="energy"]');await expect(card).toContainText('Daily expenditure');await expect(card.locator('input,select')).toHaveCount(0);await card.locator('summary').click();await expect(card).toContainText('Usual day');await expect(card).toContainText('Extra steps');
 await expect(page.locator('.energy-tabs')).toHaveCount(0);await page.locator('#tabSettings').click();await page.locator('#energySettings>summary').click();await expect(page.locator('#energyHeight')).toHaveValue('170');await page.locator('#energyHeight').fill('175');await page.locator('#energySaveProfile').click();await expect(page.locator('#energyProfileSaved')).toContainText('Profile saved');await settle(page);
 expect(await page.evaluate(()=>data.energyBalance.profile.heightCm)).toBe(175);await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);expect(await page.evaluate(()=>data.energyBalance.profile.heightCm)).toBe(175);expect(errors).toEqual([]);
});
test('existing Workout card records multiple active calorie entries, edits and deletes without double counting',async({page})=>{
 await ready(page);await seed(page);await page.locator('[data-metric="gym"]').click();await expect(page.locator('#moduleTitle')).toHaveText('Workout');await expect(page.locator('#energyWorkoutType,#energyMinutes,#energyOverlap')).toHaveCount(0);
 for(const value of ['300','150']){await page.locator('#energySimpleKcal').fill(value);await page.locator('#energySaveWorkout').click();await settle(page)}
 expect(await page.evaluate(()=>energyDay().exercise.value)).toBe(450);expect(await page.evaluate(()=>energyDay().walking.value)).toBe(0);expect(await page.evaluate(()=>data.logs['2024-03-01'].gym)).toBe(true);
 await page.locator('#moduleContent .module-history').first().click();await page.locator('#energySimpleKcal').fill('200');await page.locator('#energySaveWorkout').click();await settle(page);expect(await page.evaluate(()=>energyDay().exercise.value)).toBe(350);
 await page.locator('#moduleContent .module-history').last().click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete workout',exact:true}).click();await settle(page);expect(await page.evaluate(()=>energyDay().exercise.value)).toBe(200);
 await page.reload();await expect(page.locator('body')).not.toHaveClass(/loading-data/);expect(await page.evaluate(()=>data.energyBalance.workouts.length)).toBe(1);
});
test('legacy workouts keep their original semantics and remain editable',async({page})=>{
 await ready(page);await seed(page);await page.evaluate(async()=>{data.energyBalance.workouts=[{id:'legacy-total',date:'2024-03-01',type:'cycling',source:'watch',scope:'workout',counting:'watch',energyType:'total',overlap:'none',kcal:300,minutes:60,steps:null}];await save()});const before=await page.evaluate(()=>structuredClone(data.energyBalance.workouts[0]));await open(page);await page.locator('#moduleContent .module-history').click();await expect(page.locator('#moduleContent')).toContainText('original calculation method is preserved');expect(await page.evaluate(()=>data.energyBalance.workouts[0])).toEqual(before);
 await page.locator('#energyKcal').fill('400');await page.locator('#energySaveWorkout').click();await settle(page);expect(await page.evaluate(()=>data.energyBalance.workouts[0])).toEqual({...before,kcal:400});expect(await page.evaluate(()=>energyDay().exercise.value)).toBeCloseTo(400-1597.5/24);
});
test('Progress uses existing range and metric navigation without a duplicate weight graph',async({page})=>{
 await ready(page);await seed(page);await page.locator('#tabProgress').click();await page.evaluate(()=>setTrendRange('all'));await page.evaluate(()=>setTrendMetric('energy'));await expect(page.locator('#trendChartHost')).toContainText('Daily expenditure');await expect(page.locator('#trendChartHost')).toContainText('Deficit / surplus');await expect(page.locator('#trendChartHost')).not.toContainText('Weight: 7-day average');await expect(page.locator('#trendChartHost svg')).toHaveCount(2);await page.locator('#trendRange30Btn').click();expect(await page.evaluate(()=>trendRangeDays)).toBe(30);await page.evaluate(()=>setTrendMetric('weight'));await expect(page.locator('#trendTitle')).toContainText('Weight');
});
test('missing steps and food edits recalculate across tabs without changing historical records',async({page,context})=>{
 await ready(page);await seed(page);await addCard(page);await page.evaluate(async()=>{delete data.logs['2024-03-01'].steps;await save()});const before=await page.evaluate(()=>structuredClone(data.logs));await page.evaluate(()=>renderToday());const card=page.locator('[data-metric="energy"]');await card.locator('summary').click();await expect(card).toContainText('Steps not logged; usual activity used');expect(await page.evaluate(()=>data.logs)).toEqual(before);
 const other=await context.newPage();await ready(other);await other.evaluate(async()=>{data.nutrition.entries[0].nutrients.calories.value=1800;await save()});await expect.poll(()=>page.evaluate(()=>energyDay('2024-03-01').food.value)).toBe(1800);expect(await page.evaluate(()=>energyDay('2024-03-01').balance)).not.toBe(null);await other.close();
 await page.evaluate(async()=>{data.logs['2024-03-01'].steps=0;await save();renderToday()});expect(await page.evaluate(()=>energyDay('2024-03-01').walking.assumed)).toBe(false);await page.evaluate(async()=>{data.nutrition.entries=[];await save();renderToday()});expect(await page.evaluate(()=>energyDay('2024-03-01').balance)).toBe(null);
});
test('integrated screens fit 320px in both languages and themes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await seed(page);await addCard(page);
 for(const language of ['en','ru'])for(const theme of ['dark','light']){await page.setViewportSize({width:320,height:844});await page.evaluate(({language,theme})=>{data.language=language;data.theme=theme;render()},{language,theme});for(const tab of ['today','progress','settings']){await page.evaluate(tab=>show(tab,document.getElementById('tab'+tab[0].toUpperCase()+tab.slice(1))),tab);if(tab==='progress')await page.evaluate(()=>setTrendMetric('energy'));if(tab==='settings')await page.locator('#energySettings').evaluate(el=>el.open=true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}await openWorkout();}
 async function openWorkout(){await page.evaluate(()=>energyWorkoutOpen('2024-03-01'));expect(await page.locator('#moduleContent .energy-view').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.locator('#moduleBack').click()}
 expect(errors).toEqual([]);
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

test('Energy Balance stays inside its Progress card without overlapping the weekly review',async({page})=>{
 await ready(page);await seed(page);await page.locator('#tabProgress').click();
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});
  for(const language of ['en','ru']){
   await page.evaluate(lang=>{data.language=lang;setTrendRange('all');setTrendMetric('energy')},language);
   await expect(page.locator('#trendChartHost svg')).toHaveCount(2);
   const bounds=await page.evaluate(()=>{
    const host=document.getElementById('trendChartHost'),card=host.closest('.trend-card');
    const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom}};
    return {host:rect(host),energy:rect(host.firstElementChild),card:rect(card),review:rect(document.querySelector('.weekly-review'))};
   });
   expect(bounds.energy.bottom).toBeLessThanOrEqual(bounds.host.bottom+1);
   expect(bounds.energy.bottom).toBeLessThanOrEqual(bounds.card.bottom);
   expect(bounds.card.bottom).toBeLessThanOrEqual(bounds.review.top);
  }
  await page.evaluate(()=>setTrendMetric('weight'));
  await expect(page.locator('#trendChartHost .energy-view')).toHaveCount(0);
  expect(await page.locator('#trendChartHost').evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(190);
 }
});
