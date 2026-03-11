export interface SEOData {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	type?: 'website' | 'article' | 'profile';
}

export const seoData: Record<string, SEOData> = {
	'/': {
		title: 'Johan Chan - Software Crafter | Craft Logiciel',
		description:
			'Software Crafter depuis 2010. Je construis des logiciels qui durent. Réflexions sur le craft, la simplicité et la durabilité.',
		keywords:
			'software crafter, craft logiciel, simplicité, cohérence, durabilité, Johan Chan',
		type: 'website'
	},
	'/about': {
		title: 'Philosophie | Johan Chan - Software Crafter',
		description:
			'Ma philosophie du craft logiciel : simplicité, cohérence et durabilité. Les principes qui guident chaque ligne de code.',
		keywords:
			'philosophie, craft logiciel, simplicité, cohérence, durabilité, principes développement',
		type: 'profile'
	},
	'/articles': {
		title: 'Articles | Johan Chan - Software Crafter',
		description:
			'Réflexions sur le craft logiciel, l\'architecture durable et la philosophie du code.',
		keywords:
			'articles, craft logiciel, philosophie du code, architecture durable, réflexions techniques',
		type: 'website'
	},
	'/404': {
		title: 'Page introuvable - Erreur 404 | Johan Chan',
		description:
			'La page que vous recherchez est introuvable. Retournez à l\'accueil ou explorez les autres sections du site.',
		keywords: 'page introuvable, erreur 404, Johan Chan',
		type: 'website'
	}
};

export function getSEOData(pathname: string): SEOData | null {
	return seoData[pathname] || null;
}
