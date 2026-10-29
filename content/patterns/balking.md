---
id: balking
number: "6.11"
title: Balking
chapter: async
fit: direct
figure_number: Fig. 6.11
figure_caption: "A request that arrives mid-run is refused on the spot, not queued."
diagram: balking.svg
analogy_title: The lit lift button
---
## Gist

If an object is not in the right state, return at once instead of waiting, such as skipping a run already in progress.

## Everyday comparison

### The lit lift button

You reach the lift. The call button is already glowing, because someone pressed it a moment ago. Pressing it again changes nothing. The lift is already on its way. The button does not call a second lift or make you wait at the panel. It just ignores the extra press.

## Classic meaning

An action runs only if the object is in a suitable state. Otherwise the call returns at once and does nothing.

## In the agent system

A scheduled task fires every 15 minutes, but one run sometimes takes 20. Without care, the scheduler starts a second run on the same session while the first is still going. That doubles model spend. It also races on the transcript, with two runs writing at once. With balking, the trigger handler checks a running flag under a lock. If a run is in progress, it logs 'skipped: already running' and returns. The same check stops a double-click on Send from starting two turns. It also stops a second compaction while one is underway. Compaction is shrinking the conversation history by summarising it.

## In a large company

A harness may run as several replicas (copies on different hosts). Then an in-process flag only stops overlaps on one host. So scheduled runs take a distributed lease before starting. A lease is a lock that expires after a set time. Examples are a Postgres advisory lock or a database row with an expiry. Each skipped run is logged and counted as a metric. A job that balks every time is stuck, not busy. For user actions such as a double-clicked Send, use an idempotency key on the request. An idempotency key is a label that makes a repeat safe. It gives the same protection across retries and reconnects.

## Step by step

1. The trigger fires and calls start_run.
1. Under a lock, the handler checks whether a run is already active.
1. If one is, it logs a skip and returns at once.
1. Otherwise it marks the run active, starts it, and clears the flag when done.

## Code sketch

```python
def start_run(task):
    with task.lock:
        if task.running:
            log.info('balk: run in flight')
            return 'skipped'
        task.running = True
    try:
        execute(task)
    finally:
        task.running = False
```

## Be careful

Balking drops requests silently. So use it only when the skipped request is truly not needed. If every request matters, queue it instead.

## Diagram

![Fig. 6.11: A request that arrives mid-run is refused on the spot, not queued.](/diagrams/balking.svg)
