const {test,expect}=require('@playwright/test');
async function ready(page){await page.goto('/');await page.waitForFunction(()=>typeof data!=='undefined'&&typeof uiSavingForms!=='undefined');await page.evaluate(async()=>{data.language='en';await save();});}
test('numeric deletion preserves zero, missing values and other daily fields',async({page})=>{
 await ready(page);await page.evaluate(async()=>{data.logs['2024-01-01']={steps:0,sleep:7,outdoors:20};await save();openEntry('steps','2024-01-01')});
 await expect(page.locator('#entryValue')).toHaveValue('0');page.once('dialog',d=>d.accept());await page.locator('[onclick="deleteEntry()"]').click();await expect(page.locator('#entryModal')).not.toHaveClass(/show/);
 expect(await page.evaluate(()=>data.logs['2024-01-01'])).toEqual({sleep:7,outdoors:20});await page.reload();expect(await page.evaluate(()=>data.logs['2024-01-01'])).toEqual({sleep:7,outdoors:20});
});
test('failed numeric save keeps the form and draft; close confirms only edits',async({page})=>{
 await ready(page);await page.evaluate(()=>{openEntry('steps');window.realPersist=persistData;persistData=async()=>false});await page.locator('#entryValue').fill('123');await page.locator('[onclick="saveEntry()"]').click();await expect(page.locator('#entryModal')).toHaveClass(/show/);await expect(page.locator('#entryValue')).toHaveValue('123');
 page.once('dialog',d=>d.dismiss());await page.locator('#entryModal .close').click();await expect(page.locator('#entryModal')).toHaveClass(/show/);
 await page.evaluate(()=>persistData=window.realPersist);await page.locator('[onclick="saveEntry()"]').click();await expect(page.locator('#entryModal')).not.toHaveClass(/show/);
});
test('sleep delete keeps timing and unrelated history',async({page})=>{
 await ready(page);await page.evaluate(async()=>{data.logs['2024-01-01']={sleep:7,steps:100,habitDetails:{sleepTiming:{wake:'07:00'}}};await save();openHabitEditor('sleep','2024-01-01')});page.once('dialog',d=>d.accept());await page.locator('[onclick="deleteHabitEntry()"]').click();await expect(page.locator('#habitModal')).not.toHaveClass(/show/);expect(await page.evaluate(()=>data.logs['2024-01-01'])).toEqual({steps:100,habitDetails:{sleepTiming:{wake:'07:00'}}});
});
test('Body fits five mobile widths in both languages and themes',async({page})=>{
 await ready(page);await page.evaluate(async()=>{data.logs['2024-01-01']={weight:90};data.bodyMeasurements['2024-01-01']={chest:100,waist:90,abdomen:95,hips:100,thigh:60};await save();show('progress');openBody()});
 for(const width of [320,360,375,390,414])for(const language of ['en','ru'])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:844});await page.evaluate(({language,theme})=>{data.language=language;data.theme=theme;render()}, {language,theme});
  expect(await page.evaluate(()=>({page:document.documentElement.scrollWidth<=innerWidth,body:document.getElementById('bodyModal').scrollWidth<=document.getElementById('bodyModal').clientWidth+1}))).toEqual({page:true,body:true});
 }
});
