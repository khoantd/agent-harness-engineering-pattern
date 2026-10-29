---
id: performance
section_id: ch-performance
number: 11
title: Performance Internals
kick: Chapter 11 · Speed and memory
patterns:
  - data-locality
  - spatial-partition
---

## Summary

Two patterns from video game engines help when an agent platform serves many users: keep data that is used together stored together, and divide data into areas so a search only looks where the answer can be.
