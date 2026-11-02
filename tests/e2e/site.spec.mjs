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
