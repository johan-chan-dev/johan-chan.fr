---
title: "When Everyone’s Generating, Who’s Actually Reading?"
registre: refl
date: "2026-02-16"
tags: ["AI", "craft", "reflection"]
readingTime: 3
series: le-monde-du-dev-sous-choc
order: 4
image: ./images/hero.webp
excerpt: "Code arrives faster than our ability to read it. The team’s shared understanding of the system dilutes, one PR at a time."
---

The previous chapter talked about the individual trap. That muscle you slowly lose when you stop reading. But there’s something I didn’t think about right away: that trap could easily play out at the team level too. And that’s a whole different scale.

Because a dev who stops reviewing their own code pays for it alone. But when the whole team stops, the shared understanding of the system dilutes, fractures. Code gets merged, tests pass, but nobody has the big picture of what’s being built anymore.

## The volume has changed

The problem isn’t that generated code is bad. It’s that there’s too much of it.

A dev with AI agents can produce in a day what used to take a week. Several PRs a day, each one well-structured, well-named, tests included. It looks solid. It compiles. Tests pass.

Except now, multiply that by the whole team. The reviewer opens their queue in the morning: fifteen PRs waiting. Yesterday was the same. Tomorrow, probably more.

Code arrives faster than the human capacity to review it. And it’s not a skills problem or a motivation problem. It’s a throughput problem.

## Review fatigue

At first, you review properly. You take the time. You ask questions about the choices, you check that the intent matches the implementation.

Then the PRs pile up. The notifications stack. The pressure builds. Not explicit pressure. Nobody comes to tell you "review faster." It’s subtler than that. It’s the board moving, tickets chaining, standups where we talk about velocity.

So you start skimming. You look at the diff, check that it compiles, read the tests. "Looks good." Approve.

The thing is, AI-generated code has a particular quality: it *looks* good. Clean, consistent, well-named. It gives you the impression you’ve reviewed it when you’ve just scanned the surface. It’s mediocrity that presents well.

## The one who slows down

And then there’s the one who takes the time. Who asks the uncomfortable questions. "Why this abstraction?" "Do we actually need this layer?" "Does this solve the right problem?"

Before, that person was the pillar of the team. Now they’re the bottleneck. The one whose PRs sit waiting. The one management notices because the metrics say they review fewer PRs than everyone else.

What if the bottleneck shifted? Before, everyone waited on the dev. Now the dev ships fast. The bottleneck could easily slide toward review. And the spotlight always follows the bottleneck.

If that happens, the question people will ask isn’t "why are we generating so much code?" but "why are reviews taking so long?" The pressure risks turning against those who take the time to understand what they’re approving.

And from there, the scenario is easy to imagine. We simplify the process. We speed up the pipeline. We remove the responsibility from the person who was carrying it. And we end up with a team that produces fast, ships fast, and where nobody really knows what’s going out the door.

## The curl effect

It’s not just PRs. The same phenomenon hits every place where humans filter what machines produce.

The curl team had to suspend their bug bounty program. The reason: a flood of AI-generated reports. Well-written, well-structured, technically plausible. And massively wrong. Each report demanded time from a maintainer to read, evaluate, reject. The volume drowned the capacity to triage.

Same pattern. Production explodes. Validation can’t keep up. And the people doing the triaging end up overwhelmed or pushed out.

## What we’re really losing

Software craftsmanship — the kind I talked about in the second chapter — isn’t just individual. It’s a team thing. Care, feedback, discipline: you carry those together.

Code review isn’t just validation. It’s the moment when knowledge circulates. Someone other than the author integrates the context, understands the choices, sees how the system is evolving. Review after review, the whole team ends up with a mental map of the system. Not complete, but shared.

When that moment becomes a formality, that map fragments. Everyone only knows their own piece. The system becomes an assembly of parts that nobody sees as a whole.

And the day you need to make an architecture decision, who has the perspective? The day a bug crosses three layers, who understands the path? The day you want to change direction, who knows what you’ll break?

Those questions — before, the team knew how to answer them. Not because one person had everything in their head, but because the knowledge was distributed through reviews, discussions, the "wait, are you sure?" moments. If that fabric comes apart, do we even know how to rebuild it?
