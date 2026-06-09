# Refonte « L'Atelier » (`apps/site`) — design

> Tranche suivante après le [socle Astro](2026-06-02-astro-socle-design.md).
> Objectif : appliquer le handoff design **« L'Atelier »** (`.claude/design_handoff_atelier/`)
> à `apps/site` — porter 4 écrans + lecteur + étude de cas + une preuve interactive,
> en **Astro pur / vanilla-first**, fidèle au pixel, bilingue FR/EN, deux thèmes.

## Source

Handoff hifi : `.claude/design_handoff_atelier/README.md` + prototypes React/JSX
(`prototypes/*.jsx`, ~1235 lignes). Les prototypes sont des **références** (React + Babel
in-browser) ; la tâche est de **recréer** les designs avec les patterns établis d'`apps/site`,
pas de copier le React. Le sélecteur Desktop/Mobile du proto est un artefact de preview
(à ignorer) ; la cible est responsive via media query (~768px).

## Principe directeur (rappel du socle)

**Vanilla-first.** Chrome en composants `.astro` purs ; besoins client légers (toggle thème,
menu mobile, filtres journal, preuve interactive) en `<script>` vanilla. **Aucun framework UI
n'est introduit** : tout le proto React se réécrit en Astro + DOM natif. L'état React du proto
se traduit en idiomes Astro :

| État React (proto) | Cible Astro |
|---|---|
| `lang` (state + dropdown) | **routage** : FR à `/`, EN à `/en/` ; le sélecteur de langue = lien vers l'URL sœur |
| `theme` (state) | `data-theme` + `localStorage` (pattern socle existant), valeurs `atelier-light`/`atelier-dark` |
| `openId` / `caseId` (overlays) | **vraies routes** `/journal/[slug]`, `/projets/[slug]` |
| focus-trap / Échap / portail | supprimés — le navigateur gère routing, historique, focus |

## Décision : abandon de DaisyUI

Le socle posait DaisyUI (`autumn`/`abyss`). La palette Atelier est **sur mesure** (papier chaud /
ardoise olive, un seul accent orange) et ne correspond à aucun thème DaisyUI. On **retire**
`@plugin "daisyui"` et on définit la palette en **variables CSS** pilotées par `data-theme`,
exposées à Tailwind 4 via `@theme`. Tailwind 4 reste.

## Périmètre

**Dans la tranche :**
- Système de tokens (2 thèmes en variables CSS) + 3 fontes Google (Bricolage Grotesque, Hanken
  Grotesk, Geist Mono).
- App shell : header sticky (logo, nav active, sélecteur langue, toggle thème), footer partagé
  (CTA contact + ligne), menu nav mobile (panneau plein + backdrop, **rendu hors du header**).
- Pages : Accueil, Journal (liste + filtres), Projets (liste), À propos — en FR et EN.
- Pages détail : article (`/journal/[slug]`) et étude de cas (`/projets/[slug]`).
- Composant **preuve « les deux faces »** (interactif, vanilla + `rAF`, fallback reduced-motion),
  réutilisé sur accueil + article `impl` + étude de cas.
- Filtres journal (registre + sélecteur de tags) en JS client par-dessus une liste rendue serveur.
- Module de données typé (port de `atelier-data.js`).
- Mise à jour des tests (smoke Playwright + i18n Vitest) à la nouvelle structure.

