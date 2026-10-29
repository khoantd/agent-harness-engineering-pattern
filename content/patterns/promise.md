---
id: promise
number: "6.01"
title: Promise
chapter: async
fit: direct
review_id: rev-promise
figure_number: Fig. 6.01
figure_caption: The caller gets a handle at once and the result later.
diagram: promise.svg
analogy_title: The buzzer at a food court
---
## Gist

Give back a placeholder for a result that will arrive later, so the caller keeps working instead of waiting.

## Everyday comparison

### The buzzer at a food court

You order, pay, and get a plastic buzzer. You do not stand at the counter. You find a seat and talk. When the food is ready, the buzzer goes off and you collect it. If the kitchen runs out, the buzzer flashes a different light. Then you go back to sort it out.

## Classic meaning

A promise is an object that stands for the future result of work running in the background (asynchronous work). The caller can wait for it or attach next steps to it.

## In the agent system

The main agent can launch a subagent (a helper agent that does one task) to run in the background. When it does, the harness at once returns a handle, which is an agent id, not the finished report. The orchestrator (the main agent that hands out work) keeps planning or answering the user. When the subagent finishes, the harness resolves the handle, which means it fills the handle with the result. It then adds a notice into the conversation. If the subagent fails, the harness rejects the handle with an error. The orchestrator can then deal with that error.

## In a large company

In an enterprise harness, long subagents and batch jobs return a durable job id. This id survives process restarts. It is stored in a database or in a durable execution engine such as Temporal (a system that keeps long tasks running through crashes). It is not kept as an in-memory future, which a restart would lose. The handle carries the tenant (one customer company sharing the platform) and the user's identity. So only the owner can check on it or cancel it. Every handle needs a deadline and a cost limit. Then abandoned work does not keep spending tokens (the units that model use is measured and billed in). Pass the OpenTelemetry trace context into the subagent. OpenTelemetry is a standard for tracing requests across systems. This links the final result back to the request that started it.

## Step by step

1. The orchestrator calls spawn_agent and at once gets a pending handle.
1. It keeps doing other work while the subagent runs.
1. The subagent finishes, and the harness resolves the handle.
1. A completion notice arrives, and the orchestrator reads the result.

## Code sketch

```python
# returns at once with a pending handle
h = harness.spawn('researcher', task=q)
plan_next_steps()

# resolves when the subagent finishes
try:
    report = await h
except SubagentError as e:
    log.warn(e)
    report = None
```

## Be careful

Never invent or guess the value of a promise that has not resolved yet. If the user asks early, say the work is still running.

## Diagram

![Fig. 6.01: The caller gets a handle at once and the result later.](/diagrams/promise.svg)
