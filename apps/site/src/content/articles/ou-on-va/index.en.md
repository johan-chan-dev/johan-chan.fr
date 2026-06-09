---
title: "Where We’re Headed"
registre: refl
date: "2026-03-12"
tags: ["AI", "craft", "TDD", "DDD", "uncertainty"]
readingTime: 5
series: le-monde-du-dev-sous-choc
order: 11
image: ./images/hero.webp
excerpt: "Nobody knows. So instead of guessing, I looked at what had already changed in the way I work."
---

## Uncertainty

Nobody knows. Fowler says it’s too early to draw any conclusions. Beck says don’t even try to predict. The people who invented the practices we use every day don’t know either. That’s both reassuring and unsettling.

So instead of guessing what’s going to happen, I looked at what had already changed. In my own work. In the way I operate.

## What AI Has Changed in the Way I Work

There are two things I never see in the demos.

The first is the backlog of topics. You definitely have yours. Things you’ve always wanted to dig into but never had time to justify. How V8's garbage collector actually works. Why a certain event sourcing pattern works in some contexts and not others. The invariants in a distributed system — the real ones, not the simplified tutorial version.

Before AI, that backlog just kept growing. You’d add bookmarks, tabs, "I’ll read this over the weekend." And you never read it, because to really dig into a technical topic you need time, and time is what you don’t have.

Now I’m working through it. Something crosses my mind during a review — a technical detail I’ve always half-understood without ever taking the time to really dig in. I ask the AI. The dumb question I wouldn’t dare ask a colleague. The AI answers, I follow up, it goes in a direction I didn’t expect. In twenty minutes I’ve understood something I would have bookmarked forever.

The second thing is that AI reflects your thinking back at you. But not quite.

Rubber ducking, except the duck talks back. And sometimes its answer is off, and that’s exactly what’s useful. The mismatch forces you to rephrase, to pin down what you actually meant.

Except it works both ways. The other day I was working with several agents in parallel, each on a different topic. I mixed up the contexts. I described a problem to the wrong agent. And the agent just kept going like nothing happened. Didn’t flinch. It was trying to implement a solution to a problem that didn’t exist in that context. With confidence, with assurance, with clean code. Except it was wrong. And the AI saw nothing strange. I was the one who had to realize something was off.

That day, the AI told me nothing. Doubt is your job. Doubting it when it implements something wrong with confidence. And doubting yourself, because you’re the one who mixed things up in the first place.

## The Disciplines Coming Back

That mixed-agents story is what brought me back to fundamentals. One agent, one bounded context. Otherwise it falls apart. And the more I worked with AI, the more the old craft disciplines crept back into my day-to-day.

Vibe coding — I do it. It’s exploration, a rough draft. The problem isn’t vibe coding. It’s shipping vibe code. And it’s not a new problem: we’ve always copy-pasted from Stack Overflow. The discipline was understanding what you were pasting before you committed. Same reflex, except the speed of agents has multiplied the volume of code "not really understood."

TDD, first. Kent Beck said at the Thoughtworks retreat that it was a superpower with agents. And it’s true. If the tests exist before the code, the agent can’t cheat. It can’t write a test that validates its own broken implementation. In practice, I define the tests one by one, and the agent implements. The real guardrail is the quality of what you test, not just the fact that tests exist. It was a reflex that existed before AI, but AI has made it indispensable.

DDD, next. Bounded contexts, ubiquitous language. AI reasons better when the scope is focused. A bounded context, precise terms, clear boundaries. You bound the context, the AI produces code that stays on track. You leave the context open, it goes everywhere. And on top of that, protecting the domain from the rest of the code so that what the AI generates stays maintainable.

The thing that strikes me: these classic craft disciplines become *more* relevant with AI. You’d think AI makes constraints unnecessary. Without constraints, what it produces is unusable at scale.

## The Mad Race

And then there’s the question I actually ask myself. The one that catches me at 11 p.m. after I’ve closed the laptop. Will all of this be obsolete in six months? Will AI be able to make the judgments itself? DDD, TDD, architecture — will it eventually set the right constraints on its own?

I have no idea.

METR, an independent research lab, published a study in 2025 with a rigorous protocol. Sixteen senior devs, 246 tasks on their own open source projects. Result: with AI, they went 19% slower. Not faster. Slower. And they estimated they were going 20% faster. Forty percentage points between what we believe and what’s true.

If we’re that bad at judging our own performance with AI, we’re probably no better at predicting what will still be useful tomorrow. Maybe the disciplines I just described will be obsolete in a year. Maybe human judgment will be the last thing to fall, or the next.

The excitement when it works, the fear that it’s moving too fast for anything to hold. Both coexist, every day, and I’ve stopped trying to choose.

Even if AI catches up with everything, I’ll have learned to think in systems, to structure a domain, to question what I think I know. The gain might not be the one I imagined. But it’s still a gain.

---

<details>
<summary>References</summary>

- [METR — Measuring the Impact of Early AI on Experienced Open Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — RCT, 16 senior devs, -19% with AI, perceived +20%
- [Kent Beck — Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — TDD "superpower" with agents, augmented/vibe distinction
- [Kent Beck — Programming Deflation](https://tidyfirst.substack.com/p/programming-deflation) — "don’t bother predicting", bifurcation
- [Martin Fowler — Future Of Software Development](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html) — "it’s way too early", abstraction leap
- [Simon Willison — How I Use LLMs to Help Me Write Code](https://simonw.substack.com/p/how-i-use-llms-to-help-me-write-code) — "disrupted decades of intuition", curiosity unleashed
- [Anthropic — How AI Assistance Impacts the Formation of Coding Skills](https://www.anthropic.com/research/AI-assistance-coding-skills) — conceptual questions vs. delegation, Jan 2026
- [Thoughtworks — Reflections on the Future of Software Engineering Retreat](https://www.thoughtworks.com/en-br/insights/articles/reflections-future-software-engineering-retreat) — Feb 2026 retreat, Fowler, Beck, Vella
- Seymour Papert — *Mindstorms* (1980) — do you program the computer, or does the computer program you?
- Donald Schön — *The Reflective Practitioner* (1983) — back-talk, the mismatch that forces you to reframe

</details>
