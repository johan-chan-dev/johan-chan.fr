import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadContentByTypeForPrerender } from '$lib/utils/content';
import { prepareContentDetail } from '$lib/utils/content-detail';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const devlogs = loadContentByTypeForPrerender('devlog');
	return devlogs.map((d) => ({ slug: d.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	const item = getContentBySlug(slug);

	if (!item || item.type !== 'devlog' || item.published === false) {
		throw error(404, {
			message: 'Devlog non trouvé'
		});
	}

	const detail = await prepareContentDetail(item, slug);

	// Get all devlogs for the same project
	const projectDevlogs = loadContentByType('devlog').filter(
		(d) => d.parent === item.parent && d.published !== false
	);

	// Sort by date (newest first)
	projectDevlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	// Find current, previous, and next posts
	const currentIndex = projectDevlogs.findIndex((d) => d.slug === slug);
	const newerPost = currentIndex > 0 ? projectDevlogs[currentIndex - 1] : null;
	const olderPost = currentIndex < projectDevlogs.length - 1 ? projectDevlogs[currentIndex + 1] : null;

	return {
		post: {
			...item,
			...detail,
			renderMode: item.renderMode
		},
		projectInfo: {
			name: item.parent || 'Projet',
			posts: projectDevlogs,
			totalPosts: projectDevlogs.length
		},
		newerPost,
		olderPost
	};
};
