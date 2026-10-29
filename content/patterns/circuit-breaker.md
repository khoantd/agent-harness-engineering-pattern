---
id: circuit-breaker
number: "3.06"
title: Circuit Breaker
chapter: llm-layer
fit: direct
review_id: rev-circuit-breaker
figure_number: Fig. 3.06
figure_caption: "Three states: pass calls, refuse them fast, or test with one probe."
diagram: circuit-breaker.svg
analogy_title: "The harbour master's storm flag"
---
## Gist

Stop calling a provider that keeps failing, refuse calls quickly for a cool-down period, then let one test call decide whether to resume.

## Everyday comparison

### The harbour master's storm flag

Three ferries in a row turn back in a storm. The harbour master raises the storm flag and stops all sailings. Passengers hear the news at the gate, not halfway out to sea. After a few hours she sends one boat out to test the water. If it crosses safely, the timetable starts again. If not, the flag goes back up.

## Classic meaning

A circuit breaker wraps calls to a remote service in a state machine (a thing with a few fixed states). It opens after repeated failures and refuses calls while open. Then it tries one test call before it closes again.

## In the agent system

The model client keeps one breaker per provider, or per model and region. While the breaker is closed, calls flow normally. It counts 5xx (server error), 529 and timeout failures over a rolling window of recent time. It leaves 429s to rate limiting and retry-after. When failures cross a threshold, the breaker opens. For the next 30 seconds, every call fails at once with BreakerOpen. The fallback layer turns that into a switch to another model. So no agent wastes its retry budget on a dead endpoint. After the cool-down, the breaker goes half-open. It lets exactly one probe (test request) through. Success closes the breaker. Failure opens it again with a longer timer.

## In a large company

In an enterprise platform, breakers usually sit in the LLM gateway (the central entry point for model calls) or the service mesh (the network layer between services). Examples are Envoy outlier detection and Resilience4j-style libraries. They are keyed by provider, model and region. Each state change is sent out as an event. These events page on-call staff and mark SLO dashboards (charts of reliability targets). Breaker state usually lives separately in each gateway replica (copy), and that is acceptable. But tune the thresholds so one tenant's (customer's) badly formed traffic cannot trip a shared breaker. Pair the breaker with the fallback chain and a status page entry. Then users see a degraded mode instead of silent errors.

## Step by step

1. Closed: requests pass through, and the breaker counts recent failures.
1. Open: once failures cross the threshold, calls fail at once for a cool-down period.
1. Half-open: when the timer ends, one test request may go through.
1. The test result closes the breaker or opens it again.

## Code sketch

```python
def call(self, req):
    with self.lock:          # one probe only
        if self.state == 'open' and \
           now() >= self.retry_at:
            self.state = 'half_open'
        elif self.state != 'closed':
            raise BreakerOpen(self.name)
    try:
        r = self.provider.send(req)  # 4xx ok
    except (ServerError, Timeout):
        self.fail()   # half_open -> open
        raise
    self.reset()      # closed, fails = 0
    return r
```

## Be careful

Count only failures on the provider's side. A 400 error caused by a badly formed prompt is not the provider's fault. If those errors trip the breaker, a healthy provider goes offline for every agent.

## Diagram

![Fig. 3.06: Three states: pass calls, refuse them fast, or test with one probe.](/diagrams/circuit-breaker.svg)
