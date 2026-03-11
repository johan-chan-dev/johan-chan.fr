import type { RequestHandler } from '@sveltejs/kit';
import { loadAllContent, loadSeriesGrouped } from '$lib/utils/content';

export const prerender = true;

const SITE_URL = 'https://www.johan-chan.fr';

function formatDate(date: Date): string {
	return date.toISOString();
}

function generateStaticRoutes() {
	return ['/', '/about', '/series', '/articles', '/devlogs'].map((path) => ({
		url: `${SITE_URL}${path}`,
		lastmod: new Date().toISOString(),
		changefreq: path === '/' ? 'weekly' : 'monthly',
		priority: path === '/' ? 1.0 : 0.8
	}));
}

function generateContentRoutes() {
	const entries: Array<{ url: string; lastmod: string; changefreq: string; priority: number }> =
		[];

	const seriesMap = loadSeriesGrouped();
	for (const [seriesSlug, seriesData] of seriesMap) {
		const latestDate = seriesData.items.reduce(
			(l, i) => (i.date > l ? i.date : l),
			seriesData.items[0]?.date || ''
		);
		entries.push({
			url: `${SITE_URL}/series/${seriesSlug}`,
			lastmod: latestDate ? formatDate(new Date(latestDate)) : new Date().toISOString(),
			changefreq: 'monthly',
			priority: 0.7
		});

		for (const chapter of seriesData.items.filter(
			(c) => c.published !== false && c.preview !== true
		)) {
			entries.push({
				url: `${SITE_URL}/series/${seriesSlug}/${chapter.slug}`,
				lastmod: formatDate(new Date(chapter.date)),
				changefreq: 'monthly',
				priority: 0.6
			});
		}
	}

	const articles = loadAllContent().filter(
		(i) => i.type === 'article' && i.published !== false
	);
	for (const article of articles) {
		entries.push({
			url: `${SITE_URL}/articles/${article.slug}`,
			lastmod: formatDate(new Date(article.date)),
			changefreq: 'monthly',
			priority: 0.6
		});
	}

	return entries;
}

function generateSitemapXML(
	entries: Array<{ url: string; lastmod: string; changefreq: string; priority: number }>
) {
	const urlEntries = entries
		.map(
			(e) =>
				`  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

export const GET: RequestHandler = async () => {
	const entries = [...generateStaticRoutes(), ...generateContentRoutes()];
	entries.sort((a, b) => b.priority - a.priority || a.url.localeCompare(b.url));

	return new Response(generateSitemapXML(entries), {
		headers: { 'Content-Type': 'application/xml' }
	});
};
