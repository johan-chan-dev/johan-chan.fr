import type { PageLoad } from './$types';

export const load = (() => {
	return {
		seo: {
			title: 'Philosophie | Johan Chan - Software Crafter',
			description:
				'Ma philosophie du craft logiciel : simplicité, cohérence et durabilité. Les principes qui guident mon approche du développement.',
			keywords:
				'philosophie, craft logiciel, simplicité, cohérence, durabilité, software crafter, principes développement',
			type: 'profile' as const
		}
	};
}) satisfies PageLoad;
