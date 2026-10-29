---
id: agent-loop
section_id: ch-agent-loop
number: 01
title: The Agent Loop
kick: "Chapter 1 · The agent's heartbeat"
patterns:
  - game-loop
  - update-method
  - state
  - template-method
  - chain-of-responsibility
  - interpreter
  - memento
  - iterator
  - composite
  - visitor
  - acyclic-visitor
  - double-dispatch
  - callback
  - context-object
  - collecting-parameter
  - pipeline
  - rule-engine
  - trampoline
---

## Summary

An AI agent works in a loop. It reads what has happened so far, asks the model what to do next, does it, and repeats until the job is done. The patterns in this chapter shape that loop: what stage it is in, where extra checks can plug in, how the model's reply is turned into actions, and how a run can be paused, resumed or rolled back.
