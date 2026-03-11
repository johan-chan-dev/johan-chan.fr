import type { PageServerLoad } from './$types';
import { loadSeriesGrouped } from '$lib/utils/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const seriesMap = loadSeriesGrouped();
	// Convert Map to array for serialization
	const series = Array.from(seriesMap.entries()).map(([id, data]) => ({
		id,
		...data
	}));

	return {
		series
	};
};
