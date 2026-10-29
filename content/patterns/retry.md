---
id: retry
number: "3.04"
title: Retry
chapter: llm-layer
fit: direct
review_id: rev-retry
figure_number: Fig. 3.04
figure_caption: "Each failure earns a longer, jittered wait before the same request goes again."
diagram: retry.svg
analogy_title: The radio phone-in competition
---
## Gist

Re-send a model call that failed for a short-lived reason, waiting longer each time, and give up after a fixed limit.

## Everyday comparison

### The radio phone-in competition

When a radio station opens its prize line, thousands of people call at once. Most hear the busy tone. If everyone calls back straight away, the line stays jammed. Callers who wait a few seconds, then a bit longer, each at a slightly different moment, get through. After ten tries, sensible people stop and listen to the rest of the show.

## Classic meaning

Retry repeats an operation that failed because of a short-lived fault. It usually waits longer each time, until the operation succeeds or a limit is reached.

## In the agent system

Model APIs return transient errors (short-lived errors that may pass if you try again). A 429 rate_limit_error means you hit a usage limit. A 529 overloaded_error means the service is busy. There are also occasional 500 or 504 errors, and connections that drop mid-stream. A streaming call can also fail after a 200 (success) status, with an error event inside the stream. The client treats that error the same way as the matching HTTP error. If the response has a retry-after header (the provider's advice on how long to wait), the client follows it. Otherwise it waits using capped exponential backoff plus jitter. That means the wait doubles each time up to a maximum, plus a small random extra. Then it sends the identical request again. This is safe because a model call has no side effects (it changes nothing outside itself). Some errors will never succeed on a resend. Examples are 400 invalid_request_error, 401, 403, or a 429 caused by a used-up spending cap. These fail at once. The retry budget is limited by the number of attempts and by the turn's deadline. So a user in the chat never waits forever.

## In a large company

In an enterprise platform, retries live in exactly one layer, usually the LLM gateway (the central entry point for model calls). SDK retries behind it are set to zero. Each tenant (customer company) gets its own retry budget. So one tenant's storm of retries does not use up the shared quota. Every retry is logged as a span event in OpenTelemetry (a standard tracing system), with the status and the wait. So SLO dashboards (charts of reliability targets) can tell provider overload (529) apart from self-caused rate limiting (429). Retrying a model call is safe because it has no side effects. But a turn may have already run tools. That turn must resume from its checkpoint (a saved point), not replay the tools. A durable execution engine such as Temporal (a system that saves each step so work can resume) usually does this.

## Step by step

1. The client sends the request and gets a 529 overloaded error.
1. It marks the error as transient. It works out a delay: a base time doubled for each attempt, plus jitter.
1. If the response has retry-after, it waits at least that long.
1. It sends the same request again, up to the maximum number of attempts.
1. It returns the first success, or passes the last error up to the agent loop.

## Code sketch

```python
RETRYABLE = {408, 429, 500, 503, 504, 529}
for attempt in range(MAX_TRIES):
    try:
        return api.create(**req)
    except APIError as e:  # incl. SSE error
        if e.status not in RETRYABLE:
            raise
        if attempt == MAX_TRIES - 1:
            raise GaveUp(req) from e
        wait = min(CAP, BASE * 2 ** attempt)
        wait = random.uniform(wait / 2, wait)
        sleep(max(wait, e.retry_after or 0))
```

## Be careful

Retries can be stacked at several layers, such as the SDK, the gateway and the agent loop. During an outage they multiply into dozens of calls. Retry in exactly one place.

## Diagram

![Fig. 3.04: Each failure earns a longer, jittered wait before the same request goes again.](/diagrams/retry.svg)
