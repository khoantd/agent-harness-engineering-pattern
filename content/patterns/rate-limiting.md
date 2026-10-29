---
id: rate-limiting
number: "3.07"
title: Rate Limiting
chapter: llm-layer
fit: direct
review_id: rev-rate-limiting
figure_number: Fig. 3.07
figure_caption: Each tenant spends from its own bucket. Overdrafts are refused with a wait time.
diagram: rate-limiting.svg
analogy_title: Timed tickets at the museum
---
## Gist

Cap how many requests and tokens each caller may use per time window, and refuse the extra with a clear time to retry.

## Everyday comparison

### Timed tickets at the museum

A popular exhibition sells entry in half-hour slots of fifty people. When the 2:00 slot is full, the fifty-first visitor hears that the next free slot is 2:30. Everyone inside gets a calm look at the paintings. The people turned away know exactly when to come back.

## Classic meaning

Rate limiting limits how many operations a client may do in a time window. Requests over the limit are refused or delayed.

## In the agent system

Providers already limit requests per minute, and input and output tokens per minute. Tokens are the small chunks of text that models read and write. When you go over, the provider answers 429 with a retry-after header (how long to wait). A multi-tenant harness serves many customer companies, called tenants. It adds its own limiter in front. This is usually a token bucket per organisation or per user. A token bucket is a counter that refills at a steady rate, and each call spends from it. The buckets live in a shared store. So one user's runaway agent loop cannot use up the shared provider quota. Before each call, the limiter charges the estimated input tokens plus the full max_tokens reservation (the most output the call may produce). This is on purpose, and it is stricter than the provider. The provider counts output as it is generated, and for most models it ignores cache reads. After the call, the limiter settles the real usage. A request that would overdraw the bucket is refused at once, with the time until enough tokens refill. A request that can never fit is refused outright.

## In a large company

In an enterprise platform, per-tenant limits are enforced in the LLM gateway or the API gateway (the central entry points for calls). Examples are Kong, the Envoy rate-limit service, or a token bucket stored in Redis (a fast shared data store). The limit is keyed by the tenant and user taken from the OIDC token (the signed login token). It never comes from a header that the client sets. Limits come in tiers set by contract. They are reported back as rate-limit headers. They are tied to budgets and chargeback (billing costs back to each team), so finance sees the same numbers as the limiter. Every refusal is logged with the tenant and principal (the user or service that made the call). So noisy-neighbour incidents, where one tenant hurts others, can be traced.

## Step by step

1. Estimate the request's input tokens and add the max_tokens reservation.
1. Refill the caller's bucket for the time that has passed, and check its balance.
1. If there is room, take the tokens and forward the call. If not, return 429 with retry_after.
1. After the response, refund or charge the difference against actual usage.

## Code sketch

```python
class TokenBucket:
    def take(self, n):
        if n > self.capacity:
            raise TooLarge(n)   # never fits
        self.refill(now())
        if self.tokens < n:
            need = n - self.tokens
            raise RateLimited(need/self.rate)
        self.tokens -= n

# shared store, so all replicas agree
bucket = buckets.get(req.org_id)
bucket.take(estimate(req) + req.max_tokens)
```

## Be careful

Bad token estimates make the limiter useless or unfair. So compare against the usage the provider reports after every call.

## Diagram

![Fig. 3.07: Each tenant spends from its own bucket. Overdrafts are refused with a wait time.](/diagrams/rate-limiting.svg)
