import { test, expect } from '@playwright/test';

const contentPages = [
	{ path: '/articles/10x-plus-productif-ne-veut-pas-dire-ce-que-vous-croyez', name: 'article-10x' },
	{ path: '/articles/ce-que-augmente-veut-dire', name: 'article-augmente' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-jour-ou-jai-cesse-davoir-peur-de-lia', name: 'series-ch01' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-marche-se-restructure', name: 'series-ch02' },
	{ path: '/series/le-monde-du-dev-sous-choc/et-si-le-marche-ne-suivait-plus', name: 'series-ch03' },
	{ path: '/series/le-monde-du-dev-sous-choc/ce-qui-casse-ce-qui-se-copie', name: 'series-ch04' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-piege-de-la-qualite-suffisante', name: 'series-ch05' },
	{ path: '/series/le-monde-du-dev-sous-choc/quand-tout-le-monde-genere-qui-relit', name: 'series-ch06' },
	{ path: '/series/le-monde-du-dev-sous-choc/lia-est-faillible-et-ton-code', name: 'series-ch07' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-code-propre-n-est-pas-le-craft', name: 'series-ch08' },
	{ path: '/series/le-monde-du-dev-sous-choc/la-discipline-se-deplace', name: 'series-ch09' },
	{ path: '/series/le-monde-du-dev-sous-choc/dou-viendront-les-devs-de-demain', name: 'series-ch10' },
	{ path: '/series/le-monde-du-dev-sous-choc/ou-on-va', name: 'series-ch11' },
	{ path: '/series/le-monde-du-dev-sous-choc/la-fin', name: 'series-ch12' },
];

for (const { path: pagePath, name } of contentPages) {
	test(`visual: ${name}`, async ({ page }) => {
		await page.goto(pagePath);
		await page.waitForLoadState('networkidle');

		const contentBody = page.locator('.article-content, .post-content, .chapter-content');
		await expect(contentBody).toBeVisible();

		await expect(contentBody).toHaveScreenshot(`${name}.png`, {
			maxDiffPixelRatio: 0.01,
		});
	});
}
