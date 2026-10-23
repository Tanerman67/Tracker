const {test,expect}=require('@playwright/test');
test('inspect narrow Settings and Nutrition controls',async({page})=>{
 await page.goto('/');await expect(page.locator('body')).not.toHaveClass(/loading-data/);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  await page.locator('#tabSettings').click();await page.screenshot({path:test.info().outputPath(`settings-${width}.png`),fullPage:true});
  await page.locator('#tabNutrition').click();await page.screenshot({path:test.info().outputPath(`nutrition-${width}.png`),fullPage:true});
  await page.locator('#nutritionAddButton').click();await page.screenshot({path:test.info().outputPath(`food-${width}.png`),fullPage:true});await page.locator('[onclick="nutritionCancelForm()"]').click();
  if(await page.locator('[onclick="nutritionClose()"]').isVisible())await page.locator('[onclick="nutritionClose()"]').click();
 }
});
