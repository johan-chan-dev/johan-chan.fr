import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.article.renderMode !== 'svx') {
		return data;
	}

	const slug = data.article.slug;
	const modules = import.meta.glob('$content/articles/*/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		article: {
			...data.article,
			component: mod.default
		}
	};
};
