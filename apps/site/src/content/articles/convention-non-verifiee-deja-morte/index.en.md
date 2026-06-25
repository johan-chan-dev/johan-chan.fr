---
title: "An unenforced convention is already dead"
registre: design
date: "2026-06-24"
tags: ["architecture", "design", "dependencies", "monorepo"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "\"We always import top to bottom.\" Everyone agrees, it's in the README, and six months later the rule is violated everywhere. A boundary the tooling doesn't enforce doesn't exist."
---

"Around here, we always import top to bottom. The business layer never depends on the outside."

Everyone nods. It's in the README. It's said at onboarding. And six months later you open the dependency graph and the rule is violated in twelve places. Nobody did it on purpose. Every breach was "just a small import, to unblock something."

That's the fate of any convention resting on goodwill: it drifts. Not all at once — by accumulation of small arrangements, each reasonable on its own. A convention the tooling doesn't enforce isn't "fragile." It's **already dead** the moment you write it, because nothing stands in the way of its first violation.

## Why gentleman's conventions drift

A "gentleman's" convention is a rule everyone commits to respect… from memory. It has three fatal weaknesses.

It's **invisible at coding time**. When you write a forbidden import, nothing flags it. You don't have the rule in front of you — you have a deadline.

It's **asymmetric over time**. Respecting it pays nothing today; violating it unblocks you right now. At every trade-off, the present beats the future.

And it **degrades silently**. The first breach breaks nothing visible. It just makes the second easier to justify — "there's already one there." The debt settles in without an alarm.

The result: the boundary exists on paper, but the code does whatever it wants. And a dependency graph that does whatever it wants is a system you can no longer reason about or split apart.

## The arrow is one-way

The cure starts with a clean design decision: **dependency has a direction, one only.**

You arrange your system in layers — say, from most exposed to most stable: the outer layer (transport, I/O) → the business layer (the domain rules) → the primitives (shared utilities, no business logic). The rule is simple: you always depend **inward**. The outside knows the business; the business ignores the outside. Never the reverse.

That choice is functional. If the business starts depending on the outside, you can no longer test the business without standing up the outside, nor reuse it under another transport, nor swap the transport without touching the business. The directed arrow is what keeps the stable core independent of what surrounds it.

But stating the direction isn't enough. We just saw why: stated, it drifts.

## Make it executable

The boundary becomes real only when **the tooling refuses the violation**.

Concretely: a lint rule that forbids the wrong-way import, and that **fails** the check when one appears. Not a warning you scroll past — an error that blocks. From there, everything changes:

- The rule becomes **visible at coding time** again: you attempt the forbidden import, it goes red immediately.
- The time asymmetry **flips**: violating costs right now (CI breaks), respecting is the path of least resistance.
- Silent degradation **becomes impossible**: there's no longer a "first breach" that slips by unnoticed.

The convention stops being a promise and becomes a property of the system. You no longer ask people to remember it; you've made the mistake **impossible to commit**.

The rule stays your design decision; the test makes it *alive*. Without it, you have an intention; with it, you have a boundary.

## The corollary that bites its own tail

This principle applies to more than code. Any documentation, any editorial architecture, any "this depends on that" system obeys the same law: a dependency you forbid but don't verify will eventually be taken.

It's even a good test for yourself: if you state a boundary — in your code, your docs, your organization — immediately ask "what *refuses* its violation?" If the answer is "people's vigilance," you don't have a boundary. You have a wish.

## What to take away

- A convention resting on memory and goodwill always drifts, by accumulation of small reasonable breaches.
- Deciding the direction of dependency (always inward: outer → business → primitives) is necessary but not sufficient.
- A boundary only truly exists when the tooling **refuses** its violation: the check fails, CI blocks, the mistake stays impossible to commit.
- Good reflex: in front of any rule, ask "what prevents its violation?" If the answer is "vigilance," you hold a wish.
