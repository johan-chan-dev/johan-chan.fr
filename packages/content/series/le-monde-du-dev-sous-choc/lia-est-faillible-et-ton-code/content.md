Les chapitres précédents parlaient de ce qu'on risque de perdre. Le muscle individuel, la vision partagée de l'équipe. Mais en écrivant tout ça, un truc me gênait. On parle des risques de l'IA, c'est réel. Mais est-ce qu'on a regardé notre propre process avec la même honnêteté ?

## Le filtre anti-spam

Prenons le filtre anti-spam. La question "c'est quoi du spam ?" est vraiment floue. Ça dépend du contexte, de l'expéditeur, du destinataire, du moment. Y'a pas de réponse formelle.

Alors on a fait ce qu'on savait faire. Des listes de mots-clés, des scores, des règles. "Si le sujet contient 'gratuit' ET l'expéditeur n'est pas dans le carnet d'adresses ALORS score += 3." On a empilé des conditions jusqu'à ce que ça marche... à peu près.

Ça bloquait des emails légitimes. Ça en laissait passer d'autres. Et on ajustait les seuils en croisant les doigts.

C'était du flou habillé en logique formelle. Du déterministe dans la forme. Pas dans la nature.

## Du flou habillé en logique

C'est pas un cas isolé.

L'arbre de décision métier à 200 branches. Le PO ajoute des cas edge jusqu'à ce que plus personne comprenne la logique. Et ça casse quand même sur le 201ème.

Le scoring maison. "Si le client a fait X et Y mais pas Z alors score = 42." Pourquoi 42 ? Parce que ça marchait sur le jeu de test.

Du code déterministe dans sa forme. Du flou traité avec le seul outil qu'on avait : le `if/else`.

Et c'est pas un reproche. C'était le meilleur compromis possible. On n'avait rien d'autre. Mais on a fini par confondre l'outil avec la réalité. On a cru que programmer, c'était écrire de la logique déterministe. Que si c'est dans un `if/else`, c'est maîtrisé.

Ça l'a jamais été. Pas complètement.

## Tout peut être formalisé ?

Et c'est pas qu'un problème de dev. C'est tout le process.

Un product owner a une idée. Elle est floue, comme toutes les idées au départ. Il écrit une spec pour la formaliser. Première compression avec perte. Le dev lit la spec et implémente. Deuxième compression. Et quand des cas imprévus apparaissent, on appelle ça des "edge cases" plutôt que d'admettre que le problème était flou dès le départ.

On se cache derrière les spécifications pour donner une forme nette à un besoin qui ne l'est pas.

Et y'a pas que les edge cases. Y'a les bugs. Ceux qu'on introduit par mégarde, par fatigue, par incompréhension. On le sait tellement bien qu'on a inventé le TDD, la code review, la CI, les tests de non-régression. Tout cet outillage existe parce qu'on a accepté qu'on était faillibles. On a construit des garde-fous autour de nous-mêmes.

Alors, honnêtement. C'est quoi la différence entre une implémentation qui couvre 95% des cas (avec ses edge cases et ses bugs découverts en prod) et une IA qui couvre 95% des cas ?

## C'est vraiment si différent ?

La différence ? Pas grand-chose, sur le fond.

On rejette l'IA parce qu'elle "fait des erreurs." Mais on a bâti une méthodologie entière parce qu'on en faisait aussi. On la rejette parce que "c'est pas déterministe." Notre code ne l'a jamais été complètement. On a juste mis du `if/else` autour pour que ça en ait l'air.

On a normalisé notre propre faillibilité. On l'appelle "dette technique", "edge cases", "bugs connus." Et on refuse la même chose venant de la machine.

C'est pas que l'IA est parfaite. C'est que l'argument "c'est pas fiable" sonne creux quand on regarde honnêtement ce qu'on produit nous-mêmes.

## Prudence ou évitement ?

Je comprends la résistance. Le management qui veut remplacer une équipe par des licences IA. Les décideurs qui confondent démo et production. Résister à ça, c'est sain.

Mais à un moment je me suis posé la question franchement. Est-ce que je résiste aux mauvaises décisions ? Ou est-ce que j'utilise les mauvaises décisions comme prétexte pour éviter de me confronter à l'outil ?

Pas facile d'y répondre honnêtement. Parce que les deux peuvent coexister. Et si je confonds prudence et évitement, je fais plus de l'analyse. Je fais de la résistance.

L'IA est faillible. L'outillage pour la valider, la contraindre, la garder dans les rails, c'est pas encore là. C'est indéniable. Mais on a déjà vu ce film. Quand on a découvert que le dev humain était faillible, on n'a pas arrêté de coder. On a inventé le TDD. On a construit des filets.

L'IA a besoin des mêmes filets. Et personne ne les a encore construits.

## C'est quoi, le craft ?

Le craft, chacun le définit un peu différemment. Pour certains c'est la qualité du code. Pour d'autres c'est l'attention aux détails, la transmission, le souci du long terme. Y'a pas de version officielle. Mais y'a une posture qui revient : pas rejeter les outils en bloc, pas les avaler sans réfléchir. Les expérimenter, les comprendre, et en garder ce qui fait évoluer son craft.

Y'a deux discours qui circulent autour des juniors. D'un côté ceux qui résistent : "apprends les fondamentaux d'abord, l'IA c'est une mode." De l'autre ceux qui vendent : "l'IA fait tout, les fondamentaux c'est du passé." Les deux raccourcissent la réalité et préparent mal. Aucun des deux ne pose vraiment la bonne question.

La question c'est pas "est-ce que l'IA est prête ?" C'est "est-ce que nous, on l'est ?"
