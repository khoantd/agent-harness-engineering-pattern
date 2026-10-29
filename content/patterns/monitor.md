---
id: monitor
number: "6.14"
title: Monitor
chapter: async
fit: direct
figure_number: Fig. 6.14
figure_caption: "One caller is inside at a time, and waiters park in the wait set until notified."
diagram: monitor.svg
analogy_title: The rare-books reading room
---
## Gist

Wrap shared session state in an object whose methods run one at a time, with wait and notify for conditions.

## Everyday comparison

### The rare-books reading room

Only one reader may be in the rare-books room at a time. The attendant at the door makes sure of it. Say you go in, but the book you need is still away being repaired. You step out to the bench and wait. When the book comes back, the attendant calls the waiting readers. One goes back in to check again.

## Classic meaning

An object lets only one thread run its methods at a time, which is called mutual exclusion. It also has condition variables, so threads can wait inside it for the state to change.

## In the agent system

A session has shared state: the message list, the token count and pending tool calls. Several parts touch it, such as the stream reader, tool workers and the UI handler. Making it a monitor means every method takes the same lock. The methods include append, add_tokens and end_turn. So no caller ever sees half an update. Some methods need a condition to be true first. One is wait_idle, used before compaction (shrinking the history by summarising it). It waits on a condition variable inside the monitor. A notify call wakes it when the turn ends.

## In a large company

A monitor guards state inside one process. But several replicas (copies on different hosts) may touch a session. Then the same rule moves to the database as optimistic concurrency. With optimistic concurrency, each write checks a version column or ETag. The write fails if someone changed the record first. Another option is a single-writer owner per session. It is worth exporting lock wait and hold times as metrics. When callers fight over a session object's lock, users see a slow UI. Never make network calls, remote policy checks or model calls while holding the monitor.

## Step by step

1. Callers call methods on the SessionState monitor.
1. Each method enters by taking the monitor's single lock.
1. A method whose condition is false waits and lets go of the lock.
1. A state change calls notify, and a waiter enters again and re-checks.

## Code sketch

```python
class SessionState:            # a monitor
    def append(self, m):
        with self.cv:
            self.msgs.append(m)
    def end_turn(self):
        with self.cv:
            self.busy = False
            self.cv.notify_all()
    def wait_idle(self):
        with self.cv:
            self.cv.wait_for(self.idle)
```

## Be careful

Keep monitor methods short. Never call the model or a tool while holding the lock. Otherwise every other caller stalls behind the network.

## Diagram

![Fig. 6.14: One caller is inside at a time, and waiters park in the wait set until notified.](/diagrams/monitor.svg)
