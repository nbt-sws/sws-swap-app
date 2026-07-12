const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 375, height: 812 } });
  await p.addInitScript(() => {
    localStorage.setItem('sws_access_token', 'dev-token-buyer');
    localStorage.setItem('sws_dev_user', JSON.stringify({ id: 'u1', email: 'buyer@example.com', fullName: 'BoBoBoA', tier: 'MEMBER', kycStatus: 'APPROVED', currency: 'THB' }));
  });
  const pages = [
    ['home', '/'],
    ['market', '/market'],
    ['vault', '/vault'],
    ['seller', '/seller/u1'],
    ['services', '/services'],
    ['profile', '/profile'],
  ];
  for (const [name, path] of pages) {
    await p.goto('http://localhost:3002' + path);
    await p.waitForTimeout(2000);
    await p.screenshot({ path: `screenshots/polish-${name}.png` });
  }
  await b.close();
})();
