---
title: "Discipline Shifts"
registre: refl
date: "2026-03-07"
tags: ["AI", "craft", "discipline", "TDD", "cognitive-debt"]
readingTime: 5
series: le-monde-du-dev-sous-choc
order: 10
image: ./images/hero.webp
excerpt: "The sharpest voices in the field describe a profession in transformation. Thinkers from a century ago saw the same mechanism coming."
---

Discipline doesn’t disappear. It shifts.

## Work That Doesn’t Have a Name Yet

February 2026, in Utah. Fifty people, twenty-five years after the Agile Manifesto. People who invented or shaped the practices we use every day. They’re asking the same question we are.

Chad Fowler puts it simply: if we stop caring about the code, rigor has to go somewhere else. The discipline we’ve built over decades doesn’t disappear just because AI writes code. It shifts.

What they describe is work that doesn’t exist in job descriptions yet. Not writing code, not release management. Directing agents, evaluating what they produce, calibrating trust, setting constraints.

Martin Fowler goes further. It’s the biggest abstraction leap since assembly to high-level languages. Except this time, we’re moving up in abstraction — but without the determinism. We’ve always kept control as we moved up. This time, it’s different.

## The Fork

Kent Beck, after fifty-two years of code, frames the diagnosis differently. Commodity code is flooding the market. Careful code is gaining value. The middle disappears.

For Beck, writing code follows the same path as the typewriter. Before computing, typing a document was a trade. It took technique, precision, no room for error. You’d dictate, someone would type. Then the computer made the gesture tolerant of error, and everyone learned to type. The trade disappeared, the gesture remained.

Code follows the same path. AI makes the gesture tolerant of error. You can code roughly — it corrects, iterates, completes. What disappears is the value of the gesture. What remains is knowing what to write and why. Judgment, systems thinking, taste.

He distinguishes two practices. Augmented coding: you care about the code, the tests, the complexity. Vibe coding: you only care about the behavior. Craft survives in the first, not the second.

His advice: don’t try to guess which future we’ll have. Build capabilities that work in both scenarios.

## Older Than Software

What Beck and Fowler describe, others saw before them. Not in dev. In every trade where the machine replaced the gesture.

There’s a thing we know how to do without being able to explain it. The instinct we talked about earlier in the series. With enough practice, it becomes automatic. You know something’s off, but you couldn’t say why. How do you formalize that in a prompt?

And when expertise gets formalized into a tool, the person who had it ends up losing it. The weaver lost the gesture with the loom. The driver loses the feel of the road with GPS. It’s not a disappearance. It’s knowledge moving from standard to rare. And for those who still have it, the tool becomes an augmentation. For the others, it replaces what they never had.

The question is almost two centuries old. And we’re asking it again today in the same terms.

## Tests as an Anchor

If code is a by-product, what anchors the discipline?

The participants at that meeting in Utah found a surprising answer: TDD.

If tests exist before the code, the agent can’t cheat. It can’t write a test that validates its broken implementation. Tests become the deterministic validation of non-deterministic generation.

That doesn’t mean writing every test by hand. It means defining them, one by one, and redefining them as you understand the problem better. Beck lives this daily: his agents try to delete tests to make them pass. The important thing isn’t who writes the test. It’s who decides what to test, and in what order. If the agent prepares everything at once, it optimizes for green. If you channel it, test by test, you keep control over what the system should do.

TDD is a superpower with AI agents. Several practitioners present describe the same shift: all the effort moves to the test suite. The generated code becomes disposable. If the tests are good and the code passes, the shape doesn’t matter.

## What We Risk Losing

AI accelerates everything. Including what we don’t notice slowing down.

Margaret-Anne Storey introduced a concept in February 2026: cognitive debt. Not technical debt, written into the code. Cognitive debt — the kind that lives in your head. The gap between the system that keeps growing and what the team actually understands about the system.

It’s exactly what you see in the field. The team ships more, but if you ask why that service is split that way, nobody knows anymore. Knowledge evaporates without anyone noticing.

Fowler puts his finger on something precise. What he loves about programming is building mental models, abstractions that help you think through a domain. If LLMs pull us away from that work, we lose the most valuable skill. He goes so far as to say LLMs are "dealers: they give us stuff, but don’t care about the system or the humans building and using it."

Rachel Laycock, CTO of Thoughtworks, frames the risk differently. AI is an accelerator of what you already have. If your practices are good, it amplifies. If they’re fragile, the speed multiplier becomes a debt accelerator.

And in the middle of all this, one detail that shifts the perspective: clean code, modularity, clear naming — it helps LLMs as much as it helps humans. Craft serves both.

---

The question is what we do Monday morning.

---

<details>
<summary>References</summary>

- [Thoughtworks — Reflections on the Future of Software Engineering Retreat](https://www.thoughtworks.com/en-br/insights/articles/reflections-future-software-engineering-retreat) — Feb 2026 retreat, "rigor has to go somewhere else", TDD + agents
- [Martin Fowler — Future Of Software Development](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html) — abstraction leap, non-determinism, LLMs as "dealers"
- [Kent Beck — Programming Deflation](https://tidyfirst.substack.com/p/programming-deflation) — commodity code, augmented/vibe fork, the typewriter
- [Kent Beck — Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — system prompt TDD, agents that delete tests
- [Pragmatic Engineer — TDD, AI agents and coding with Kent Beck](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent) — TDD "superpower" with agents
- [Margaret-Anne Storey — Cognitive Debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/) — cognitive debt, gap between system and understanding
- [Rachel Laycock / The New Stack — AI Velocity Debt Accelerator](https://thenewstack.io/ai-velocity-debt-accelerator/) — debt accelerator
- Michael Polanyi — *The Tacit Dimension* (1966) — tacit knowledge, unexplainable automatism
- Bernard Stiegler — *La Société automatique* (2015) — knowledge loss through tools

</details>
