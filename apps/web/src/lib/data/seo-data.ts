export interface SEOData {
	title: string;
	description: string;
	image?: string;
	type?: 'website' | 'article' | 'profile';
}

export const seoData: Record<string, SEOData> = {
	'/': {
		title: 'Johan Chan - Software Crafter',
		description:
			'Software Crafter depuis 2010. Je construis des logiciels qui durent. Réflexions sur le craft, la simplicité et la durabilité.',
		type: 'website'
	},
	'/about': {
		title: 'Philosophie - Johan Chan',
		description:
			'Ma philosophie du craft logiciel : simplicité, cohérence et durabilité. Les principes qui guident chaque ligne de code.',
		type: 'profile'
	},
	'/articles': {
		title: 'Articles - Johan Chan',
		description:
			'Réflexions sur le craft logiciel, l\'architecture durable et la philosophie du code.',
		type: 'website'
	},
	'/404': {
		title: 'Page introuvable - Johan Chan',
		description:
			'La page que vous recherchez est introuvable. Retournez à l\'accueil ou explorez les autres sections du site.',
		type: 'website'
	}
};

const defaultSEO: SEOData = {
	title: 'Johan Chan - Software Crafter',
	description:
		'Software Crafter depuis 2010. Réflexions sur le craft, la simplicité et la durabilité.',
	type: 'website'
};

export function getSEOData(pathname: string): SEOData {
	// Strip trailing slash for consistent matching (except root)
	const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
	return seoData[normalized] ?? defaultSEO;
}
