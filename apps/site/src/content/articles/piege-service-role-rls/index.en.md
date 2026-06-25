---
title: "The service_role trap: why RLS won't protect you"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rls", "security", "edge-functions", "postgres"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 3
image: ./images/hero.webp
imageFocus: center
excerpt: "Your admin Edge Function writes to the database, and you think your RLS policies have your back. They don't. Here's why, and the guard you need at the gate."
---

## The need

A manager refunds an order. A chef updates the menu. The counter staff take orders but must touch neither refunds, nor the menu, nor the settings.

To do this cleanly, you write an admin Edge Function. It receives the request, it writes to the database. And since it has to act on any customer's data, not just the caller's, it runs with the `service_role` key, Supabase's all-powerful key.

Being a good student, you also wrote per-role RLS policies on your tables. You tell yourself: even if I get the function wrong, RLS will catch me.

It won't. And it's Supabase's trap number one — the one 90% of tutorials never mention.

## The principle: ACL at the gate, RLS as the safety net

> **↑ Going deeper:** this article applies the principle [ACL at the gate, RLS as the safety net](/en/journal/acl-en-entree-rls-en-filet). Here's the short version.

One control point is one point of failure. Serious access security has **two layers with distinct jobs**:

- an **ACL at the gate** — the explicit decision *is this caller allowed to perform this action?*, made early, as a prerequisite;
- a **safety net** at the data level — per-row policies, stretched whatever the access path.

The part that hurts: **a privileged actor short-circuits the net.** So every privileged path *must* have an ACL at the gate — that's where there's no second chance. Hold onto that; we're about to see it literally at work.

## The Supabase implementation

### `service_role` bypasses RLS — by design

The `service_role` key is built for infrastructure: migrations, jobs, trusted server code. For it to do its work, Postgres runs it in **RLS bypass**. Your `for select/insert/update ... to authenticated` policies don't apply to it. It goes straight through as if they didn't exist.

Direct consequence: **an Edge Function using `service_role` is protected by none of your policies.** The net is stretched for everyone else, not for it. If you add nothing, your admin function is a wide-open door: the counter staff can call the refund endpoint, and RLS will say nothing.

RLS keeps its full meaning for the **other** path: direct access through PostgREST, where the caller is `authenticated`, not `service_role`. There, the net does its job. Each layer covers its own path.

### The guard at the gate: `serveAdmin({ requiredPermission })`

Since the net doesn't cover the Edge path, you need an **explicit ACL** at the function's entry point. The role travels in the JWT (set server-side by an Auth Hook — see chapter 1); we read it, and refuse with 403 if the permission is missing.

```js
// Role → permission matrix — a MIRROR of the role_permissions seed in the database.
export const PERMISSION_MATRIX = {
  gerante: ['catalog.write', 'promotions.write', 'delivery.dispatch', 'refunds.write',
            'settings.write', 'staff.manage', 'compliance.read', 'orders.manage'],
  chef: ['catalog.write', 'orders.manage'],
  comptoir: ['orders.manage'],
};

// Reads the user_role claim from the Bearer JWT. We do NOT re-verify the signature:
// in production the gateway already verified it (verify_jwt=true) before reaching the Edge.
export function roleFromAuthHeader(req) {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (auth === null || !auth.startsWith('Bearer ')) return null;
  const parts = auth.slice(7).split('.');
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const r = claims.user_role;
    return r === 'gerante' || r === 'chef' || r === 'comptoir' ? r : null;
  } catch { return null; }
}
```

`serveAdmin(handlers, { requiredPermission })` wraps the handler: it reads the role, checks the permission against the matrix, and **refuses with 403 before** running anything. It's the **only** gate for admin writes, since the function acts as `service_role`, which bypasses RLS. The per-role RLS stays the net for direct PostgREST access.

The principle, literally at work: the privileged path has no net underneath, so all of its access control rests on the gate guard.

### The trade-off: a duplicated matrix, but armed

You noticed: the role → permission matrix lives **twice**. Once in the database (`role_permissions`, the source of truth RLS reads), once in JS (`PERMISSION_MATRIX`, which the Edge gate reads).

That's duplication. The temptation is to kill it — query the database on every request to keep a single truth. But that means paying a DB round-trip on the hot path of every admin write, just for a matrix that changes twice a year.

The chosen call: **deliberate redundancy, but verifiable.** A test arms the invariant — if the JS matrix and the SQL seed diverge, CI breaks. The duplication stops being scary because drift is caught before production. (This is exactly the principle's "controlled redundancy.")

## Honesty

The **design** of this gate is proven and the authorization flow is covered by tests (level A/B, on an ephemeral database). The E2E validation of the **real Deno serving** (real gateway, real GoTrue, under load) is level C and remains **deferred** in this project. So: here's the correct shape of the guard and why it holds, without claiming it's been validated in production under load. Claiming that would be lying to you, and honesty is the whole point of this series.

---

**Takeaway:** `service_role` bypasses RLS, so an Edge that uses it is protected by none of your policies and needs an explicit ACL at the gate; RLS stays the net for direct access.
