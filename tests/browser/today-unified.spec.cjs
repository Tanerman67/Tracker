const {test,expect}=require('@playwright/test');

async function ready(page){
 await page.goto('/');
 await expect(page.locator('body')).not.toHaveClass(/loading-data/);
 await page.evaluate(()=>saveCoordinationQueue);
}

test('Today input cards share a stable bottom sheet on mobile',async({page})=>{
 await ready(page);
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 await page.setViewportSize({width:375,height:812});
 for(const metric of ['steps','outdoors','sleep','gym','weight']){
  await page.locator('[data-metric="'+metric+'"]').click();
  const sel=metric==='steps'||metric==='outdoors'?'#entryModal .sheet':
    metric==='sleep'?'#habitModal .habit-sheet':
    metric==='gym'?'#moduleModal .module-page':'#bodyCheckinModal .body-checkin-sheet';
  const rect=await page.locator(sel).boundingBox();
  expect(rect,metric).not.toBeNull();
  expect(rect.width,metric).toBeGreaterThanOrEqual(370);
  expect(rect.height,metric).toBeGreaterThan(140);
 expect(rect.height,metric).toBeLessThanOrEqual(720);
  expect(Math.abs(rect.y+rect.height-812),metric).toBeLessThan(3);
  const top=rect.y;
  const close=metric==='steps'||metric==='outdoors'?'#entryModal .close':
    metric==='sleep'?'#habitClose':
    metric==='gym'?'#moduleBack':'#bodyCheckinModal .close';
  await expect(page.locator(close)).toHaveAttribute('aria-label',/Close|Закрыть/);
  await expect(page.locator(close+' .ui-icon')).toHaveCount(1);
  await page.locator(close).click();
  expect(top).toBeGreaterThanOrEqual(0);
 }
 expect(failures).toEqual([]);
});

test('Weight & body is recorded from Today and explored from Progress',async({page})=>{
 await ready(page);
 await page.evaluate(()=>setTodayDate('2024-02-29'));
 await page.locator('[data-metric="weight"]').click();
 await expect(page.locator('#bodyDateInput')).toHaveValue('2024-02-29');
 await page.locator('#bodyWeightInput').fill('81.2');
 await page.locator('#bodyWaistInput').fill('91.4');
 await page.locator('#bodySaveBtn').click();
 await page.evaluate(()=>saveCoordinationQueue);
 expect(await page.evaluate(()=>data.logs['2024-02-29'].weight)).toBe(81.2);
 expect(await page.evaluate(()=>data.bodyMeasurements['2024-02-29'].waist)).toBe(91.4);
 await expect(page.locator('#today')).toHaveClass(/active/);
 await page.locator('#tabProgress').click();
 await expect(page.locator('#bodyProgressEntry')).toBeVisible();
 await expect(page.locator('#bodyProgressWeight')).toContainText('81.2');
 await expect(page.locator('#bodyProgressWaist')).toContainText('91.4');
 await expect(page.locator('#bodyModal')).toBeHidden();
 await page.locator('#bodyProgressToggle').click();
 await expect(page.locator('#bodyModal')).toBeVisible();
 await expect(page.locator('#bodyProgressToggle')).toHaveAttribute('aria-expanded','true');
 await page.locator('#bodyMetricTabs').getByRole('button',{name:/Waist|Талия/}).click();
 await expect(page.locator('#bodyLatestWaist')).toContainText('91.4');
 await expect(page.locator('#bodyChartTitle')).not.toContainText('⚖️');
 await page.locator('#bodyModal .body-back').click();
 await expect(page.locator('#bodyModal')).toBeHidden();
 await expect(page.locator('#progress')).toHaveClass(/active/);
 await page.reload();
 expect(await page.evaluate(()=>data.bodyMeasurements['2024-02-29'].waist)).toBe(91.4);
});

test('Smoke-free uses original quit date and does not invent daily smoking logs',async({page})=>{
 await ready(page);
 await page.evaluate(async()=>{
  data.smokeDate='2024-01-10';
  ensureDay('2024-01-11').steps=8000;
  await save();
 });
 await page.locator('[data-metric="smoke"]').click();
 await expect(page.locator('#smokeModal')).toHaveClass(/show/);
 await expect(page.locator('#smokeQuitDate')).toHaveValue('2024-01-10');
 await page.evaluate(()=>{smokeViewYear=2024;renderSmokeCalendar()});
 await expect(page.locator('#smokeCalendarHost .shared-day')).toHaveCount(366); // leap year
 const original=await page.evaluate(()=>JSON.stringify(data.logs));
 await page.locator('#smokeQuitDate').fill('2024-02-01');
 await page.locator('#smokeSaveButton').click();
 await page.evaluate(()=>saveCoordinationQueue);
 expect(await page.evaluate(()=>data.smokeDate)).toBe('2024-02-01');
 expect(await page.evaluate(()=>JSON.stringify(data.logs))).toBe(original);
 await page.reload();
 expect(await page.evaluate(()=>data.smokeDate)).toBe('2024-02-01');
 await page.locator('#tabSettings').click();
 await expect(page.locator('#smokeDate')).toHaveValue('2024-02-01');
});

test('Today cards use a consistent visual inset at narrow widths',async({page})=>{
 await ready(page);
 for(const width of [320,375,414]){
  await page.setViewportSize({width,height:812});
  const cards=page.locator('#todayGrid > .today-metric:not(.block-expanded)');
  const boxes=await cards.evaluateAll(els=>els.map(el=>({
   padding:getComputedStyle(el).paddingLeft,
   radius:getComputedStyle(el).borderRadius,
   background:getComputedStyle(el).backgroundColor
  })));
  expect(new Set(boxes.map(b=>b.padding)).size).toBe(1);
  expect(new Set(boxes.map(b=>b.radius)).size).toBe(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('Progress Body summary refreshes after new measurements without opening a separate page',async({page})=>{
 await ready(page);
 await page.evaluate(async()=>{
  ensureDay('2024-07-01').weight=78.8;
  data.bodyMeasurements['2024-07-01']={waist:87.2};
  await save();
 });
 await page.locator('#tabProgress').click();
 await expect(page.locator('#bodyProgressWeight')).toContainText('78.8');
 await expect(page.locator('#bodyProgressWaist')).toContainText('87.2');
 await page.locator('#bodyProgressToggle').click();
 await expect(page.locator('#bodyModal')).toBeVisible();
 await page.reload();
 await page.locator('#tabProgress').click();
 await expect(page.locator('#bodyProgressWeight')).toContainText('78.8');
 await expect(page.locator('#bodyProgressWaist')).toContainText('87.2');
});
