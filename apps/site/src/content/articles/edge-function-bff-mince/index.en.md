---
title: "Your Edge Function should know nothing"
registre: impl
date: "2026-06-24"
tags: ["supabase", "edge-functions", "architecture", "testability", "deno"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 4
image: ./images/hero.webp
imageFocus: center
excerpt: "Pricing, tax, availability logic must be reusable and testable without starting a server. An Edge Function's job is to wire — not to know."
---

## The need

An order comes in. You have to check dish availability, freeze an immutable price, break down the tax, persist it all atomically. This is the heart of the business — the part that has to be *right*.

And you need that logic in several places: the web app, the native app, maybe a back office. You need to **test** it fast, in a loop, without spinning up a whole stack. And you need it to never drift from one copy to another.

Question: where do you put this code? The Supabase reflex is "in the Edge Function, obviously, that's where the request lands." That's exactly the trap.

## The principle: running in ≠ belonging to

> **↑ Going deeper:** this chapter applies ["Executed in X" is not "belongs to X"](/en/journal/execute-dans-x-nest-pas-appartenir-a-x) and, underneath, [the verified dependency boundary](/en/journal/convention-non-verifiee-deja-morte). Here's the short version.

Code that runs in the Edge doesn't *belong* to it for that reason. Where it runs (the Deno runtime) is a contingent technical fact. Where the rule lives (the business domain) is a durable design decision. The question that settles it: **what do I have to start up to test this rule?** If the answer is "the whole stack," the rule is in the wrong place.

Hold onto that. We're about to see it literally in the handler.

## The Supabase implementation

### The `order` handler: it composes, it invents nothing

Here's order placement. Look at what it *doesn't do*: no inline price calculation, no tax rule, no business validation written on the spot. It imports modules and chains them.

```ts
import { createClient } from '@supabase/supabase-js'
import { createCatalog } from '@baan/catalog'
import { factureDeCommande, lignesFactureFromSnapshots } from '@baan/pricing'
import { createOrderFromResolved } from '@baan/ordering'
import { getDb } from '@baan/db'

// ... inside the handler:
const db = await getDb()
const catalog = createCatalog({ getDb: () => db })
const resolved = await catalog.resolveIntent({ lignes: body.lignes })   // availability + immutable snapshot
const factureVentilee = factureDeCommande({ /* ... */ })                 // tax breakdown
const order = await createOrderFromResolved(db, { /* ... */ })           // atomic persistence
```

All the safety — availability, price, breakdown, immutable snapshot — lives in the `business/*` modules. The Edge **wires the real dependencies behind the same ports as the test doubles**. The runtime translates the request into business calls, then the result into a response. That's its entire job.

Direct consequence: every rule is tested by calling a function, without starting Deno or opening a port. *Running in* the Edge, *belonging to* the domain.

### The boundary that prevents drift

What's left is to stop convenience from pulling the logic back into the handler "just this once." The tooling handles that.

The dependency rule is directed: `apps → business → packages`. The Edge (`apps`) may import the business layer (`business`); the reverse is forbidden. A `business → apps` import is **rejected at lint** (`eslint-plugin-boundaries`): the arrow is one-way, mechanically enforced. (That's the [verified-boundary principle](/en/journal/convention-non-verifiee-deja-morte).)

### The contrast: the "all inline" version

To feel what you gain, look at what the tutorials encourage — compute price and tax then insert, straight inside the `serve()`:

```ts
// ANTI-PATTERN (illustrative) — logic married to the transport
serve(async (req) => {
  const body = await req.json()
  let total = 0
  for (const ligne of body.lignes) {
    const { data } = await supabase.from('plats').select('prix').eq('id', ligne.id).single()
    total += data.prix * ligne.qty           // inline pricing rule
  }
  const tva = total * 0.1                     // inline tax rule
  await supabase.from('orders').insert({ total, tva })
  return new Response(JSON.stringify({ total, tva }))
})
```

It works. And it's a trap: price and tax are welded to `req`, to `Response`, to the Supabase client. To test the breakdown, you have to start the whole runtime. To reuse the rule on web or native, you rewrite it — and the truth diverges. The principle's criterion settles it: to test this tax, you must start the infrastructure → it's in the wrong place.

## Honesty

The **flow** this handler wires is validated by tests at the right level (A, on an ephemeral database): the catalog → price → persistence composition is covered. The **real Deno serving** (real gateway, real runtime under load), however, is level C and remains **deferred** in this project — this module is not run by the green suite. So: here's the correct shape of the wrapper and why it holds. Not "proven in production under load."

---

**Takeaway:** the business logic lives in modules that know nothing of Deno or HTTP, testable without starting anything, and the `apps → business → packages` boundary is held by the linter.
