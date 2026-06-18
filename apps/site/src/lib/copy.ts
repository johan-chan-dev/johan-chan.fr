import type { Lang } from '../i18n/ui';
import type { Registre } from './content-utils';
export type { Registre } from './content-utils';

export interface Copy {
  name: string;
  nav: { work: string; journal: string; about: string };
  read: string; live: string;
  kind: Record<Registre, string>;
  now: { status: string; line: string; meta: string };
  hero: { kicker: string; line: string; sub: string };
  proof: { eyebrow: string; title: string; sub: string; hint: string;
    bothSides: string; whatYouTouch: string; whatHolds: string; served: string;
    autoOn: string; autoOff: string; clickHint: string;
    samples: string[]; stages: string[] };
  journal: { title: string; sub: string; seeAll: string };
  projects: { title: string; sub: string; badge: string; viewCase: string; none: string };
  reader: { back: string; readNext: string; demoInline: string; source: string };
  caseStudy: { back: string; demo: string; whatHelped: string; whatHelpedSub: string };
  about: {
    kicker: string; lede: string; intro: string; portrait: string;
    defTitle: string; def: [string, string, string?, string?][];
    aiTitle: string; ai: string; openTitle: string; open: string; readMore: string;
  };
  call: { kicker: string; lede: string; intro: string };
  footer: { kicker: string; line: string; sub: string };
  series: string; chapter: string;
  seriesIndex: { title: string; sub: string; back: string; chapters: string };
  lens: { browse: string; temps: string; theme: string; seriesLink: string };
  search: { placeholder: string; noResults: string };
}

export const kindLabel: Record<Lang, Record<Registre, string>> = {
  fr: { impl: 'Implémentation', design: 'Design', refl: 'Réflexion' },
  en: { impl: 'Implementation', design: 'Design', refl: 'Reflection' },
};
export const kindClass: Record<Registre, string> = { impl: 'kind-impl', design: 'kind-design', refl: 'kind-refl' };

export const CONTACT_EMAIL = 'johan@chan.dev';

const MONTHS: Record<Lang, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const mo = MONTHS[lang][m - 1];
  return lang === 'fr' ? `${d} ${mo} ${y}` : `${mo} ${d}, ${y}`;
}

