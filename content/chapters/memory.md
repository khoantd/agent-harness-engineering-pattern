---
id: memory
section_id: ch-memory
number: 04
title: Context and Memory
kick: Chapter 4 · What the agent remembers
patterns:
  - repository
  - dao
  - dao-factory
  - data-mapper
  - dto
  - value-object
  - composite-entity
  - unit-of-work
  - identity-map
  - lazy-loading
  - flyweight
  - write-ahead-log
  - event-sourcing
  - dirty-flag
  - serialized-entity
  - serialized-lob
  - metadata-mapping
  - single-table-inheritance
  - table-inheritance
  - optimistic-offline-lock
  - version-number
  - sharding
  - client-session
  - server-session
---

## Summary

The model can only see a limited amount of text at once (its context window), and that space is costly. Conversations, files and saved memories are large and need to last. These patterns decide what gets stored, when it is loaded, how copies are avoided, and how two people editing at once do not overwrite each other.
