// Réalisations — feature web-app, données en dur.
// Le package @johan-chan/content ne connaît que article/série/devlog/post :
// il n'y a pas de type « projet ». Cette liste vit donc dans le repo public,
// indépendante du studio du cockpit.

export interface ProjetSection {
	heading: string;
	body: string;
}

export interface Projet {
	slug: string;
	title: string;
	/** Phrase d'accroche affichée en tête (liste + détail). */
	summary: string;
	externalUrl: string;
	status: string;
	tags: string[];
	stack: string[];
	sections: ProjetSection[];
	/** Capture réelle du site, sous static/images/ (chemin relatif au base). */
	image?: string;
	imageAlt?: string;
	/** Description SEO (≤ ~160 caractères). */
	seoDescription: string;
}

export const projets: Projet[] = [
	{
		slug: 'baan-waan',
		title: "Baan-Waan : d'une idée à une plateforme en production",
		summary:
			'Une plateforme e-commerce complète pour un commerce de restauration, conçue et livrée de bout en bout, opérée en production depuis mars 2026. En ligne sur baan-waan.com.',
		externalUrl: 'https://www.baan-waan.com',
		status: 'En production depuis mars 2026',
		tags: ['SvelteKit', 'Stripe', 'e-commerce', 'idée→prod'],
		stack: ['SvelteKit', 'Drizzle', 'PostgreSQL', 'Stripe', 'Vercel'],
		image: '/images/baan-waan.webp',
		imageAlt: "Page d'accueil de Baan-Waan : « Bienvenue chez Baan Waan »",
		seoDescription:
			"Étude de cas Baan-Waan : une plateforme e-commerce menée d'une idée à la production de bout en bout. SvelteKit, Stripe, PostgreSQL, en ligne depuis mars 2026.",
		sections: [
			{
				heading: "L'origine",
				body: "Baan-Waan est né d'une idée partagée avec un commerçant : voir jusqu'où on pouvait la pousser avec les outils d'aujourd'hui. Je l'ai prise en main de bout en bout. C'est là que j'ai vraiment appris à travailler avec l'IA, et que j'ai vu les limites de ce qu'une seule personne peut construire reculer."
			},
			{
				heading: "Ce que j'ai livré",
				body: "De l'interface au système, sans couture : paiement Stripe, gestion des produits, commandes, livraisons et précommandes, back-office métier. Un monolithe modulaire, des services isolés par domaine et testables en mémoire, des tests end-to-end sur les parcours critiques de paiement et de commande. Pas une démo : un produit qui tient en production."
			},
			{
				heading: 'Ce que ça démontre',
				body: "Mener une idée jusqu'à la production de bout en bout, sans couture entre le front, le back et l'infra. Cette largeur, c'est l'IA qui la rend possible ; ce qui fait qu'elle tient, c'est le jugement."
			},
			{
				heading: 'La suite',
				body: "Ce pilote est devenu la graine d'une plateforme pour restaurateurs, en développement. Elle aura son propre portail le moment venu."
			}
		]
	}
];

export function getProjet(slug: string): Projet | undefined {
	return projets.find((p) => p.slug === slug);
}
