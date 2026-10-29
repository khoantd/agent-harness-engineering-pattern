---
id: lockable-object
number: "6.15"
title: Lockable Object
chapter: async
fit: direct
review_id: rev-lockable-object
figure_number: Fig. 6.15
figure_caption: The holder keeps the lock across several steps while others are turned away.
diagram: lockable-object.svg
analogy_title: The community hall key
---
## Gist

Let a caller lock a session object across a change of several steps, so other writers wait or back off until it is released.

## Everyday comparison

### The community hall key

A group that books the village hall signs out its single key at the shop. They keep it all evening while they set up, use and tidy the hall. Anyone else who turns up sees the group's name next to the key in the book. They either wait or come back tomorrow. Whoever holds the key owns the hall until it is handed back.

## Classic meaning

An object has explicit lock and unlock operations and records who holds it. A caller can hold it across several operations.

## In the agent system

Compaction shrinks a session's transcript by summarising it. It rewrites the transcript in several steps. First it takes a snapshot. Then it summarises with the model, replaces old turns and updates token counts. Locking each method on its own is not enough. Messages that arrive between steps would be lost. So the session is a lockable object. The compactor calls lock(owner='compactor') and holds it across all steps. Meanwhile the UI's append calls try_lock. It sees who holds the lock and saves the message for later. The lock records its owner and an expiry time. So a crashed holder cannot keep it forever.

## In a large company

Across replicas (copies on different hosts), the lock is a lease in a shared store. Examples are a Postgres row with an expiry or an etcd lease. Every write the lock protects carries a fencing token. The token is a number that only ever goes up, and the store checks it. The harness records the holder's identity, lease time and renewals. So operators can see who holds a session. They can break a stale hold through an audited admin action. Holders should be service identities (accounts for software), not browser connections. Then a client that disconnects cannot pin a tenant's session, which would keep a customer's session locked.

## Step by step

1. A caller locks the session with its owner id and becomes the holder.
1. It does several operations while holding the lock.
1. Other callers' try_lock reports the holder, so they wait or put off their work.
1. The holder unlocks, or the lease runs out, and the next caller goes ahead.

## Code sketch

```python
lease = session.try_lock('compactor', ttl=60)
if lease:
    try:
        snap = session.snapshot()
        summary = model.summarise(snap)
        # refused if the lease has expired
        session.replace_old_turns(
            summary, fence=lease.token)
    finally:
        session.unlock(lease)
else:
    log.info(f'held by {session.holder}')
```

## Be careful

A lock held across a model call can outlive its lease (its time limit). So renew the lease while working. Also have the store reject writes that carry a stale fencing token. A fencing token is a number that goes up with each new lease. Without these, an expired holder can overwrite newer messages.

## Diagram

![Fig. 6.15: The holder keeps the lock across several steps while others are turned away.](/diagrams/lockable-object.svg)
