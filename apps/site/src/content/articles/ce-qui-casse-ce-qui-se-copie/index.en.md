---
title: "AI Isn’t Just Threatening Jobs"
registre: refl
date: "2026-02-28"
tags: ["AI", "production", "SaaS", "data"]
readingTime: 4
series: le-monde-du-dev-sous-choc
order: 9
image: ./images/hero.webp
excerpt: "Production breaking, SaaS collapsing, and a very convenient narrative for selling courses. What if we’re reading the situation wrong?"
---

AI isn’t just threatening jobs. It’s threatening products.

## An immature practice

When AI produces code, it also produces incidents.

Replit, the online editor betting everything on AI, had one of its agents delete a user’s database. Kiro, AWS’s AI dev tool, caused 13 hours of downtime. This is real, in production, with real losses.

What these incidents show isn’t that AI is dangerous. It’s that our practice with AI is immature.

On the security side, new attack vectors are emerging. Slopsquatting: an LLM hallucinates a package name that doesn’t exist, someone creates it with malicious code inside. The vector is directly tied to AI code generation.

On quality, we’re going faster but not better. The DORA 2025 report confirms the gap: AI adoption improves software throughput but degrades delivery stability. Other studies measure the same phenomenon: 8x more code duplication, +41% complexity.

Reviews getting skipped, gains overestimated. We haven’t learned to verify as fast as we generate.

## Autopsy of a collapse

There’s a phenomenon nobody really anticipated. AI isn’t just replacing developers. It’s replacing products.

In February 2026, $285 billion in market cap was wiped in a single day from the software sector, after Anthropic’s announcement of Claude Cowork plugins. Wall Street traders invented a word for it: the "SaaSpocalypse". Valuation multiples (valuation relative to revenue) dropped from a peak of 18.6x in 2021 to around 5x at the end of 2025.

Jasper, the AI writing tool, lost 54% of its revenue. Chegg, the homework help company, lost around 99% of its valuation. Two spectacular collapses. But what did these products have in common?

A single feature, no proprietary data, no complex workflow, no deep integration. Jasper sold text generation. ChatGPT does the same thing for $20 a month. Chegg sold answers to questions. The base model made them redundant overnight. That’s what’s called a thin wrapper: a layer of interface on top of a capability that AI already provides.

A SaaS built on proprietary data, a complex business workflow, deep integrations into an ecosystem — that’s a different story. The model can generate text. It can’t replace ten years of customer data, a regulatory validation chain, or a network of integrations with third-party systems.

The $285 billion wiped out is real. But it’s a valuation correction, not an extinction. The market is recalibrating what has value. What held together on a single technical feature collapsed. The rest is still there.

The real question isn’t "will SaaS disappear." It’s: what constituted a real advantage, and what was only an apparent one?

## The shortcut

While some products collapse, others emerge. App generation tools are exploding. Lovable is doing $300 million in annual revenue. Replit shows +1,556% growth. 25% of YC startups are at 95% AI-generated code.

From these numbers, you can build a narrative that looks smart. On one side, AI makes software creation accessible to non-devs. More creators, more projects. On the other, AI reduces the need for developers per project. Fewer positions, smaller teams. The two curves converge. The developer market gets crushed.

This narrative is everywhere. On LinkedIn, in ads for "vibe coding" courses, in the hooks of prompt engineering classes. "Learn AI or become obsolete." The fear of replacement has become a sales argument. Scary enough to push the purchase, simple enough to fit in a post.

Except the two "curves" don’t exist as data. Nobody has measured the number of non-dev creators replacing devs. Nobody has measured the real reduction in positions per project at market scale. It’s a story we tell ourselves, not a finding.

The numbers cited to support it don’t measure what we think they do. Lovable and Replit — that’s company revenue. It shows there’s a market for these tools, not that devs have been replaced. The YC stat, 25% of startups at 95% AI code, those are early-stage startups. Teams of 2-3 people who wouldn’t have hired 10 developers anyway. That’s a very specific sample, not the market.

Is the market growing fast enough to absorb the surplus? We still don’t have an answer. And this narrative isn’t one. It’s a comfortable way to stop asking the question.

## What we know and what we don’t

The facts are there. Production incidents are documented. Some SaaS collapsed because the base model already did what they were selling.

But the reading we make of it is fragile. The incidents show an immature practice. The SaaS that fall are thin wrappers, not all software.

What we don’t know is what comes next. Is it a temporary correction, like the dotcom crash that preceded 15 years of growth? Or a structural shift, like factory automation that never recreated the same number of jobs?

Nobody can answer honestly. Every signal has its counter-signal.

The only thing we can say with certainty is that the market of early 2026 no longer looks like the one from 2022. And that pretending to know what it’ll be in 2030, in either direction, is selling something.

What’s moving isn’t just our jobs — it’s the products we build, the practices we use, the models we serve. What does it mean to be a dev while the industry redraws itself?

---

<details>
<summary>References</summary>

- [Fortune — Replit AI agent wiped database](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) — database deletion incident
- [Gigazine — AWS AI outage](https://gigazine.net/gsc_news/en/20260223-aws-ai-outage/) — Kiro, 13h of downtime
- [Wikipedia — Slopsquatting](https://en.wikipedia.org/wiki/Slopsquatting) — hallucinated packages
- [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research) — 8x duplicated blocks
- [arXiv — CMU / Cursor](https://arxiv.org/abs/2511.04427) — +41% complexity in generated code
- [DORA 2025](https://dora.dev/research/2025/dora-report/) — throughput vs stability
- [TechCrunch — SaaSpocalypse](https://techcrunch.com/2026/03/01/saas-in-saas-out-heres-whats-driving-the-saaspocalypse/) — $285B wiped, SaaS multiples
- [Sacra — Jasper](https://sacra.com/c/jasper/) — -54% revenue
- [Chegg Investor Relations](https://investor.chegg.com/) — post-ChatGPT collapse
- [Sacra — Lovable](https://sacra.com/c/lovable/) — $300M ARR
- [Sacra — Replit](https://sacra.com/c/replit/) — +1556% growth
- [TechCrunch — YC W25](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated/) — 25% startups, 95% AI code

</details>
