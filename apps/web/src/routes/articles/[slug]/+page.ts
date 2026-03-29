import type { PageLoad } from './$types';
import { loadSvxComponent } from '$lib/utils/svx-loader';

export const load: PageLoad = async ({ data }) => {
	if (data.article.renderMode !== 'svx') {
		return data;
	}

	const component = await loadSvxComponent(
		data.article.slug!,
		import.meta.glob('$content/articles/*/content.svx')
	);

	return component
		? { ...data, article: { ...data.article, component } }
		: data;
};
