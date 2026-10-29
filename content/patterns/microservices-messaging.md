---
id: microservices-messaging
number: "5.14"
title: Microservices Messaging
chapter: multi-agent
fit: direct
figure_number: Fig. 5.14
figure_caption: The sender only needs the channel to be up. Acknowledgements and the dead-letter queue stop messages from vanishing.
diagram: microservices-messaging.svg
analogy_title: "The department store's pneumatic tubes"
---
## Gist

Agent services talk through message channels, so a sender posts work and moves on without waiting for the receiver.

## Everyday comparison

### The department store's pneumatic tubes

A shop assistant rolls the cash and the receipt into a canister. She drops it into a tube and turns to the next customer. The canister shoots off to the counting house, which deals with it when it can. If the counting house is busy, canisters pile up in its basket. None are lost, and the shop floor never waits.

## Classic meaning

Services talk by sending messages over channels such as queues or streams, without waiting for a reply. So neither side needs the other to be running at the same moment.

## In the agent system

A research service and a writing service each run as their own agent deployment. A durable queue (one that saves messages so they survive a crash) called research.results connects them. The research agent sends a message with its findings and a correlation id (a tag that links related messages). Then it picks up its next job without waiting. The writer reads messages at its own pace. It acknowledges each one (confirms it is done) only after it has saved its draft. Messages that are not acknowledged are delivered again. A message that keeps failing moves to a dead-letter queue (a holding place for problem messages). A person or a repair agent can look at it there.

## In a large company

In company agent platforms, the channels are Kafka, RabbitMQ, SQS or Pub/Sub. The producer uses a transactional outbox (it writes the message in the same database step as its own change). So a message is sent only if its database write succeeds. Messages carry a correlation id, a tenant id (which customer company) and W3C trace context in headers. W3C trace context is a standard tag that links all the work in one request. Consumers drop duplicates using an idempotency key (a unique id that marks a repeat). Dead-letter queues have alerts and an owner. Messages are encrypted with keys managed by KMS (a key management service). They are kept no longer than the retention policy allows.

## Step by step

1. The producer agent sends a message with a correlation id to the channel.
1. The channel saves it durably, and the producer moves on.
1. The consumer receives the message, does the work and acknowledges it.
1. Unacknowledged messages are delivered again, and repeated failures go to a dead-letter queue.

## Code sketch

```python
# research service
chan.send('research.results',
    {'cid': job.id, 'findings': notes})

# writer service
for msg in chan.consume('research.results'):
    try:
        draft = write(msg.body['findings'])
        drafts.save(msg.body['cid'], draft)
        msg.ack()
    except Exception:
        msg.nack()   # redeliver, then DLQ
```

## Be careful

Channels deliver at least once, so a message may arrive twice. Consumers must cope with duplicates. For example, save each draft under its correlation id.

## Diagram

![Fig. 5.14: The sender only needs the channel to be up. Acknowledgements and the dead-letter queue stop messages from vanishing.](/diagrams/microservices-messaging.svg)
