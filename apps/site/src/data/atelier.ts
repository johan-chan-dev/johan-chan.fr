import type { Lang } from '../i18n/ui';

export type Kind = 'impl' | 'design' | 'refl';

export interface PieceContent { title: string; tags: string[] }
export interface Piece {
  id: string;
  slug: string;
  kind: Kind;
  date: string; // YYYY-MM-DD
  read: number;
  live?: boolean;
  fil?: Record<Lang, string>;
  filPart?: number;
  fr: PieceContent;
  en: PieceContent;
}
export interface ProjectContent { name: string; role: string; oneliner: string; story: string[]; tags: string[] }
export interface Project {
  id: string;
  slug: string;
  year: string;
  live?: boolean;
  demo?: boolean;
  relatedIds: string[];
  stack: string[];
  fr: ProjectContent;
  en: ProjectContent;
}

export const pieces: Piece[] = [
  { id: 'p1', slug: 'editeur-code-navigateur-zero-dependance', kind: 'impl', date: '2026-05-28', read: 14, live: true,
    fil: { fr: 'Atelier WASM', en: 'WASM Workshop' }, filPart: 2,
    fr: { title: 'Un éditeur de code dans le navigateur, zéro dépendance', tags: ['WebAssembly', 'Perf', 'Éditeur'] },
    en: { title: 'A code editor in the browser, zero dependencies', tags: ['WebAssembly', 'Perf', 'Editor'] } },
  { id: 'p2', slug: 'invalider-cache-par-evenements', kind: 'design', date: '2026-05-12', read: 9,
    fr: { title: 'Invalider un cache par événements, pas par TTL', tags: ['Systèmes', 'Cache'] },
    en: { title: 'Invalidating a cache by events, not TTL', tags: ['Systems', 'Cache'] } },
  { id: 'p3', slug: 'animations-60fps-timeline', kind: 'impl', date: '2026-04-30', read: 11, live: true,
    fr: { title: 'Des animations 60 fps pilotées par une timeline', tags: ['Animation', 'Canvas'] },
    en: { title: '60 fps animations driven by a timeline', tags: ['Animation', 'Canvas'] } },
  { id: 'p4', slug: 'versionner-ses-decisions', kind: 'refl', date: '2026-05-20', read: 6,
    fr: { title: 'Versionner ses décisions, pas seulement son code', tags: ['Pratique', 'ADR'] },
    en: { title: 'Version your decisions, not just your code', tags: ['Practice', 'ADR'] } },
  { id: 'p5', slug: 'artisanat-ere-autocompletion', kind: 'refl', date: '2026-05-03', read: 8,
    fr: { title: 'L’artisanat à l’ère de l’autocomplétion', tags: ['Métier', 'IA'] },
    en: { title: 'Craft in the age of autocompletion', tags: ['Craft', 'AI'] } },
];

export const projects: Project[] = [
  { id: 'proj-wasm', slug: 'atelier-wasm', year: '2026', live: true, demo: true,
    relatedIds: ['p1', 'p2', 'p4'], stack: ['Rust', 'WebAssembly', 'TypeScript'],
    fr: {
      name: 'Atelier WASM', role: 'Conception et développement, de bout en bout',
      oneliner: 'Un éditeur de code qui tourne entièrement dans le navigateur, sans serveur ni dépendance lourde.',
      story: [
        'Au départ, c’était une frustration toute bête : je voulais un petit éditeur où essayer du code, et tout ce que je trouvais réclamait un serveur derrière pour compiler et colorer. Lourd, lent au premier chargement, et un coût qui grimpe avec chaque visiteur.',
        'Je me suis demandé jusqu’où on pouvait aller sans serveur du tout. J’ai sorti un noyau en Rust, compilé en WebAssembly, qui fait l’analyse directement dans le navigateur. Pas d’aller-retour réseau. L’interface est restée volontairement fine ; c’est le système qui porte le poids, là où il est.',
        'En route, j’ai dû repenser deux ou trois choses que je croyais acquises — notamment comment garder l’affichage rapide pendant qu’on tape. J’ai écrit dessus au fil du chantier, c’est plus honnête que de prétendre que c’était limpide.',
        'Au final ça démarre instantanément, ça ne coûte rien par session, et la base a tenu sans que je doive la réécrire. Le même moteur sert ce qu’on voit et ce qui calcule. C’est le genre de résultat qui me plaît : discret, mais solide.',
      ],
      tags: ['WebAssembly', 'Perf', 'Éditeur'],
    },
    en: {
      name: 'WASM Workshop', role: 'Design and build, end to end',
      oneliner: 'A code editor that runs entirely in the browser, no server, no heavy dependencies.',
      story: [
        'It started as a small frustration: I wanted a little editor to try out code, and everything I found needed a server behind it to compile and highlight. Heavy, slow on first load, and a cost that climbs with every visitor.',
        'I wondered how far you could go with no server at all. I pulled out a Rust kernel, compiled to WebAssembly, that does the analysis right in the browser. No network round-trip. The interface stayed deliberately thin; the system carries the weight, where it belongs.',
        'Along the way I had to rethink a couple of things I thought were settled — mainly how to keep the display fast while you type. I wrote about it as the work happened, which is more honest than pretending it was obvious.',
        'In the end it starts instantly, costs nothing per session, and the base held without a rewrite. One engine serves both what you see and what computes. That’s the kind of result I like: quiet, but solid.',
      ],
      tags: ['WebAssembly', 'Perf', 'Editor'],
    },
  },
];

