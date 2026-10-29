---
id: backpressure
number: "3.10"
title: Backpressure
chapter: llm-layer
fit: direct
review_id: rev-backpressure
figure_number: Fig. 3.10
figure_caption: A full buffer makes the producer wait instead of piling up work.
diagram: backpressure.svg
analogy_title: The sushi conveyor belt
---
## Gist

Let a slow consumer push back on its producer, so work waits at the source instead of piling up in memory.

## Everyday comparison

### The sushi conveyor belt

At a conveyor-belt sushi bar, the chef puts a plate only where the belt has a gap. When diners are slow and the belt is full, there is nowhere for the next plate. So the chef pauses and waits. As diners take plates off, gaps appear and the chef starts again. The belt never spills onto the floor.

## Classic meaning

Backpressure is a way to control flow. The downstream part (the consumer) tells the upstream part (the producer) how much it can take. Producers slow down or pause when buffers fill up.

## In the agent system

An orchestrator (the agent that hands out work) may fan out many subagents. It puts each task into a bounded queue, which has a fixed maximum size. Suppose every model-call slot in the dispatcher is busy. Then queue.put waits, and the orchestrator stops starting new subagents. So memory stays flat, however many tasks the model plans. Streaming to the chat UI works differently. If the harness pauses reading from the provider, the model does not slow down. A long pause may also make the provider close the stream. So the harness reads the provider stream at full speed. It writes into the transcript and into a bounded buffer for each client. When a slow mobile client falls behind, the harness coalesces (merges) the queued text pieces instead of holding up the provider. Wherever the producer can truly wait, the slowest stage sets the pace.

## In a large company

In an enterprise platform, backpressure shows up as bounded queues and concurrency limits (caps on how many run at once). These sit between the orchestrator, the dispatcher and the gateway. It also shows up as consumer lag on event streams such as Kafka (a system for streams of messages), where consumers pull at their own pace. Backpressure is a key part of cost control. A planner that can queue unlimited subtasks is also a tenant (customer) that can spend unlimited tokens. Queue depth and wait time per tenant are sent out as metrics. So capacity planning and alerts can follow the slowest stage.

## Step by step

1. Connect the producer and consumer with a bounded buffer.
1. The consumer empties the buffer at its own pace.
1. When the buffer is full, the producer's put or write waits.
1. Freed space releases the producer, and work flows again.

## Code sketch

```python
q = asyncio.Queue(maxsize=8)

async def orchestrator(plan):
    for task in plan.subtasks:
        await q.put(task)   # waits when full

async def dispatcher():   # start 4 of these
    while True:
        task = await q.get()
        try:
            await run_subagent(task)
        finally:
            q.task_done()
```

## Be careful

An unbounded queue anywhere in the chain breaks backpressure. The producer never feels the push, and memory grows until the process dies.

## Diagram

![Fig. 3.10: A full buffer makes the producer wait instead of piling up work.](/diagrams/backpressure.svg)
