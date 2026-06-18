import { test, expect } from '@playwright/test';

test('FR /call renders heading + embed container and is noindex', async ({ page }) => {
  await page.goto('/call');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Réservons un moment');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByTestId('cal-inline')).toBeVisible();
});

test('FR /call initializes the Cal embed and reflects + re-themes', async ({ page }) => {
  await page.goto('/call');
  const el = page.getByTestId('cal-inline');
  // loader + init run synchronously on astro:page-load — no external dependency
  await expect(el).toHaveAttribute('data-cal-mounted', 'true');
  await expect.poll(() => page.evaluate(() => typeof (window as any).Cal)).toBe('function');
  const before = await el.getAttribute('data-cal-theme');
  expect(['dark', 'light']).toContain(before);
  await page.getByTestId('theme-toggle').click();
  const after = await el.getAttribute('data-cal-theme');
  expect(after).not.toBe(before);
});

test('FR /call mounts the Cal iframe (needs cal.lagraineducraft.fr reachable)', async ({ page }) => {
  await page.goto('/call');
  await expect(page.locator('[data-testid="cal-inline"] iframe')).toBeVisible({ timeout: 20_000 });
});

test('FR /call language switch points to /en/call', async ({ page }) => {
  await page.goto('/call');
  await expect(page.getByTestId('lang-switch')).toHaveAttribute('href', /\/en\/call\/?$/);
});

test('FR /call survives a view transition without duplicating', async ({ page }) => {
  await page.goto('/call');
  await expect(page.getByTestId('cal-inline')).toHaveAttribute('data-cal-mounted', 'true');
  await page.getByTestId('logo').click(); // client-side swap to home
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/call\/?$/);
  await expect(page.getByTestId('cal-inline')).toHaveCount(1);
  await expect(page.getByTestId('cal-inline')).toHaveAttribute('data-cal-mounted', 'true');
});
