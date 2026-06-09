---
title: "AI is fallible. What about your code?"
registre: refl
date: "2026-02-19"
tags: ["AI", "craft", "reflection"]
readingTime: 4
series: le-monde-du-dev-sous-choc
order: 5
image: ./images/hero.webp
excerpt: "We reject AI because it makes mistakes. We invented TDD because we do too. The real question is what we haven’t been willing to look at."
---

The previous chapters were about what we risk losing. Individual muscle, shared team vision. But while writing all that, something was nagging at me. We talk about the risks of AI — that’s real. But have we looked at our own process with the same honesty?

## The spam filter

Take the spam filter. The question "what counts as spam?" is genuinely fuzzy. It depends on context, sender, recipient, timing. There’s no formal answer.

So we did what we knew how to do. Keyword lists, scores, rules. "If the subject contains 'free' AND the sender isn’t in the address book THEN score += 3." We stacked conditions until it worked... more or less.

It blocked legitimate emails. It let others through. And we adjusted the thresholds, fingers crossed.

It was fuzziness dressed up as formal logic. Deterministic in form. Not in nature.

## Fuzziness dressed up as logic

It’s not an isolated case.

The business decision tree with 200 branches. The PO keeps adding edge cases until nobody understands the logic anymore. And it still breaks on the 201st.

The homegrown scoring system. "If the customer did X and Y but not Z then score = 42." Why 42? Because it worked on the test set.

Deterministic code in form. Fuzziness handled with the only tool we had: `if/else`.

And that’s not a criticism. It was the best compromise available. We had nothing else. But we ended up confusing the tool with reality. We started believing that programming meant writing deterministic logic. That if it’s in an `if/else`, it’s under control.

It never was. Not completely.

## Can everything be formalized?

And it’s not just a dev problem. It’s the whole process.

A product owner has an idea. It’s fuzzy, like all ideas at the start. They write a spec to formalize it. First lossy compression. The dev reads the spec and implements. Second compression. And when unexpected cases show up, we call them "edge cases" instead of admitting the problem was fuzzy from the start.

We hide behind specifications to give a clean shape to a need that doesn’t have one.

And it’s not just edge cases. There are bugs. The ones we introduce by mistake, through fatigue, through misunderstanding. We know it so well that we invented TDD, code review, CI, regression tests. All that tooling exists because we accepted that we were fallible. We built guardrails around ourselves.

So, honestly. What’s the difference between an implementation that covers 95% of cases (with its edge cases and bugs discovered in production) and an AI that covers 95% of cases?

## Is it really that different?

The difference? Not much, at the core.

We reject AI because it "makes mistakes." But we built an entire methodology because we did too. We reject it because it’s "not deterministic." Our code never was, completely. We just wrapped `if/else` around it to make it look that way.

We normalized our own fallibility. We call it "technical debt", "edge cases", "known bugs." And we refuse the same thing coming from the machine.

It’s not that AI is perfect. It’s that the argument "it’s not reliable" rings hollow when you look honestly at what we produce ourselves.

## Caution or avoidance?

I get the resistance. Management that wants to replace a team with AI licenses. Decision-makers who confuse demo and production. Resisting that is healthy.

But at some point I asked myself the question honestly. Am I resisting bad decisions? Or am I using bad decisions as a pretext to avoid confronting the tool?

Not easy to answer honestly. Because both can coexist. And if I’m confusing caution with avoidance, I’m not doing analysis anymore. I’m doing resistance.

AI is fallible. The tooling to validate it, constrain it, keep it on the rails — it’s not there yet. That’s undeniable. But we’ve seen this film before. When we discovered that human devs were fallible, we didn’t stop coding. We invented TDD. We built safety nets.

AI needs the same safety nets. And nobody has built them yet.

## What is craft?

Everyone defines craft a little differently. For some it’s code quality. For others it’s attention to detail, knowledge transfer, thinking long-term. There’s no official version. But there’s a posture that keeps coming up: don’t reject tools wholesale, don’t swallow them whole either. Experiment with them, understand them, and keep what moves your craft forward.

Two narratives circulate around juniors. On one side, those who resist: "learn the fundamentals first, AI is a trend." On the other, those selling: "AI does everything, fundamentals are the past." Both compress reality and leave you underprepared. Neither one actually asks the right question.

The question isn’t "is AI ready?" It’s "are we?"
