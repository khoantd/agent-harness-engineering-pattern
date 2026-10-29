---
id: monostate
number: "13.01"
title: Monostate
chapter: idioms
fit: direct
figure_number: Fig. 13.01
figure_caption: "Many instances, one dictionary: a change through any one is seen by all."
diagram: monostate.svg
analogy_title: Clocks on every railway platform
---
## Gist

Let code create as many config objects as it likes, while every one reads and writes the same shared state.

## Everyday comparison

### Clocks on every railway platform

A big station has a clock on every platform, in the ticket hall and over the cafe. Each looks like a separate clock, but one master signal drives them all. Hang a new clock on platform nine, and it shows the same time as the rest the moment it is plugged in.

## Classic meaning

In a monostate, all instances of a class share the same state through class-level storage. It acts like a singleton (a class with one instance) but looks like an ordinary class.

## In the agent system

Tools, hooks (code that runs at set points) and subagents often create a HarnessConfig() locally. They use it to read the model name, the sandbox root or the permission mode. No one hands them a shared object. With monostate, the class keeps its fields in one class-level dict (dictionary). So every new instance sees the current values. Suppose the session switches to plan mode or raises max_tokens. That change is visible everywhere at once. Callers keep the normal constructor syntax and do not need to know the state is shared.

## In a large company

In an enterprise platform, a multi-tenant worker serves many sessions in one process. A tenant is one customer company. A monostate holding permission mode, model or tenant settings would leak one session's choices into another. That is a security defect, not a style issue. Session and tenant settings belong in a context object or a contextvars scope (Python's way to keep values separate per request). The scope is set when the request comes in, from the logged-in identity. Monostate is acceptable only for settings that truly cover the whole process and are mostly read, such as telemetry endpoints. Changes to them go through change-managed configuration (a formal review process).

## Step by step

1. Store the configuration fields in one class-level dictionary.
1. Point each new instance's attribute storage at that dictionary.
1. When any instance changes a field, it changes for every instance.
1. Reset the shared dictionary between tests.

## Code sketch

```python
class HarnessConfig:
    _shared = {'model': 'large',
               'mode': 'default'}
    def __init__(self):
        self.__dict__ = self._shared

a = HarnessConfig()     # in a tool
b = HarnessConfig()     # in a hook
a.mode = 'plan'
assert b.mode == 'plan'  # same state
```

## Be careful

Shared state that looks local surprises readers. Two sessions in one process will also overwrite each other's settings. So scope it per session if you run more than one.

## Diagram

![Fig. 13.01: Many instances, one dictionary: a change through any one is seen by all.](/diagrams/monostate.svg)
