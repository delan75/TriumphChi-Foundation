import { expect, test } from '@playwright/test';
import { formatImpactCount, formatImpactPercentage } from '../src/lib/impactSummary';

test('impact formatting rejects invalid values and preserves legitimate zero values', () => {
  for (const value of [null, undefined, NaN, Infinity, -1, '300']) {
    expect(formatImpactCount(value, '—', 'en')).toEqual({ value: '—', usedFallback: true });
    expect(formatImpactPercentage(value, '—')).toEqual({ value: '—', usedFallback: true });
  }
  expect(formatImpactCount(1.5, '—', 'en').usedFallback).toBe(true);
  expect(formatImpactPercentage(101, '—').usedFallback).toBe(true);
  expect(formatImpactCount(0, '—', 'fr')).toEqual({ value: '0', usedFallback: false });
  expect(formatImpactPercentage(0, '—')).toEqual({ value: '0%', usedFallback: false });
  expect(formatImpactPercentage(100, '—')).toEqual({ value: '100%', usedFallback: false });
});

test('discovery endpoints serve Markdown and JSON rather than the SPA shell', async ({
  request,
}) => {
  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBe(true);
  expect(llms.headers()['content-type']).toContain('text/plain');
  const markdown = await llms.text();
  expect(markdown.trimStart()).toMatch(/^# TriumphChi Foundation\r?\n/);
  expect(markdown).toMatch(/\[[^\]]+\]\(https:\/\/triumphchi\.org\//);
  expect(markdown).not.toMatch(/<!doctype/i);

  const catalogs = [];
  for (const url of ['/ai-catalog.json', '/.well-known/ai-catalog.json']) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('json');
    const catalog = await response.json();
    expect(catalog).toEqual({
      specVersion: '1.0',
      host: {
        displayName: 'TriumphChi Foundation',
        documentationUrl: 'https://triumphchi.org/llms.txt',
      },
      entries: [],
    });
    catalogs.push(catalog);
  }
  expect(catalogs[0]).toEqual(catalogs[1]);

  const ardManifests = [];
  for (const url of ['/ard.json', '/.well-known/ard.json']) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('json');
    const manifest = await response.json();
    expect(Array.isArray(manifest.entries)).toBe(true);
    expect(manifest.entries.length).toBeGreaterThan(0);
    for (const entry of manifest.entries) {
      expect(entry.identifier).toMatch(/^urn:air:triumphchi\.org:/);
      expect(typeof entry.displayName).toBe('string');
      expect(typeof entry.type).toBe('string');
      expect(typeof entry.url).toBe('string');
      expect(entry.url).toMatch(/^https:\/\/(triumphchi\.org|api\.triumphchi\.org)\//);
      expect(typeof entry.description).toBe('string');
      expect(Array.isArray(entry.tags)).toBe(true);
      expect(Array.isArray(entry.representativeQueries)).toBe(true);
      expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2);
      expect(entry.representativeQueries.length).toBeLessThanOrEqual(5);
    }
    ardManifests.push(manifest);
  }
  expect(ardManifests[0]).toEqual(ardManifests[1]);
});

