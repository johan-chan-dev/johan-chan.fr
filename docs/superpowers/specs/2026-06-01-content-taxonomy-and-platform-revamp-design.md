# Revamp du site : taxonomie par registre + re-plateformage Astro

> Note de **réflexion** (pas un spec d'implémentation). Fige les décisions d'architecture
> prises en brainstorming le 2026-06-01. Reste en amont de tout code.

## Déclencheur

La navigation actuelle range le contenu par **format** (`Articles · Séries · Devlogs`),
ce qui ne dit rien de la **nature** de la lecture et ne scale pas (à 80 entrées,
« Articles » devient un tiroir sans intention). Le site est aussi une **vitrine PRO** :
aujourd'hui 100 % du contenu est de la réflexion sur l'IA, ce qui établit une crédibilité
d'opinion mais ne prouve aucune compétence de *bâtisseur* — alors que le hero promet un
« Software Crafter ». Décalage de positionnement à corriger.

Constat de départ (fact-check) :
- 4 types déclarés (`article`/`série`/`devlog`/`post`), **2 vides** (`devlog`, `post`) — nav
  fantôme vers des pages sans contenu.
- Inventaire réel : 3 articles + 1 série de 12 chapitres. Tout sur le thème IA/craft.
- Tags non normalisés (`ia` vs `IA`) → agrégations fragmentées.
- `série` est le type qui gêne le plus : il fige comme une thèse fermée (ordre + clôture +
  autorité) ce qui n'était qu'une réflexion d'un instant T.

## Insight central

Le `type` actuel confond **un axe** (format : seul vs feuilleton) avec ce qui mérite
vraiment d'être l'axe structurant : l'**intention de lecture**. On découple :

- **`registre`** (nature, structurant) : `réflexion` · `design` · `implémentation`
- **`tags`** (thème, transversal) : `ia`, `craft`… normalisés en minuscules
- **`fil`** (format, propriété) : regroupe des textes liés. Remplace le *type* `série`.

La tagline le disait déjà — **« Ce que je pense. Ce que j'apprends. »** :
- *Ce que je pense* → `réflexion` (ponctuelle ou en feuilleton)
- *Ce que j'apprends* → technique, à deux altitudes : `design` (le quoi/pourquoi, vue
  architecte) et `implémentation` (le comment deep, vue intégrateur)

## Décisions d'architecture

### Socle technique
- **Astro** remplace SvelteKit (méta-frameworks concurrents → l'un OU l'autre). Astro est
  taillé pour un site de contenu : pré-rendu statique, **îlots** (zéro JS par défaut,
  hydratation par composant), content collections typées en Zod.
- **Svelte** survit comme *bibliothèque* d'îlots (charts, Callout, particles, thème portés).
  Astro est agnostique du framework → d'autres écosystèmes possibles en démo plus tard.
- **Contenu en Markdown/MDX natif** (content collections). `.md` = prose ; `.mdx` = prose +
  îlots. Reprend le modèle mental actuel (`content.md` vs `content.svx`) en plus propre,
  sans le combat mdsvex + Svelte 5.
- **Vercel** remplace GitHub Pages : prod sur `main`, **preview deployments** protégés par
  branche (Deployment Protection). Plus de bricolage `BASE_PATH`, domaine à la racine.
- **Pas de CMS** (Tina écartée) : pas d'équipe éditoriale, pas de douleur d'authoring.
  Porte de sortie notée si besoin d'une UI un jour : **Keystatic** (git-based, local, sans
  cloud), pas Tina.

### Modèle de contenu (le contrat à figer)

**Owner du schéma = le repo du site** (`content.config.ts`). Pas le second cerveau, pas un
package partagé entre les deux : le schéma encode des préoccupations de *publication*
(`registre`, `fil`, positionnement), qui ne doivent pas vivre en amont sous peine de
re-coupler. **`registre` est un jugement de positionnement → assigné à la promotion**, côté
site, pas stocké dans le cerveau.

Le schéma épouse la **nature** → **socle commun + union discriminée sur `registre`**
(un schéma plat unique mentirait : `source` ne vaut que pour l'implémentation).

```ts
// src/content.config.ts — OWNER: repo du site
import { defineCollection, z } from 'astro:content';

const socle = z.object({
  titre: z.string().min(1),
  date: z.coerce.date(),
  excerpt: z.string().min(1),                          // requis : cartes + SEO
  tags: z.array(z.string().toLowerCase()).default([]), // normalisés minuscules
  fil: z.object({ slug: z.string(), ordre: z.number().int().positive() }).optional(),
  published: z.boolean().default(false),               // publier = acte délibéré
  updatedAt: z.coerce.date().optional(),
  image: z.string().optional(),
  imageFocus: z.string().default('center'),
  ogCrop: z.enum(['top', 'center', 'bottom']).default('center'),
  external_url: z.string().url().optional(),
  translation_id: z.string().optional(),               // i18n FR/EN
});

const contenu = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('registre', [
    socle.extend({ registre: z.literal('réflexion') }),
    socle.extend({ registre: z.literal('design') }),
    socle.extend({
      registre: z.literal('implémentation'),
      source: z.object({                               // n'existe QUE ici (provenance code)
        repo: z.string().url().optional(),
        demo: z.string().optional(),                   // chemin vers un îlot / page démo
        projet: z.string().optional(),
      }).optional(),
    }),
  ]),
});

export const collections = { contenu };
```

Micro-décisions figées :
1. `published` défaut **`false`** (rien ne fuit par accident).
2. Le **`fil` a sa propre fiche** (titre/description/image) et **porte un `registre`** → un
   feuilleton est entièrement d'un registre, donc ne traverse jamais les registres. C'est ce
   qui rend l'union mono-collection propre (le feed unifié reste un `getCollection('contenu')`,
   les sections par registre = un `.filter`).
