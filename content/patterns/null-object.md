---
id: null-object
number: "2.20"
title: Null Object
chapter: tool-system
fit: direct
figure_number: Fig. 2.20
figure_caption: "The loop calls the same interface, and a do-nothing version fills the gap"
diagram: null-object.svg
analogy_title: The tree in the school play
---
## Gist

When a feature is switched off, plug in a helper that does nothing, so the agent loop never checks for None.

## Everyday comparison

### The tree in the school play

Every child in the school play has a part, even those who did not want a line. The third tree from the left stands in place, follows the same cues, bows at the end and says nothing. The director runs the show the same way, whether that spot holds a speaking role or a tree.

## Classic meaning

Instead of an empty reference (None or null), you use an object with the expected methods that do nothing. Callers then need no checks for the empty case.

## In the agent system

The agent loop calls many optional helpers: a tracer (which records what happens), a memory store, a UI renderer (which draws the screen) and an approval prompter. Sometimes the agent runs headless, with no screen, in a scheduled task. There is no chat UI then. So the harness plugs in a NullRenderer whose on_token and on_tool_card methods do nothing. When long-term memory is off, a NullMemory returns an empty list on recall. It accepts writes but stores nothing. When there is no telemetry exporter (the part that sends trace data out), a NullTracer hands out empty spans (empty trace records). The loop calls the same methods every time. There are no 'if renderer is not None' checks spread through the code.

## In a large company

Company harnesses use null objects for helpers that are truly optional, such as a UI renderer in headless batch runs. The OpenTelemetry API (a standard tracing library) itself returns a do-nothing tracer when no SDK is set up. In a regulated platform, one rule matters most. Compliance helpers are never optional. These are the audit logger, the policy engine client and the DLP filter (data loss prevention: it blocks data that must not leak). They must fail closed, which means blocking the action when they do not work. They must never be swapped for a do-nothing version. Startup checks should refuse to run in production if any of them turns out to be a null object.

## Step by step

1. At startup the harness reads the settings for each optional helper.
1. Where one is turned off or missing, it plugs in the matching do-nothing version.
1. The loop always calls the tracer, memory and renderer methods, with no checks.
1. The do-nothing versions return empty, neutral values and record nothing.

## Code sketch

```python
class NullMemory(Memory):
    def recall(self, query): return []
    def remember(self, fact): pass

class NullTracer(Tracer):
    def span(self, name): return nullcontext()

mem = VectorMem(url) if url else NullMemory()
tr = OTelTracer() if otel else NullTracer()
```

## Be careful

Never give the model a tool that silently does nothing. A write_file that quietly does nothing lets the agent believe it saved its work. If a tool is missing, leave it out of the tool list instead.

## Diagram

![Fig. 2.20: The loop calls the same interface, and a do-nothing version fills the gap](/diagrams/null-object.svg)
