---
id: throttling
number: "3.08"
title: Throttling
chapter: llm-layer
fit: adapted
review_id: rev-throttling
figure_number: Fig. 3.08
figure_caption: A burst queues on the ramp and leaves at an even pace set by the headers.
diagram: throttling.svg
analogy_title: Ramp meters on the motorway
---
## Gist

Keep the harness's own agents within a safe share of the provider quota by pacing, capping, degrading or delaying their calls.

## Everyday comparison

### Ramp meters on the motorway

At rush hour, a traffic light on the motorway entry ramp lets one car on every few seconds. Every car gets on in the end. The queue on the ramp soaks up the surge, so the main road keeps moving. When traffic thins, the light turns green and stays green.

## Classic meaning

Throttling controls how many resources an app instance, a tenant (customer) or a whole service may use. Once use crosses a threshold, it rejects work, degrades it (does a cheaper version) or defers it (does it later). This keeps the system meeting its SLOs (reliability targets) under heavy load.

## In the agent system

Every agent, subagent and scheduled job in the harness shares one provider quota. So the harness slows its own users before the provider starts returning 429 errors. A controller reads the rate-limit headers after each call. These headers say how many tokens remain and when the limit resets. As the remaining tokens shrink, it takes graded steps, one after another. First, a shared pacer spaces out calls. Next, fewer subagents may run at once. Then background work is degraded: shorter max_tokens, a smaller model, or no extended thinking. Last, the lowest-priority jobs are deferred (put off until later). Interactive turns, where a person is waiting, still go through, a little later. As headroom (spare quota) comes back, the harness lifts the steps in reverse order.

## In a large company

In an enterprise platform, throttling is how the platform shares a fixed provider commitment among many tenants and workloads. That commitment might be provisioned throughput (capacity bought in advance) or a negotiated rate limit. Throttling caps how many agent runs each tenant may have at once. It degrades background work to a smaller model. It defers batch jobs before interactive users feel anything. Policies are set per tier in the gateway. Tenants can see them through headers and status pages, so a slowed job can be explained. Each throttling action is recorded as a metric and an audit event. This matters when an SLA credit (a refund for missing a service promise) or a chargeback dispute depends on whether a tenant was degraded.

## Step by step

1. Read the rate-limit headers after each model call.
1. Work out a minimum gap between calls from the remaining tokens and the reset time. The reset header is a timestamp, so subtract the current time.
1. Before each call, reserve the next slot, then wait for it.
1. As headroom shrinks further, cap how many subagents run at once. Degrade or defer background work.
1. Lift the limits in reverse order as headroom returns.

## Code sketch

```python
class Pacer:
    def adjust(self, h):
        left = int(h['tokens-remaining'])
        # reset is an RFC 3339 timestamp
        ts = parse_rfc3339(h['tokens-reset'])
        until = max(ts - now(), 0)
        self.gap = until / max(left / AVG, 1)

    async def wait_turn(self):
        slot = max(now(), self.next)
        self.next = slot + self.gap  # reserve
        await sleep(slot - now())
```

## Be careful

Throttling only hides overload up to a point. If the ramp queue grows without end, you also need load shedding (dropping low-priority work) or backpressure (making the sender wait).

## Diagram

![Fig. 3.08: A burst queues on the ramp and leaves at an even pace set by the headers.](/diagrams/throttling.svg)