for (const locale of ['en', 'fr']) {
  test(`${locale}: donation text has intended contrast and language control includes its visible label`, async ({
    page,
  }) => {
    await page.route('**/api/v1/public/impact-summary', (route) =>
      route.fulfill({
        json: {
          data: {
            children_supported: 0,
            partner_schools: 0,
            regions_reached: 0,
            school_continuation_rate: null,
          },
        },
      }),
    );
    await page.goto(`/${locale}`);
    const donatePath = locale === 'fr' ? 'donner' : 'donate';
    const donate = page.locator(`header a[href="/${locale}/${donatePath}"]:visible`).first();
    await expect(donate).toBeVisible();
    await expect(donate).toHaveCSS('color', 'rgb(255, 255, 255)');
    const language = page.getByRole('button', { name: new RegExp(`^${locale.toUpperCase()} —`) });
    await expect(language).toBeVisible();
    await expect(language).toHaveText(new RegExp(locale, 'i'));
  });

  test(`${locale}: valid impact metrics including zero do not show a data-unavailable warning`, async ({
    page,
  }) => {
    await page.route('**/api/v1/public/impact-summary', (route) =>
      route.fulfill({
        json: {
          data: {
            children_supported: 0,
            partner_schools: 0,
            regions_reached: 0,
            school_continuation_rate: 0,
          },
        },
      }),
    );
    await page.goto(`/${locale}/impact`);
    const grid = page.locator('div[aria-busy]');
    await expect(grid).toHaveAttribute('aria-busy', 'false');
    await expect(grid.locator('article').first()).toContainText('0');
    await expect(grid.locator('article').nth(3)).toContainText('0%');
    await expect(grid.locator('article')).toHaveCount(6);
    await expect(
      page.getByText(locale === 'fr' ? /catégories indiquées/ : /Program categories marked/),
    ).toBeVisible();
    await expect(
      page.getByText(
        locale === 'fr'
          ? /indicateurs vérifiés sont indisponibles/
          : /Some verified figures are unavailable/,
      ),
    ).toHaveCount(0);
    await expect(page).toHaveTitle(
      locale === 'fr'
        ? 'Impact éducatif au Cameroun | Fondation TriumphChi'
        : 'Education Impact in Cameroon | TriumphChi Foundation',
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://triumphchi.org/${locale}/impact`,
    );
  });
}

test('impact loading, partial data, and API failure keep useful content and neutral fallback values', async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/public/impact-summary', async (route) => {
    await pending;
    await route.fulfill({
      json: {
        data: {
          children_supported: 1234,
          partner_schools: null,
          regions_reached: -1,
          school_continuation_rate: 101,
        },
      },
    });
  });
  await page.goto('/en/impact');
  await expect(page.getByText('Loading verified impact figures.')).toBeVisible();
  await expect(page.locator('div[aria-busy]')).toHaveAttribute('aria-busy', 'true');
  release();
  const cards = page.locator('div[aria-busy] article');
  await expect(cards.first()).toContainText('1,234');
  await expect(cards.nth(1)).toContainText('—');
  await expect(cards.nth(2)).toContainText('—');
  await expect(cards.nth(3)).toContainText('—');
  await expect(page.getByText(/Some verified figures are unavailable/)).toBeVisible();
  await expect(page.getByText(/not verified beneficiary stories/)).toBeVisible();

  await page.unroute('**/api/v1/public/impact-summary');
  await page.route('**/api/v1/public/impact-summary', (route) =>
    route.fulfill({ status: 503, json: { message: 'Unavailable' } }),
  );
  await page.goto('/fr/impact');
  await expect(page.getByText(/indicateurs vérifiés sont indisponibles/)).toBeVisible();
  await expect(page.locator('div[aria-busy] article').first()).toContainText('—');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.getByText('300+', { exact: true })).toHaveCount(0);
  await expect(page.getByText('95%', { exact: true })).toHaveCount(0);
});

test('entry source map is available in the production build', async ({ request }) => {
  const html = await (await request.get('/en')).text();
  const entry = html.match(/<script[^>]+src="([^"]+\/index-[^"]+\.js)"/)?.[1];
  expect(entry).toBeTruthy();
  const script = await (await request.get(entry!)).text();
  const mapFile = script.match(/sourceMappingURL=([^\s]+)/)?.[1];
  expect(mapFile).toBeTruthy();
  const mapUrl = new URL(mapFile!, new URL(entry!, 'http://127.0.0.1:4173')).pathname;
  const response = await request.get(mapUrl);
  expect(response.ok()).toBe(true);
  const map = await response.json();
  expect(map.version).toBe(3);
  expect(map.sources.length).toBeGreaterThan(0);
});
