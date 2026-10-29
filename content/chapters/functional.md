---
id: functional
section_id: ch-functional
number: 09
title: Functional Plumbing
kick: "Chapter 9 · Small functions, joined together"
patterns:
  - collection-pipeline
  - function-composition
  - combinator
  - currying
  - monad
---

## Summary

A lot of agent work is data passing through steps: messages become a prompt, the model's reply becomes tool requests, tool results become a summary. Functional patterns keep each step small and easy to chain together safely.
