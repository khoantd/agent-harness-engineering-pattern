---
id: poison-pill
number: "6.12"
title: Poison Pill
chapter: async
fit: direct
figure_number: Fig. 6.12
figure_caption: The stop signal travels through the queue behind the real work.
diagram: poison-pill.svg
analogy_title: The marathon sweep bus
---
## Gist

Shut down queue workers cleanly by sending a special stop message that each worker recognises and exits on.

## Everyday comparison

### The marathon sweep bus

Behind the last runner of a marathon drives the sweep bus. Volunteers at each water station keep handing out cups until it passes. When they see it, they know nobody else is coming. So they pack up the tables. Nobody phones the stations. The signal travels along the course in the same stream as the runners.

## Classic meaning

A sentinel (a special marker message) goes into a queue. Each consumer that reaches it finishes its current work and stops.

## In the agent system

Sometimes a harness host deploys a new version, or a batch eval (a large automated test run) finishes. It must then stop its agent workers without leaving turns half-done. The supervisor is the process that manages the workers. It stops taking new jobs. It then puts one STOP sentinel per worker on the job queue. Each worker finishes the job it holds. It also finishes the jobs ahead of the pill, in FIFO order (first in, first out). Then it leaves its loop when it takes STOP. The supervisor joins the workers, which means it waits for each to finish. Then it saves transcripts and closes MCP connections (links to tool servers).

## In a large company

Pills only work on an in-process queue. On a shared broker such as Kafka or SQS, another replica's worker would take the pill. A broker is a separate service that holds messages. So hosts do something else instead. They stop polling for jobs when they get SIGTERM, the signal that tells a process to shut down. They finish or checkpoint (save progress on) the current turn. Then the broker delivers anything not yet acknowledged again. Agent turns can last longer than a Kubernetes termination grace period, the time a pod gets to shut down. So long work should checkpoint into durable execution and resume on another host. Durable execution keeps work going through crashes and restarts. Do not confuse a poison pill with a poison message. A poison message is a malformed job that crashes consumers again and again. It belongs in a dead-letter queue, a holding place for messages that cannot be handled.

## Step by step

1. The supervisor stops taking new jobs.
1. It adds one STOP sentinel per worker behind the remaining jobs.
1. Workers handle the jobs ahead of the pill as usual.
1. Each worker that takes STOP exits, and the supervisor joins them and cleans up.

## Code sketch

```python
STOP = object()

def shutdown(q, workers):
    for _ in workers:
        q.put(STOP)       # one pill each
    for w in workers:
        w.join()

def worker(q):
    while (job := q.get()) is not STOP:
        run_agent_turn(job)
```

## Be careful

Send exactly one pill per consumer, and never let a worker put it back on the queue. A missing pill leaves a worker stuck on get() forever.

## Diagram

![Fig. 6.12: The stop signal travels through the queue behind the real work.](/diagrams/poison-pill.svg)
