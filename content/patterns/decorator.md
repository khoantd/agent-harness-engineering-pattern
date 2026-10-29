---
id: decorator
number: "2.17"
title: Decorator
chapter: tool-system
fit: direct
review_id: rev-decorator
figure_number: Fig. 2.17
figure_caption: Each wrapper adds one job and passes the same call inward
diagram: decorator.svg
analogy_title: Layering up for the ski slope
---
## Gist

Wrap a tool in layers such as logging, retries, rate limits and telemetry. Each layer adds one job behind the same interface.

## Everyday comparison

### Layering up for the ski slope

A skier puts on a thermal base layer, then a fleece, then a waterproof shell. Each layer adds one thing: warmth, insulation or weather protection. Each one fits over whatever is underneath. The skier inside is the same person. On a mild afternoon the fleece comes off without touching the other layers.

## Classic meaning

You add extra jobs to an object while the program runs. You wrap it in other objects that look the same from outside and pass each call on to it.

## In the agent system

The harness keeps each tool as a plain object with a run(args) method. When it builds the tool set, it wraps each tool in layers. A Telemetry wrapper records a span (a timed trace record) and the call's cost. A Logged wrapper writes the call and its result to the transcript (the record of the session). A Retry wrapper tries again after transient errors (short-lived failures), waiting longer each time. This waiting is called backoff. It also follows any Retry-After hint from the server, which says how long to wait. A RateLimit wrapper waits for a free slot before calling a paid API. Every wrapper shows the same name and schema as the real tool. So neither the model nor the executor (the part that runs tools) can tell how many layers there are. Configuration chooses the layers for each tool. A local file read might get only logging. Web search gets all four. A tool with side effects, such as create_ticket, gets no Retry. The exception is when it sends an idempotency key. That is a unique ID that lets the server spot a repeat and do the work only once.

## In a large company

In a large company the platform team usually owns the stack of layers and applies it the same way to every tool. Every tool call gets an OpenTelemetry span (a standard trace record) with the GenAI semantic convention attributes (standard labels for AI calls). Each call also gets an audit record, a rate limit per tenant (one customer company sharing the platform) and a cost tag for chargeback (billing each team for its use). Tool authors supply only the bare tool. The platform's configuration decides which layers apply. This stops anyone from skipping the audit and policy layers. The key rules are these. Audit and policy wrappers sit outside the retry and caching layers. They cannot be removed for any single tool. And retries never wrap non-idempotent actions (actions that are not safe to repeat) unless the call carries an idempotency key.

## Step by step

1. The registry loads the bare tool.
1. The builder wraps it in the configured layers, starting with the innermost.
1. A call enters the outermost wrapper, which does its job and passes the call inward.
1. The result travels back out through each layer. Each layer can record it, change it or retry.

## Code sketch

```python
class Retry(Tool):
    def __init__(self, inner, n=3):
        self.inner, self.n = inner, n
        self.name = inner.name
    def run(self, args):
        for i in range(self.n):
            try: return self.inner.run(args)
            except Transient as e:
                sleep(e.retry_after or 2 ** i)
        raise ToolFailed(self.name)

t = Telemetry(Logged(Retry(RateLimit(web))))
```

## Be careful

Order matters. A retry outside the rate limiter waits for a new slot on each attempt. A retry inside it can burst past the limit. So set the order of layers in one place.

## Diagram

![Fig. 2.17: Each wrapper adds one job and passes the same call inward](/diagrams/decorator.svg)
