---
id: active-object
number: "6.06"
title: Active Object
chapter: async
fit: direct
figure_number: Fig. 6.06
figure_caption: "Callers only add requests, and the task's own thread does all the work."
diagram: active-object.svg
analogy_title: "The assistant's in-tray"
---
## Gist

Give a scheduled task its own thread and request queue, so callers add requests and get futures back.

## Everyday comparison

### The assistant's in-tray

You do not interrupt the executive assistant in the middle of a task. You drop a note in their in-tray and keep a carbon copy as your receipt. They take notes from the tray one at a time. They put each answer in the sender's pigeonhole. Their work always happens at their own desk, never at yours.

## Classic meaning

Calling a method and running it are kept apart. A proxy (a stand-in object) turns each call into a request on an activation queue. A scheduler runs each request on the object's own thread and fills in its future (a placeholder for the result).

## In the agent system

Take a scheduled task such as a daily inbox triage (sorting the inbox). It runs as an active object. It owns a session, a transcript and a single worker thread or asyncio task. Callers never touch that session directly. A caller may be the cron trigger (a timer), a Run now button or another agent. Each one calls a proxy method, run(prompt). The proxy wraps the call as a request and puts it on the task's activation queue. Then it returns a future, a placeholder for the result that fills in later. The task's scheduler takes requests in order. It runs each turn against the task's own session. Then it resolves (fills in) the matching future.

## In a large company

At platform scale, the active object becomes a durable single writer per session. Durable means it survives crashes. Single writer means only one owner changes the session. One example is a Temporal workflow per scheduled task. It receives Run now requests as signals (messages to a running workflow). It handles them one at a time. Each session is pinned to one owner by a lease (a time-limited lock) or a partition key. This stops two pods (server units) from running turns against the same transcript. The scheduled task runs under a service identity, an account for software rather than a person. That identity is limited to what its owner approved. The harness records who sent each request, for audit.

## Step by step

1. A caller calls proxy.run(prompt) and gets a future.
1. The proxy puts a method request on the activation queue.
1. The scheduler on the task's thread takes the next request.
1. The servant (the object that does the real work) runs the turn in its own session and resolves the future.

## Code sketch

```python
class ScheduledTask:          # proxy side
    def run(self, prompt):
        fut = Future()
        self.q.put((prompt, fut))
        return fut

    def _loop(self):          # own thread
        while True:
            prompt, fut = self.q.get()
            out = self.session.turn(prompt)
            fut.set_result(out)
```

## Be careful

Code running on the task's own thread must never call the task's proxy and wait on the future. It deadlocks (gets stuck forever), because the request waits in line behind itself.

## Diagram

![Fig. 6.06: Callers only add requests, and the task's own thread does all the work.](/diagrams/active-object.svg)
