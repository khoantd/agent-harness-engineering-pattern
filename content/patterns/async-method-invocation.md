---
id: async-method-invocation
number: "6.02"
title: Async Method Invocation
chapter: async
fit: direct
review_id: rev-async-method-invocation
figure_number: Fig. 6.02
figure_caption: "The invoker returns a task id now and delivers the result later, by polling or by callback."
diagram: async-method-invocation.svg
analogy_title: Dropping film at the photo lab
---
## Gist

Start a slow job, like a background subagent, get a future (a claim ticket for the result) at once, and collect the result later.

## Everyday comparison

### Dropping film at the photo lab

You hand your roll of film over the counter. You get a numbered claim stub. You do not stand there while the prints develop. You go and do your shopping. Later you come back with the stub and ask if they are ready. Or the lab phones the number on the stub. The stub is the only link between you and the job.

## Classic meaning

A method runs on another thread (a separate line of work). The caller gets a future or a callback hook right away while the work goes on.

## In the agent system

A subagent is a helper agent that the main agent starts for a task. Say the model calls a tool like run_in_background, or starts a background subagent. The harness hands the job to an executor (the part that runs jobs). It puts a task id in the tool_result straight away. A tool_result is the message that carries a tool's answer back to the model. The model reads that result on its next step. It then goes on with other tool calls while the job runs. Later it has three ways to get the result. It can poll (ask again and again) a status tool with the id. It can await the future, which means wait for it to finish. Or a completion callback can add the result to the transcript as a new message. The transcript is the saved record of the conversation. The invoker (the part that started the job) owns the job and records it against the session. So it can cancel the job and enforce a timeout. It can also refuse status requests for task ids that belong to another session.

## In a large company

Enterprise platforms run background agent jobs on a durable engine, one that survives crashes and restarts. Examples are Temporal or a fleet of workers fed by a queue. They do this because an in-process future dies with the pod (the small server unit that runs the code) during a deploy. The task id acts as a capability, a token that grants access by itself. So status and cancel calls must check that the caller's tenant (customer company) and session own it. Otherwise one user can read another user's results. Every job carries a deadline and a token budget charged to the tenant. It also carries trace context, so the background span (one timed step in a trace) links to the turn that started it.

## Step by step

1. The model calls run_in_background with a task description.
1. The invoker hands the job to an executor and returns a task id at once.
1. The model makes other tool calls while the job runs.
1. It polls the status tool, or a done-callback adds the result to the transcript.

## Code sketch

```python
fut = executor.submit(run_subagent, task)
jobs[(session.id, fut.id)] = fut
return {'task_id': fut.id}

# later: look up by id within this session
fut = jobs[(session.id, task_id)]
if fut.done():
    report = fut.result()
else:
    fut.add_done_callback(inject_result)
```

## Be careful

A background job that nobody waits for or cancels leaks, which means it keeps using resources. Track every future per session. When the session ends, cancel or report any jobs still running.

## Diagram

![Fig. 6.02: The invoker returns a task id now and delivers the result later, by polling or by callback.](/diagrams/async-method-invocation.svg)