3. `excerpt` **obligatoire**.
4. `preview` **retiré** du schéma — géré par l'environnement Vercel (voir ci-dessous), plus
   par un flag + une clé dans l'app.

Migration : les 3 articles + la série « sous choc » → tous `réflexion`, la série devenant un
`fil` de réflexion (12 entrées, `ordre` 1→12).

### Provenance par registre (carrière → atelier)

Pas de « double source de vérité » : le second cerveau et le site sont **deux choses
différentes** (matière première vs produit fini), pas deux copies. La carrière dépend du
registre :

| Registre | Carrière (amont) | Atelier canonique (aval) |
|---|---|---|
| `réflexion` | second cerveau (pensée distillée) | repo |
| `design` | second cerveau (le quoi/pourquoi) | repo |
| `implémentation` | **le code réel / les projets** (+ notes du cerveau en *soutien*) | repo — où vit aussi le code des démos |

Publier = **acte de promotion délibéré** : une note sort du cerveau vers le repo *une fois* ;
ensuite le repo est canonique pour cette pièce (on l'édite, on la tague, on y ajoute une démo
en îlot). Le miroir read-only `packages/content/` automatique est **supprimé**. Conséquence :
pour l'implémentation, ces pièces référenceront du vrai code (champ `source`).

### Cycle de publication (Vercel)

`published: false` → seulement dans les preview deployments (branche, protégés).
`published: true` → en production.

La preview devient une préoccupation d'**environnement**, pas d'app. On **supprime** toute la
machinerie de gate : `PreviewGate.svelte`, `PreviewBanner`, `preview.ts`,
`PUBLIC_PREVIEW_KEY`. (Sur un site statique, la gate `?preview=key` n'était de toute façon que
cosmétique — la page restait publiquement récupérable.)

### Navigation & home

- **Nav par registre** (`Réflexion · Design · Implémentation`) plutôt que par format.
- **Home = H2** : après le hero, bloc **« Ce que je construis »** (design + implémentation) en
  tête de gondole, puis **« Ce que je pense »** (réflexion). Section technique **vide assumée**
  au lancement avec un message honnête (« rien encore, ça arrive ») — pour une vitrine PRO,
  une section explicitement en chantier signale une trajectoire, pas un trou.
- **Démos en îlots** pour l'implémentation : un composant interactif (`client:visible`)
  embarqué dans le MDX → preuve de compétence la plus forte possible (« ça tourne sous les
  yeux du prospect »).

## Décomposition en sous-projets

Ordre proposé (chacun aura son propre cycle réflexion → spec → plan le moment venu) :

1. **Socle Astro** — projet, îlots Svelte portés, déploiement Vercel. *Remplace* (≠ porte) :
   i18n (Astro i18n vs Paraglide), images (`astro:assets`), rendu (MDX vs mdsvex),
   routing/SEO/sitemap/redirects. C'est là qu'est le vrai coût du rewrite.
2. **Modèle de contenu** — `content.config.ts` ci-dessus.
3. **Migration** — articles + série « sous choc » → collection, tout `réflexion`.
4. **Routes + nav** par registre.
5. **Home H2**.
6. *(différé)* **Keystatic**, seulement si l'édition devient une douleur.

## Stratégie d'exécution

**Option retenue : nouvelle app coexistante.** Ajouter une 2ᵉ app Astro (`apps/site`) à côté
de la SvelteKit (`apps/web`), développée sur branches incrémentales. Le monorepo (Turbo +
pnpm) est fait pour ça.

- Les deux apps coexistent : `apps/web` (SvelteKit) reste la prod sur GitHub Pages,
  **intouchée** ; `apps/site` (Astro) mûrit sur **Vercel previews**.
- Chaque tranche merge dans `main` sans risque — la nouvelle app n'affecte pas la prod tant
  qu'on n'a pas basculé.
- **Cutover** quand la parité est atteinte : pointer `johan-chan.fr` vers Vercel (app Astro)
  + retirer GitHub Pages. Puis commit de nettoyage : supprimer `apps/web` (SvelteKit) et le
  miroir `packages/content`.
- **Rejeté** : réécriture en place de `apps/web` sur une branche longue durée — branche
  divergente + app cassée pendant tout le rewrite + merge big-bang, sans comparaison
  ancien/nouveau possible. On protège le *trajet*, pas seulement l'état final.

Pendant la coexistence : `apps/web` garde `packages/content` (miroir) ; `apps/site` a son
contenu migré dans ses content collections. Le pont est géré au moment de la migration.

## Hors périmètre (sous-projet distinct)

**Réorganiser le second cerveau / PKM** : NON. Le réorganiser pour matcher les registres du
site re-couplerait les deux espaces. Le cerveau reste organisé pour le *rappel/apprentissage*,
le site pour la *vitrine* ; ils se rencontrent à la promotion, pas par taxo partagée. Ce qui
est légitime : (a) clarifier la frontière cerveau ↔ code (l'implémentation vit dans le code,
pas en note) ; (b) utiliser le site comme *lentille de feedback* (« je manque de matière
design/implémentation à publier »). Une vraie réorga du PKM = brainstorm séparé, dans son
propre système (le-cockpit, non visible depuis ce repo).

## Questions ouvertes (différées à l'implémentation)

- Promotion cerveau → repo : manuelle (export/copie) ou petit pont outillé ?
- `design` gagnera-t-il des champs propres (lien vers l'implémentation qui le réalise,
  diagramme) ? Pour l'instant il partage le socle avec `réflexion`.
- i18n EN (`/en/`) : toujours planifié, à recâbler en Astro i18n lors du socle.
