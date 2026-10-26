import { expect, test } from '@playwright/test';

test('home excludes deferred pages and public navigation loads its page on demand', async ({ page }) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/fr');
  await expect(page.locator('main h1')).toBeVisible();
  expect(scripts.join('\n')).not.toMatch(/StaffShell-|StaffDashboardPage-|ApplicationsPage-|BeneficiariesPage-|ReportsPage-|LoginPage-|AboutPage-|DonatePage-/);
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) await menu.click();
  await page.locator('header a[href="/fr/a-propos"]:visible').first().click();
  await expect(page).toHaveURL(/\/fr\/a-propos$/);
  await expect(page.locator('main h1')).toBeVisible();
  expect(scripts.some((url) => /AboutPage-.*\.js/.test(url))).toBe(true);
  expect(errors).toEqual([]);
});

test('staff guard redirects before loading a protected page chunk', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.goto('/fr/staff/reports?range=month#summary');
  await expect(page.locator('input[type="password"]')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('redirectTo')).toBe('/fr/staff/reports?range=month#summary');
  expect(scripts.some((url) => /LoginPage-.*\.js/.test(url))).toBe(true);
  expect(scripts.join('\n')).not.toMatch(/ReportsPage-|StaffDashboardPage-/);
});

test('locale recovery retains query and hash for a deferred auth page', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('triumphchi.locale', 'fr'));
  await page.goto('/forgot-password?redirectTo=%2Ffr%2Fstaff#reset');
  await expect(page).toHaveURL(/\/fr\/forgot-password\?redirectTo=%2Ffr%2Fstaff#reset$/);
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('OAuth callback error renders in French after loading the callback chunk', async ({ page }) => {
  await page.goto('/fr/oauth/callback');
  await expect(page.getByRole('heading', { name: 'Connexion impossible' })).toBeVisible();
  await expect(page.locator('a[href="/fr/login"]')).toBeVisible();
});

test('OAuth exchange reaches lazy staff reports and preserves permission denial', async ({ page }) => {
  const errors: string[] = [];
  const scripts: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.addInitScript(() => localStorage.setItem('triumphchi.oauth.redirectTo', '/en/staff/reports'));
  await page.route('**/api/v1/**', async (route) => {
    if (route.request().url().endsWith('/auth/oauth/exchange')) {
      expect(route.request().postDataJSON()).toEqual({ code: 'test-code', device_name: 'web-client' });
      await route.fulfill({ json: {
        token: { access_token: 'test-token', token_type: 'Bearer', expires_at: '2099-01-01T00:00:00Z' },
        user: { id: 1, name: 'Test User', email: 'test@example.org', status: 'active', preferred_locale: 'en', roles: [], permissions: [] },
      } });
    } else {
      await route.fulfill({ status: 503, json: { message: 'Test API unavailable' } });
    }
  });
  await page.goto('/en/oauth/callback?code=test-code');
  await expect(page).toHaveURL(/\/en\/staff\/reports$/);
  await expect(page.locator('main')).toContainText('permission');
  expect(scripts.some((url) => /ReportsPage-.*\.js/.test(url))).toBe(true);
  expect(scripts.join('\n')).not.toMatch(/StaffDashboardPage-|BeneficiariesPage-|ApplicationsPage-/);
  expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBe('test-token');
  expect(errors).toEqual([]);
});
