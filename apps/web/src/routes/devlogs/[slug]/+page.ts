import type { PageLoad } from './$types';
import { loadSvxComponent } from '$lib/utils/svx-loader';

export const load: PageLoad = async ({ data }) => {
	if (data.post.renderMode !== 'svx') {
		return data;
	}

	const component = await loadSvxComponent(
		data.post.slug!,
		import.meta.glob('$content/devlogs/**/content.svx')
	);

	return component
		? { ...data, post: { ...data.post, component } }
		: data;
};
