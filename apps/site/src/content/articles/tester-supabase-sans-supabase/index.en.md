---
title: "Testing your Supabase backend without Supabase"
registre: impl
date: "2026-06-24"
tags: ["supabase", "testing", "pglite", "postgres", "rls"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 5
image: ./images/hero.webp
imageFocus: center
excerpt: "Check your RLS policies and SQL functions in milliseconds, without starting the stack. A Postgres in WASM, a simulated JWT claim, and honesty about what has to stay E2E."
---

## The need

You have RLS policies, an `authorize()` function, business RPCs. All of that is code — and code gets tested. But at what cost?

If every test requires starting a full Supabase stack — Postgres, GoTrue, PostgREST, the network — you're paying tens of seconds per run, a heavy CI, flaky tests. The familiar result: you write fewer of them, you run them less, coverage erodes. What you want is to check your database logic in **milliseconds**, in a loop, while you code. And you keep the real stack only for what truly demands it.

## The principle: push the test to the lowest level

> **↑ Going deeper:** this chapter applies [Test at the right level](/en/journal/tester-par-le-bon-niveau). Here's the short version.

Three tiers: **A** (logic in memory, milliseconds), **B** (light integration, ephemeral infra stand-in), **C** (real end-to-end). The rule: bring every test down to the lowest level where it still makes sense. An RLS policy, a pure SQL decision function — it doesn't need a real GoTrue to be proven. It just needs a Postgres. We're going to give it one, disposable.

## The Supabase implementation

### PGlite: a real Postgres, in WASM, disposable

PGlite is Postgres compiled to WebAssembly: a real Postgres engine that starts inside the test process, no server, no container. You apply your migrations to it, run your queries, check the behavior — then throw it away. Level A/B reached: your policies, your `authorize()` function, your RPCs run against real Postgres SQL, in milliseconds, without the Supabase stack.

It's the exact same Postgres engine. A policy that passes in PGlite passes because the semantics are identical.

### The JWT claim, simulated by a GUC

One detail decides everything: your policies read the caller's identity and role. In production, that comes from the JWT. In tests, there's no JWT. How do you make `authorize()` believe a manager is logged in?

This is where a decision from chapter 1 pays off. Remember: `authorize()` reads `current_setting('request.jwt.claims')` **rather than** `auth.jwt()`. The reason is exactly this: `request.jwt.claims` is a **GUC** (a Postgres session setting), and a GUC can be set by hand.

```sql
-- The test shim sets the claim, exactly as the real stack would
select set_config('request.jwt.claims', '{"sub":"...","user_role":"gerante"}', true);
```

From there, `authorize('staff.manage')` returns `true` in tests just as in production, because it reads the same source. The same authority code is **portable** between the level-A PGlite and the level-C real GoTrue. Had the function depended on `auth.jwt()`, that bridge would be impossible: you couldn't simulate the caller without a real GoTrue.

### What doesn't come down: `@pglite-skip`

Not everything can be proven in PGlite, and that's healthy. Some migrations reference roles only the real environment has — for instance the auth-admin role that runs the Custom Access Token Hook (chapter 1). PGlite doesn't know that role.

Rather than hacking a fake role that would lie about reality, those migrations carry a marker at the top:

```sql
-- @pglite-skip  (supabase_auth_admin role absent from PGlite: validated at level C)
```

The harness skips the entire file at level A. The consequence is honest: the Hook doesn't pretend to be unit-tested — it belongs to level C, **deferred**. The RBAC tables and `authorize()`, meanwhile, stay A-testable. You only push down what still makes sense at the bottom.

### The cost of PGlite

One last point we don't smooth over. PGlite consumes memory — on the order of **~1.6 GB per fork**, not released. Spun up in massive parallelism "because it's fast," you go OOM. So the suites cap concurrency. Speed has a memory cost: the right reflex is to know it and pay it knowingly, instead of discovering the OOM in CI.

## Honesty

This is the chapter that *embodies* the whole series' guardrail. What's proven here is genuinely proven: policies, `authorize()`, RPCs run against a real Postgres and are covered (level A/B, green suite). What depends on the real runtime — the token-issuance Hook, the GoTrue-specific grants — is **explicitly marked as deferred** (level C), not hidden under a fake green test. The strategy rests on that transparency about the real state of the proof.

---

**Takeaway:** PGlite gives you a real, disposable Postgres to test policies and functions in milliseconds; the claim is simulated via the `request.jwt.claims` GUC (hence `current_setting` over `auth.jwt()` in chapter 1), what needs a real GoTrue carries `@pglite-skip` at level C, and the memory cost runs ~1.6 GB/fork.
