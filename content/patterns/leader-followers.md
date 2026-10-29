---
id: leader-followers
number: "5.07"
title: Leader-Followers
chapter: multi-agent
fit: adapted
review_id: rev-leader-followers
figure_number: Fig. 5.07
figure_caption: "Leadership rotates. The leader claims a task, promotes a follower, and rejoins the line when done."
diagram: leader-followers.svg
analogy_title: The taxi rank
---
## Gist

Worker agents take turns. One leader watches the task queue, claims the next task, then makes a follower the new leader.

## Everyday comparison

### The taxi rank

Cabs queue nose to tail outside the station. Only the cab at the front picks up the next passenger. As it pulls away, the cab behind rolls forward and becomes the one to take the next fare. When the first driver drops off the passenger, they rejoin the back of the line.

## Classic meaning

A pool of threads (units of work inside one program) shares a set of event sources. One leader waits for an event. When one comes, it makes a follower the new leader, then handles the event itself.

## In the agent system

A group of identical worker agents serves a shared queue of tasks, such as new tickets or scheduled code reviews. Only the current leader checks the queue. So idle workers do not all hit it at once, and two workers never claim the same task. When the leader claims a task, it first hands leadership to the next idle worker. Only then does it start its long model and tool calls. So someone is always watching the queue. When the worker finishes, it writes the result and rejoins the followers.

## In a large company

Inside one harness process, a leader-followers pool stops a thundering herd (many idle workers rushing the queue at once). But across machines, companies almost always use competing consumers. They use SQS, Pub/Sub or Kafka consumer groups (message services where workers share one queue). Visibility timeouts or leases take the place of the leader token. Either way, a claimed task needs a lease and a dead-letter path (a place where failing tasks go to be looked at). Worker counts are capped per tenant (per customer company), so one customer cannot take over the whole pool. Alert on queue length and on how long tasks wait to be claimed. These are the SLO measures (measures for the reliability target).

## Step by step

1. One idle worker holds the leader token and waits on the task queue.
1. A task arrives and the leader claims it.
1. The leader passes the token to the next follower, who starts waiting on the queue.
1. The former leader does the task, writes the result and rejoins the followers.

## Code sketch

```python
async def worker(me, pool, queue):
    while True:
        await pool.wait_until_leader(me)
        task = await queue.claim()
        pool.promote_next()   # hand off lead
        out = await run_agent('review', task)
        results.write(task.id, out)
        pool.rejoin(me)
```

## Be careful

Leader-followers works inside one process (one running program). If the leader crashes after claiming a task but before passing the token, nobody watches the queue. So give the token a lease (a hold that expires unless renewed). For workers on several machines, use competing consumers instead. That means all workers read from one queue that hides a claimed message for a set time (a visibility timeout).

## Diagram

![Fig. 5.07: Leadership rotates. The leader claims a task, promotes a follower, and rejoins the line when done.](/diagrams/leader-followers.svg)
