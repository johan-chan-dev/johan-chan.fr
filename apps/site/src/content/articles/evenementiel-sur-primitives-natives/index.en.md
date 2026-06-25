---
title: "Reacting without a broker: event-driven on native primitives"
registre: design
date: "2026-06-24"
tags: ["architecture", "event-driven", "decoupling", "design"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "An order is paid, three services must react. Event decoupling is first a matter of design. Often, the primitives you already have are enough."
---

An order is paid. You have to credit loyalty, schedule delivery, send a notification. Three reactions, three services, maybe three teams. The trap question: how do you wire them?

The reflex answer, in 2026, is "we need an event bus." And right behind it, "so we need Kafka." You install heavy infrastructure for a need that, at this stage, is first a **design** need. Event decoupling isn't a product you buy, it's a way to structure dependencies. And it doesn't start with a broker.

## The event as a decoupling seam

The model comes from the domain. A business fact occurs — *the order has been paid*. That fact is a truth of the domain, independent of whoever cares about it. Around it, reactions: loyalty credits, delivery schedules, notifications go out. Each carries **its own rule**, in **its own service**.

The thing that makes it all hold: **the emitter doesn't know its reactors.** The order emits "I've been paid" and stops there. It doesn't know loyalty exists; it doesn't call delivery; it carries no list of consequences. The reactions *subscribe* to the fact, never the fact *invoking* the reactions.

That direction is the whole benefit. Adding a fourth reaction doesn't force you to reopen the order. Removing loyalty doesn't break payment. Each reaction tests, deploys, fails in isolation. It's the same directed arrow as everywhere else in architecture: the stable core (the fact) ignores the changing periphery (the reactions).

## Not all reactions are alike

The next mistake would be to think there's *one* right mechanism to wire a reaction. There are several, and the right one depends on the **nature of the reaction**. A few axes to decide:

- **Must it succeed or fail with the fact, atomically?** If the consequence is part of the transaction (it *cannot* not happen if the fact happens), wire it closest, synchronously and transactionally.
- **Can it happen a bit later, but must it be guaranteed?** Then it needs a **durable queue**: the fact drops a message, a consumer processes it at its own pace, and a failure replays. That's eventual-but-reliable.
- **Does it leave the system?** If the reaction lives elsewhere (a third party, another domain), it's an **outbound notification**: you notify, without waiting, without coupling the fact to the recipient.
- **Is it so critical and immediate you own it in the clear?** Sometimes the honest answer is an **explicit call**, here, now, because decoupling would only add obscurity.

The trap isn't choosing "the wrong tool" in the abstract, but wiring everything the same way — all synchronous (and a slow third party brings payment down), or all asynchronous (and a critical consequence gets lost in a queue). One reaction = one coupling decision, made for what it is.

## You don't need a broker for this

Here's the real message. None of the mechanisms above requires dedicated messaging infrastructure. A modern data system already offers, natively, what's needed to implement them: triggers for synchronous-transactional, durable queues for eventual-reliable, notifications for outbound, calls for explicit. The decoupling you were after was a property of your **design**.

Adopting an external broker isn't free: one more component to operate, monitor, secure, evolve. As long as your native primitives carry your volume, adding it imports complexity to solve a problem you don't have yet. The right order is the reverse: structure the decoupling first, on what you already have, and introduce heavy infrastructure only **when a real limit shows up**.

## And the limits are real

Honesty requires saying where native stops. Built-in primitives carry a finite throughput. The day your event volume exceeds what an in-system queue absorbs, when you need multi-region, partitioning, fine ordering guarantees, long replayable retention at scale — there, the dedicated tool earns its place. The model itself doesn't move: the event as a seam holds. Only the mechanism under the seam changes. And since the emitter never knew its reactors, replacing the native queue with a broker touches neither the fact nor the reactions — only the plumbing between them.

Selling native primitives as "it scales infinitely" would be as dishonest as imposing Kafka from the start. The truth fits in one sentence: begin with the decoupling, on what you have; change the mechanism the day a *measured* limit demands it, not before.

## What to take away

- Event decoupling is a **design decision**, not a product. The emitter emits a fact; it doesn't know its reactors.
- Not all reactions wire the same way: atomic-synchronous, eventual-reliable (durable queue), outbound (notification), or owned explicit call. One reaction = one coupling decision.
- A modern data system's native primitives cover these cases. No broker needed to *start*.
- Native has real limits (throughput, ordering, multi-region). Change the mechanism when a limit is measured — and since the model doesn't depend on the mechanism, that change touches neither the fact nor the reactions.
