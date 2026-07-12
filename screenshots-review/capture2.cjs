const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const outDir = path.resolve(__dirname, 'screenshots-review');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Dev login as buyer
  await page.goto('http://localhost:3002/dev-login');
  await page.waitForSelector('text=Buyer');
  const buyerCard = page.locator('h3:has-text("Buyer")').locator('..').locator('..');
  await buyerCard.locator('button:has-text("Login")').click();
  await page.waitForURL('http://localhost:3002/', { timeout: 5000 });

  // Stores list
  await page.goto('http://localhost:3002/stores');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '07-stores.png'), fullPage: true });

  // Click first store
  const firstStore = page.locator('a[href*="/seller/"]').first();
  if (await firstStore.count() > 0) {
    const href = await firstStore.getAttribute('href');
    console.log('First store href:', href);
    await firstStore.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '05-seller-store.png'), fullPage: true });
  }

  // Also mobile home
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3002/');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '08-home-mobile.png'), fullPage: true });

  await browser.close();
  console.log('Done');
})();
