import { dev } from '$app/environment';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadSeriesGroupedForPrerender } from '$lib/utils/content';
import { prepareContentDetail } from '$lib/utils/content-detail';
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

	const detail = await prepareContentDetail(item, chapterSlug, seriesSlug);

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

	return {
		chapter: {
			...item,
			...detail,
			renderMode: item.renderMode
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
