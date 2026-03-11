import type { LayoutServerLoad } from './$types';
import { loadContentByType } from '$lib/utils/content';
import type { ContentType } from '@johan-chan/content/schema';

interface ContentCounts {
	articles: number;
	series: number;
	devlogs: number;
}

interface LayoutData {
	env: 'development' | 'production';
	contentCounts: ContentCounts;
}

export const load = (async () => {
	const contentCounts: ContentCounts = {
		articles: loadContentByType('article').length,
		series: loadContentByType('série').length,
		devlogs: loadContentByType('devlog').length
	};

	return {
		env: process.env.NODE_ENV ?? 'development',
		contentCounts
	} as LayoutData;
}) satisfies LayoutServerLoad;
