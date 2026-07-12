import { chromium, devices } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE_URL = 'http://localhost:3002';
const OUT_DIR = path.resolve(process.cwd(), 'screenshots');

const devUser = {
  id: 'u-demo',
  email: 'demo@swibswap.app',
  fullName: 'Collector',
  avatarUrl: undefined,
  tier: 'REGULAR',
  kycStatus: 'APPROVED',
  currency: 'THB',
  notifications: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const routes = [
  { name: 'home', path: '/' },
  { name: 'market', path: '/market' },
  { name: 'vault', path: '/vault' },
  { name: 'seller', path: '/seller' },
  { name: 'services', path: '/services' },
  { name: 'profile', path: '/profile' },
  { name: 'service-provider', path: '/service-provider/s1-pregrade' },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: devices['iPhone 13'].userAgent,
  });

  const page = await context.newPage();

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((user) => {
    localStorage.setItem('sws_access_token', 'demo-token');
    localStorage.setItem('sws_dev_user', JSON.stringify(user));
  }, devUser);
  await page.reload({ waitUntil: 'networkidle' });

  for (const route of routes) {
    console.log(`Capturing ${route.name}...`);
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT_DIR, `${route.name}.png`),
      fullPage: true,
    });
  }

  await browser.close();
  console.log('Screenshots saved to', OUT_DIR);
})();
