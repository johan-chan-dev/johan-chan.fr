---
title: "ACL at the gate, RLS as the safety net"
registre: design
date: "2026-06-24"
tags: ["architecture", "security", "authorization", "backend"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "One control point is one point of failure. Access security holds when two layers with distinct jobs cover each other's blind spots."
---

You put a guard at the door. He checks badges, turns away anyone who has no business being there. The day you tell yourself "good, we have a guard, that's handled" — you've just created a single point of failure.

Because the guard steps away. Someone redoes the hallway and forgets to put the post back. A new door appears that nobody told him about. The guard did nothing wrong — he just wasn't aware. And behind him, there's nothing.

That's exactly what happens to access control in a backend. A single layer of checking, however well written, eventually gets bypassed. Rarely out of malice: more often out of forgetfulness, a refactor, an access path nobody anticipated.

## Two layers, two different jobs

The answer isn't "a better guard." It's **two layers that don't do the same work**.

The first is **access control at the gate** — the ACL. The explicit decision: *is this caller allowed to perform this action?* It's made early, at the entry point, before a single write goes out. It's a **prerequisite**: if the answer is no, you stop right there, return a refusal, nothing happens.

The second is the **safety net** — policies at the level of the data itself (row-level security). They don't depend on the path taken. Whether the request comes through the intended API, through direct database access, through a maintenance script — the net is stretched under every row. It doesn't ask "are you allowed to perform this action," it asks "are you allowed to see, to touch *this particular row*."

The two layers do distinct work. They answer different questions, at different moments, against different threats. The ACL protects the **action**. The net protects the **data**. That's defense in depth: not the same wall twice, but two walls covering each other's blind spots.

## The trap: the actor that slips through the net

Here's the scenario that keeps you up at night. Some components of a system run with **elevated privileges** — an internal service, an administration job, a trusted worker. By construction, those components **short-circuit the net**: row-level policies don't apply to them, otherwise they couldn't do their infrastructure work.

Direct consequence, and it's the mistake you see everywhere: **a privileged component is not protected by your policies.** You've polished your net, you've written impeccable row-by-row rules — and the code running in privileged mode goes straight through as if they didn't exist. Because for it, they don't.

That's precisely where the gate ACL becomes **mandatory**. If a component bypasses the net, then the only rampart it has left is the explicit check at its entry point. No net underneath: the guard is all there is. So it has to be there, and it has to be explicit.

The resulting rule is simple to state:

> Every path that bypasses the net must have an ACL at the gate. No exception, because that's exactly where there is no second chance.

## The trade-off: deliberate redundancy

Running two layers has a cost. Often the same authorization rule lives in two places: in the gate logic, and in the data policies. "The manager role can manage staff" might be written once at the gate, once in the net.

That's duplication. And a developer's first instinct is to kill it — one place, one truth. But here, removing the redundancy means removing one of the two layers. You're back to the single point of failure.

The right call isn't "zero duplication." It's **controlled redundancy**: you accept that the rule lives in two places, and you **arm a test that fails if the two diverge**. The test becomes the guardian of consistency. The duplication stops being scary, because drift between the two layers breaks CI before it breaks production.

It's a pattern you find everywhere defense in depth shows up: you make redundancy **verifiable** rather than trying to eliminate it. An untested "these two must stay in sync" convention is already dead — it'll drift the first time someone forgets.

## What to take away

- One control point is one point of failure. Serious access security has two layers.
- The gate ACL protects the **action**, it's made early, it's a prerequisite. The net protects the **data**, it's stretched whatever the path.
- A privileged actor bypasses the net. So every privileged path *must* have an explicit ACL: that's where there's no second chance.
- The same rule on both layers is redundancy. You make it verifiable with a test rather than deleting it.

Security doesn't hold because one wall is perfect. It holds because when a wall gives, there's another behind it — and because you have a test that screams the moment they stop saying the same thing.
