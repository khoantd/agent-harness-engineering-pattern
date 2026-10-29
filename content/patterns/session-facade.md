---
id: session-facade
number: "8.18"
title: Session Facade
chapter: architecture
fit: direct
review_id: rev-session-facade
figure_number: Fig. 8.18
figure_caption: "One remote call goes in, many local calls run behind the facade, and one handle comes out."
diagram: session-facade.svg
analogy_title: The interlibrary loan desk
---
## Gist

Offer one big remote call that does a whole job on the server, so clients do not chain many small calls.

## Everyday comparison

### The interlibrary loan desk

You fill in one slip at the library desk: this book, by Friday. The librarian searches the regional catalogue and requests it from another branch. The librarian books it onto the van, checks it out to your card and texts you when it arrives. Doing those steps yourself would mean five queues and three phone calls.

## Classic meaning

A facade (a single front door) on the server that wraps many small business objects behind a few big operations. It cuts the number of remote calls and keeps the workflow logic on the server.

## In the agent system

Without a facade, an SDK client would make five calls. It would create a session, upload files, register tools, set the system prompt and then send the first turn. That is five round trips, and any one can fail halfway. A start_task(spec) endpoint on the server does all of it in one call. It returns a session handle plus the event stream. Files and the runtime live outside the session database, so one database transaction cannot cover them. So the facade creates the session as "pending". It only turns it on when every step succeeds, and it cleans up on failure. An idempotency key on the request makes client retries safe. (That key makes a repeated request safe to run twice.) The small internal APIs for the session store, file service and runtime stay hidden and can change freely. Waiting time drops, and half-set-up sessions disappear.

## In a large company

Large platforms offer big operations like start_task to integration teams and workflow tools. This cuts chatty traffic across regions. It also keeps the order of policy checks on the server. The facade is a good place to apply tenant policy once for the whole job. (A tenant is one customer company.) That covers allowed tools, the data class of uploaded files, DLP scanning (checks that catch leaks of sensitive data) and reserving budget. For long jobs it usually starts a durable workflow in Temporal or AWS Step Functions and returns a handle. (A durable workflow survives crashes and restarts.) Then the engine handles retries and compensation (undoing steps after a failure). The risk is a facade that quietly grants every tool the request asks for. So it must only grant requested tools that the tenant and caller are both allowed to use.

## Step by step

1. The client sends one start_task request with the prompt, files and tool list.
1. The facade creates the session and stores the files.
1. It sets up tools and starts the first turn on the runtime.
1. It returns a single handle and event stream to the client.

## Code sketch

```python
@api.post('/v1/tasks')
def start_task(spec):
    with uow:
        s = sessions.create(spec.owner)
        files.attach(s.id, spec.files)
        runtime.configure(s.id, spec.tools)
    stream = runtime.run_turn(s.id, spec.prompt)
    return TaskHandle(s.id, stream)
```

## Be careful

A facade might grow a flag for every variation. Then it becomes one giant procedure. Keep a few well-named big operations, and let unusual clients use the internal APIs.

## Diagram

![Fig. 8.18: One remote call goes in, many local calls run behind the facade, and one handle comes out.](/diagrams/session-facade.svg)
