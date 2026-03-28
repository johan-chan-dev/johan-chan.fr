import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.chapter.renderMode !== 'svx') {
		return data;
	}

	const slug = data.chapter.slug;
	const modules = import.meta.glob('$content/series/**/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		chapter: {
			...data.chapter,
			component: mod.default
		}
	};
};
