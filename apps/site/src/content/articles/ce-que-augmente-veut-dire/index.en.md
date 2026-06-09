---
title: "What 'Augmented' Actually Means"
registre: refl
date: "2026-03-09"
tags: ["AI", "craft", "augmented"]
readingTime: 4
image: ./images/hero.webp
excerpt: "Augmented doesn’t mean going faster. It means understanding more broadly and exploring what you’d never have had time to consider."
---

<!-- DRAFT v2 — restructure : concret plus tôt, anaphores cassées, Morris intégré -->
<!-- Cible : devs, crafters, tech leads -->
<!-- Angle : augmenté = changement de rôle, pas accélération -->

The word "augmented" gets thrown around a lot. Usually it means "faster". An augmented dev is a dev who ships more code in less time. The dashboard goes up, everyone’s happy.

That’s not it.

---

## Two ways to use AI

Kent Beck drew the clearest line. On one side, vibe coding: you describe what you want, the AI generates, you check if it works. If it breaks, you feed the error back to the AI and hope for a fix. The code is a black box. You don’t read it — you don’t care as long as it runs.

On the other, what he calls augmented coding: you hold the same standards as when you wrote by hand. The code must be readable, tested, simple. You don’t type every line anymore, but you make every decision. Beck puts it like this: *"I make more consequential programming decisions per hour, fewer boring vanilla decisions."*

The difference isn’t in the tool. It’s in what you choose to keep.

---

## From author to architect

In a podcast, Beck describes the augmented engineer as a "constraint writer". Not someone who produces code, but someone who defines the constraints within which code is produced. The specs, the tests, the guardrails, the complexity limits. The code can be thrown away and regenerated. The constraints are the real artifact.

Kief Morris, at Thoughtworks, formalizes the same idea differently: the engineer is no longer inside the execution loop — they’re above it. They improve the system of constraints, not the code itself.

This shift is quiet but profound. When you write code, your value is in what you produce. When you define constraints, your value is in what you prevent.

---

## What it looks like

Being augmented, day to day, means spending more time writing tests than writing code. Tests are your constraints. The code, the AI can generate. The constraints — you’re the one who decides which ones matter.

It also means reading more code than you write. Not because you’re slow. Because review has become the real work. The AI generates fast. Understanding what it generated and deciding whether it’s good takes time. And that’s where the value is created.

It means saying no more often. The AI proposes solutions that work but that complicate things. Beck notes it has no "taste": it extends functions, reuses problematic patterns, never restructures on its own. Accepting without thinking is accumulating complexity.

And it means exploring more broadly. Simon Willison sums it up well: the gain isn’t going faster, it’s being able to explore paths you’d never have had time to dig into. Prototypes in an hour to test a hypothesis. Explorations in domains you barely know. The time the AI frees up, you don’t spend shipping more — you spend understanding better.

But Willison adds a condition: AI amplifies existing expertise. No expertise, no amplification. A junior using AI produces code they don’t understand. A senior using AI explores territory they couldn’t have reached alone.

---

## What it is, what it isn’t

Augmented means a little dependent, yes. If the tool disappears tomorrow, you can still code. Like riding a bike — it comes back. But it hurts, because your brain has gotten used to easier. And most importantly, you lose what made you augmented: the ability to explore what you don’t know. What you learned along the way stays. But the territories you could have discovered — those disappear.

It doesn’t mean more productive either. At least not in the usual sense. The productivity that gets sold is speed: more code, more features, faster. The one that counts is breadth: more solutions explored, more problems understood in depth, more paths considered before choosing. AI doesn’t make us directly faster, but it can push us to go further in our thinking, our research. And that’s what can, in the end, lead us to produce more.


---

## What really changes

The hardest part isn’t the tool. It’s what it does to your identity. If you’ve always been "the one who codes", "the technician people call when it’s broken", AI touches something deeper than a workflow. It touches who you are.

Augmented isn’t just a new relationship to the tool. It’s a new relationship to yourself. Accepting that your value isn’t in the gesture but in the judgment. That the job isn’t the code — it’s the need the code answers.

Software Craftsmanship, the care for code, doesn’t disappear. As long as there are passionate people who want to understand every line, it’ll exist. But alongside it, something is emerging. No name yet. A practice that comes after the care for code: constraints, architecture, the business problem. Thinking the system, guiding the AI, assembling the whole. It’s no less artisanal. It’s a different gesture.

---

Augmented means keeping the craft. Just from a different place.

<details>
<summary>Sources</summary>

- [Kent Beck — "Augmented Coding: Beyond the Vibes" (2025)](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — the augmented/vibe distinction, "more consequential decisions per hour"
- [Kent Beck — "Augmented Coding & Design" (2025)](https://tidyfirst.substack.com/p/augmented-coding-and-design) — AI has no taste, complexity accumulates without supervision
- [Kent Beck — "Programming Deflation" (2025)](https://tidyfirst.substack.com/p/programming-deflation) — code becomes commodity, value migrates
- [O11ycast #80 — "Augmented Coding with Kent Beck" (2025)](https://www.heavybit.com/library/podcasts/o11ycast/ep-80-augmented-coding-with-kent-beck) — constraint writer, unpredictable genius
- [Simon Willison — "How I Use LLMs to Help Me Write Code" (2025)](https://simonw.substack.com/p/how-i-use-llms-to-help-me-write-code) — projects you’d never have started, AI amplifies expertise
- [Kief Morris / Martin Fowler — "Humans and Agents in Software Engineering Loops" (2025)](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html) — engineer above the loop, the harness as artifact
- [Kent Beck + Gergely Orosz — "TDD, AI Agents and Coding" (2025)](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent) — TDD as superpower with agents

</details>
