Le chapitre précédent parlait du piège individuel. Ce muscle qu'on perd doucement quand on arrête de lire. Mais y'a un truc auquel j'ai pas pensé tout de suite : ce piège-là, il pourrait bien se jouer aussi au niveau de l'équipe. Et là, c'est une autre échelle.

Parce qu'un dev qui arrête de relire son code, il le paie seul. Mais quand c'est toute l'équipe qui arrête, la compréhension partagée du système se dilue, se fracture. Le code passe, les tests passent, mais plus personne n'a la vision d'ensemble de ce qui se construit.

## Le volume a changé

Le problème c'est pas que le code généré soit mauvais. C'est qu'il y en a trop.

Un dev avec des agents IA peut produire en une journée ce qui prenait une semaine. Plusieurs PRs par jour, chacune bien structurée, bien nommée, tests inclus. Ça a l'air solide. Ça compile. Les tests passent.

Sauf que maintenant, multiplie ça par toute l'équipe. Le reviewer ouvre sa liste le matin : quinze PRs en attente. Hier c'était pareil. Demain, probablement plus.

Le code arrive plus vite que la capacité humaine à le relire. Et c'est pas un problème de compétence ou de motivation. C'est un problème de débit.

## La fatigue de relecture

Au début, tu relis. Tu prends le temps. Tu poses des questions sur les choix, tu vérifies que l'intention colle avec l'implémentation.

Puis les PRs s'empilent. Les notifs s'accumulent. Et la pression monte. Pas une pression explicite. Personne vient te dire "relis plus vite". C'est plus subtil que ça. C'est le board qui avance, les tickets qui s'enchaînent, les standup où on parle de vélocité.

Alors tu commences à survoler. Tu regardes le diff, tu vérifies que ça compile, tu lis les tests. "Ça a l'air bien." Approve.

Le truc c'est que le code généré par IA a une particularité : il *a l'air* bien. Propre, cohérent, bien nommé. Ça te donne l'impression que t'as bien relu alors que t'as juste scanné de la surface. C'est de la médiocrité qui se présente bien.

## Celui qui ralentit

Et puis il y a celui qui prend le temps. Qui pose les questions gênantes. "Pourquoi cette abstraction ?" "Est-ce qu'on a besoin de cette couche ?" "Ça résout le bon problème ?"

Avant, c'était le pilier de l'équipe. Maintenant c'est le frein. Celui à cause de qui les PRs traînent. Celui que le management remarque parce que les métriques disent qu'il review moins de PRs que les autres.

Et si le goulot d'étranglement se déplaçait ? Avant, tout le monde attendait le dev. Maintenant le dev livre vite. Le goulot pourrait bien glisser vers la review. Et les projecteurs suivent toujours le goulot.

Si ça arrive, la question qu'on posera c'est pas "pourquoi on génère autant de code ?" mais "pourquoi les reviews prennent si longtemps ?". La pression risque de se retourner contre ceux qui prennent le temps de comprendre ce qu'ils approuvent.

Et là, le scénario est facile à imaginer. On simplifie le process. On accélère le pipeline. On retire la responsabilité à celui qui la portait. Et on se retrouve avec une équipe qui produit vite, qui livre vite, et où personne ne sait plus vraiment ce qui sort.

## L'effet curl

C'est pas juste les PRs. Le même phénomène touche tous les endroits où des humains filtrent ce que des machines produisent.

L'équipe de curl a dû suspendre son programme de bug bounty. La raison : un flood de rapports générés par IA. Bien écrits, bien structurés, techniquement plausibles. Et massivement faux. Chaque rapport demandait du temps à un mainteneur pour être lu, évalué, rejeté. Le volume a noyé la capacité de tri.

C'est le même schéma. La production explose. La validation ne suit pas. Et ceux qui faisaient le tri se retrouvent submergés ou éjectés.

## Ce qu'on perd vraiment

L'artisanat logiciel, celui dont je parlais dans le deuxième chapitre, c'est pas juste individuel. C'est un truc d'équipe. Le soin, le feedback, la discipline, ça se porte à plusieurs.

La code review, c'est pas juste de la validation. C'est le moment où la connaissance circule. Quelqu'un d'autre que l'auteur intègre le contexte, comprend les choix, voit comment le système évolue. Review après review, toute l'équipe finit par avoir une carte mentale du système. Pas complète, mais partagée.

Quand ce moment-là devient une formalité, c'est cette carte qui se fragmente. Chacun ne connaît plus que son bout. Le système devient un assemblage de morceaux que personne ne voit dans son ensemble.

Et le jour où il faut prendre une décision d'architecture, qui a le recul ? Le jour où un bug traverse trois couches, qui comprend le chemin ? Le jour où on veut changer de direction, qui sait ce qu'on casse ?

Ces questions-là, avant, l'équipe savait y répondre. Pas parce que quelqu'un avait tout en tête, mais parce que la connaissance était distribuée à travers les reviews, les discussions, les "attends, t'es sûr ?". Si ce tissu se défait, est-ce qu'on sait seulement le reconstruire ?
