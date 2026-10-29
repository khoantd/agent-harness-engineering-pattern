---
id: flux
number: "10.05"
title: Flux
chapter: frontend
fit: direct
figure_number: Fig. 10.05
figure_caption: One dispatcher sends each action to all stores. Every store updates only its own part.
diagram: flux.svg
analogy_title: The newsroom wire desk
---
## Gist

Send every action through one dispatcher to several stores, each updating its own part, so chat views refresh in one direction.

## Everyday comparison

### The newsroom wire desk

Every story from the news wire is printed once, and a copy lands on every desk in the newsroom. The sports desk keeps the football result. The business desk keeps the share prices. The weather desk ignores both. Each desk updates only its own pages before the next edition is printed. Nobody walks over to edit another desk's page.

## Classic meaning

Flux is an app design where data flows one way. Actions go to a single dispatcher. The dispatcher passes each action to every registered store. Stores update and tell the views. Unlike MVI's single state, Flux has several stores, each keeping its own slice of the data.

## In the agent system

Harness events and clicks become plain action objects, such as text_delta, tool_result, usage and approve. A single dispatcher hands each action to every registered store. The TranscriptStore adds text. The ToolStore tracks the cards for running tools. The UsageStore adds up token counts (tokens are the small pieces of text the model reads and writes) for the cost meter. Each store sends a change event, and the views subscribed to that store redraw. The dispatcher refuses a new action while one is still being handled. This stops chains of updates that trigger more updates.

## In a large company

Large enterprise chat apps split state into separate stores per area, such as transcript, tool runs, approvals and usage. Then separate teams can own each part. The UsageStore behind the cost meter is for display only. Per-tenant budgets and chargeback (billing each team or customer for its own usage) are measured and enforced on the server, at the LLM gateway (one shared front door to all AI models). A tenant is one customer company sharing the platform. The app's figure should be checked against that server record. Dispatcher action logs make useful client traces (records of what happened in a request). Tag them with the OpenTelemetry trace id (a standard tracing ID) that the server returns.

## Step by step

1. An SSE event (a message streamed from the server) or a click becomes an action object.
1. The dispatcher passes the action to every registered store, one at a time.
1. Each store updates its own part if the action concerns it, then announces the change.
1. Subscribed views redraw, and the next user action starts the cycle again.

## Code sketch

```python
dispatcher = Dispatcher()
dispatcher.register(transcript_store.handle)
dispatcher.register(tool_store.handle)
dispatcher.register(usage_store.handle)

def on_sse(evt):
    dispatcher.dispatch({'type': evt.type,
                         'data': evt.data})
```

## Be careful

Avoid stores that wait on each other through chains of waitFor calls. They bring back the tangle that Flux removes. Keep stores independent, or merge them.

## Diagram

![Fig. 10.05: One dispatcher sends each action to all stores. Every store updates only its own part.](/diagrams/flux.svg)
