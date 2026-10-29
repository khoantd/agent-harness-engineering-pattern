---
id: distributed-tracing
number: "5.18"
title: Distributed Tracing
chapter: multi-agent
fit: direct
review_id: rev-distributed-tracing
figure_number: Fig. 5.18
figure_caption: "The same trace id rides along every hop, so every span lands in one tree."
diagram: distributed-tracing.svg
analogy_title: The parcel tracking number
---
## Gist

Carry one trace id through the orchestrator, subagents, tool calls and model calls, so a whole run reads as one tree.

## Everyday comparison

### The parcel tracking number

Your parcel gets one number at the counter. Every depot, van and sorting belt that touches it scans the number and adds a line with a time and a place. When the parcel is late, you type the number in once. You see the whole journey, including the six hours it sat in a depot nobody suspected.

## Classic meaning

Every request carries a trace context (a shared id and a parent link) from service to service. Each piece of work records a span, a timed record that names its parent. The spans join up into one end-to-end trace.

## In the agent system

When a user message starts a run, the harness creates a trace id. It also opens a root span (the top record in the tree) for the orchestrator's turn. The orchestrator is the agent in charge. When it starts a subagent (helper agent), it passes the trace id and parent span id in the task envelope. Inside the subagent, every model call and tool call opens a child span. Each records timing, token counts and status. MCP requests carry the same context in their metadata (MCP is a standard way to connect tools to an AI model). So remote servers can add their spans too. A collector joins the spans into a tree. The tree shows which subagent spent the tokens, or which tool call held up the run.

## In a large company

Company platforms measure agents with OpenTelemetry (a standard for recording what software does) and its GenAI semantic conventions (agreed names for AI-related data). They pass the W3C traceparent header (the standard trace tag) through task envelopes, HTTP headers and MCP _meta fields. Spans go through an OpenTelemetry Collector to the tracing backend. Spans carry tenant (customer company), user and cost details. So traces support chargeback (billing each team for its use) and SLOs (reliability targets) per tenant. Prompt and reply content stays off by default. When it is turned on, it is redacted (secrets and personal data removed) and kept for a shorter time. Sampling keeps every error and slow trace but only some routine runs, to control storage cost.

## Step by step

1. The harness creates a trace id and a root span when the run starts.
1. Every subagent start, model call and tool call opens a child span with the trace id and its parent's span id.
1. Each span records timing, tokens and status when it closes.
1. A collector joins all spans with the same trace id into one tree.

## Code sketch

```python
with tracer.span('invoke_agent orch') as root:
    sub = spawn('researcher', task,
                trace=root.context)

# inside the subagent's harness
with tracer.span('invoke_agent researcher',
                 parent=task.trace) as s:
    with tracer.span('chat', parent=s):
        r = client.messages.create(**req)
    with tracer.span('execute_tool search',
                     parent=s):
        run_tool(block)
```

## Be careful

Spans that store full prompts and tool outputs copy secrets into the monitoring store. So by default, record only sizes and hashes (short fingerprints). Record full content only when someone turns it on.

## Diagram

![Fig. 5.18: The same trace id rides along every hop, so every span lands in one tree.](/diagrams/distributed-tracing.svg)
