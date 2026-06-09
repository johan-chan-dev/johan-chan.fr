# Vitrine multi-framework `<FrameworkShowcase>` (`apps/site`) — design

> Sous-projet n°2 du type de contenu « agnosticisme des frameworks ».
> Objectif : permettre un article qui **montre un même pattern implémenté en plusieurs frameworks**,
> en direct, avec le code source affiché à côté — la comparaison *est* le contenu. Construit sur le
> socle modèle de contenu (sous-projet n°1) : un article MDX importe des îlots ; ici on standardise
> ce geste dans un composant de contenu réutilisable.
>
> Roster de ce passage : **Svelte + Vue + React** (3 intégrations Astro natives). Angular / exotiques
> (via custom element ou iframe) et métriques (poids de bundle, LOC) : **tranches ultérieures**.

## Principe

Trois couches (rappel du sous-projet n°1) inchangées. Ce sous-projet ajoute, dans la couche
**Contenu**, un composant de vue réutilisable que l'auteur compose en MDX :

- **Source unique du code** : un fichier de démo (`counter.svelte`) sert à la fois d'îlot vivant
  (`import Demo from './counter.svelte'`) et de source affichée (`import src from './counter.svelte?raw'`).
  Le code montré est exactement le module que le build compile → ils ne peuvent pas diverger.
- **Composition par slot** : l'auteur place l'îlot avec sa directive `client:*` littérale (Astro exige
  une directive littérale, non pilotée par une prop) ; le showcase ne fait qu'arranger et étiqueter.
- **Le build attrape les erreurs** : modules réels dans le graphe → erreurs de compilation gratuites
  au build ; erreurs de type via un type-checker par framework dans le gate de vérification.

## Périmètre

**Dans le sous-projet n°2 :**
- Intégrations Astro **Svelte, Vue, React** + leurs runtimes (`svelte`, `vue`, `react`/`react-dom`).
- Composant **`Demo.astro`** (panneau code + slot îlot) et **`FrameworkShowcase.astro`** (onglets +
  bascule « Comparer », modes focus/compare).
- Panneau de code via le composant **`<Code>` intégré d'Astro** (Shiki) — aucune nouvelle dépendance.
- **Modes de vue** focus (onglets, défaut) / compare (grille responsive), pilotés par `data-mode` +
  CSS + un îlot vanilla (réinit sur `astro:page-load`, cohérent avec les view transitions).
- **Gate de correction** : `check` composite ajoutant `svelte-check` (.svelte) + `vue-tsc` (.vue) +
  `tsc` (.tsx) à `astro check`.
- Un **article de démonstration** réel (pattern de réactivité / compteur) avec ses fichiers de démo
  colocalisés, ajouté à la collection `articles`.

**Hors périmètre (tranches ultérieures) :**
- Angular et frameworks exotiques (chemin custom element / iframe + toolchain propre).
- Métriques de comparaison (poids de bundle, lignes de code, coût d'hydratation).
- Réutilisation du showcase sur les pages projet.
- Alias d'import `@components` (les imports MDX restent relatifs, comme l'`import` de `<Proof />` du
  sous-projet n°1) — nicety possible plus tard.

## Architecture — intégrations

`apps/site/astro.config.mjs` : ajouter les intégrations (l'ordre n'importe pas) :
```ts
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
// integrations: [mdx(), svelte(), vue(), react()]
```
`tsconfig.json` : React TSX nécessite `"jsx": "react-jsx"` + `"jsxImportSource": "react"` (le plan
fixe la config exacte ; `@astrojs/react` configure esbuild pour le JSX au build). Svelte/Vue n'ont
pas besoin de réglage tsconfig supplémentaire.

Dépendances ajoutées à `apps/site/package.json` : `@astrojs/svelte`, `@astrojs/vue`, `@astrojs/react`,
`svelte`, `vue`, `react`, `react-dom` (deps) ; `svelte-check`, `vue-tsc`, `@types/react`,
`@types/react-dom` (devDeps).

