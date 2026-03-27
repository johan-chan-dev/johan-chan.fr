import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadContentByTypeForPrerender, getCoverImageUrl, getHeroImageUrl, getOGImageUrl } from '$lib/utils/content';
import { marked } from 'marked';
import { createShikiRenderer } from '$lib/utils/syntax-highlighting';
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

	// Estimate reading time from raw markdown content
	const wordCount = item.content.trim().split(/\s+/).filter(Boolean).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 250));

	return {
		post: {
			...item,
			htmlContent,
			renderMode: item.renderMode,
			coverUrl,
			heroUrl: hero?.url ?? null,
			heroSrcset: hero?.srcset ?? null,
			ogUrl: ogImage,
			readingTime
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
