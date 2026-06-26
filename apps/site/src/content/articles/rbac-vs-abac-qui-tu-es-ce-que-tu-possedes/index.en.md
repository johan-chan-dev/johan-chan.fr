---
title: "RBAC vs ABAC: who you are vs what you own"
registre: design
date: "2026-06-24"
tags: ["architecture", "security", "authorization", "design"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Two ways to authorize access: by your role, or by what belongs to you. Two complementary axes that real systems combine."
---

"Is this person allowed to see this order?"

There are two good answers to that question, and they're not about the same thing. The first: "yes, because it's *their* order." The second: "yes, because they're a *manager*." The first looks at the data, the second looks at the person. Confusing the two, or using only one, leaves you stuck halfway to what you actually need.

## RBAC: who you are

Role-based access control (RBAC) sorts people into categories — admin, editor, reader — and attaches to each category a set of permissions. The question it asks is: *who are you?* If you're an editor, you can write. If you're a reader, you can only read. Regardless of *what*: the permission follows from the role, independent of the target object.

It's powerful for everything cross-cutting. "An admin can manage staff" depends on no particular row — it holds for all staff, everywhere. The role is a property of the **person**.

Its limit is exactly the flip side of its strength: a role knows nothing about ownership. RBAC alone can't express "everyone sees *their own* orders," because there isn't one role per user. If you try, you end up with one role per person — which is to say, no roles at all.

## ABAC: what you own

Attribute-based access control (ABAC) doesn't look at who you are, but at the **relationship between you and the data**. The question it asks is: *is it yours?* This order carries your identifier → you see it. This loyalty record is attached to your account → you have access. Authorization is decided row by row, comparing an attribute of the data to your identity.

That's exactly what RBAC was missing. "Everyone sees their own data" becomes trivial: the rule is a comparison between a field on the row and the caller's identity. No role to invent, and the combinatorial explosion is gone.

Its limit, again, mirrors its strength: ownership knows nothing about the cross-cutting. ABAC alone can't express "a manager sees everything," because a manager doesn't *own* other people's orders. For them, you'd have to write "belongs to the caller," which is false, or "everyone," which is dangerous.

## Two axes, not two camps

The mistake is to present RBAC and ABAC as a choice: "our system is RBAC" or "we do ABAC." They're not two rival schools. They're **two orthogonal axes**:

- *Who you are* — your role. Cross-cutting, attached to the person.
- *What you own* — your link to the data. Local, attached to the row.

A real authorization system needs both, because real-world rules mix both questions. "You see this order if it's yours **or** if you're a manager" is expressible neither in pure RBAC nor in pure ABAC. It is, in one line, the moment you accept **combining the two with an `or`**:

> you have access **if** (the data belongs to you) **or** (your role allows it)

The first clause is ABAC, the second RBAC, and the `or` joins them without conflating them. Each keeps its job: ABAC covers ownership, RBAC covers the cross-cutting. Together, they cover reality.

The test for which one to reach for is simple: if the rule talks about a **category of people** ("managers," "admins"), it's role. If it talks about a **link to an object** ("their order," "their file"), it's ownership. And if it talks about both, you combine them.

## Where the truth lives

One last point, common to both models: **the source of truth for authorization lives server-side.**

A person's role, like a piece of data's ownership, are facts the server establishes and keeps. What the caller *presents* — a token, an identifier, a displayed attribute — is only a **mirror** of those facts. The classic trap is trusting an attribute the client can edit itself: at that point you're no longer authorizing, you're obeying. The role is checked against what the server set; ownership is checked against the authenticated identity, not against a parameter supplied by the caller.

## What to take away

- RBAC answers *who are you?* (role, cross-cutting, attached to the person). Ideal for category-wide rights.
- ABAC answers *is it yours?* (attribute, local, attached to the row). Ideal for ownership.
- **Two axes**, complementary: real-world rules combine them with an `or` ("mine **or** my role allows it").
- For both, the truth is server-side: the role set by the server, ownership checked against the authenticated identity — never against an attribute the client controls.