const MONTHS: Record<Lang, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const mo = MONTHS[lang][m - 1];
  return lang === 'fr' ? `${d} ${mo} ${y}` : `${mo} ${d}, ${y}`;
}

export function allTags(lang: Lang): string[] {
  const s = new Set<string>();
  pieces.forEach((p) => p[lang].tags.forEach((tg) => s.add(tg)));
  return [...s].sort((a, b) => a.localeCompare(b));
}

export function piecesByDate(): Piece[] {
  return pieces.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function relatedPieces(piece: Piece, lang: Lang): Piece[] {
  const c = piece[lang];
  let related = pieces.filter((p) => p.id !== piece.id && (
    (piece.fil && p.fil && p.fil.en === piece.fil.en) ||
    p[lang].tags.some((tg) => c.tags.includes(tg))
  ));
  if (related.length < 2) {
    const extra = pieces
      .filter((p) => p.id !== piece.id && !related.includes(p))
      .sort((a) => (a.kind === piece.kind ? -1 : 1));
    related = related.concat(extra);
  }
  return related.slice(0, 2);
}

export const kindLabel: Record<Lang, Record<Kind, string>> = {
  fr: { impl: 'Implémentation', design: 'Design', refl: 'Réflexion' },
  en: { impl: 'Implementation', design: 'Design', refl: 'Reflection' },
};
export const kindClass: Record<Kind, string> = { impl: 'kind-impl', design: 'kind-design', refl: 'kind-refl' };

export interface Copy {
  name: string;
  nav: { work: string; journal: string; about: string };
  read: string; live: string;
  kind: Record<Kind, string>;
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
    defTitle: string; def: [string, string, string, string][];
    aiTitle: string; ai: string; openTitle: string; open: string; readMore: string;
  };
  footer: { kicker: string; line: string; sub: string };
  series: string; chapter: string;
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
        ['Je tiens toute la chaîne', 'De ce que voit l’utilisateur jusqu’au système qui encaisse derrière. Garder les deux cohérents, c’est là que ça se joue.', 'editeur-code-navigateur-zero-dependance', 'Voir : l’éditeur WASM'],
        ['Je creuse les sujets qui le méritent', 'Systèmes résilients, performance, architecture. Quand un problème le demande, je vais au fond.', 'animations-60fps-timeline', 'Voir : les animations 60 fps'],
        ['J’écris du code qui dure', 'Éprouvé par les tests, qui tient en production, qui ne vous enferme pas.', 'invalider-cache-par-evenements', 'Voir : invalider un cache par événements'],
      ],
      aiTitle: 'Comment je travaille avec l’IA',
      ai: 'Je ne confie pas mon jugement à l’IA, je m’en sers pour aller plus loin. Elle explore, elle propose, elle accélère l’écriture du code. Les choix d’architecture et les arbitrages restent les miens, et je vérifie ce qui sort. Mon métier n’est pas de produire du code, c’est de savoir lequel est bon.',
      openTitle: 'À découvert',
      open: 'Je n’ai pas fini d’apprendre, et je le montre. Ce journal suit le travail au fur et à mesure, avec ses décisions, ses ratés et ses corrections. Un atelier ouvert, pas une vitrine.',
      readMore: 'Lire le journal',
    },
    footer: { kicker: 'Travaillons ensemble', line: 'Un projet à construire ? Écrivez-moi.', sub: 'Dites-moi ce que vous voulez construire ; on cadre le reste ensemble.' },
    series: 'fil', chapter: 'chap.',
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
        ['I hold the full chain', 'From what the user sees down to the system that takes the load behind it. Keeping both coherent is where it’s won or lost.', 'editeur-code-navigateur-zero-dependance', 'See: the WASM editor'],
        ['I dig into the subjects that deserve it', 'Resilient systems, performance, architecture. When a problem calls for it, I go deep.', 'animations-60fps-timeline', 'See: the 60 fps animations'],
        ['I write code that lasts', 'Test-proven, holds in production, doesn’t lock you in.', 'invalider-cache-par-evenements', 'See: invalidating a cache by events'],
      ],
      aiTitle: 'How I work with AI',
      ai: 'I don’t hand my judgment to AI, I use it to go further. It explores, it proposes, it speeds up writing code. The architecture choices and the trade-offs stay mine, and I check what comes out. My job isn’t to produce code, it’s to know which code is good.',
      openTitle: 'In the open',
      open: 'I’m not done learning, and I show it. This journal follows the work as it goes, with its decisions, its misses and its fixes. An open workshop, not a showcase.',
      readMore: 'Read the journal',
    },
    footer: { kicker: 'Let’s work together', line: 'Got something to build? Write me.', sub: 'Tell me what you want to build; we’ll shape the rest together.' },
    series: 'series', chapter: 'ch.',
  },
};

export const CONTACT_EMAIL = 'johan@chan.dev';
