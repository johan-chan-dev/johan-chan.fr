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

test('journal list: lens switcher filters by register and collapses series', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  // Temps (default): the collapsed series row is visible, chapter rows are hidden
  await expect(page.locator('[data-series-row]').first()).toBeVisible();
  await expect(page.locator('[data-testid="piece-row"][data-chapter]').first()).toBeHidden();
  // switch to the refl register lens
  await page.locator('[data-lens-btn="reg"][data-lens-val="refl"]').click();
  await expect(page).toHaveURL(/\?reg=refl$/);
  await expect(page.locator('[data-series-row]').first()).toBeHidden();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeGreaterThan(0);
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
  await page.locator('[data-lens-btn="reg"][data-lens-val="design"]').click();
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
  await expect(page).toHaveURL(/\/en\/journal\/le-code-propre-n-est-pas-le-craft\/?$/);
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

test('series index lists the series', async ({ page }) => {
  await page.goto('/series');
  const cards = page.getByTestId('series-card');
  await expect(cards.first()).toBeVisible();
  await expect(page.locator('body')).toContainText('Le monde du dev sous choc');
});

test('series detail lists chapters in order', async ({ page }) => {
  await page.goto('/series/le-monde-du-dev-sous-choc');
  const chapters = page.getByTestId('chapter-link');
  expect(await chapters.count()).toBeGreaterThanOrEqual(12);
  await expect(chapters.first()).toContainText('Le jour où j’ai cessé d’avoir peur de l’IA');
});

test('article links to its series and shows prev/next', async ({ page }) => {
  await page.goto('/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.locator('a[href="/series/le-monde-du-dev-sous-choc"]')).toBeVisible();
  await expect(page.getByTestId('chapter-prev')).toBeVisible();
  await expect(page.getByTestId('chapter-next')).toBeVisible();
});

test('EN series detail renders chapters', async ({ page }) => {
  await page.goto('/en/series/le-monde-du-dev-sous-choc');
  const chapters = page.getByTestId('chapter-link');
  expect(await chapters.count()).toBeGreaterThanOrEqual(12);
  await expect(chapters.first()).toContainText('The Day I Stopped Being Afraid of AI');
});

test('theme lens filters by tag and syncs the URL', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  await page.locator('[data-theme-toggle]').click();
  await page.locator('[data-lens-btn="tag"][data-lens-val="craft"]').first().click();
  await expect(page).toHaveURL(/\?tag=craft$/);
  // reload restores the filtered state from the URL
  await page.goto('/journal?tag=craft');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-series-row]').first()).toBeHidden();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeGreaterThan(0);
});

test('Séries link points to the series index', async ({ page }) => {
  await page.goto('/journal');
  await expect(page.locator('[data-lens] a[href="/series"]')).toBeVisible();
});

test('journal has a canonical link to /journal', async ({ page }) => {
  await page.goto('/journal');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/journal$/);
});

test('search returns a matching article and clearing restores the feed', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  const input = page.locator('[data-search-input]');
  await input.fill('Python');
  await expect(page.locator('[data-search-results] [data-search-result]').first()).toBeVisible();
  await expect(page.locator('[data-search-results]')).toContainText('Boring languages win');
  await expect(page.locator('[data-feed]')).toBeHidden();
  await input.fill('');
  await expect(page.locator('[data-feed]')).toBeVisible();
});

test('clicking a search result navigates to the article', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  await page.locator('[data-search-input]').fill('Python');
  await page.locator('[data-search-results] [data-search-result]').first().click();
  await expect(page).toHaveURL(/\/journal\/boring-languages-win\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Boring languages win');
});

test('pagefind index is served on the build', async ({ page }) => {
  const res = await page.request.get('/pagefind/pagefind.js');
  expect(res.status()).toBe(200);
});

test('breakout: the language chart bleeds wider than the body text', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await page.waitForLoadState('networkidle');
  const chart = await page.locator('.atl-bubblechart').first().boundingBox();
  const para = await page.locator('.atl-prose > p').first().boundingBox();
  expect(chart!.width).toBeGreaterThan(para!.width + 80);
  // body paragraph stays at the reading rail (not stretched to the container)
  expect(para!.width).toBeLessThan(760);
});

test('breakout: the framework showcase bleeds wider than the body text', async ({ page }) => {
  await page.goto('/journal/reactivite-trois-frameworks');
  await page.waitForLoadState('networkidle');
  const show = await page.locator('[data-showcase]').boundingBox();
  const para = await page.locator('.atl-prose > p').first().boundingBox();
  expect(show!.width).toBeGreaterThan(para!.width + 80);
});

test('series detail leads with a cover hero', async ({ page }) => {
  await page.goto('/series/le-monde-du-dev-sous-choc');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('article figure img').first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Le monde du dev sous choc');
  await expect(page.locator('article')).toContainText('chapitres');
  expect(await page.getByTestId('chapter-link').count()).toBeGreaterThanOrEqual(12);
});
