import type { PageServerLoad } from './$types';
import { loadAllContent } from '$lib/utils/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const content = loadAllContent();

	return {
		content,
		seo: {
			title: 'Johan Chan - Ce que je pense. Ce que j\'apprends.',
			description:
				'Réflexions sur le craft logiciel, la pensée systémique et l\'entrepreneuriat. Articles, séries et carnets de développement par Johan Chan.',
			keywords:
				'craft logiciel, pensée systémique, entrepreneuriat, développement, articles, réflexions techniques'
		}
	};
};
