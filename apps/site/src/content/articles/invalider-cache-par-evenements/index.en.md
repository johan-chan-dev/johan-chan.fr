---
title: Invalidating a cache by events, not TTL
registre: design
date: "2026-05-12"
tags: [Systems, Cache]
readingTime: 9
---
A TTL is hoping that time does the work. Better to invalidate when the event that
makes the data stale actually happens — consistency becomes a consequence of the
system, not a bet.
