---
id: idempotent-consumer
number: "7.06"
title: Idempotent Consumer
chapter: safety
fit: direct
review_id: rev-idempotent-consumer
figure_number: Fig. 7.06
figure_caption: "A redelivery that finds its key done stops, and one that finds it pending retries with the same key."
diagram: idempotent-consumer.svg
analogy_title: The cheque serial number
---
## Gist

Record each trigger firing's key before acting, so a message delivered twice is recognised and the email is never sent twice.

## Everyday comparison

### The cheque serial number

Every cheque has a serial number. Say the same cheque is paid in twice, by mistake or by a second phone scan of the same paper. The bank checks the number against the ones it has already cleared. It refuses the copy. The account is charged once, however many times the cheque turns up.

## Classic meaning

Some message systems deliver at least once, so a message may arrive twice. The consumer stays safe by tracking processed message ids and ignoring duplicates.

## In the agent system

Scheduled triggers, webhooks and queue messages arrive at least once. A worker can crash after sending an email but before it acks, which means telling the broker the message is handled. Then the broker delivers the message again. An idempotent consumer is safe to run twice with the same result. It builds a key from the business event, such as trigger id plus scheduled fire time. It claims that key in a processed table. The table has a unique constraint, so the database refuses duplicate keys. It also has a status column. If the row is already done, the consumer acks. It returns the stored result instead of running the agent again. If the row is still pending, an earlier attempt died part-way. So the consumer tries the send again with the same key. It passes that key to the email API as the idempotency key. The provider then drops any duplicate. The consumer acks only after it stores the result as done.

## In a large company

Enterprise agents that send email, file tickets or move money need effectively-once side effects. That means each action happens once in effect, even if messages repeat. It comes from three parts together. The first is at-least-once delivery. The second is a durable table of processed keys. The third is an idempotency key that the downstream system honours. An example is the Idempotency-Key header that payment APIs like Stripe accept. Provider-side keys expire after a retention window, a set storage period. So the local table must last longer than any possible redelivery. Some downstream systems have no idempotency support. Then the consumer checks for the effect before retrying, or sends the case to a human. Every attempt goes to the audit log.

## Step by step

1. A message arrives carrying a trigger id and fire time.
1. The consumer claims the key in the processed table, or reads the row that already holds it.
1. If the row is done, it acks and returns the stored result.
1. Otherwise it does the action, passing the key as the provider's idempotency key.
1. It marks the row done with the result, then acks.

## Code sketch

```python
def on_fire(msg):
    key = f'{msg.trigger_id}:{msg.fire_at}'
    row = db.claim('done', key)  # unique key
    if row.status == 'done':
        msg.ack()
        return row.result         # duplicate
    # new, or an earlier try crashed mid-send
    res = mail.send(draft, idem_key=key)
    db.finish('done', key, res)
    msg.ack()
```

## Be careful

Build the key from the business event, never from the delivery attempt. A fresh uuid (random id) for each retry makes every duplicate look new.

## Diagram

![Fig. 7.06: A redelivery that finds its key done stops, and one that finds it pending retries with the same key.](/diagrams/idempotent-consumer.svg)
