---
id: fallback
number: "3.05"
title: Fallback
chapter: llm-layer
fit: direct
review_id: rev-fallback
figure_number: Fig. 3.05
figure_caption: The same request walks down a fixed chain until something answers.
diagram: fallback.svg
analogy_title: The understudy in the wings
---
## Gist

When the preferred model cannot answer, give the same request to a substitute, so the turn still finishes, maybe at lower quality.

## Everyday comparison

### The understudy in the wings

Every lead role in a theatre show has an understudy who knows the lines. If the star loses their voice an hour before the show, a note goes into the programme and the understudy goes on. The audience still sees the show, a little differently. Nobody cancels the night because one actor is out.

## Classic meaning

Fallback gives an alternative action or result when the main operation fails. The system then works less well instead of showing an error.

## In the agent system

Sometimes retries run out, or a circuit breaker is open (a switch that blocks calls to a failing provider). Then the model client walks a fallback chain, which is an ordered list of substitutes. The chain is first filtered by the tenant's policy (the rules for that customer company). It might try the same model in another allowed region, then a smaller model. Last, it returns a typed 'busy, try again' status. Each step gets the same messages and tool definitions. They change only where the substitute needs it. Examples are a smaller max_tokens (output limit), no extended thinking, or dropping earlier thinking blocks. The substitute starts with a cold prompt cache. The prompt cache is saved work the provider can reuse when a request starts the same way, and cold means it is empty. So the substitute's first call pays the full input price. The harness tags the response with the model that actually served it. This keeps the transcript, cost records and evals (quality tests) honest. Some callers must use the strongest model, such as a review subagent. They opt out and fail loudly instead.

## In a large company

In an enterprise platform, the platform team owns the fallback chain as configuration. It is limited for each tenant. A tenant pinned to EU data residency (keeping data inside the EU), or to one approved vendor, may only fall back inside that boundary, or not at all. Each fallback is logged with served_by in the audit trail and the trace. Cost reports show the shift, because the substitute starts with a cold prompt cache. Change management (the formal review process for changes) treats adding a model to the chain like a release. The same eval suite as the primary model must pass first.

## Step by step

1. Call the primary model with the request.
1. If retries run out or the breaker is open, pick the next entry in the fallback chain.
1. Adjust the request to the substitute's limits and send it.
1. Tag the response with served_by and return it to the agent loop.

## Code sketch

```python
CHAIN = ['large', 'large-eu', 'small']

def complete(req, tenant):
    for model in tenant.allowed(CHAIN):
        try:
            r = call(model, fit(req, model))
            r.served_by = model
            return r
        except (Overloaded, BreakerOpen):
            continue
    return Degraded('busy, try later')
```

## Be careful

A fallback model may not support the same tools, context length or output format. So run the agent's evals against every model in the chain.

## Diagram

![Fig. 3.05: The same request walks down a fixed chain until something answers.](/diagrams/fallback.svg)
