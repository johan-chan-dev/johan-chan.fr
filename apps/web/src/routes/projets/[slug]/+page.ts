import { error } from '@sveltejs/kit';
import { getProjet, publishedProjets } from '$lib/data/projets';
import type { PageLoad, EntryGenerator } from './$types';

export const prerender = true;

// Seuls les projets publiés sont prérendus ; les brouillons ne produisent
// aucune page (404 via le fallback de adapter-static).
export const entries: EntryGenerator = () => publishedProjets.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	const projet = getProjet(params.slug);

	if (!projet || !projet.published) {
		throw error(404, { message: 'Réalisation non trouvée' });
	}

	return { projet };
};
