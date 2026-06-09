import { test, expect } from '@playwright/test';

test('FR home renders hero + desktop nav + lang=fr', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByTestId('hero')).toContainText('début à la fin');
  await expect(page.getByTestId('nav-desktop')).toContainText('Journal');
});

test('EN home renders at /en/ with lang=en', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('nav-desktop')).toContainText('About');
});

test('language switch links FR home to EN home', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('lang-switch')).toHaveAttribute('href', '/en/');
});

test('theme toggle switches and persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByTestId('theme-toggle').click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);
  expect(after, 'theme-toggle must set a data-theme value').toBeTruthy();
  expect(['atelier-light', 'atelier-dark']).toContain(after);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after!);
});

test('journal list renders all pieces and filters by register', async ({ page }) => {
  await page.goto('/journal');
  const rows = page.getByTestId('piece-row');
  await expect(rows.first()).toBeVisible();
  const total = await rows.count();
  expect(total).toBeGreaterThanOrEqual(5);
  await page.locator('[data-reg="design"]').click();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeLessThan(total);
});

test('article detail page renders title and back link', async ({ page }) => {
  await page.goto('/journal/editeur-code-navigateur-zero-dependance');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('éditeur');
  await expect(page.locator('article')).toContainText('le journal');
});

test('case study page renders story and demo', async ({ page }) => {
  await page.goto('/projets/atelier-wasm');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Atelier WASM');
  await expect(page.locator('[data-proof]')).toBeVisible();
});

test('demo MDX page still renders the Callout component', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Démo MDX', level: 1 })).toBeVisible();
  await expect(page.getByTestId('callout')).toBeVisible();
});

test('view transitions: interactivity + theme survive in-app navigation', async ({ page }) => {
  await page.goto('/');
  // navigate to an article by clicking a feed row (client-side swap, not a full load)
  await page.getByTestId('piece-row').first().click();
  await expect(page).toHaveURL(/\/journal\/.+/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // theme toggle must still work after the swap (re-init on astro:page-load)
  const beforeTheme = await page.locator('html').getAttribute('data-theme');
  await page.getByTestId('theme-toggle').click();
  const afterTheme = await page.locator('html').getAttribute('data-theme');
  expect(afterTheme).not.toBe(beforeTheme);

  // navigate again via the nav; theme must persist across the swap (astro:after-swap)
  await page.getByTestId('nav-desktop').getByText('Journal').click();
  await expect(page).toHaveURL(/\/journal\/?$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', afterTheme!);

  // filters must re-initialise on the swapped-in journal page
  const rows = page.getByTestId('piece-row');
  const total = await rows.count();
  await page.locator('[data-reg="design"]').click();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeLessThan(total);
});
