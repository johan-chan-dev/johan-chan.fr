import type { PageLoad } from './$types';

export const load = (() => {
	return {
		seo: {
			title: 'Philosophie - Johan Chan',
			description:
				'Ma philosophie du craft logiciel : simplicité, cohérence et durabilité. Les principes qui guident mon approche du développement.',
			type: 'profile' as const
		}
	};
}) satisfies PageLoad;
