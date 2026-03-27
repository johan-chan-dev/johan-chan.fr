import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadContentByTypeForPrerender, getCoverImageUrl, getHeroImageUrl, getOGImageUrl } from '$lib/utils/content';
import { marked } from 'marked';
import { createShikiRenderer } from '$lib/utils/syntax-highlighting';
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

	// Render markdown content (only for .md — .svx is pre-compiled by mdsvex)
	let htmlContent: string | null = null;
	if (item.renderMode === 'md') {
		const renderer = await createShikiRenderer();
		marked.use({ renderer });
		htmlContent = await marked(item.content);
	}

	// Compute cover thumbnail URL, hero image URL, and OG image URL
	const coverUrl = getCoverImageUrl(item.type, slug, item.image);
	const hero = getHeroImageUrl(item.type, slug, item.image);
	const ogImage = getOGImageUrl(item.type, slug, item.image);

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

	// Estimate reading time from raw markdown content
	const wordCount = item.content.trim().split(/\s+/).filter(Boolean).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 250));

	return {
		article: {
			...item,
			htmlContent,
			renderMode: item.renderMode,
			coverUrl,
			heroUrl: hero?.url ?? null,
			heroSrcset: hero?.srcset ?? null,
			ogUrl: ogImage,
			readingTime
		},
		relatedArticles
	};
};
