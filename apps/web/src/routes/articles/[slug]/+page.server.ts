import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadContentByTypeForPrerender } from '$lib/utils/content';
import { prepareContentDetail } from '$lib/utils/content-detail';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const articles = loadContentByTypeForPrerender('article');
	return articles.map((e) => ({ slug: e.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	const item = getContentBySlug(slug);

	if (!item || item.type !== 'article') {
		throw error(404, {
			message: 'Article non trouvé'
		});
	}

	const detail = await prepareContentDetail(item, slug);

	// Get related articles (same tags)
	const allArticles = loadContentByType('article').filter(
		(e) => e.slug !== slug && e.published !== false
	);
	const relatedArticles = allArticles
		.map((article) => {
			const commonTags = article.tags.filter((tag) => item.tags.includes(tag));
			return { ...article, score: commonTags.length };
		})
		.filter((e) => e.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 3);

	return {
		article: {
			...item,
			...detail,
			renderMode: item.renderMode
		},
		relatedArticles
	};
};
