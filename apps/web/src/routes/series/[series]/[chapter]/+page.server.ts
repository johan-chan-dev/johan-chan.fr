import { dev } from '$app/environment';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, getCoverImageUrl, getHeroImageUrl, getOGImageUrl, loadSeriesGroupedForPrerender } from '$lib/utils/content';
import { marked } from 'marked';
import { createShikiRenderer } from '$lib/utils/syntax-highlighting';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const seriesMap = loadSeriesGroupedForPrerender();
	const entries: Array<{ series: string; chapter: string }> = [];

	for (const [seriesSlug, seriesData] of seriesMap) {
		for (const item of seriesData.items) {
			entries.push({ series: seriesSlug, chapter: item.slug });
		}
	}

	return entries;
};

export const load: PageServerLoad = async ({ params }) => {
	const { series: seriesSlug, chapter: chapterSlug } = params;

	const item = getContentBySlug(chapterSlug);

	const isDevMode = dev && !building;

	if (!item || item.type !== 'série' || (!isDevMode && item.published === false)) {
		throw error(404, {
			message: 'Chapitre non trouvé'
		});
	}

	// Render markdown content (only for .md — .svx is pre-compiled by mdsvex)
	let htmlContent: string | null = null;
	if (item.renderMode === 'md') {
		const renderer = await createShikiRenderer();
		marked.use({ renderer });
		htmlContent = await marked(item.content);
	}

	// Compute cover thumbnail URL, hero image URL, and OG image URL using nested path
	const coverUrl = getCoverImageUrl(item.type, chapterSlug, item.image, seriesSlug);
	const hero = getHeroImageUrl(item.type, chapterSlug, item.image, seriesSlug);
	const ogImage = getOGImageUrl(item.type, chapterSlug, item.image, seriesSlug);

	// Get all chapters in the same series
	const allSeriesItems = loadContentByType('série').filter(
		(s) => (s.parentSlug === seriesSlug || s.parent === item.parent) && (isDevMode || s.published !== false)
	);

	// Sort by order
	allSeriesItems.sort((a, b) => (a.order || 0) - (b.order || 0));

	// Find current, previous, and next chapters
	const currentIndex = allSeriesItems.findIndex((s) => s.slug === chapterSlug);
	const prevChapter = currentIndex > 0 ? allSeriesItems[currentIndex - 1] : null;
	const nextChapter = currentIndex < allSeriesItems.length - 1 ? allSeriesItems[currentIndex + 1] : null;

	// Estimate reading time from raw markdown content
	const wordCount = item.content.trim().split(/\s+/).filter(Boolean).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 250));

	return {
		chapter: {
			...item,
			htmlContent,
			renderMode: item.renderMode,
			coverUrl,
			heroUrl: hero?.url ?? null,
			heroSrcset: hero?.srcset ?? null,
			ogUrl: ogImage,
			readingTime
		},
		seriesInfo: {
			title: item.parent || 'Série',
			slug: seriesSlug,
			chapters: allSeriesItems,
			currentIndex: currentIndex + 1,
			totalChapters: allSeriesItems.length
		},
		prevChapter,
		nextChapter
	};
};
