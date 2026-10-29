---
id: transactional-outbox
number: "7.07"
title: Transactional Outbox
chapter: safety
fit: adapted
figure_number: Fig. 7.07
figure_caption: "The decision and the pending action commit together, and the relay acts afterwards."
diagram: transactional-outbox.svg
analogy_title: "The solicitor's dispatch ledger"
---
## Gist

Write the planned side effect to an outbox in the same transaction as the transcript turn, then let a relay carry it out.

## Everyday comparison

### The solicitor's dispatch ledger

When a solicitor finishes a letter, the clerk files the copy and writes it in the dispatch ledger in one motion. A runner works down the ledger. The runner posts each unposted letter and ticks it off. If the runner is off sick, the ledger still shows what must go. If the office floods mid-round, the ticks show exactly where to start again.

## Classic meaning

Outgoing messages are stored in a database outbox, inside the same business transaction. A separate relay publishes them. This gives at-least-once delivery without two-phase commit, a slow protocol that makes two systems agree.

## In the agent system

Say an agent decides to post a chat message or create a ticket. The harness does not call the outside API right then. It opens one database transaction, a group of writes that all succeed or all fail together. In it, the harness adds the assistant turn to the transcript. It also inserts an outbox row. The row holds the action, its arguments and an idempotency key (a label that makes a repeat safe). A relay worker polls the outbox. It carries out each pending action and marks it sent. Say the process dies after the commit. The relay finds the row on restart, so nothing is lost. Say it dies after sending but before marking. Then the idempotency key on the receiving side stops a duplicate.

## In a large company

Enterprise systems relay the outbox in one of two ways. One is polling with SELECT ... FOR UPDATE SKIP LOCKED, so several relays can share the work without taking the same row. The other is change data capture, which reads the database's change log. It uses Debezium's outbox event router to send rows into Kafka. The tool_result the model sees should say the action was queued, not done. Then the agent does not tell the user an email went out before it did. Failed rows retry with backoff, waiting longer each time. After that they move to a dead-letter state with an alert. The outbox also works as an audit record of every side effect the agent asked for.

## Step by step

1. In one transaction, save the transcript turn and an outbox row for the action.
1. Commit, and note that nothing has touched the outside world yet.
1. A relay reads pending outbox rows in order.
1. It does each action with its idempotency key and marks the row sent.

## Code sketch

```python
with db.transaction():
    db.insert('turns', turn)
    db.insert('outbox', {'id': key,
        'action': 'send_email', 'args': args,
        'status': 'pending'})

def relay():                 # separate worker
    for row in db.pending('outbox'):
        run_action(row, idem=row.id)
        db.mark_sent(row.id)
```

## Be careful

The outbox gives at-least-once delivery, not exactly-once. Pair it with an idempotent receiver, one that is safe to hit twice. Otherwise the relay's retries can repeat an action.

## Diagram

![Fig. 7.07: The decision and the pending action commit together, and the relay acts afterwards.](/diagrams/transactional-outbox.svg)
