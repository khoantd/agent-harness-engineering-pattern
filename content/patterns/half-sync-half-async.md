---
id: half-sync-half-async
number: "6.13"
title: Half-Sync/Half-Async
chapter: async
fit: adapted
review_id: rev-half-sync-half-async
figure_number: Fig. 6.13
figure_caption: "Blocking code above, non-blocking code below, and a queue in between."
diagram: half-sync-half-async.svg
analogy_title: The clinic desk and the lab
---
## Gist

Let clients use simple blocking calls while the backend runs model streams and tool calls asynchronously, joined by a queue.

## Everyday comparison

### The clinic desk and the lab

At the clinic desk you hand over a blood sample and fill in a form. Patients are seen one at a time, in plain step-by-step order. The sample goes into a rack. Behind the wall, machines test hundreds of samples at once, in whatever order suits them. Results come back through the rack to the desk. The desk reads yours out to you.

## Classic meaning

Concurrent work is split into three layers. A synchronous layer keeps code simple. An asynchronous layer handles I/O (input and output) efficiently. A queue sits between them.

## In the agent system

An SDK or CLI offers a blocking call: result = agent.run(prompt). A blocking call waits until the answer is ready. It is easy to script and test. Underneath, the harness runs an asyncio backend. It is asynchronous, meaning it handles many things at once without waiting on each one. It streams from the model, starts many tool calls at once and juggles many sessions. A thread-safe bridge sits between the two sides. The sync side schedules a request on the event loop. Then it waits on a reply future (a placeholder for the answer). The async side picks up the request, does the concurrent work and fills in the future. Neither side has to adopt the other's style of programming.

## In a large company

Enterprise deployments usually put an async gateway in front. It accepts WebSocket, webhook and SSE traffic on an event loop. These are kinds of live or pushed web connections. It hands jobs through a queue to synchronous worker processes. These run tools and sandboxes with plain blocking code. The queue in the middle is where the platform enforces backpressure, per-tenant quotas and deadlines. Backpressure means slowing down senders when the system is full. A tenant is one customer company sharing the platform. Timeouts on the sync side must cancel the async work. Otherwise abandoned requests keep spending the tenant's token budget.

## Step by step

1. The sync layer gets a call and places a request on the bridge.
1. It blocks on the reply future for that request.
1. The event loop takes the request and runs model streams and tool calls at the same time.
1. It fills in the future, and the sync caller wakes with a plain return value.

## Code sketch

```python
# sync half: simple and blocking
def run(prompt):
    fut = asyncio.run_coroutine_threadsafe(
        backend_run(prompt), loop)
    try: return fut.result(timeout=600)
    finally: fut.cancel()   # no-op if done

# async half: one loop, many sessions
async def backend_run(prompt):
    async with asyncio.TaskGroup() as tg:
        async for ev in model.stream(prompt):
            if ev.tool_use:
                tg.create_task(run_tool(ev))
```

## Be careful

Never call the blocking API from inside the async layer. It would block the event loop while waiting for work that only that same loop can do.

## Diagram

![Fig. 6.13: Blocking code above, non-blocking code below, and a queue in between.](/diagrams/half-sync-half-async.svg)
