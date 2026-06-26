---
title: "Test at the right level"
registre: design
date: "2026-06-24"
tags: ["architecture", "testing", "design", "backend"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "If a rule is testable without the infrastructure, it doesn't belong to it. Push every test to the lowest level where it still means something — and honestly own what has to stay up top."
---

To check that a tax calculation is right, you don't need a server, a network, or a real database. You need input data and an expected result. The day your tax test requires starting the whole stack, that's a sign: it was written at the wrong level.

Testing at the right level is a single idea: **put each test at the lowest tier where it still makes sense.** The lowest, because that's where it runs fast, stays reliable and points straight at what broke. And "where it still makes sense," because going too low no longer proves anything.

## Three levels, three jobs

Tests sort into three tiers, lowest to highest.

**Level A — logic, in memory.** A pure rule: you give it inputs, you check outputs. No infrastructure, no I/O. It runs in milliseconds, it's deterministic, and when it breaks the message is unambiguous. This is where the overwhelming majority of your business tests should live.

**Level B — light integration.** Several pieces assembled, sometimes with a light, ephemeral stand-in for the infrastructure (an in-memory database, a faithful simulated dependency). You check that the parts fit together, that the contracts hold. Slower than A, but still fast and reproducible.

**Level C — real end-to-end.** The real system, the real components, the real network. It's slow, more fragile, costly to maintain. But it's the only level that proves certain things: that the real wiring works, that external components behave as the docs promise.

These three tiers aren't in competition: they answer different questions. The mistake is testing something at a level that isn't its own.

## Gravity: push the test down

The design rule that follows: **bring every test down to the lowest possible level.**

A business rule tested at level C when it could be tested at level A is waste: you're paying slowness and fragility for a proof you could have had in milliseconds. Worse, it's a **symptom**: if you *have to* go up to level C to test a piece of arithmetic, that rule is hooked onto infrastructure it should be detached from. The hard test points at a design problem, not a testing problem.

Hence the criterion, the same one that sorts code by ownership: *what do I need to test this rule?* If the answer is "nothing but the rule itself," your target is level A. If the answer is "the whole stack," start by asking whether the rule is in the right place — often, making it testable at level A is first about unsticking it from the infrastructure.

A good suite isn't measured by its volume of tests. Its quality comes down to one thing: each test sits at the lowest tier that makes it useful.

## What has to stay up top — and the honesty it demands

Some things are only provable at level C. The real behavior of an external component. Wiring that depends on the real environment. A contract with a system you don't control. Forcing them lower means building a test that goes green without guaranteeing anything — the worst of both worlds.

And here comes a demand for honesty that's often neglected. Level C is slow and costly; sometimes you **defer** part of that validation — a legitimate choice, provided you say so. The rule is simple:

> What's proven at level A/B, you can assert. What belongs to a level C you haven't (yet) run, you describe its **design**, not its validation.

In other words: "here's the correct shape, and here's why it holds" is honest. "Validated in production, under load" while the end-to-end test is deferred is not. Conflating proven design with deferred validation means selling the aspirational as the achieved — and that ruins trust far more surely than debt owned out loud.

## The low level isn't free

One last guardrail, against the opposite excess. Pushing tests down is the right direction, but no tier is free of cost. An ephemeral infrastructure stand-in (level B) consumes resources — memory, startup time — that are easy to forget because they're "local." Multiplied by parallelism, it adds up: you cap concurrency, you watch memory, you don't spin up a thousand instances "because it's fast."

Presenting a fast testing tool as "free" is the same family of mistake as claiming to have validated what you deferred: it smooths over a trade-off instead of naming it. The right reflex: know the cost of each level, and pay it knowingly.

## What to take away

- Three levels, three jobs: A (logic in memory), B (light integration), C (real end-to-end). Each answers a different question.
- Push every test to the **lowest level where it still makes sense**: that's where it's fast, stable, precise.
- A test that *requires* going up to level C for a simple rule is a symptom: the rule is misfiled.
- Own the level C you defer: describe the **design**, not a validation you didn't run.
- No level is free. Know the cost (memory, slowness) and pay it knowingly.
