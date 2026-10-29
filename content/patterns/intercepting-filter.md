---
id: intercepting-filter
number: "7.01"
title: Intercepting Filter
chapter: safety
fit: direct
review_id: rev-intercepting-filter
figure_number: Fig. 7.01
figure_caption: "Traffic in both directions passes a chain of separate filters, and any of them can stop it."
diagram: intercepting-filter.svg
analogy_title: Airport security lanes
---
## Gist

Pass every prompt and response through a chain of guardrail filters, each able to inspect, rewrite or block it.

## Everyday comparison

### Airport security lanes

Before you board, you pass a chain of checks. There is the boarding pass scan, the bag x-ray, the metal detector and the passport desk. Each looks for one kind of problem and can turn you back. The airline does not run these checks itself. The airport can add a new scanner without changing anything about the plane.

## Classic meaning

Filters run in a chain before and after a request handler. They can be configured, and the handler does not need to know they exist.

## In the agent system

Some inputs reach the model, such as a user message or a fetched web page. First they pass through input filters. One is a prompt-injection scan on tool results. Prompt injection is hidden text that tries to give the model new orders. Others are a PII redactor and a size cap. A PII redactor removes personal data such as names and emails. After the model replies, output filters run. These include moderation, secret scanning, and a check that no tool call targets a blocked domain. That output check is only an early warning. The real block on domains happens where the tool runs, or in the egress proxy (the gate for outgoing network traffic). A filter manager builds the chains from config. So a team can add a new detector without touching the agent loop. Any filter can stop the chain early with a refusal. Or it can pass on a redacted payload.

## In a large company

Enterprise platforms usually build this chain into an LLM gateway or harness middleware. An LLM gateway is a shared entry point for all model calls. The chain applies PII redaction and DLP (data loss prevention), injection classifiers, moderation and secret scanning. Each tenant (customer company) gets its own settings from versioned configuration. Filters fail closed. They log each decision with a redacted payload for audit. Cheap rules run before model-based classifiers, to protect latency SLOs (targets for response speed). Streaming responses need the output chain applied to buffered chunks. The controls that truly decide, such as egress allow-lists, still sit in the tool executor and the network layer.

## Step by step

1. The filter manager builds the input and output chains from config.
1. An incoming message runs through each input filter in order.
1. If nothing blocks it, the agent loop calls the model with the cleaned input.
1. The reply runs through the output filters before it reaches the user or a tool.

## Code sketch

```python
pre = FilterChain([
    InjectionScan(), RedactPII(),
    TokenCap(50_000),
])
post = FilterChain([Moderation(),
                    SecretScan()])

def handle(msg):
    msg = pre.run(msg)   # may raise Block
    reply = agent.turn(msg)
    return post.run(reply)
```

## Be careful

Classifier filters are probabilistic, which means they guess and can be wrong. So treat the chain as defence in depth, one layer among several. It is not a security boundary. Fail closed when a filter errors, which means block when unsure. Keep hard limits, such as tool permissions and egress allow-lists, in the executor. An egress allow-list is the list of outside addresses the tools may reach.

## Diagram

![Fig. 7.01: Traffic in both directions passes a chain of separate filters, and any of them can stop it.](/diagrams/intercepting-filter.svg)
