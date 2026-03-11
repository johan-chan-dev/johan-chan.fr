import type { PageServerLoad } from './$types';
import { loadContentByType } from '$lib/utils/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const content = loadContentByType('article');

	return {
		content
	};
};
