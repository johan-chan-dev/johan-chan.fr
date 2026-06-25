---
title: "Compliance is a property of the schema"
registre: design
date: "2026-06-24"
tags: ["architecture", "compliance", "gdpr", "design"]
readingTime: 3
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Right of access, right to erasure, retention: handle them after the fact, in an application layer, and they'll leak. Compliance holds when it's written into the data model itself."
---

"We'll handle GDPR later, in the application layer." That's the sentence that dooms compliance before it even starts. "Later, on the side" means one more place not to forget: at every new table, every new access path, every added service.

Compliance handled after the fact **always leaks** — by structure, not bad faith. The big rights you must guarantee (access, erasure, retention) aren't features to bolt on at the end: they're **properties of the data model**. Written into the schema, they hold.

## Why after-the-fact leaks

Compliance handled "in the application layer" rests on vigilance. You add a table of personal data, and you have to *remember* to include it in the export, *remember* to anonymize it on erasure, *remember* to purge it. Nothing forces you to, at the moment you create the table.

It's the problem of any unenforced convention: invisible at coding time, no immediate cost, silent as it degrades. Except here, a leak doesn't cost technical debt. It sends personal data to the wrong person, or destroys what the law requires you to keep.

So compliance demands better than a habit: that the guarantee be **carried by the structure**, where it can't be forgotten.

## Scope is bounded by identity

When a user exercises a right — "export my data," "erase my data" — the limit of what they touch must **never** be a parameter they supply. It must be their **authenticated identity**, read as close as possible to the operation.

Compare the two setups. If the operation takes "the id of the customer to export" as input, then all the security rests on the caller passing the right id — and a malicious caller will pass someone else's. If the operation itself reads *who the caller is* and bounds its scope to that, it becomes **structurally impossible** to export or erase anyone else's data. The scope isn't checked after the fact; it's **carved into the operation's definition**.

The general rule: don't ask the client for the data that defines its own rights. The scope of a personal right is derived from identity.

## Erasing isn't deleting

The right to erasure is almost never a `DELETE`. It's counterintuitive, and yet it's the heart of the matter.

Your obligations seemingly contradict each other. On one side, the person has the right to have their personal data disappear. On the other, other laws require you to **keep** certain records — an invoice, an accounting voucher, a transaction history — for years. Deleting the whole row would violate the second obligation to satisfy the first.

The answer is **selective anonymization**: remove what identifies the person (name, contact, address), keep the rest, depersonalized. The invoice remains, but it no longer points to anyone. Erasing becomes a surgical operation on the personal fields.

Designed this way, erasure is written into the schema: which fields are personal data (nullable), which fields are a retention obligation (untouchable). That map is a property of the model.

## Retention is a declared policy

"We keep logs for a year, addresses for ten" isn't a gesture you perform by hand when you think of it. It's a **policy**, and a policy is declared and runs on its own.

Data has a lifespan inscribed in its nature: this category expires after that delay. A scheduled purge applies the rule with no human intervention. Retention becomes a behavior of the system, on the same footing as a backup.

## The common thread

These three principles say the same thing from three angles: the compliance guarantee must live **where it can't be forgotten** — in the definition of operations, in the shape of tables, in policies that run on their own. Not in a team's discipline nor a review checklist.

The right test, as for any boundary: facing a compliance requirement, ask "what *guarantees* it's respected, even when nobody thinks about it?" If the answer is "we'll be careful," it isn't compliance. It's a risk waiting for its incident.
