import { expect, test } from '@playwright/test';

test('localized navigation and migrated styles work in the production build', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/en');
  await expect(page.locator('header')).toBeVisible();
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) {
    await menu.click();
  }
  const about = page.locator('header a[href="/en/about"]:visible').first();
  await about.click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.locator('main')).toBeVisible();
  const foundationColor = await page.evaluate(() => {
    const element = document.createElement('div');
    element.className = 'bg-foundation-600 rounded-xs shadow-xs';
    document.body.append(element);
    const style = getComputedStyle(element);
    const result = { background: style.backgroundColor, radius: style.borderRadius, shadow: style.boxShadow };
    element.remove();
    return result;
  });
  expect(foundationColor.background).toBe('rgb(15, 111, 86)');
  expect(foundationColor.radius).toBe('2px');
  expect(foundationColor.shadow).not.toBe('none');
  expect(errors).toEqual([]);
});

test('staff guard preserves the requested localized path and query', async ({ page }) => {
  await page.goto('/fr/staff/applications?status=pending');
  await expect(page).toHaveURL(/\/fr\/login\?/);
  const destination = new URL(page.url()).searchParams.get('redirectTo');
  expect(destination).toBe('/fr/staff/applications?status=pending');
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('root redirects preserve query and hash; nested public routes load directly', async ({ page }) => {
  await page.goto('/?campaign=education#support');
  await expect(page).toHaveURL(/\/(en|fr)\?campaign=education#support$/);
  await page.goto('/en/donate/paypal/cancel');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveURL(/\/en\/donate\/paypal\/cancel$/);
});

test('unmatched nested routes render the recovery page', async ({ page }) => {
  await page.goto('/en/unknown/nested/page');
  await expect(page.getByRole('heading', { name: "We couldn't find that page" })).toBeVisible();
  await expect(page.locator('a[href="/en"]').first()).toBeVisible();
});
