import {test} from '@playwright/test';
test('prepare real app screenshots and square icon for marketplace galleries',async({page})=>{
 await page.setViewportSize({width:1270,height:760});
 await page.goto('/');
 await page.locator('#sample').click();
 await page.screenshot({path:'launch-assets/payloadlens-overview.png'});
 await page.locator('.results').scrollIntoViewIfNeeded();
 await page.screenshot({path:'launch-assets/payloadlens-drift-review.png'});
 await page.goto('/logo.svg');
 await page.locator('svg').screenshot({path:'launch-assets/payloadlens-thumbnail.png'});
});
