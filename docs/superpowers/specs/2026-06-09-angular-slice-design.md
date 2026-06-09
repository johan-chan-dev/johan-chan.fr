# Tranche Angular du showcase (`apps/site`) — design

> Suite du sous-projet n°2 (vitrine multi-framework). Ajoute **Angular** comme 4ᵉ framework du
> `<FrameworkShowcase>`, en îlot Astro via **`@analogjs/astro-angular`** (SSR + hydratation), comme
> Svelte/Vue/React. Précédé d'un **bump Node → LTS 24** (hygiène + prérequis moteur).
>
> Décidé après un spike (worktree throwaway, exécuté puis nettoyé) qui a établi la matrice de
> versions ci-dessous.

## Matrice de versions (fact-checkée npm, 2026-06-09)

| Composant | Choix | Pourquoi |
|---|---|---|
| **Node** | **24.16.0** (LTS « Krypton ») | nouvelle ligne LTS ; remplace 22.12.0. |
| **Angular** | **21** (`^21`, dernier 21.2.x) | requiert **TS ≥5.9** = notre **5.9.3** (zéro changement TS) ; engines Node `^20.19 || ^22.12 || >=24` (OK sur 22.12 *et* 24). |
| **Pas Angular 22** | — | exige **TS ≥6.0** → migration TS majeure de tout le monorepo (touche apps/web) pour un seul onglet. Reporté. |
| **`@analogjs/astro-angular`** | `2.6.0` | peer `@angular/core >=20.0.0 || ^22.0.0` → **inclut 21**. Apporte `@analogjs/vite-plugin-angular` en interne. |
| **TypeScript** | **inchangé** `5.9.3` | Angular 21 l'accepte. |

## Principe

Approche **A (îlot)** retenue au spike : `@analogjs/astro-angular` rend un composant Angular
**standalone** comme un îlot Astro (SSR + hydratation progressive, `client:load`), exactement comme
les trois autres frameworks. Pas de custom element / Angular Elements (approche B écartée : pas de
SSR, plus de plomberie, aucun gain ici). Angular s'insère donc dans le pattern existant
`<Demo framework="angular"><NgCounter client:load /></Demo>` sans plomberie spécifique.

`★` Le poids d'Angular (zone.js + ~10 paquets `@angular/*`) est **assumé et sur le message** : c'est
le contraste « heavy lifting » que l'article illustre.

## Phase 0 — Bump Node → 24.16.0 (prérequis repo-wide, autonome)

Indépendant et vérifiable seul ; **aucun lien avec le lockfile dev-proxy** (les pins Node ne touchent
pas les dépendances).

- `.nvmrc` : `22.12.0` → `24.16.0`.
- `.github/workflows/ci.yml` (ligne ~26) et `deploy.yml` (ligne ~29) : `node-version: '22'` → `'24'`.
- Pas de champ `engines` à modifier (aucun présent).
- **Installer Node 24 localement** (`nvm install 24.16.0`) puis `pnpm install`.
- **Vérifier les DEUX apps sur Node 24** avant de continuer :
  - apps/web : `pnpm --filter @johan-chan/web build` + `test:unit` (+ `check`) verts.
  - apps/site : `build` + `check` + `test:e2e` verts.
- Commit propre (`.nvmrc` + 2 workflows). **Pas de dance lockfile** (rien côté deps).
- Si apps/web casse sur Node 24 → **escalader** (investigation séparée) avant la phase 1.

## Phase 1 — Onglet Angular 21 (Approche A)

### Dépendances (dance lockfile dev-proxy, comme la tranche showcase)
Ajouter à `apps/site` : `@analogjs/astro-angular`, `@angular/core`, `@angular/common`,
`@angular/compiler`, `@angular/compiler-cli`, `@angular/platform-browser`,
`@angular/platform-server`, `@angular/animations`, `@angular/build` (tous `^21`), `rxjs` (`^7.8`),
`zone.js` (`^0.15`), `tslib`. **TypeScript reste 5.9.3** (aucun downgrade).

