L'IA ne menace pas que les postes. Elle menace les produits.

## Une pratique immature

Quand l'IA produit du code, elle produit aussi des incidents.

Replit, l'éditeur en ligne qui mise tout sur l'IA, a vu un de ses agents supprimer la base de données d'un utilisateur. Kiro, l'outil de dev IA d'AWS, a provoqué 13 heures de panne. C'est du réel, en production, avec de vraies pertes.

Ce que ces incidents montrent, c'est pas que l'IA est dangereuse. C'est que notre pratique avec l'IA est immature.

Côté sécurité, de nouveaux vecteurs d'attaque apparaissent. Le slopsquatting : un LLM hallucine un nom de package qui n'existe pas, quelqu'un le crée avec du code malveillant dedans. Le vecteur est directement lié à la génération de code par IA.

Sur la qualité, on va plus vite mais on ne va pas mieux. Le rapport DORA 2025 confirme le décalage : l'adoption de l'IA améliore le débit logiciel mais dégrade la stabilité de livraison. D'autres études mesurent le même phénomène : 8 fois plus de duplication de code, +41% de complexité.

La review qui saute, les gains surestimés. On n'a pas appris à vérifier aussi vite qu'on génère.

## Autopsie d'un effondrement

Y'a un phénomène que personne n'avait vraiment anticipé. L'IA ne remplace pas seulement les développeurs. Elle remplace les produits.

En février 2026, 285 milliards de dollars de capitalisation boursière ont été effacés en une seule journée sur le secteur logiciel, après l'annonce des plugins Claude Cowork d'Anthropic. Les traders de Wall Street ont inventé un mot pour ça : la "SaaSpocalypse". Les multiples de valorisation (valorisation rapportée au revenu) sont passés d'un pic à 18.6x en 2021 à environ 5x fin 2025.

Jasper, l'outil de rédaction IA, a perdu 54% de ses revenus. Chegg, l'entreprise d'aide aux devoirs, a perdu environ 99% de sa valorisation. Deux effondrements spectaculaires. Mais qu'est-ce que ces produits avaient en commun ?

Une seule fonctionnalité, pas de données propriétaires, pas de workflow complexe, pas d'intégration profonde. Jasper vendait de la génération de texte. ChatGPT fait la même chose pour 20 dollars par mois. Chegg vendait des réponses à des questions. Le modèle de base les a rendus redondants du jour au lendemain. C'est ce qu'on appelle un wrapper mince : une couche d'interface par-dessus une capacité que l'IA fournit déjà.

Un SaaS qui repose sur de la donnée propriétaire, un workflow métier complexe, des intégrations profondes dans un écosystème, c'est pas la même histoire. Le modèle peut générer du texte. Il peut pas remplacer dix ans de données clients, une chaîne de validation réglementaire, ou un réseau d'intégrations avec des systèmes tiers.

Les 285 milliards effacés, c'est réel. Mais c'est une correction de valorisation, pas une extinction. Le marché recalibre ce qui a de la valeur. Ce qui tenait sur une seule fonctionnalité technique a sauté. Le reste est encore là.

La vraie question c'est pas "est-ce que les SaaS vont disparaître." C'est : qu'est-ce qui constituait un vrai avantage, et qu'est-ce qui n'en était qu'un en apparence ?

## Le raccourci

Pendant que certains produits s'effondrent, d'autres émergent. Les outils de génération d'apps explosent. Lovable fait 300 millions de revenus annuels. Replit affiche +1 556% de croissance. 25% des startups YC en sont à 95% de code généré par IA.

De ces chiffres, on peut construire un récit qui a l'air malin. D'un côté, l'IA rend la création de logiciel accessible à des non-devs. Plus de créateurs, plus de projets. De l'autre, l'IA réduit le besoin de développeurs par projet. Moins de postes, des équipes plus petites. Les deux courbes convergent. Le marché des développeurs se fait écraser.

Ce récit, on le retrouve partout. Sur LinkedIn, dans les pubs pour des formations "vibe coding", dans les accroches des cours de prompt engineering. "Apprends l'IA ou deviens obsolète." La peur du remplacement est devenue un argument de vente. Assez effrayant pour pousser à l'achat, assez simple pour tenir dans un post.

Sauf que les deux "courbes" n'existent pas comme données. Personne n'a mesuré le nombre de créateurs non-devs qui remplacent des devs. Personne n'a mesuré la réduction réelle de postes par projet à l'échelle du marché. C'est une histoire qu'on se raconte, pas un constat.

Les chiffres qu'on cite pour l'étayer ne mesurent pas ce qu'on croit. Lovable et Replit, c'est du revenu d'entreprise. Ça montre qu'il y a un marché pour ces outils, pas que des devs ont été remplacés. La stat YC, 25% des startups à 95% de code IA, c'est des startups early-stage. Des équipes de 2-3 personnes qui n'auraient pas embauché 10 développeurs de toute façon. C'est un échantillon très spécifique, pas le marché.

Est-ce que le marché grossit assez pour absorber le surplus ? On n'a toujours pas la réponse. Et ce récit n'en est pas une. C'est une façon confortable de ne plus poser la question.

## Ce qu'on sait et ce qu'on ne sait pas

Les faits sont là. Les incidents de production sont documentés. Certains SaaS se sont effondrés parce que le modèle de base faisait déjà ce qu'ils vendaient.

Mais la lecture qu'on en fait est fragile. Les incidents montrent une pratique immature. Les SaaS qui tombent sont des wrappers minces, pas tout le logiciel.

Ce qu'on ne sait pas, c'est la suite. Est-ce que c'est une correction temporaire, comme le crash des dotcoms qui a précédé 15 ans de croissance ? Ou un changement structurel, comme l'automatisation des usines qui n'a jamais recréé le même nombre d'emplois ?

Personne ne peut répondre honnêtement. Chaque signal a son contre-signal.

Le seul truc qu'on peut dire avec certitude, c'est que le marché de début 2026 ne ressemble plus à celui de 2022. Et que prétendre savoir ce qu'il sera en 2030, dans un sens ou dans l'autre, c'est vendre quelque chose.

Ce qui bouge, c'est pas seulement nos postes, c'est les produits qu'on construit, les pratiques qu'on utilise, les modèles qu'on sert. Qu'est-ce que ça veut dire d'être dev pendant que l'industrie se redessine ?

---

<details>
<summary>Références</summary>

- [Fortune — Replit AI agent wiped database](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) — incident suppression BDD
- [Gigazine — AWS AI outage](https://gigazine.net/gsc_news/en/20260223-aws-ai-outage/) — Kiro, 13h de panne
- [Wikipedia — Slopsquatting](https://en.wikipedia.org/wiki/Slopsquatting) — packages hallucinés
- [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research) — 8x blocs dupliqués
- [arXiv — CMU / Cursor](https://arxiv.org/abs/2511.04427) — +41% complexité du code généré
- [DORA 2025](https://dora.dev/research/2025/dora-report/) — débit vs stabilité
- [TechCrunch — SaaSpocalypse](https://techcrunch.com/2026/03/01/saas-in-saas-out-heres-whats-driving-the-saaspocalypse/) — $285B effacés, multiples SaaS
- [Sacra — Jasper](https://sacra.com/c/jasper/) — -54% revenus
- [Chegg Investor Relations](https://investor.chegg.com/) — effondrement post-ChatGPT
- [Sacra — Lovable](https://sacra.com/c/lovable/) — $300M ARR
- [Sacra — Replit](https://sacra.com/c/replit/) — croissance +1556%
- [TechCrunch — YC W25](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated/) — 25% startups, 95% code IA

</details>
