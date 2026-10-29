---
id: leader-election
number: "5.08"
title: Leader Election
chapter: multi-agent
fit: direct
review_id: rev-leader-election
figure_number: Fig. 5.08
figure_caption: "An atomic lease picks one leader. When it expires, the next one takes over with a higher term."
diagram: leader-election.svg
analogy_title: The conclave and the white smoke
---
## Gist

Let a group of identical agents agree on exactly one coordinator, and pick a new one automatically when it disappears.

## Everyday comparison

### The conclave and the white smoke

The cardinals lock themselves in the chapel and vote until one name has the required majority. They burn the ballots after each round. Black smoke means no decision yet. White smoke tells the crowd there is one leader. When that leader dies, the same steps run again, and nobody acts as leader in between.

## Classic meaning

A group of machines (nodes) runs a shared method to choose one node to coordinate them. When that node fails, they choose a replacement.

## In the agent system

Several copies of the harness may share a task queue or run the same scheduled task. Exactly one of them should coordinate. It splits the work, sends reminders and writes the daily summary. Each copy tries to get a lease in a shared store. A lease is a database row or key-value lock with a TTL (a time limit after which it expires). The winner becomes leader and renews the lease while it is healthy. A term number goes up with each new leader. Workers reject commands from an older term. This stops a former leader that was paused from acting on old authority. If the leader's process crashes, its lease expires and another copy wins the next try.

## In a large company

Company harnesses get leases from a store with linearizable compare-and-set. That means a write happens only if the value is still what you expect, and every reader sees the same order of changes. Examples are etcd, ZooKeeper, Consul or a Kubernetes Lease object. Teams use these instead of writing their own consensus (agreement) system. The systems the leader writes to must check the fencing term (the term number used as a guard). One way is a conditional write in the database. Without that check, a paused old leader can still cause duplicate side effects. Log and alert on changes of leader. Frequent changes, called flapping, usually mean an unhealthy node or a network partition (part of the network cut off from the rest).

## Step by step

1. Each agent copy tries to get the coordinator lease with a TTL.
1. One succeeds, gets a new term number and starts coordinating.
1. The leader renews the lease while healthy. The others keep retrying quietly.
1. If renewals stop, the lease expires and the next copy to get it leads with a higher term.

## Code sketch

```python
while running:
    lease = store.try_acquire('coord', me,
                              ttl=30)
    while lease and lease.valid():
        # work in slices shorter than the TTL
        coordinate_step(fence=lease.term)
        lease = store.renew(lease)  # or None
    await sleep(10)
```

## Be careful

Never choose a leader by comparing clocks or by asking the model to pick one. Use an atomic lease (one that is taken in a single step that cannot be split) in a store that gives every copy the same answer.

## Diagram

![Fig. 5.08: An atomic lease picks one leader. When it expires, the next one takes over with a higher term.](/diagrams/leader-election.svg)
