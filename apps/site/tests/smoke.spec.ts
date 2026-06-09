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
  expect(total).toBeGreaterThanOrEqual(15); // 15 imported articles + showcase
  await page.locator('[data-reg="design"]').click();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeLessThan(total);
});

test('imported article renders title, body, hero image, and back link', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Boring languages win');
  await expect(page.locator('article')).toContainText('le journal'); // back link
  await expect(page.locator('.atl-prose')).toContainText('Python');
  // optimized hero <img> rendered from the article's image
  await expect(page.locator('article figure img')).toBeVisible();
});

test('series chapter shows the series thread line', async ({ page }) => {
  await page.goto('/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.locator('body')).toContainText('Le monde du dev sous choc');
  await expect(page.locator('body')).toContainText('chap. 2');
});

test('projets page shows the empty state (no real projects yet)', async ({ page }) => {
  await page.goto('/projets');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('body')).toContainText('Rien ici pour l’instant');
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

test('EN journal lists the translated articles', async ({ page }) => {
  await page.goto('/en/journal');
  const rows = page.getByTestId('piece-row');
  await expect(rows.first()).toBeVisible();
  // all 15 imported articles now translated + the bilingual showcase
  expect(await rows.count()).toBeGreaterThanOrEqual(15);
  await expect(page.locator('body')).toContainText('Clean Code Isn’t the Craft');
});

test('EN article renders English title + body', async ({ page }) => {
  await page.goto('/en/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clean Code Isn’t the Craft');
  await expect(page.locator('.atl-prose')).toContainText('craft');
});

test('boring-languages-win renders its Callout and BubbleChart components', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await expect(page.getByTestId('callout')).toBeVisible();
  // SVG quadrant chart renders (no raw JSX leak)
  await expect(page.locator('.atl-bubblechart svg')).toBeVisible();
  await expect(page.locator('.atl-bubblechart')).toContainText('Python');
  await expect(page.locator('body')).not.toContainText('quadrants={');
});

test('language switch from a translated imported article lands on its EN sibling', async ({ page }) => {
  await page.goto('/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.getByTestId('lang-switch')).toBeVisible();
  await page.getByTestId('lang-switch').click();
  await expect(page).toHaveURL('/en/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clean Code');
});

test('framework showcase: code panel, live island, compare mode', async ({ page }) => {
  await page.goto('/journal/reactivite-trois-frameworks');
  const showcase = page.locator('[data-showcase]');
  await expect(showcase).toBeVisible();
  // Shiki-rendered source visible (Svelte uses $state)
  await expect(showcase).toContainText('$state');
  // focus mode: the Svelte demo is shown and interactive
  const svelteDemo = page.locator('[data-demo][data-framework="svelte"]');
  await expect(svelteDemo).toBeVisible();
  await svelteDemo.getByRole('button', { name: 'plus' }).click();
  await expect(svelteDemo.locator('output')).toHaveText('1');
  // in focus, other frameworks' demos are hidden
  await expect(page.locator('[data-demo][data-framework="react"]')).toBeHidden();
  // switching tabs in focus shows the picked framework and hides the others
  await page.getByRole('button', { name: 'Vue', exact: true }).click();
  await expect(page.locator('[data-demo][data-framework="vue"]')).toBeVisible();
  await expect(svelteDemo).toBeHidden();
  await expect(page.locator('[data-demo][data-framework="react"]')).toBeHidden();
  // switching to the Angular tab shows its hydrated island
  await page.getByRole('button', { name: 'Angular', exact: true }).click();
  const ngDemo = page.locator('[data-demo][data-framework="angular"]');
  await expect(ngDemo).toBeVisible();
  await ngDemo.getByRole('button', { name: 'plus' }).click();
  await expect(ngDemo.locator('output')).toHaveText('1');
  // compare toggle reveals all three
  await page.getByRole('button', { name: 'Comparer' }).click();
  await expect(showcase).toHaveAttribute('data-mode', 'compare');
  await expect(page.locator('[data-demo][data-framework="vue"]')).toBeVisible();
  await expect(page.locator('[data-demo][data-framework="react"]')).toBeVisible();
});
