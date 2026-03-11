import type { PageServerLoad } from './$types';
import { loadDevlogsGrouped } from '$lib/utils/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const devlogsMap = loadDevlogsGrouped();
	// Convert Map to array for serialization
	const devlogs = Array.from(devlogsMap.entries()).map(([id, data]) => ({
		id,
		...data
	}));

	return {
		devlogs
	};
};
