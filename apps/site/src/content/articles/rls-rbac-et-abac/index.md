---
title: "Une policy RLS qui combine rôle et appartenance"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rls", "rbac", "abac", "postgres"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 2
image: ./images/hero.webp
imageFocus: center
excerpt: "Un client voit ses commandes, un gérant voit celles de tout le monde. Une seule table, deux logiques d'accès, réunies par un OR dans une policy RLS — et une astuce de perf à connaître."
---

## Le besoin

Une table `orders`. Deux lectures légitimes, très différentes.

Un **client** ouvre son historique : il doit voir *ses* commandes, et seulement les siennes. Une **gérante** ouvre le back-office : elle doit voir *toutes* les commandes, parce que c'est son métier de les superviser.

Même table, même requête `select`, deux logiques d'accès qui n'ont rien à voir. La première regarde une relation entre la ligne et l'appelant. La seconde regarde le rôle de l'appelant. Comment exprimer les deux sans dupliquer la table, ni écrire deux endpoints qui finiront par diverger ?

## Le principe : deux axes, réunis par un OR

> **↑ Pour aller plus loin :** ce chapitre applique [RBAC vs ABAC : qui tu es vs ce que tu possèdes](/journal/rbac-vs-abac-qui-tu-es-ce-que-tu-possedes), et s'appuie sur [ACL en entrée, RLS en filet](/journal/acl-en-entree-rls-en-filet). Voici la version courte.

L'autorisation se pose sur deux axes orthogonaux. *Ce que tu possèdes* (ABAC) : la ligne t'appartient-elle ? *Qui tu es* (RBAC) : ton rôle te le permet-il ? Le client relève du premier, la gérante du second. Et la règle complète n'est ni l'un ni l'autre : c'est leur **réunion par un `ou`** — « cette ligne est à moi **ou** mon rôle m'autorise ». On va l'écrire littéralement comme ça.

## L'implémentation Supabase

### ABAC pur : « je vois mes lignes »

D'abord le cas simple, l'appartenance. La policy compare un champ de la ligne à l'identité de l'appelant. Rien d'autre.

```sql
CREATE POLICY "orders_select_own" ON orders FOR SELECT TO authenticated
  USING (orders.auth_user_id = (select auth.uid()));
```

C'est de l'ABAC à l'état pur : aucun rôle, juste une relation entre la donnée et l'appelant. Le même motif se répète partout où une donnée « appartient » à quelqu'un :

```sql
CREATE POLICY "customers_select_own" ON customers FOR SELECT TO authenticated
  USING ((select auth.uid()) = customers.id);

CREATE POLICY "loyalty_ledger_select_own" ON loyalty_ledger FOR SELECT TO authenticated
  USING (loyalty_ledger.customer_id = (select auth.uid()));
```

### La policy qui combine les deux

Maintenant la règle complète. On veut « je vois mes lignes **ou** je suis gérant ». C'est exactement un `OR` entre un test d'appartenance et un test de rôle :

```sql
-- « je vois MES lignes (ABAC : attribut user_id) OU je suis gérant (RBAC : rôle) »
create policy "user_roles_select_own_or_manager" on public.user_roles
  as permissive for select to authenticated
  using ((select auth.uid()) = user_id or public.authorize('staff.manage'));
```

Lis la condition à voix haute, elle dit le principe mot pour mot : `auth.uid() = user_id` (c'est à moi, ABAC) `or` `authorize('staff.manage')` (mon rôle l'autorise, RBAC). Le `authorize()` est la fonction d'autorité du chapitre 1 ; ici, elle est convoquée *à l'intérieur même* de la policy. Les deux axes cohabitent dans une seule expression : si tu possèdes la ligne, le premier membre suffit ; sinon, le rôle prend le relais.

### L'astuce de perf : `(select auth.uid())`

Tu as sûrement remarqué que `auth.uid()` est systématiquement enveloppé dans un `(select ...)`. C'est délibéré, pour la perf.

Une policy RLS s'évalue **pour chaque ligne** scannée. Écrite nue, `auth.uid()` serait rappelée à chaque ligne. Enveloppée dans `(select auth.uid())`, le planner la reconnaît comme un sous-plan d'initialisation (*initPlan*) : il l'évalue **une seule fois** pour toute la requête, puis réutilise la valeur. Sur une grosse table scannée, la différence est réelle. C'est le pattern recommandé par Supabase, et il vaut pour tout appel stable répété dans une policy.

## Honnêteté

Ces policies sont testées au bon niveau (A/B, en base éphémère) : l'appartenance, la combinaison avec le rôle, le refus quand ni l'un ni l'autre n'est vrai — c'est couvert. Le design est prouvé. (L'optimisation `initPlan`, elle, est une propriété du planner Postgres documentée par Supabase ; on l'applique par principe, on ne prétend pas l'avoir mesurée sous charge dans ce projet.)

---

**À retenir :** une seule table sert deux logiques d'accès quand la policy combine les deux axes par un `OR` — `auth.uid() = user_id` (appartenance, ABAC) `or` `authorize(...)` (rôle, RBAC) — et les appels stables passent dans `(select ...)` pour être évalués une fois par requête.
