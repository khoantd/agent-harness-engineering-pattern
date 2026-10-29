---
id: thread-specific-storage
number: "6.09"
title: Thread-Specific Storage
chapter: async
fit: adapted
review_id: rev-thread-specific-storage
figure_number: Fig. 6.09
figure_caption: "The same shared code reads a different slot, depending on which task runs it."
diagram: thread-specific-storage.svg
analogy_title: "Each cashier's own till drawer"
---
## Gist

Give each session its own slot for user id, budget and trace id, which shared code can read without passing it everywhere.

## Everyday comparison

### Each cashier's own till drawer

Six cashiers share one shop, one price list and one row of tills. Each logs in with their own key. The drawer that springs open is always theirs, with their own cash and takings. The screen in front of each cashier looks the same. The money is never mixed.

## Classic meaning

Code reads what looks like one global variable. But its value is private to the current thread or task.

## In the agent system

A harness server runs many sessions on one asyncio loop and a shared thread pool. Deep inside, a tool wrapper needs to know which session it serves. It needs the user id for permission checks. It also needs the token budget, the trace id and the sandbox path. A trace id is a label that links all the logs from one request. Passing all of these through every function would be messy. So the harness sets a contextvars.ContextVar at the start of each session task. A ContextVar is a Python variable whose value belongs to the current task. Any code running in that task can call session.get() and see its own values. This includes logging and the MCP client. It works even while another session's task takes turns on the same thread.

## In a large company

Enterprise harnesses keep tenant id, principal, roles and trace context in context variables. A tenant is one customer company. A principal is the user or service the action is for. OpenTelemetry's Python SDK also uses contextvars this way. OpenTelemetry is a standard for traces and metrics. So spans (timed steps) from shared code land under the right trace. Security decisions should fail closed when no context is set. Fail closed means deny when unsure. They must never fall back to a default tenant. Some context crosses a thread pool, process or queue boundary. That context must be passed explicitly. For example, put signed claims and W3C trace context on the job message. W3C trace context is a standard format for passing trace ids.

## Step by step

1. The server declares a ContextVar for session state.
1. Each session task sets it at the start with its own values.
1. Shared tool and logging code calls get() to read the current session.
1. The value goes away with the task, so nothing leaks to the next session.

## Code sketch

```python
session = ContextVar('session')

async def handle(req):
    session.set(Session(req.user, budget=5e4))
    await agent_loop(req)

def write_file(path, text):   # shared code
    s = session.get()
    s.sandbox.check(path)
```

## Be careful

The context follows asyncio tasks and asyncio.to_thread. It does not follow loop.run_in_executor or raw threads. Wrap those in copy_context().run. Otherwise the worker sees no session, or an old one.

## Diagram

![Fig. 6.09: The same shared code reads a different slot, depending on which task runs it.](/diagrams/thread-specific-storage.svg)
