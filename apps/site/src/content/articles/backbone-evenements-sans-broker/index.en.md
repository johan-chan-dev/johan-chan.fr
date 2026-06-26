---
title: "An event backbone without a broker"
registre: impl
date: "2026-06-24"
tags: ["supabase", "event-driven", "pgmq", "pg-cron", "postgres"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 6
image: ./images/hero.webp
imageFocus: center
excerpt: "A paid order triggers loyalty, delivery, notifications — without Kafka. A durable queue (pgmq) and a scheduler (pg_cron) already in Postgres, and a matrix to choose the right wiring."
---

## The need

`OrderPaid`. An order has just been paid. Three things must follow: loyalty credits points, delivery gets scheduled, a notification goes to the customer. Three reactions, carried by three distinct services, which must not weigh down the payment or depend on one another.

The temptation is familiar: "let's stand up an event bus, so a Kafka." For a Supabase backend that's starting out, that's adding an entire infrastructure — to operate, monitor, secure — for a need Postgres already covers. Before reaching for a broker, ask yourself *what you actually need under the seam*.

## The principle: decoupling is design, not a product

> **↑ Going deeper:** this chapter applies [Reacting without a broker: event-driven on native primitives](/en/journal/evenementiel-sur-primitives-natives). Here's the short version.

A business fact occurs; reactions subscribe to it. The emitter **doesn't know** its reactors: the order emits "I've been paid" and stops there. And not all reactions wire the same way — atomic-synchronous, eventual-reliable (durable queue), outbound (notification), or explicit call. The decoupling you want is a design property: no broker needed to *start*. Let's see what Postgres offers natively for it.

## The Supabase implementation

> ⚠️ The SQL snippets in this section are **illustrative** (the shape of the pattern), not verified copies from the project. The real implementation lives in an internal architecture doc and dedicated migrations; see the honesty note at the end.

### Two primitives, already in Postgres

You have nothing extra to install. Supabase exposes two Postgres extensions that suffice for the backbone:

- **`pgmq`** — a durable message queue, *inside* the database. A producer drops a message, a consumer reads it, processes it, then acknowledges it. A failure doesn't lose the message: it becomes visible again and replays. That's the principle's "eventual-but-reliable."
- **`pg_cron`** — a scheduler *inside* the database. It runs a function at a regular interval — for instance, draining the queue and dispatching its messages to the right consumers.

The fact emits by dropping into the queue; a periodic dispatcher drains the queue and triggers the reactions. The emitter still ignores who reacts.

```sql
-- ILLUSTRATIVE — emitting the event = dropping a message into the queue
select pgmq.send('order_events', jsonb_build_object(
  'type', 'OrderPaid',
  'order_id', new.id,
  'paid_at', now()
));

-- ILLUSTRATIVE — a periodic dispatcher drains the queue (pg_cron)
select cron.schedule('dispatch-order-events', '10 seconds', $$
  select dispatch_order_events();   -- reads pgmq.read(...), routes to consumers, acknowledges
$$);
```

Loyalty, delivery, notifications each consume the stream at their own pace, in their own service. Adding a fourth reaction doesn't force you to reopen payment.

### Choosing the right wiring: the matrix

The heart of the chapter is **wiring each reaction according to its nature**. The project's architecture doc turns this into a decision matrix; here's how it reads:

| Nature of the reaction | Native mechanism | Why |
|---|---|---|
| Must be atomic with the fact | **trigger** (same transaction) | if the fact commits, so does the consequence — or neither |
| Eventual but guaranteed | **`pgmq` queue** + consumer | decoupled, replayable on failure |
| Leaves the system (third party) | **webhook / DB notification** | notify without coupling the fact to the recipient |
| Critical, immediate, local | **explicit call** | decoupling would only add obscurity |

Wire everything synchronous, and a slow third party brings payment down. Go the other way, all asynchronous, and a critical consequence gets lost in a queue. The matrix avoids those two excesses: one reaction, one coupling decision.

### The day Postgres isn't enough

This backbone carries a volume, not an infinite one. Multi-region, partitioning, fine ordering guarantees, long replayable retention at scale: at that point, a dedicated broker earns its place. And since the emitter never knew its reactors, replacing `pgmq` with that broker touches neither the event nor the reactions — only the plumbing between them. You change the mechanism, not the model.

## Honesty

A special status for this chapter, and it needs saying plainly. The design of this backbone is documented in an **internal architecture doc (v1.0), fact-checked against the official Supabase documentation** (`pgmq`, `pg_cron`). But unlike the authorization chapters, it **doesn't rest on a green test suite** in this project: the snippets above are *illustrative* of the shape, not verified copies. So: here's the pattern and the wiring logic, backed by the official docs. Not "proven in production under load." The proven-design / deferred-validation distinction matters here more than anywhere.

---

**Takeaway:** an event backbone holds with what Postgres already has (`pgmq` + `pg_cron`); the real work is the **per-reaction wiring choice** — trigger, queue, webhook or call.