**Hors tranche** (phases « contenu / production » du handoff) : vrais corps d'articles + images
(placeholders conservés), migration MDX / content collections, fontes auto-hébergées + preload,
SEO/OpenGraph par page + sitemap, durcissement A11y complet, 2ᵉ projet, branchement de la preuve
sur un vrai exemple, présence humaine / angle « augmenté » (point ouvert #11 du handoff).

## Routage

FR à la racine, EN sous `/en/` (config `i18n` existante, `prefixDefaultLocale: false`).
**Segments d'URL non localisés** (`/en/journal`, `/en/projets`) — seuls les libellés sont
traduits. Pas d'overlays JS : tout est une vraie page.

| Route FR / EN | Fichier | Proto d'origine |
|---|---|---|
| `/` · `/en/` | `pages/index.astro` · `pages/en/index.astro` | `atelier.jsx` |
| `/journal` · `/en/journal` | `pages/journal/index.astro` (+ `en/`) | `atelier-journal.jsx` (onglet Journal) |
| `/journal/[slug]` (+ `en/`) | `pages/journal/[slug].astro` via `getStaticPaths` | `atelier-reader.jsx` (overlay) |
| `/projets` · `/en/projets` | `pages/projets/index.astro` (+ `en/`) | journal `?view=travaux` |
| `/projets/[slug]` (+ `en/`) | `pages/projets/[slug].astro` via `getStaticPaths` | `atelier-case.jsx` (overlay) |
| `/about` · `/en/about` | `pages/about.astro` (+ `en/`) | `atelier-about.jsx` |

Les onglets Journal/Projets du proto deviennent des liens de nav réels. `?view=travaux` disparaît.

## Tokens & thème

`src/styles/global.css` :
- Retirer `@plugin "daisyui"`.
- Palette en variables CSS sous `[data-theme="atelier-light"]` (défaut) et `[data-theme="atelier-dark"]` :
  `--bg --bg2 --surf --ink --ink2 --faint --line --hair --accent --accent-ink --live`
  (valeurs exactes du handoff §Design tokens).
- Variables fontes : `--font-display`, `--font-text`, `--font-mono`.
- Mapper dans `@theme` (Tailwind 4) : `--color-bg: var(--bg)`, `--color-ink: var(--ink)`, etc.,
  pour que `bg-bg text-ink border-line text-accent` soient de vraies utilities qui se
  re-résolvent par thème ; idem `font-display`/`font-text`/`font-mono`.
- Couleurs par registre en classes : `.kind-impl{color:var(--accent)}`,
  `.kind-design{color:var(--live)}`, `.kind-refl{color:var(--ink2)}` (remplace `hueOf`).
- Keyframes partagées (pulse « live », rise/fade d'entrée des pages détail, sheet-up mobile),
  toutes sous `@media (prefers-reduced-motion: no-preference)` ou neutralisées en `reduce`.

`Base.astro` : script inline anti-FOUC et `ThemeToggle` passent de `autumn`/`abyss` à
`atelier-light`/`atelier-dark`, en gardant le défaut `prefers-color-scheme` + persistance
`localStorage`. Ajout du `<link>` Google Fonts (+ preconnect) dans le `<head>`.

## Données (module typé, contenu placeholder)

`src/data/atelier.ts` — port typé de `atelier-data.js` :
- Types : `Kind = 'impl'|'design'|'refl'`, `Piece`, `Project`, `Lang` (réutilise `i18n/ui`).
- `pieces: Piece[]`, `projects: Project[]` (mêmes données que le proto ; `slug` dérivé de `id`).
- `fmtDate(iso, lang)` ; helper d'agrégation des tags ; `relatedPieces(piece)` (même fil ou
  tag partagé, complété par même registre, max 2) pour « à lire ensuite ».
- `copy[lang]` : toutes les chaînes UI longues (hero, statut « en ce moment », preuve, titres de
  section, CTA footer, copie À propos, libellés de registre/lecture/live). `i18n/ui.ts` (léger)
  reste pour les clés de nav ; on n'y déplace **pas** la copie longue.

Le test i18n existant (`nav.about`, fallback `site.tagline`) reste vert : ces clés sont conservées.

## Composants (`src/components/`, tous `.astro`)

- `Header.astro(lang, current)` — barre sticky floutée : logo « Johan Chan**.** », nav desktop
  avec état actif (soulignement accent), `LangSwitch`, `ThemeToggle`, `MobileNav`.
- `LangSwitch.astro(lang, url)` — bouton/menu mono ; **liens vers l'URL sœur** de l'autre locale
  (calcul du chemin via `Astro.url` + `i18n/utils`). Pas d'état React.
- `ThemeToggle.astro` — bouton rond `◐` (look du proto) ; script existant adapté aux nouvelles valeurs.
- `MobileNav.astro(lang, current)` — hamburger→✕, panneau plein largeur + backdrop **au niveau
  body** (pas de portail, évite le piège `backdrop-filter`). Script vanilla : toggle, Échap, clic-out.
- `Footer.astro(lang)` — bloc CTA (`mailto:`) + ligne pied (année calculée au build).
- `PieceRow.astro(piece, lang)` — ligne d'article (point/date registre, fil éventuel, titre, tags,
  temps de lecture, badge live, flèche, hover +4px). `<a href>` vers `/journal/[slug]`.
