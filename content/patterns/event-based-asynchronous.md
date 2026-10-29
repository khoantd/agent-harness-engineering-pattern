---
id: event-based-asynchronous
number: "6.03"
title: Event-Based Asynchronous
chapter: async
fit: adapted
review_id: rev-event-based-asynchronous
figure_number: Fig. 6.03
figure_caption: One running job raises separate events that different subscribers act on.
diagram: event-based-asynchronous.svg
analogy_title: The pharmacy text alerts
---
## Gist

Show a long job as events (start, progress, completed, failed, cancel), so the UI and agent loop react as things happen.

## Everyday comparison

### The pharmacy text alerts

You drop off a prescription and leave your phone number. A text comes when they start making it up. Another comes if an item is out of stock. A last one comes when it is ready to collect. If you no longer need it, you reply STOP. You never stand at the counter asking if it is done yet.

## Classic meaning

A MethodAsync call returns at once. It then raises ProgressChanged and Completed events on the caller's own thread or loop. It can also support cancelling.

## In the agent system

Some jobs run a long time, like a background subagent, a long build or a scheduled task. Each one publishes lifecycle events: started, progress, completed, failed, cancelled. An event is a short message that says something happened. The chat UI subscribes to (signs up for) progress events to update a task card. The agent loop is the cycle that calls the model and runs its tools. It subscribes to completed and failed events. Then it can add a task-notification message to the conversation. Cancelling goes the other way, as a cancel request on the same task id. The runner raises events back on the session's own event loop. That is the single loop that handles the session's work. So handlers never touch session state from a worker thread.

## In a large company

In production, the lifecycle events go onto a durable stream such as Kafka or EventBridge. A durable stream is a stored log of messages that survives crashes. Each event is keyed by task id. So a client that reconnects can replay the latest state instead of missing it. Failed events often carry stack traces or raw tool output. So remove secrets and PII (personal data such as names and emails) before an error message enters the transcript or a notification. Cancelling is cooperative, which means the job must notice the request and stop itself. Record each cancel in the audit log. Side effects already in flight must either finish idempotently (safe to run twice with the same result) or be compensated (undone by a reversing action).

## Step by step

1. The caller registers its handlers, then starts the job with run_async and gets a task id.
1. The worker raises progress events as it goes.
1. When it finishes, it raises completed with the result, or failed with the error.
1. Handlers on the session loop update the task card and tell the model.

## Code sketch

```python
task = runner.create(job, task_id='t42')
task.on('progress', ui.update_card)
task.on('completed', lambda r:
        transcript.notify(f'done: {r}'))
task.on('failed', lambda e:
        transcript.notify(f'failed: {e}'))
task.run_async()     # subscribe first

# user presses Stop on the task card
task.cancel_async()
```

## Be careful

Each event fires only once. A handler registered after completed has fired misses the result. So subscribe before you start the job, or let late subscribers read the last state.

## Diagram

![Fig. 6.03: One running job raises separate events that different subscribers act on.](/diagrams/event-based-asynchronous.svg)
