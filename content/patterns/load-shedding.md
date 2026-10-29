---
id: load-shedding
number: "3.09"
title: Load Shedding
chapter: llm-layer
fit: direct
review_id: rev-load-shedding
figure_number: Fig. 3.09
figure_caption: "Under load, low-priority calls are put off so the chat stays fast."
diagram: load-shedding.svg
analogy_title: Rolling cuts on a heatwave grid
---
## Gist

When demand is more than capacity, drop or delay the least important model work, so interactive turns keep getting answers.

## Everyday comparison

### Rolling cuts on a heatwave grid

On the hottest afternoon of the year, people want more power than the power stations can make. The operator does not let the whole grid collapse. Instead, it cuts power to a few industrial areas for an hour. Hospitals, homes and traffic lights stay on. The cut is announced in advance and reversed when demand falls.

## Classic meaning

Load shedding means refusing some incoming requests on purpose when a system is overloaded. It chooses them by priority, to protect the system's main job.

## In the agent system

Each model request carries a priority. It inherits that priority from the root of its run (the request that started the work). A user waiting in the chat UI is high priority, and so is any subagent working for that turn. A subagent on a background task is medium. Scheduled digests, eval runs and memory consolidation (tidying stored memories) are low. Sometimes provider errors rise, or the queue gets long. Or p95 latency (the time within which 95% of calls finish) crosses a threshold. Or the organisation's token budget is nearly gone. Then the admission check (the gate before each call) refuses calls below the current cut-off. It gives them a 'shed' status and moves them to a later scheduled task. Interactive turns stay fast. Shed work is recorded so it can run when load drops.

## In a large company

In an enterprise platform, the gateway decides what to shed using server-side context. The priority class comes from the logged-in workload and its run lineage (the chain of runs that led to this call). It never comes from a field the client sets, or every caller will claim to be interactive. Shed and deferred work is visible per tenant (customer company) in job status and metrics. The deferred queue has a size limit and is drained slowly, so recovery does not cause a second spike. Contracts and SLOs (reliability targets) should say which tiers of work can be shed. Then an eval or batch customer is not surprised.

## Step by step

1. Tag every model request with a priority class.
1. Measure load: queue depth, latency, provider errors and remaining budget.
1. Above a threshold, refuse or defer requests below the current cut-off priority.
1. Record shed work, and lower the cut-off as load recovers.

## Code sketch

```python
PRIORITY = {'chat': 3, 'subagent': 2,
            'eval': 1, 'digest': 0}

def admit(req):
    cutoff = 0
    if load.p95_ms > 8000: cutoff = 2
    elif load.queue > 200: cutoff = 1
    if PRIORITY[req.kind] < cutoff:
        deferred.put(req)   # run later
        raise Shed(req.kind)
    return dispatch(req)
```

## Be careful

Shedding must be visible. A background job that quietly gets dropped every afternoon looks like a bug. So show deferrals in logs and in job status.

## Diagram

![Fig. 3.09: Under load, low-priority calls are put off so the chat stays fast.](/diagrams/load-shedding.svg)
