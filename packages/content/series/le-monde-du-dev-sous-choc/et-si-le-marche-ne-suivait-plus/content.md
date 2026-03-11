Le chapitre précédent finissait sur une question : est-ce qu'on est prêts ?

C'était honnête. Mais c'était encore confortable, quelque part. Parce que "est-ce qu'on est prêts ?" implique qu'il y a quelque chose à être prêt pour. Un endroit où aller. Une place qui t'attend si tu fais le travail.

## L'histoire rassure

Chaque fois que le secteur vit une rupture comme celle-là, y'a une réponse qui revient. Les anciens qui ont traversé plusieurs transitions te disent : on a déjà vu ça. Et ils ont raison.

Grady Booch le dit lui-même en termes presque optimistes : on est peut-être en train d'entrer dans un troisième âge d'or du génie logiciel. Chaque rupture précédente avait généré le sien.

Dans les années 60, les programmeurs assembleur avaient peur. Les langages de haut niveau allaient les rendre obsolètes. Ce qui s'est passé : le software est devenu accessible à plus d'entreprises, la demande a explosé, le marché a grossi. Les programmeurs assembleur ont migré vers les nouvelles abstractions. Et il y avait de la place pour tout le monde, parce qu'il y avait plus de travail qu'avant.

Même chose avec l'orienté objet dans les années 80. Avec les frameworks dans les 90. Avec le cloud dans les années 2000. À chaque fois, des gens ont crié à la fin du métier. À chaque fois, le métier a muté et le marché a suivi.

L'histoire rassure. Et elle le devrait, jusqu'à un certain point.

## La condition qu'on oublie de mentionner

Toutes ces transitions tenaient à un truc qu'on ne mentionne jamais dans les analogies historiques : le marché grossissait en même temps.

C'est ça qui absorbait le surplus. Quand compiler le code au lieu de l'écrire en assembleur permettait à deux fois plus de boîtes de faire du software, la demande doublait. Les postes supprimés dans une catégorie réapparaissaient dans l'autre. Plus d'abstraction, plus d'accessibilité, plus de demande, plus de monde dans le secteur.

Le marché du dev a grandi pendant 40 ans. Pas parce que les devs devenaient meilleurs. Parce que la demande suivait chaque gain de productivité.

Et là, elle ne suit pas de la même façon.

## Le calcul simple

L'argument habituel, c'est que la demande va suivre. Le software moins cher à produire, c'est plus de boîtes qui en font, donc plus de travail. C'est possible.

Mais les transitions précédentes ne rendaient pas seulement le software moins cher — elles ouvraient des marchés entièrement nouveaux. Le cloud n'a pas juste compressé les coûts, il a rendu possibles des produits qui n'existaient pas. C'est ça qui absorbait le surplus de devs.

Le calcul que personne ne peut faire avec certitude, c'est : est-ce que l'IA ouvre un territoire nouveau de la même façon, ou est-ce qu'elle rend surtout moins cher ce qu'on construisait déjà ? Si un dev avec des outils IA fait trois fois plus de code, tu n'as pas besoin de trois fois plus de devs pour la même quantité de travail. T'en as besoin de trois fois moins — à moins que la demande elle-même explose. Et personne ne sait si elle va exploser de cette façon.

Les licenciements dans le secteur ont commencé avant l'IA. L'IA amplifie un mouvement qui était déjà là.

## L'outillage qui manque

Il y a un deuxième problème, plus technique, mais tout aussi réel.

On a mis des décennies à construire des filets autour de notre propre faillibilité. TDD, code review, CI, tests de non-régression. Tout ça existe parce qu'on a reconnu qu'on faisait des erreurs et qu'on a décidé d'en faire un problème d'ingénierie. C'est ce que je disais au chapitre précédent.

L'IA fait des erreurs autrement. Elle hallucine. Elle annonce que les tests passent quand ils échouent. Elle produit du code qui a l'air solide, bien structuré, bien nommé, et qui ne couvre pas les cas qui comptent. Les filets qu'on a construits pour nous ne fonctionnent pas de la même façon pour elle, parce qu'ils ont été conçus pour un système déterministe. Et l'IA ne l'est pas.

Martin Fowler en parle comme d'un collaborateur très productif à qui on ne peut pas faire confiance sur parole. Tu dois relire chaque ligne comme si c'était une PR d'un inconnu. Pour l'instant, il n'y a pas d'autre moyen de vérifier. Et l'outillage pour changer ça n'est pas là.

Quand il arrivera, les postes supprimés entre-temps ne reviendront pas.

## Le même mécanisme, à une autre échelle

Dans le chapitre sur la fatigue de relecture, j'avais décrit comment celui qui ralentit devient le frein. À l'échelle de l'équipe. Ça se rejoue au niveau du marché.

Celui qui prenait le temps de vraiment comprendre les PRs devenait le frein. Le management regardait les métriques. Les métriques disaient qu'il reviewait moins que les autres. La pression se retournait contre lui, et on finissait par éjecter celui qui la portait.

Un marché qui se contracte, ça marche pareil. Celui qui refuse d'accélérer, qui garde ses standards, qui prend le temps de comprendre ce qu'il produit, il devient le frein à l'échelle de l'entreprise. La question, c'est : dans un marché resserré, est-ce qu'on peut encore se permettre d'être ce frein-là ?

## L'inconfort n'était pas irrationnel

Le premier chapitre parlait de la peur. De l'année où j'avais flippé, où je ne savais plus où allait le métier.

J'ai passé plusieurs chapitres à déconstruire les mauvaises raisons de cette peur. La résistance hypocrite. La confusion entre prudence et évitement. Les arguments contre l'IA qu'on ne s'appliquait pas à nous-mêmes. C'était nécessaire.

Mais l'inconfort au fond, celui qui reste une fois qu'on a retiré les mauvaises raisons, il n'était pas irrationnel. Il était juste mal dirigé.

La vraie question, c'est : dans un marché qui se contracte, qu'est-ce qui justifie ta place ?

---

## Références

- Grady Booch — *The third golden age of software engineering* — [YouTube](https://www.youtube.com/watch?v=OfMAtaocvJw)
- Martin Fowler — *How AI will change software engineering* — [YouTube](https://www.youtube.com/watch?v=CQmI4XKTa0U)
