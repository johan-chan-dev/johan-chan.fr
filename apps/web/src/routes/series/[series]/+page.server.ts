import { error } from '@sveltejs/kit';
import { loadSeriesBySlug, loadSeriesGroupedForPrerender, getCoverImageUrl } from '$lib/utils/content';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const seriesMap = loadSeriesGroupedForPrerender();
	return Array.from(seriesMap.keys()).map((slug) => ({ series: slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { series: seriesSlug } = params;

	const seriesData = loadSeriesBySlug(seriesSlug);

	if (!seriesData) {
		throw error(404, { message: 'Série non trouvée' });
	}

	// Build chapter list with cover URLs
	const chapters = seriesData.items.map((item) => ({
		...item,
		coverUrl: item.coverUrl || getCoverImageUrl('série', item.slug, item.image, seriesSlug)
	}));

	return {
		series: {
			title: seriesData.title,
			description: seriesData.description,
			slug: seriesData.slug,
			coverUrl: seriesData.coverUrl || null
		},
		chapters
	};
};
