---
title: "An RLS policy that combines role and ownership"
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
excerpt: "A customer sees their orders, a manager sees everyone's. One table, two access logics, joined by an OR in a single RLS policy — plus a performance trick worth knowing."
---

## The need

An `orders` table. Two legitimate reads, very different.

A **customer** opens their history: they must see *their* orders, and only theirs. A **manager** (`gerante`) opens the back office: she must see *all* orders, because supervising them is her job.

Same table, same `select` query, two access logics with nothing in common. The first looks at a relationship between the row and the caller. The second looks at the caller's role. How do you express both without duplicating the table, or writing two endpoints that will eventually drift?

## The principle: two axes, joined by an OR

> **↑ Going deeper:** this chapter applies [RBAC vs ABAC: who you are vs what you own](/en/journal/rbac-vs-abac-qui-tu-es-ce-que-tu-possedes), and builds on [ACL at the gate, RLS as the safety net](/en/journal/acl-en-entree-rls-en-filet). Here's the short version.

Authorization sits on two orthogonal axes. *What you own* (ABAC): does the row belong to you? *Who you are* (RBAC): does your role allow it? The customer is the first, the manager the second. And the full rule is neither one alone: it's their **union with an `or`** — "this row is mine **or** my role authorizes it." We're about to write it literally that way.

## The Supabase implementation

### Pure ABAC: "I see my rows"

First the simple case, ownership. The policy compares a field on the row to the caller's identity. Nothing else.

```sql
CREATE POLICY "orders_select_own" ON orders FOR SELECT TO authenticated
  USING (orders.auth_user_id = (select auth.uid()));
```

That's ABAC in its pure state: no role, just a relationship between the data and the caller. The same shape repeats everywhere data "belongs" to someone:

```sql
CREATE POLICY "customers_select_own" ON customers FOR SELECT TO authenticated
  USING ((select auth.uid()) = customers.id);

CREATE POLICY "loyalty_ledger_select_own" ON loyalty_ledger FOR SELECT TO authenticated
  USING (loyalty_ledger.customer_id = (select auth.uid()));
```

### The policy that combines both

Now the full rule. We want "I see my rows **or** I'm a manager." That's exactly an `OR` between an ownership test and a role test:

```sql
-- "I see MY rows (ABAC: user_id attribute) OR I'm a manager (RBAC: role)"
create policy "user_roles_select_own_or_manager" on public.user_roles
  as permissive for select to authenticated
  using ((select auth.uid()) = user_id or public.authorize('staff.manage'));
```

Read the condition out loud, it states the principle word for word: `auth.uid() = user_id` (it's mine, ABAC) `or` `authorize('staff.manage')` (my role allows it, RBAC). The `authorize()` is the authority function from chapter 1; here it's summoned *inside* the policy itself. The two axes coexist in a single expression: if you own the row, the first clause is enough; otherwise, the role takes over.

### The performance trick: `(select auth.uid())`

You've surely noticed `auth.uid()` is consistently wrapped in a `(select ...)`. That's deliberate, for performance.

An RLS policy is evaluated **for every row** scanned. Written bare, `auth.uid()` would be re-called on each row. Wrapped in `(select auth.uid())`, the planner recognizes it as an initialization subplan (*initPlan*): it evaluates it **once** for the whole query, then reuses the value. On a large scanned table, the difference is real. It's the pattern Supabase recommends, and it holds for any stable call repeated in a policy.

## Honesty

These policies are tested at the right level (A/B, on an ephemeral database): ownership, the combination with role, the denial when neither is true — covered. The design is proven. (The `initPlan` optimization is a property of the Postgres planner documented by Supabase; we apply it on principle, we don't claim to have measured it under load in this project.)

---

**Takeaway:** one table serves two access logics when the policy combines both axes with an `OR` — `auth.uid() = user_id` (ownership, ABAC) `or` `authorize(...)` (role, RBAC) — and stable calls go in `(select ...)` so they're evaluated once per query.
