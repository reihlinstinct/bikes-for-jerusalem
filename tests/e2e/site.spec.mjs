import { test, expect } from '@playwright/test';

const PAGES = [
  ['/', 'היי! אנחנו אב״י'],
  ['/rider/', 'הכל לרוכב/ת'],
  ['/events/', 'אירועים'],
  ['/articles/', 'ניירות עמדה וכתבות'],
  ['/act/', 'השפיעו כבר היום'],
  ['/about/', 'אודות'],
  ['/contact/', 'צרו קשר'],
];

// The analytics beacon (cloudflareinsights.com, issue #11) is intentionally
// unreachable in e2e runs (no external network). Abort those requests so the
// zero-console-errors assertions keep covering real page errors only.
test.beforeEach(async ({ page }) => {
  // Fulfill (not abort) with an empty script: an aborted request still logs
  // "Failed to load resource" as a console error in the page.
  await page.route(/cloudflareinsights\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
});

for (const [path, heading] of PAGES) {
  test(`page ${path} renders RTL with heading and no horizontal overflow`, async ({ page }, info) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toContainText(heading);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/shots/${info.project.name}${path.replace(/\//g, '_')}.png`, fullPage: true });
  });
}

test('every page discloses the anonymous analytics counter', async ({ page }) => {
  for (const [path] of PAGES) {
    await page.goto(path);
    await expect(page.locator('.site-footer .privacy')).toContainText('Cloudflare Web Analytics');
  }
});

test('navigation reaches every page', async ({ page, isMobile }) => {
  for (const [path] of PAGES.slice(1)) {
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: 'תפריט' }).click();
    await page.locator(`#site-nav a[href="${path}"]`).click();
    await expect(page).toHaveURL(path);
  }
});

test('mobile menu toggles and reports aria-expanded', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'תפריט' });
  await expect(page.locator('#site-nav')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-nav')).toBeVisible();
});

test('desktop shows the nav without a menu button', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only');
  await page.goto('/');
  await expect(page.locator('#site-nav')).toBeVisible();
  await expect(page.getByRole('button', { name: 'תפריט' })).toBeHidden();
});

test('articles tabs switch panels', async ({ page }) => {
  await page.goto('/articles/');
  await expect(page.locator('#panel-positions')).toBeVisible();
  await page.getByRole('tab', { name: 'כתבות' }).click();
  await expect(page.locator('#panel-news')).toBeVisible();
  await expect(page.locator('#panel-positions')).toBeHidden();
});

test('add-to-calendar link serves a valid .ics', async ({ page, request }) => {
  await page.goto('/events/');
  const href = await page.locator('a[href$=".ics"]').first().getAttribute('href');
  const res = await request.get(href);
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).toContain('BEGIN:VEVENT');
});

test('CSP blocks nothing the pages need (no console errors)', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const [path] of PAGES) await page.goto(path);
  expect(errors).toEqual([]);
});

test('articles tabs support arrow keys (RTL: right arrow goes to the previous tab)', async ({ page }) => {
  await page.goto('/articles/');
  await page.getByRole('tab', { name: 'כתבות' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'תקשורת' })).toBeFocused();
  await expect(page.locator('#panel-press')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'כתבות' })).toBeFocused();
});

test('header shows the organization logo, loaded', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.brand img');
  await expect(img).toBeVisible();
  expect(await img.evaluate((e) => e.complete && e.naturalWidth > 0)).toBe(true);
});