## Composants (`src/components/content/`)

Nouveau dossier `content/` pour les composants destinés à être importés depuis le contenu MDX.

### `Demo.astro`
```ts
interface Props { framework: 'svelte' | 'vue' | 'react'; source: string; label?: string }
```
- Rend un en-tête (label = nom du framework + nom de fichier optionnel), un panneau **code**
  (`<Code code={source} lang={langOf(framework)} theme=… />` ; `langOf`: svelte→`svelte`, vue→`vue`,
  react→`tsx`), et un `<slot />` pour l'îlot vivant rendu par l'auteur.
- Porte `data-demo data-framework={framework}` pour que le showcase parent le cible (onglets/grille).
- Pas de JS propre ; purement présentationnel.

### `FrameworkShowcase.astro`
- Enveloppe N `<Demo>` enfants (`<slot />`). Rend la **barre d'onglets** (un onglet par framework,
  dérivé des enfants) + la bascule **« Comparer »**. Le premier framework est actif par défaut.
- Un `<script>` vanilla (réinit sur `astro:page-load`) gère l'état `data-mode="focus" | "compare"` et,
  en focus, l'onglet actif (`data-active="svelte|vue|react"`), via des `data-` attributs sur la racine.
- **Tous les `<Demo>` sont rendus serveur** dans le DOM ; les modes/onglets ne font que montrer/cacher
  + relayouter en **CSS**. SEO-safe ; sans JS → tous les démos visibles (dégradation acceptable).
- Les îlots s'hydratent une seule fois quel que soit le mode (leur directive `client:*` est dans le MDX).

### Modes de vue (CSS, pilotée par `data-mode`)
- **focus** (défaut) : seul le `<Demo>` du framework actif est visible ; dans la **colonne de lecture
  880px**.
- **compare** : tous les `<Demo>` visibles. **≥768px** → grille en **colonnes** (le showcase **déborde**
  la colonne 880 vers une bande plus large pour donner de la place au code) ; **<768px** → **empilés**.
- Le débordement utilise une technique « figure plus large que la prose » (marges négatives bornées /
  largeur explicite) confinée au mode compare ; le focus reste dans la colonne.

## Modèle d'écriture (dans un article MDX)
```mdx
import FrameworkShowcase from '../../../components/content/FrameworkShowcase.astro';
import Demo from '../../../components/content/Demo.astro';
import Svelte from './counter.svelte';  import svelteSrc from './counter.svelte?raw';
import Vue from './counter.vue';        import vueSrc from './counter.vue?raw';
import React from './counter.tsx';      import reactSrc from './counter.tsx?raw';

<FrameworkShowcase>
  <Demo framework="svelte" source={svelteSrc}><Svelte client:visible /></Demo>
  <Demo framework="vue"    source={vueSrc}><Vue client:visible /></Demo>
  <Demo framework="react"  source={reactSrc}><React client:visible /></Demo>
</FrameworkShowcase>
```
(Imports relatifs depuis `src/content/articles/<slug>/index.mdx`, comme l'`import` de `<Proof />`.)

## Gate de correction (le build attrape les erreurs)

`apps/site/package.json` `check` devient composite :
```
astro check && svelte-check && vue-tsc --noEmit && tsc --noEmit -p tsconfig.demos.json
```
- `astro check` : `.astro` / `.ts` (et le TS importé).
- `svelte-check` : composants `.svelte`.
- `vue-tsc --noEmit` : composants `.vue`.
- `tsc --noEmit` : `.tsx` React — via un `tsconfig.demos.json` ciblé (jsx react) si nécessaire pour
  éviter les conflits avec la config Astro globale. Le plan fixe l'invocation exacte (et écarte les
  doublons de vérification entre outils). Principe : **chaque framework = un checker câblé**.
- Une démo cassée (syntaxe → build ; type → checker) **échoue le gate**.

## Article de démonstration

