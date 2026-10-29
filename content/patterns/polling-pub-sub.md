---
id: polling-pub-sub
number: "5.13"
title: Polling Pub/Sub
chapter: multi-agent
fit: direct
review_id: rev-polling-pub-sub
figure_number: Fig. 5.13
figure_caption: Events wait in the store. The subscriber pulls whatever is newer than its cursor.
diagram: polling-pub-sub.svg
analogy_title: The post office box
---
## Gist

Publishers add events to a shared store, and each subscriber agent checks it on its own schedule using a saved cursor.

## Everyday comparison

### The post office box

Letters for you go into a numbered box at the post office. The postman never knocks on your door. You call in when it suits you, on the way to work or once a week. You take everything that arrived since your last visit. If you are away for two weeks, the letters simply wait.

## Classic meaning

Publishers write messages to a durable topic (one that is saved and survives crashes). Subscribers check from time to time and pull the messages that arrived after the last one they read.

## In the agent system

Some agents run as scheduled tasks or short sessions. They cannot keep a connection open for pushed messages. So the harness writes events to an append-only table or file (one where new items are only added at the end), with ids that keep going up. Each subscriber keeps a cursor, which is the id of the last event it handled. Each time it wakes up, it asks for events after that cursor. A subagent may have been asleep, crashed, or paused while waiting for user approval. It catches up on its next check. The cost is delay, up to the time between checks. There are also wasted calls when nothing has changed.

## In a large company

This is how many company agents read change feeds. A scheduled agent may read a transactional outbox table (a table of messages written in the same database step as the change). Or it may read a Kafka topic by consumer offset (its saved position). Or it may read a SaaS API's changes endpoint with a saved cursor. Cursors are stored per subscriber and per tenant (customer company) in a durable store. Handlers are idempotent, because at-least-once replay is normal. That means the same event may arrive more than once. How often to check is a cost decision. So platforms set it per tenant. They alert on consumer lag (how far behind a reader is) rather than on single failures.

## Step by step

1. A publisher adds an event with the next id in the sequence.
1. A subscriber wakes on its schedule and asks for events after its cursor.
1. It handles the returned events in order.
1. It saves the new cursor, so a restart picks up from the right place.

## Code sketch

```python
cursor = state.get('cursor', 0)
while True:
    events = store.read(topic='repo',
                        after=cursor)
    for ev in events:
        handle(ev)
        cursor = ev.id
    state.save('cursor', cursor)
    await sleep(POLL_SECONDS)
```

## Be careful

Save the cursor only after the events are handled successfully. Make handlers idempotent (safe to run twice with the same result), because a crash replays events. Do not trust raw database sequence ids as cursors. Transactions running at the same time can commit them out of order, so a reader may skip one.

## Diagram

![Fig. 5.13: Events wait in the store. The subscriber pulls whatever is newer than its cursor.](/diagrams/polling-pub-sub.svg)
