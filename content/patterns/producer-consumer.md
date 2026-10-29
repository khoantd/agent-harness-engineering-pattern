---
id: producer-consumer
number: "6.04"
title: Producer-Consumer
chapter: async
fit: direct
review_id: rev-producer-consumer
figure_number: Fig. 6.04
figure_caption: "Producers and consumers never meet, and the bounded buffer sets the pace for both."
diagram: producer-consumer.svg
analogy_title: The bakery cooling rack
---
## Gist

Many sources put agent jobs into a bounded (size-limited) buffer, and a separate set of workers takes them off at its own pace.

## Everyday comparison

### The bakery cooling rack

Bakers slide fresh trays onto a tall cooling rack. Shop staff lift trays off the other side to stock the counter. Nobody hands bread from person to person. When every shelf is full, the bakers wait. When the rack is empty, the staff wait. The number of shelves decides how far ahead the ovens can run.

## Classic meaning

Producers and consumers share a bounded buffer instead of talking directly. Producers wait when it is full, and consumers wait when it is empty.

## In the agent system

Agent jobs come from many places. Webhook handlers produce them. A webhook handler is code that runs when another service sends an event. Scheduled tasks fired by cron (a timer) produce them. So do user messages from many sessions. These producers do not call the agent loop directly. Instead they put jobs on a bounded asyncio.Queue or a broker list. A bounded queue has a fixed maximum size. A broker is a separate service that holds messages. A fixed set of consumer workers take jobs off. Each one runs the model and tool calls, and stores the results. When the queue is full, producers wait or answer 429 (the HTTP code for 'too many requests'). This protects model rate limits and token budgets from sudden bursts.

## In a large company

Enterprise harnesses replace the in-memory queue with a durable broker such as Kafka, SQS or Pub/Sub. A durable broker keeps messages safe even if a server crashes. The worker acknowledges a job only after the turn is recorded. So if a worker crashes, the broker delivers its job again. A single shared queue lets one tenant's (customer company's) burst starve everyone else. So platforms use per-tenant queues or weighted fair scheduling. Each tenant also gets a concurrency cap, a limit on jobs running at once. The cap is tied to the tenant's model quota. Two numbers drive autoscaling and SLO alerts (alerts on reliability targets). They are the queue depth and the age of the oldest job.

## Step by step

1. Producers wrap incoming work as job messages.
1. They put jobs on a bounded queue, and wait if it is full.
1. Consumers take one job at a time, and wait if it is empty.
1. Each consumer runs the agent turn and records the result.

## Code sketch

```python
jobs = asyncio.Queue(maxsize=100)

async def on_webhook(evt):     # producer
    try:
        jobs.put_nowait(Job.from_event(evt))
    except asyncio.QueueFull:
        return 429             # shed load

async def worker():            # consumer
    while True:
        job = await jobs.get()
        try: await run_agent(job)
        finally: jobs.task_done()
```

## Be careful

An unbounded queue (one with no size limit) hides overload until memory runs out. Always set a size. Then decide whether producers wait, drop the job or reject it.

## Diagram

![Fig. 6.04: Producers and consumers never meet, and the bounded buffer sets the pace for both.](/diagrams/producer-consumer.svg)
