import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.post.renderMode !== 'svx') {
		return data;
	}

	const slug = data.post.slug;
	const modules = import.meta.glob('$content/devlogs/**/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		post: {
			...data.post,
			component: mod.default
		}
	};
};
