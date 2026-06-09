---
title: "What If the Market Doesn’t Follow?"
registre: refl
date: "2026-02-21"
tags: ["AI", "market", "craft"]
readingTime: 4
series: le-monde-du-dev-sous-choc
order: 6
image: ./images/hero.webp
excerpt: "History says devs always find their way. What it doesn’t say is that the market was growing at the same time."
---

The previous chapter ended on a question: are we ready?

It was honest. But it was still comfortable, somehow. Because "are we ready?" implies there’s something to be ready for. A place to go. A spot waiting for you if you do the work.

## History is reassuring

Every time the industry goes through a rupture like this one, the same answer comes back. The veterans who’ve been through several transitions tell you: we’ve seen this before. And they’re right.

Grady Booch says it himself in almost optimistic terms: we may be entering a third golden age of software engineering. Every previous rupture had generated its own.

In the 60s, assembly programmers were scared. High-level languages were going to make them obsolete. What happened: software became accessible to more companies, demand exploded, the market grew. Assembly programmers migrated to the new abstractions. And there was room for everyone, because there was more work than before.

Same thing with object-oriented in the 80s. With frameworks in the 90s. With the cloud in the 2000s. Every time, people cried out that the profession was dying. Every time, the profession mutated and the market followed.

History is reassuring. And it should be, up to a point.

## The condition nobody mentions

All those transitions held together on something that’s never mentioned in the historical analogies: the market was growing at the same time.

That’s what absorbed the surplus. When compiling code instead of writing it in assembly let twice as many companies do software, demand doubled. The jobs cut in one category reappeared in another. More abstraction, more accessibility, more demand, more people in the field.

The dev market grew for 40 years. Not because devs were getting better. Because demand followed every productivity gain.

And right now, it’s not following in the same way.

## The simple calculation

The usual argument is that demand will follow. Software that’s cheaper to produce means more companies making it, so more work. That’s possible.

But the previous transitions didn’t just make software cheaper — they opened entirely new markets. The cloud didn’t just compress costs, it made possible products that didn’t exist before. That’s what absorbed the surplus of devs.

The calculation nobody can make with certainty is: does AI open new territory in the same way, or does it mostly make cheaper what we were already building? If a dev with AI tools produces three times more code, you don’t need three times more devs for the same amount of work. You need three times fewer — unless demand itself explodes. And nobody knows if it’s going to explode that way.

The layoffs in the industry started before AI. AI amplifies a movement that was already there.

## The missing tooling

There’s a second problem, more technical, but just as real.

We spent decades building safety nets around our own fallibility. TDD, code review, CI, regression tests. All of that exists because we recognized that we make mistakes and decided to make it an engineering problem. That’s what I said in the previous chapter.

AI makes mistakes differently. It hallucinates. It announces that tests pass when they fail. It produces code that looks solid, well-structured, well-named — and doesn’t cover the cases that matter. The nets we built for ourselves don’t work the same way for AI, because they were designed for a deterministic system. And AI isn’t one.

Martin Fowler talks about it as a very productive collaborator you can’t take at their word. You have to re-read every line as if it were a PR from a stranger. For now, there’s no other way to verify. And the tooling to change that isn’t there.

When it arrives, the jobs cut in the meantime won’t come back.

## The same mechanism, at another scale

In the chapter on review fatigue, I described how the one who slows down becomes the bottleneck. At the team level. It plays out again at the market level.

The one who took time to really understand PRs became the bottleneck. Management watched the metrics. The metrics said they reviewed less than the others. The pressure turned back on them, and in the end you’d eject the one who was carrying it.

A contracting market works the same way. The one who refuses to accelerate, who keeps their standards, who takes time to understand what they’re producing — they become the bottleneck at the company level. The question is: in a tight market, can you still afford to be that bottleneck?

## The discomfort wasn’t irrational

The first chapter talked about fear. About the year I panicked, when I didn’t know where the profession was going anymore.

I spent several chapters taking apart the wrong reasons for that fear. The hypocritical resistance. The confusion between caution and avoidance. The arguments against AI that we didn’t apply to ourselves. That was necessary.

But the discomfort underneath — the one that remains once you’ve removed the wrong reasons — wasn’t irrational. It was just misdirected.

The real question is: in a contracting market, what justifies your place?

---

## References

- Grady Booch — *The third golden age of software engineering* — [YouTube](https://www.youtube.com/watch?v=OfMAtaocvJw)
- Martin Fowler — *How AI will change software engineering* — [YouTube](https://www.youtube.com/watch?v=CQmI4XKTa0U)
