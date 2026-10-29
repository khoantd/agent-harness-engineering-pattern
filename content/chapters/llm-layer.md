---
id: llm-layer
section_id: ch-llm-layer
number: 03
title: The Model Call Layer
kick: Chapter 3 · Talking to the AI model
patterns:
  - gateway
  - ambassador
  - bridge
  - retry
  - fallback
  - circuit-breaker
  - rate-limiting
  - throttling
  - load-shedding
  - backpressure
  - queue-based-load-leveling
  - caching
  - object-pool
  - multiton
  - singleton
  - tolerant-reader
  - partial-response
  - money
---

## Summary

The model lives on someone else's servers. It can be busy, slow, or briefly down, it limits how much you can send, it charges for every word, and its replies are not always perfectly formatted. These patterns keep requests flowing anyway: picking a provider, trying again, switching to a backup, saving repeat work, and counting the cost.