Un article réel dans la collection `articles` (dossier-par-entrée — d'où le choix du sous-projet n°1) :
```
src/content/articles/reactivite-trois-frameworks/
├── index.mdx        (registre: design ; prose + le <FrameworkShowcase>)
├── counter.svelte
├── counter.vue
└── counter.tsx
```
Le compteur est le même pattern minimal dans les trois ; la prose souligne le contraste (réactivité
implicite Svelte vs refs Vue vs hooks/deps React). Il apparaît dans le feed / le journal comme tout
article et valide le pipeline de bout en bout.

## ⚠️ Prérequis opérationnel — le lockfile

C'est le premier travail qui ajoute de vraies dépendances. Le `pnpm-lock.yaml` partagé est intriqué
avec le lien dev-proxy local :
- Le lockfile **committé (HEAD) est propre** (aucun dev-proxy). Le lockfile **de travail** porte le
  `link:` dev-proxy d'`apps/web` (+~3,7k lignes non committées) — à ne **jamais** committer.
- `apps/site` n'est dans aucun workflow CI, mais **le déploiement d'`apps/web` installe tout le
  workspace avec `--frozen-lockfile`** → le lockfile committé doit inclure les nouvelles deps **et**
  rester sans dev-proxy.

**Procédure (danse retrait-commit-restauration), exécutée dans la tâche « deps » du plan :**
1. Retirer temporairement l'`optionalDependency` dev-proxy d'`apps/web/package.json`.
2. `pnpm install` → lockfile **propre** + nouvelles deps `apps/site`.
3. Committer `apps/site/package.json` + le lockfile propre (et `astro.config.mjs`/`tsconfig`).
4. Restaurer le `link:` dev-proxy dans `apps/web/package.json` + `pnpm install` → les deltas locaux
   (apps/web/package.json, pnpm-lock.yaml) **reviennent à leur état non-committé actuel**.
5. **Vérifier** que `pnpm install --frozen-lockfile` passe sur le lockfile committé (simule la CI
   d'`apps/web`).

Les 4 fichiers dev-proxy (`apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`,
`turbo.json`) finissent dans leur état non-committé d'origine.

## Tests & vérification

- **Build** : `astro build` compile les 3 îlots du showcase ; une erreur de compilation d'une démo
  échoue le build. L'article de démo génère sa page.
- **`check` composite** : 0 erreur sur les 4 checkers.
- **e2e (Playwright)** — nouveau test : ouvrir l'article de démo ; vérifier que (a) le panneau de code
  d'au moins un framework est rendu (Shiki), (b) le ou les îlots sont interactifs (cliquer « + » du
  compteur Svelte incrémente l'affichage), (c) la bascule **Comparer** passe la racine en
  `data-mode="compare"` et rend les trois démos visibles, (d) zéro débordement horizontal à 360px.
- La suite smoke existante (9 tests) reste verte.
- **`--frozen-lockfile`** : vérifié (cf. prérequis lockfile).

## Risques / points d'attention

- **Lockfile / dev-proxy** : le risque principal (cf. section dédiée). À exécuter avec soin ; restaurer
  l'état local après.
- **Config TSX/React** : `jsx`/`jsxImportSource` mal réglés cassent `tsc` ou le build — isoler via
  `tsconfig.demos.json` si la config Astro globale entre en conflit.
- **Showcase multi-instances** : un article peut contenir plusieurs `<FrameworkShowcase>` ; scoper
  l'état au nœud racine (pas de globals), comme `<Proof />`.
- **ClientRouter** : le showcase est un îlot de chrome vanilla → réinit sur `astro:page-load`, sinon
  les onglets cassent après une navigation (leçon des view transitions).
- **Poids** : trois runtimes (Svelte/Vue/React) chargés sur l'article de démo — assumé et *sur le
  message* (le coût fait partie de la démonstration) ; `client:visible` limite l'hydratation à la
  visibilité.
- **DaisyUI mort** : `daisyui` est encore dans `apps/site/package.json` mais n'est plus utilisé
  (retiré du CSS au sous-projet redesign) — hors périmètre, à nettoyer séparément.