- `ProjectCard.astro(project, lang)` — carte projet → `/projets/[slug]`.
- `Ph.astro(n, w?)` — placeholder de texte rayé (corps des pages détail).
- `Proof.astro(lang)` — preuve « deux faces ». Markup statique rendu serveur + `<script>` vanilla :
  boucle `rAF` (avance les événements par lanes reçu→validé→écrit→diffusé), toggle « flux auto »,
  clic bouton UI → événement ; compteur « N servis » ; barre scale + 99.9%. `prefers-reduced-motion`
  → état statique rempli, sans boucle. Encapsulé (id/`data-` scoping) pour pouvoir apparaître
  plusieurs fois sur une page.
- `JournalList.astro` + `JournalFilters.astro` — liste `PieceRow` rendue serveur (tout le contenu
  dans le HTML, SEO-safe) ; filtres en JS client : toggles registre + sélecteur de tags
  (popover desktop / bottom-sheet mobile, recherche + cases ✓), filtrage par `data-kind`/`data-tags`,
  **union (OU)** sur tags × intersection registre, compteur live. Sans JS : liste complète non filtrée.

## Pages détail (article / étude de cas)

Vraies pages, layout du proto (colonne ~880px desktop / plein mobile) :
- **Article** : « ← le journal » (lien), registre, fil éventuel, h1, méta, corps placeholder (`Ph`).
  Si `impl` : preuve live intégrée + bloc source `git clone`. Bloc « à lire ensuite » (2 liens réels).
- **Étude de cas** : « ← les projets », badge projet, nom, accroche, méta (rôle · année · stack),
  visuel 16:9 placeholder, récit (4 paragraphes 1ʳᵉ pers.), démo live optionnelle, bloc « ce qui a
  aidé » (liens vers articles liés).
- Animation d'entrée rise/fade en CSS au chargement, neutralisée en `prefers-reduced-motion`.

## Tests

- `tests/i18n.test.ts` — inchangé (clés conservées).
- `tests/smoke.spec.ts` — réécrit pour la nouvelle structure : home FR/EN (h1 hero, nav, `lang`),
  toggle thème + persistance avec les **nouvelles** valeurs `atelier-light`/`atelier-dark`,
  rendu d'une page liste journal, rendu d'une page article (`/journal/[slug]`). `data-testid`
  ajoutés sur les éléments clés (logo, nav, toggle, hero, lignes d'article).

## Risques / points d'attention

- **Zéro débordement horizontal mobile** sur tous les écrans (vérifié dans le proto) — à re-vérifier.
- La preuve interactive multi-instances sur une même page (accueil n'en a qu'une, mais article
  `impl` + future composition) → scoper l'état au nœud, pas à des globals.
- Contraste de l'orange en thème clair sur petites métas (point A11y du handoff) — conservé tel
  quel cette tranche, durcissement A11y hors périmètre.
- Fichiers dev-proxy locaux (`apps/web`) — ne **jamais** committer ; cette tranche ne touche
  qu'`apps/site` + `docs/`.