Procédure (identique à la tranche showcase, Task 1) : retirer temporairement l'`optionalDependency`
dev-proxy d'`apps/web/package.json` → `pnpm add ...` (lockfile propre + nouvelles deps) → vérifier
build + `pnpm install --frozen-lockfile` → committer `apps/site/package.json` + lockfile propre +
config → restaurer le `link:` dev-proxy + `pnpm install`. Les 4 fichiers dev-proxy finissent dans
leur état non-committé d'origine.

### Configuration
- `astro.config.mjs` : importer `angular from '@analogjs/astro-angular'`, l'ajouter à `integrations`
  (`[mdx(), svelte(), vue(), react(), angular()]`). Il câble `@analogjs/vite-plugin-angular` lui-même.
- `apps/site/tsconfig.app.json` (config compilateur Angular, requise au spike) :
  `experimentalDecorators: true`, `moduleResolution: "node"` (ou "bundler"), `target/module: es2020`,
  `include` ciblant les composants Angular. Le plan fixe le contenu exact.

### Composant + intégration au showcase
- **Composant** : `counter.angular.ts` colocalisé dans le dossier de l'article de démo — un composant
  **standalone** (`@Component({ standalone: true, selector: 'app-ng-counter', template: …, … })`)
  reproduisant le même compteur (−/output/+).
- **`Demo.astro`** : étendre l'union `framework` à `'svelte' | 'vue' | 'react' | 'angular'` ;
  `lang` Shiki pour angular = `ts` ; libellé/fichier `counter.angular.ts`.
- **`FrameworkShowcase.astro`** : la barre d'onglets se construit déjà depuis les `<Demo>` rendus →
  ajouter seulement `angular: 'Angular'` à la map `NAMES`. Un 4ᵉ onglet « marche tout seul ».
- **Article de démo** (`reactivite-trois-frameworks/index.mdx`) : ajouter un 4ᵉ
  `<Demo framework="angular" source={ngSrc}><NgCounter client:load /></Demo>` + l'import
  `import NgCounter from './counter.angular'` et `import ngSrc from './counter.angular.ts?raw'`.
  (Le titre/prose de l'article peut rester ; éventuellement une phrase sur Angular.)

### Gate de correction
Le plugin Vite d'Analog exécute le compilateur Angular (**ngtsc**) au build : un composant Angular
cassé ou mal typé (y c. erreurs de template) **échoue `astro build`**. C'est le gate — **pas de
checker séparé requis**. Le plan vérifie que le gate attrape une erreur injectée (puis revert),
comme pour les autres frameworks.

### Tests
- **Build** : `astro build` SSR le composant (`<app-ng-counter ng-version="21.x" ng-server-context="analog">`) + émet le bundle d'hydratation ; 14 pages (l'article gagne un 4ᵉ démo, pas de nouvelle page).
- **e2e** : étendre le test showcase existant — passer sur l'onglet **Angular**, vérifier que le
  compteur Angular est visible et interactif (clic « plus » → `1`). La suite reste à **10 tests**
  (on enrichit le test showcase, on n'en ajoute pas).
- `check` (composite svelte-check/vue-tsc/tsc) reste vert ; Angular est couvert par le build (ngtsc).

## Hors périmètre
Angular Elements (approche B) ; migration TS 6 / Angular 22 ; métriques (poids/LOC) ; réutilisation
du showcase ailleurs ; nettoyage du dep `daisyui` mort.

## Risques / points d'attention

- **apps/web sur Node 24** (phase 0) : le vrai risque repo-wide. Vérifier build + tests apps/web
  avant la phase 1 ; escalader si cassure.
- **Node 24 doit être installé** sur la devbox pour vérifier (`nvm install 24.16.0`).
- **Lockfile / dev-proxy** (phase 1) : même dance que la tranche showcase ; restaurer l'état local
  après ; `--frozen-lockfile` doit passer sur le lockfile committé.
- **`tsconfig.app.json`** : config Angular fragile (decorators, moduleResolution) — itérer jusqu'à
  build vert, sans toucher la config TS globale des autres frameworks.
- **`client:load` vs `client:visible`** : le spike a validé `client:load` ; garder ça (pas
  `client:only`).
- **Multi-instances / ClientRouter** : Angular en îlot Astro suit le cycle des îlots (pas de souci
  de réinit propre au showcase au-delà de ce qui existe déjà).
