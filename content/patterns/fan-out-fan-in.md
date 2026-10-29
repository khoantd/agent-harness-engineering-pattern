---
id: fan-out-fan-in
number: "5.05"
title: Fan-Out/Fan-In
chapter: multi-agent
fit: direct
review_id: rev-fan-out-fan-in
figure_number: Fig. 5.05
figure_caption: One question goes out to many. One bundle comes back when all reply or the clock runs out.
diagram: fan-out-fan-in.svg
analogy_title: The exam bell
---
## Gist

Send the same question to several subagents at once, then gather their answers in one place, usually by a deadline.

## Everyday comparison

### The exam bell

The examiner hands the same paper to every student at the same moment. Each student works alone, all at the same time. When the bell rings, the papers are collected into one pile, even if the last student has not finished. Only then does marking begin.

## Classic meaning

A sender sends one request to many workers at the same time (fan-out). A collector then combines their answers into one result (fan-in).

## In the agent system

Take a research question. The orchestrator (the agent in charge) sends the same query to three subagents (helper agents) in one turn. One searches the web, one searches code, and one reads docs through an MCP server (MCP is a standard way to connect tools to an AI model). Fan-in happens at a collector. It waits for every reply or for a deadline, whichever comes first. Late or failed replies are marked as missing. So the orchestrator knows its answer rests on partial evidence. The collected replies then enter the orchestrator's context as one tool_result (the block that carries a tool's output back to the model). This is better than three separate interruptions.

## In a large company

This is the Scatter-Gather pattern from the book Enterprise Integration Patterns. Companies use it for research and search across sources that are governed separately. Examples are a document store, a ticketing system and the code host. Each branch must run with the requesting user's own permissions. These pass along through OIDC token exchange (a standard way to swap a user's login token for one that a downstream service accepts). So the gathered bundle never holds documents that the user could not open. Deadlines are tied to the SLO (reliability target) that the user sees. Token and time measurements for each branch feed cost dashboards. Then low-value branches can be dropped.

## Step by step

1. The orchestrator sends the same request to several subagents at once.
1. Each subagent works on its own with its own tools.
1. A collector gathers replies until all arrive or the deadline passes.
1. The orchestrator receives one combined bundle, with missing replies marked.

## Code sketch

```python
jobs = {a: create_task(spawn(a, task=q))
        for a in ('web', 'code', 'docs')}
done, late = await asyncio.wait(
    jobs.values(), timeout=60)
for j in late:
    j.cancel()
ok = {a: j.result() for a, j in jobs.items()
      if j in done and not j.exception()}
bundle = {'answers': ok, 'missing':
          sorted(set(jobs) - set(ok))}
```

## Be careful

Fanning out multiplies the cost of every question. So fan out only when the sources are different enough to add new evidence.

## Diagram

![Fig. 5.05: One question goes out to many. One bundle comes back when all reply or the clock runs out.](/diagrams/fan-out-fan-in.svg)
