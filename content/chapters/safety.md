---
id: safety
section_id: ch-safety
number: 07
title: "Safety, Permissions and Resilience"
kick: Chapter 7 · Keeping agents within safe limits
patterns:
  - intercepting-filter
  - specification
  - filterer
  - role-object
  - bulkhead
  - idempotent-consumer
  - transactional-outbox
  - health-check
  - immutable
  - private-class-data
  - raii
  - notification
---

## Summary

An agent acts on someone's behalf using real logins and real data. These patterns put checks between what the agent wants to do and what actually happens: filters, permission rules, walls between customers, actions that never run twice by accident, and cleanup that always happens.
