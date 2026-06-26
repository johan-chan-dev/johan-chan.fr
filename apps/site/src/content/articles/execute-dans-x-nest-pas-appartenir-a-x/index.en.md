---
title: "\"Executed in X\" is not \"belongs to X\""
registre: design
date: "2026-06-24"
tags: ["architecture", "design", "testability", "backend"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "The code that computes your prices runs inside an HTTP server. That doesn't mean it lives there. Confusing the two marries your business logic to a transport it should never know about."
---

Your price-calculation rule runs inside an HTTP server. So it belongs to the HTTP server, right?

No. And that confusion — between *where the code runs* and *where the rule lives* — is at the root of a good half of the backends nobody can test or reuse anymore.

The mail carrier walks down your street every morning. That doesn't make your street the post office.

## The founding confusion

When you write an endpoint, everything sits in one place: you receive a request, read the body, check availability, compute price and tax, write to the database, return a response. The natural move is to drop it all in the handler. It works. It ships.

But you just decided, without saying it out loud, that your pricing rule *belongs* to the HTTP transport. It's married to the request object, the response object, the database client. To run it, you need the whole set.

Yet where it runs and where it lives are two different things. Code *runs* in the runtime — a technical, contingent fact that will change. Code *belongs* to a domain — a design decision that should last. Conflating them lets an infrastructure detail dictate the architecture of your business logic.

## The question that settles it

There's a dead-simple question that sorts every piece of code onto the right side:

> **What do I have to start up to test this rule?**

If verifying your tax breakdown means launching an HTTP server, opening a port, forging a request and reading a response — then you've answered it: your business rule *belongs* to the infrastructure. That's a problem, because tax breakdown has nothing to do with HTTP. You're paying a startup-and-staging cost to test a piece of arithmetic.

If the answer is *nothing* — I call a function with some data, I check the result, done — then the rule *lives* in the domain, and the runtime is just a place it passes through. That's what we want.

The criterion is operational, not philosophical. You run it against the code, and it tells you where the rule actually lives. When testing a rule requires starting the infrastructure, the problem usually isn't hard tests. The rule was simply filed in the wrong place.

## What the confusion costs

Logic married to the transport gets paid for in three ways.

**It becomes untestable at the right level.** Every rule test drags the whole runtime set along. Tests are slow, brittle, painful to write. So you write fewer of them, and you cover less of the logic that matters.

**It becomes non-reusable.** The same pricing rule, you need it on web, on native, in a batch job. But it's welded to *one* transport. So you rewrite it elsewhere — and now the truth exists in two copies that will drift.

**It becomes opaque.** When business and HTTP plumbing are tangled in the same handler, you can no longer read the intent. "What is this order supposed to guarantee?" drowns under parsing, serialization, network error handling.

## The healthy shape

The inversion is simple to state: **the runtime owns nothing, it wires.**

The handler becomes thin. Its only job: translate the outside world (the request) into calls to business modules, then translate the result into a response. It *composes*. No rule is born in the handler.

The logic, meanwhile, lives in modules that know nothing of HTTP, the transport, or the runtime. Availability, price, breakdown, persistence: each is a unit you test by calling a function, starting nothing. The handler assembles them behind the same interfaces you use in tests with doubles.

You then get the property we were after: *running in* the runtime, *belonging to* the domain. The code does run in the server — but it lives in portable modules, testable in milliseconds, reusable everywhere. The day you swap transports, you rewrite the thin handler. The rule doesn't move. It was never the transport's to begin with.

## What to take away

- *Running in* X (a contingent technical fact) ≠ *belonging to* X (a durable design decision). Don't let the first dictate the second.
- The question that settles it: "what do I have to start up to test this rule?" If the answer is "the infrastructure," the rule is in the wrong place.
- Logic married to the transport is untestable at the right level, non-reusable, and opaque.
- The healthy shape: a thin handler that *composes*, and business modules that don't know the runtime. The runtime just wires things together.