export const copy: Record<Lang, Copy> = {
  fr: {
    name: 'Johan Chan',
    nav: { work: 'Projets', journal: 'Journal', about: 'À propos' },
    read: 'min', live: 'démo live',
    kind: kindLabel.fr,
    now: { status: 'En ce moment', line: 'Je construis un éditeur de code WebAssembly, zéro dépendance.', meta: 'mis à jour il y a 2 jours' },
    hero: { kicker: 'Product Engineer',
      line: 'Je conçois des produits du début à la fin. L’interface que les gens utilisent, et le système qui encaisse derrière.',
      sub: 'Du code testé, qui tient en production, et qui ne vous bloque pas dans un coin. Je travaille à découvert.' },
    proof: { eyebrow: '01 · preuve', title: 'Les deux faces',
      sub: 'Ce qu’on voit à l’écran, et ce qui tourne dessous. La même chose, prise en charge de bout en bout.',
      hint: '← cliquez un bouton. l’action traverse le système, en direct.',
      bothSides: 'la même pièce, deux faces', whatYouTouch: 'ce qu’on touche', whatHolds: 'ce qui tient dessous',
      served: 'servis', autoOn: '⏸ flux auto', autoOff: '▶ flux auto',
      clickHint: '↑ cliquez. l’action part dans le système →',
      samples: ['ajouter au panier', 'valider l’e-mail', 'publier l’article', 'régler la facture'],
      stages: ['reçu', 'validé', 'écrit', 'diffusé'] },
    journal: { title: 'Le journal', sub: 'Tout ce que j’écris : réflexion, design, implémentation.', seeAll: 'Voir tout le journal' },
    projects: { title: 'Projets', sub: 'Des choses que j’ai construites, racontées. Chacune renvoie aux notes écrites en chemin.',
      badge: 'projet', viewCase: 'voir l’étude de cas', none: 'Rien ici pour l’instant.' },
    reader: { back: '← le journal', readNext: 'à lire ensuite', demoInline: 'démo live, dans l’article', source: 'source' },
    caseStudy: { back: '← les projets', demo: 'démo live, l’idée en action', whatHelped: 'ce qui a aidé',
      whatHelpedSub: 'Les notes et articles écrits au fil de ce projet.' },
    about: {
      kicker: 'À propos',
      lede: 'Je prends en charge le produit complet, de l’interface jusqu’au système.',
      intro: 'L’interface que les gens utilisent et le système qui tient la charge : front, back, design, infra. Une seule personne pour la cohérence de l’ensemble, là où il faut souvent une équipe. Certains appellent ça un Product Engineer.',
      portrait: 'portrait',
      defTitle: 'Concrètement',
      def: [
        ['Je tiens toute la chaîne', 'De ce que voit l’utilisateur jusqu’au système qui encaisse derrière. Garder les deux cohérents, c’est là que ça se joue.'],
        ['Je creuse les sujets qui le méritent', 'Systèmes résilients, performance, architecture. Quand un problème le demande, je vais au fond.'],
        ['J’écris du code qui dure', 'Éprouvé par les tests, qui tient en production, qui ne vous enferme pas.'],
      ],
      aiTitle: 'Comment je travaille avec l’IA',
      ai: 'Je ne confie pas mon jugement à l’IA, je m’en sers pour aller plus loin. Elle explore, elle propose, elle accélère l’écriture du code. Les choix d’architecture et les arbitrages restent les miens, et je vérifie ce qui sort. Mon métier n’est pas de produire du code, c’est de savoir lequel est bon.',
      openTitle: 'À découvert',
      open: 'Je n’ai pas fini d’apprendre, et je le montre. Ce journal suit le travail au fur et à mesure, avec ses décisions, ses ratés et ses corrections. Un atelier ouvert, pas une vitrine.',
      readMore: 'Lire le journal',
    },
    call: {
      kicker: 'Réserver un appel',
      lede: 'Réservons un moment.',
      intro: 'Choisissez le créneau qui vous convient pour notre échange de 30 minutes.',
    },
    footer: { kicker: 'Travaillons ensemble', line: 'Un projet à construire ? Écrivez-moi.', sub: 'Dites-moi ce que vous voulez construire ; on cadre le reste ensemble.' },
    series: 'fil', chapter: 'chap.',
    seriesIndex: { title: 'Séries', sub: 'Des fils à suivre dans l’ordre, du premier au dernier chapitre.', back: '← les séries', chapters: 'chapitres' },
    lens: { browse: 'Parcourir', temps: 'Temps', theme: 'Thème', seriesLink: 'Séries →' },
    search: { placeholder: 'Rechercher…', noResults: 'Aucun résultat' },
  },
  en: {
    name: 'Johan Chan',
    nav: { work: 'Projects', journal: 'Journal', about: 'About' },
    read: 'min', live: 'live demo',
    kind: kindLabel.en,
    now: { status: 'Right now', line: 'Building a zero-dependency WebAssembly code editor.', meta: 'updated 2 days ago' },
    hero: { kicker: 'Product Engineer',
      line: 'I build products end to end. The interface people use, and the system that takes the load behind it.',
      sub: 'Code that’s tested, holds in production, and doesn’t box you into a corner. I work in the open.' },
    proof: { eyebrow: '01 · proof', title: 'Both sides',
      sub: 'What you see on screen, and what runs underneath. The same thing, owned end to end.',
      hint: '← click a button. the action flows through the system, live.',
      bothSides: 'one piece, two sides', whatYouTouch: 'what you touch', whatHolds: 'what holds underneath',
      served: 'served', autoOn: '⏸ auto flow', autoOff: '▶ auto flow',
      clickHint: '↑ click. the action flows into the system →',
      samples: ['add to cart', 'verify email', 'publish post', 'settle invoice'],
      stages: ['received', 'validated', 'written', 'fanned-out'] },
    journal: { title: 'Journal', sub: 'Everything I write: reflection, design, implementation.', seeAll: 'See the whole journal' },
    projects: { title: 'Projects', sub: 'Things I’ve built, told as stories. Each links to the notes written along the way.',
      badge: 'project', viewCase: 'view the case study', none: 'Nothing here yet.' },
    reader: { back: '← the journal', readNext: 'read next', demoInline: 'live demo, inline', source: 'source' },
    caseStudy: { back: '← projects', demo: 'live demo, the idea in action', whatHelped: 'what helped',
      whatHelpedSub: 'The notes and articles written along this project.' },
    about: {
      kicker: 'About',
      lede: 'I take on the whole product, from the interface down to the system.',
      intro: 'The interface people use and the system that holds the load: front, back, design, infra. One person for the coherence of the whole, where it usually takes a team. Some call it a Product Engineer.',
      portrait: 'portrait',
      defTitle: 'Concretely',
      def: [
        ['I hold the full chain', 'From what the user sees down to the system that takes the load behind it. Keeping both coherent is where it’s won or lost.'],
        ['I dig into the subjects that deserve it', 'Resilient systems, performance, architecture. When a problem calls for it, I go deep.'],
        ['I write code that lasts', 'Test-proven, holds in production, doesn’t lock you in.'],
      ],
      aiTitle: 'How I work with AI',
      ai: 'I don’t hand my judgment to AI, I use it to go further. It explores, it proposes, it speeds up writing code. The architecture choices and the trade-offs stay mine, and I check what comes out. My job isn’t to produce code, it’s to know which code is good.',
      openTitle: 'In the open',
      open: 'I’m not done learning, and I show it. This journal follows the work as it goes, with its decisions, its misses and its fixes. An open workshop, not a showcase.',
      readMore: 'Read the journal',
    },
    call: {
      kicker: 'Book a call',
      lede: 'Let’s find a moment.',
      intro: 'Pick the slot that works for you for our 30-minute conversation.',
    },
    footer: { kicker: 'Let’s work together', line: 'Got something to build? Write me.', sub: 'Tell me what you want to build; we’ll shape the rest together.' },
    series: 'series', chapter: 'ch.',
    seriesIndex: { title: 'Series', sub: 'Threads to follow in order, first chapter to last.', back: '← the series', chapters: 'chapters' },
    lens: { browse: 'Browse', temps: 'Time', theme: 'Theme', seriesLink: 'Series →' },
    search: { placeholder: 'Search…', noResults: 'No results' },
  },
};
