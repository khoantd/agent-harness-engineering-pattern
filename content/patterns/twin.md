---
id: twin
number: "13.04"
title: Twin
chapter: idioms
fit: adapted
figure_number: Fig. 13.04
figure_caption: "Two halves, each with its own parent, linked to each other and to one state."
diagram: twin.svg
analogy_title: The twins who run a corner shop
---
## Gist

Pair sync and async clients as two linked objects over one shared state, instead of one class that inherits from both.

## Everyday comparison

### The twins who run a corner shop

Two siblings run one shop. One serves at the counter, where customers stand and wait for their change. The other answers the phone, takes orders and calls back when they are ready. Each is trained for their own job. But they share one order book, and either can hand a customer to the other.

## Classic meaning

Twin handles a class that would need two parents. It uses a pair of objects instead. Each extends one parent and holds a reference to the other, and together they act as one.

## In the agent system

A model SDK usually ships two clients. Client is sync (each call blocks and waits), for scripts and notebooks. AsyncClient is async (calls can wait without blocking), for the harness's event loop (the part that runs many async tasks). One class that inherits from both a blocking HTTP base and an async base would clash. Method names and event-loop assumptions would collide. As twins, each client extends its own transport base. They hold references to each other and to shared parts. These are settings, credentials, rate-limit state and the usage meter. So a sync tool in a worker thread and the async agent loop share one view of the quota. Either side can reach its twin.

## In a large company

In an enterprise platform, sync and async twins often share rate-limit state, a usage meter and credentials. The credentials are rotated from Vault or a cloud KMS (key management service). Worker threads and the event loop touch the shared part at the same time. So it must be thread-safe, using a threading lock, not an asyncio one. Keeping metering and policy in the shared state means each tenant's budget is enforced the same way, whichever twin made the call. A tenant is one customer company. Contract tests run the same scenarios through both twins, so their behaviour cannot drift.

## Step by step

1. Build the shared state once: settings, credentials and usage meter.
1. Create a SyncClient on the blocking transport and an AsyncClient on the async one.
1. Link each client to the other and to the shared state.
1. Code in either world uses its own client, or reaches the twin through .aio or .sync.

## Code sketch

```python
class SyncClient(HttpTransport):
    def create(self, **req):
        return self.post(PATH, req)

class AsyncClient(AsyncTransport):
    async def create(self, **req):
        return await self.post(PATH, req)

def make_clients(cfg):
    st = Shared(cfg)       # keys, meter
    s, a = SyncClient(st), AsyncClient(st)
    s.aio, a.sync = a, s   # the twin links
    return s, a
```

## Be careful

Keep the twins thin. If logic is copied into both instead of living in the shared part, sync and async behaviour will drift apart.

## Diagram

![Fig. 13.04: Two halves, each with its own parent, linked to each other and to one state.](/diagrams/twin.svg)
