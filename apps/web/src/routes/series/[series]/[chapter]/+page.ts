import type { PageLoad } from './$types';
import { loadSvxComponent } from '$lib/utils/svx-loader';

export const load: PageLoad = async ({ data }) => {
	if (data.chapter.renderMode !== 'svx') {
		return data;
	}

	const component = await loadSvxComponent(
		data.chapter.slug!,
		import.meta.glob('$content/series/**/content.svx')
	);

	return component
		? { ...data, chapter: { ...data.chapter, component } }
		: data;
};
