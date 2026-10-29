---
id: queue-based-load-leveling
number: "3.11"
title: Queue-Based Load Leveling
chapter: llm-layer
fit: direct
review_id: rev-queue-based-load-leveling
figure_number: Fig. 3.11
figure_caption: Bursts fill the queue. Workers empty it at the rate the model can take.
diagram: queue-based-load-leveling.svg
analogy_title: The reservoir behind the dam
---
## Gist

Put model jobs in a durable queue that a fixed pool of workers empties, so bursts become a steady, affordable call rate.

## Everyday comparison

### The reservoir behind the dam

A storm drops a week of rain on the hills in one night. The river below would flood, but the reservoir fills instead. The gates release water at a steady rate that the town's channels can carry, day after day, until the level falls.

## Classic meaning

A queue sits as a buffer between tasks and a service. It smooths out sudden heavy loads. The service then handles work at its own steady rate.

## In the agent system

At 9am, hundreds of scheduled tasks start at once. A CI webhook (an automatic message from the build system) can launch fifty review agents in a minute. These do not each call the model right away. Instead, the harness writes a job record to a durable queue, one that keeps jobs safe if machines restart. It returns a run id. A pool of workers pulls jobs and runs the agent loop. The pool is sized to the provider's sustained rate limit (the steady rate it allows). So the provider sees a flat line of traffic, and the 429 errors stop. Callers watch the run status or get a notice when it is done. Nothing is lost if a worker restarts.

## In a large company

In an enterprise platform, the queue is a managed, durable service such as SQS, Pub/Sub or Kafka. It may also be a durable execution engine like Temporal (a system that saves each step so work can resume). The worker pool is sized to the provisioned model throughput (capacity bought in advance) of the tenant or platform. Delivery is at least once, so a job may arrive more than once. So every job carries an idempotency key (an id that makes repeats safe). Before any outside side effect, such as a PR comment or a ticket update, the worker checks that key. Separate queues or priorities per tenant (customer company) and for interactive work stop one tenant's burst from slowing everyone.

## Step by step

1. Producers (schedules, webhooks, users) add a job to the queue and get a run id.
1. The queue stores jobs safely and soaks up the burst.
1. A fixed pool of workers pulls jobs at a rate that fits the model budget.
1. Each worker runs the agent and posts the result and a notice.

## Code sketch

```python
def on_webhook(event):
    run_id = f'pr-{event.pr}-{event.sha}'
    jobs.enqueue({'run': run_id,  # dedupe
                  'agent': 'pr_review',
                  'pr': event.pr})
    return {'run_id': run_id}   # at once

def worker():                    # N of these
    while job := jobs.receive(lease=900):
        if not runs.done(job['run']):
            result = run_agent(job)
            notify(job['run'], result)
        jobs.ack(job)  # redelivered if we die
```

## Be careful

Load leveling trades speed for stability. A user waiting in the chat should not sit behind a thousand batch jobs. So give interactive work its own lane.

## Diagram

![Fig. 3.11: Bursts fill the queue. Workers empty it at the rate the model can take.](/diagrams/queue-based-load-leveling.svg)
