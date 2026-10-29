---
id: async
section_id: ch-async
number: 06
title: "Async, Concurrency and Scheduling"
kick: Chapter 6 · Work that has to wait
patterns:
  - promise
  - async-method-invocation
  - event-based-asynchronous
  - producer-consumer
  - event-queue
  - active-object
  - reactor
  - thread-pool-executor
  - thread-specific-storage
  - guarded-suspension
  - balking
  - poison-pill
  - half-sync-half-async
  - monitor
  - lockable-object
  - double-checked-locking
  - double-buffer
---

## Summary

Agents spend a lot of time waiting: for the model, for tools, for a person to approve, or for a scheduled time. These patterns let the system run many jobs at once, hand work to background workers, pause for approval, and shut down cleanly without two jobs tripping over each other.
