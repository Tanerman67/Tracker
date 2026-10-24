const {test,expect}=require('@playwright/test');
async function ready(page){await page.goto('/');await expect(page.locator('body')).not.toHaveClass(/loading-data/);await page.evaluate(()=>saveCoordinationQueue)}
test('legacy protein is read-only, labelled, never added twice, and survives backup/reload',async({page})=>{
 await ready(page);await page.evaluate(async()=>{data.logs['2024-02-29']={protein:73,steps:0};await save();nutritionOpen('2024-02-29')});
 await expect(page.getByRole('button',{name:'Manual protein',exact:true})).toHaveCount(0);await expect(page.locator('#nutritionProteinSource')).toContainText('historical manual');await expect(page.locator('#nutritionSummary [data-nutrient=protein]')).toContainText('73 g');
 await page.evaluate(async()=>{data.nutrition.entries=[nutritionNormalizeRecord({id:'fictional_protein',date:'2024-02-29',meal:'lunch',name:'Fictional food',nutrients:{protein:{value:12,quality:'label'}}})];await save()});
 await expect(page.locator('#nutritionSummary [data-nutrient=protein]')).toContainText('12 g');expect(await page.evaluate(()=>validateBackupObject({format:'my-life-tracker-backup',data}).logs['2024-02-29'].protein)).toBe(73);
 await page.reload();expect(await page.evaluate(()=>data.logs['2024-02-29'].protein)).toBe(73);
});
test('dirty food and Body editors keep draft when discard is rejected',async({page})=>{
 await ready(page);await page.locator('#tabNutrition').click();await page.locator('#nutritionAddButton').click();await page.locator('#nutritionFoodName').fill('Fictional unsaved meal');page.once('dialog',d=>d.dismiss());await page.locator('[onclick="nutritionCancelForm()"]').click();await expect(page.locator('#nutritionFoodName')).toHaveValue('Fictional unsaved meal');await expect(page.locator('#nutritionForm')).toHaveClass(/show/);
 page.once('dialog',d=>d.accept());await page.locator('[onclick="nutritionCancelForm()"]').click();await page.evaluate(()=>openBody());await page.locator('.body-new-checkin').click();await page.locator('#bodyWeightInput').fill('80');page.once('dialog',d=>d.dismiss());await page.locator('[onclick="closeBodyCheckin()"]').click();await expect(page.locator('#bodyCheckinModal')).toHaveClass(/show/);expect(await page.evaluate(()=>Object.keys(data.logs).length)).toBe(0);
});
test('Body and primary navigation fit every requested width, language and theme',async({page})=>{
 await ready(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,360,375,390,414])for(const language of ['en','ru'])for(const theme of ['dark','light']){
  await page.setViewportSize({width,height:844});await page.evaluate(async({language,theme})=>{data.language=language;data.theme=theme;await save();openBody();setBodyRange(7)},{language,theme});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const locator of [page.locator('.body-new-checkin'),page.locator('.body-back'),page.locator('#tabNutrition')]){const b=await locator.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44)}
  await page.locator('.body-new-checkin').click();expect(await page.locator('#bodyWeightInput').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);await page.locator('[onclick="closeBodyCheckin()"]').click();
 }
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.fonts.check('16px Inter','Привет Hello'))).toBe(true);
 await page.locator('#tabNutrition').focus();await page.keyboard.press('Tab');expect(await page.locator('#tabProgress').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
});
test('Today card forwards date; tab return retains Nutrition date and Progress scroll',async({page})=>{
 await ready(page);await page.evaluate(()=>setTodayDate('2024-02-29'));await page.locator('[data-metric=nutrition]').click();await expect(page.locator('#nutritionDate')).toHaveValue('2024-02-29');await page.locator('#tabToday').click();await page.locator('#tabNutrition').click();await expect(page.locator('#nutritionDate')).toHaveValue('2024-02-29');
 await page.locator('#tabProgress').click();await page.evaluate(()=>scrollTo(0,300));const y=await page.evaluate(()=>scrollY);await page.evaluate(()=>openBody());await page.locator('.body-back').click();expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(3);
});
test('shared headings, labels and actions keep normal-text contrast in both themes',async({page})=>{
 await ready(page);
 for(const theme of ['dark','light']){
  await page.evaluate(async theme=>{data.theme=theme;await save();nutritionOpen(localDate())},theme);
  for(const selector of ['#nutritionTitle','#nutritionAddButton','#nutritionImportButton','#nutritionProteinSource']){
   const ratio=await page.locator(selector).evaluate(el=>{
    const rgb=s=>s.match(/[\d.]+/g).map(Number),lum=a=>a.slice(0,3).map(x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
    let host=el,bg;while(host){const c=rgb(getComputedStyle(host).backgroundColor);if(c.length<4||c[3]===1){bg=c;break}host=host.parentElement}const a=lum(rgb(getComputedStyle(el).color)),b=lum(bg||[255,255,255]);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   });expect(ratio,theme+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
 }
});
test('Alcohol annual overview stays compact after shared calendar target changes',async({page})=>{
 await ready(page);await page.setViewportSize({width:320,height:844});await page.evaluate(async()=>{data.alcoholTrackingStart='2024-01-01';await save();openAlcohol()});
 const day=page.locator('.alcohol-year-grid .shared-day').first();await expect(day).toBeVisible();const box=await day.boundingBox();expect(box.height).toBeLessThan(40);expect(await page.locator('#alcoholModal').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
});
