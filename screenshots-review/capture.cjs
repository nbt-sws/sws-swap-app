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
  await page.screenshot({ path: path.join(outDir, '01-dev-login.png'), fullPage: true });

  // Click the Login button inside the Buyer card (first card)
  const buyerCard = page.locator('h3:has-text("Buyer")').locator('..').locator('..');
  await buyerCard.locator('button:has-text("Login")').click();
  await page.waitForURL('http://localhost:3002/', { timeout: 5000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '02-home.png'), fullPage: true });

  // Market
  await page.goto('http://localhost:3002/market');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '03-market.png'), fullPage: true });

  // Vault
  await page.goto('http://localhost:3002/vault');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '04-vault.png'), fullPage: true });

  // Seller store
  await page.goto('http://localhost:3002/seller/dev-seller');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '05-seller-store.png'), fullPage: true });

  // Services
  await page.goto('http://localhost:3002/services');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '06-services.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots saved to', outDir);
})();
