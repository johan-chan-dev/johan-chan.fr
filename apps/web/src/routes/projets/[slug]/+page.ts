import { error } from '@sveltejs/kit';
import { getProjet, projets } from '$lib/data/projets';
import type { PageLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => projets.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	const projet = getProjet(params.slug);

	if (!projet) {
		throw error(404, { message: 'Réalisation non trouvée' });
	}

	return { projet };
};
