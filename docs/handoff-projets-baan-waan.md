# Handoff — créer la page `/projets` et y placer l'étude de cas Baan-Waan

> Source : le cockpit (le-cockpit, repo privé). Ce handoff est destiné à l'agent qui travaille sur `johan-chan.fr`. La copie ci-dessous est **figée et validée** par Johan, passée au linter `avoid-ai-slop` (exit 0). Ne la réécris pas : place-la.

## Pourquoi

`/projets` **n'existe pas** encore (routes actuelles : `articles`, `series`, `devlogs`, `about`, `call`). C'est un trou : sur le site de quelqu'un dont le métier est la rigueur de livraison, l'absence de réalisations est une promesse rompue. Cette page est la **preuve de capacité** de la motion freelance, distincte du flux éditorial (« IA & Craft »).

**Positionnement à respecter (v3.1, verrouillé) :** Johan vend la **cohérence de bout en bout** (idée → prod, « d'un seul tenant »), avec pour wedge les **POC/prototypes, souvent IA, qui marchent en démo mais ne passent pas en production**. L'IA est l'**activateur** qui rend cette largeur possible ; le **jugement** est le moat. La vitesse est une conséquence, pas un argument. Le « solo » n'est pas vendu (la valeur est la cohérence, pas la solitude). Cohérent avec le hero + about en cours de refonte.

## La tâche

1. **Créer la route `/projets`** (calque le pattern de `/about` : `apps/web/src/routes/projets/+page.svelte` + `+page.ts`). Page statique, pas de CMS.
2. **L'ajouter à la navigation** (« Projets » ou « Réalisations »).
3. **Y placer l'étude de cas Baan-Waan ci-dessous** comme première réalisation.

**Important — modèle de données :** le package `@johan-chan/content` (géré par le studio du cockpit) ne connaît que `article / série / devlog / post`. **Il n'y a pas de type « projet ».** N'essaie donc PAS de router `/projets` via le content package ni d'inventer un type. C'est une **feature web-app** : données en dur dans la page, ou un petit fichier de données local au repo public (`projets.ts`), à ta main. Si tu veux préparer la suite (plusieurs réalisations), structure-le comme une petite liste de projets, mais une seule entrée pour l'instant.

## Contraintes de copie (non négociables)

- **Aucun em dash (—)** nulle part dans la copie sortante. Tirets simples ou deux-points.
- Ne pas « enrichir » le texte avec du remplissage marketing : il a été dé-sloppé exprès.
- **Honnêteté** : c'est une preuve de **capacité** (idée→prod, end-to-end), **pas** une win commerciale ni une validation marché. N'invente aucune métrique, aucun logo client, aucun chiffre de trafic/CA. Pas de témoignage fictif.
- Le lien `baan-waan.com` est réel et en production (depuis mars 2026).

## Métadonnées suggérées

- Slug : `baan-waan` (URL `/projets/baan-waan` si tu fais des sous-pages, sinon section ancrée sur `/projets`).
- Titre : « Baan-Waan : d'une idée à une plateforme en production ».
- Lien externe : https://baan-waan.com
- Statut : en production depuis mars 2026.
- Tags possibles : `SvelteKit`, `Stripe`, `e-commerce`, `idée→prod`.

## Contenu figé (verbatim, sans em dash)

---

### Baan-Waan : d'une idée à une plateforme en production

Une plateforme e-commerce complète pour un commerce de restauration, conçue et livrée de bout en bout, opérée en production depuis mars 2026. En ligne sur baan-waan.com.

**L'origine**

Baan-Waan est né d'une idée partagée avec un commerçant : voir jusqu'où on pouvait la pousser avec les outils d'aujourd'hui. Je l'ai prise en main de bout en bout. C'est là que j'ai vraiment appris à travailler avec l'IA, et que j'ai vu les limites de ce qu'une seule personne peut construire reculer.

**Ce que j'ai livré**

De l'interface au système, sans couture : paiement Stripe, gestion des produits, commandes, livraisons et précommandes, back-office métier. Un monolithe modulaire, des services isolés par domaine et testables en mémoire, des tests end-to-end sur les parcours critiques de paiement et de commande. Pas une démo : un produit qui tient en production.

Stack : SvelteKit, Drizzle, PostgreSQL, Stripe, déployé sur Vercel.

**Ce que ça démontre**

Mener une idée jusqu'à la production de bout en bout, sans couture entre le front, le back et l'infra. Cette largeur, c'est l'IA qui la rend possible ; ce qui fait qu'elle tient, c'est le jugement.

**La suite**

Ce pilote est devenu la graine d'une plateforme pour restaurateurs, en développement. Elle aura son propre portail le moment venu.

---

## Notes d'intégration

- Le rendu peut éclater les quatre sections (Origine / Ce que j'ai livré / Ce que ça démontre / La suite) en blocs ou cartes ; garde le texte tel quel.
- « Stack : … » peut devenir une rangée de tags/chips.
- Un CTA discret vers `/call` en bas de la page de réalisation est cohérent avec la motion.
- Si tu ajoutes un visuel, un screenshot réel de baan-waan.com convient ; pas de mockup générique.
