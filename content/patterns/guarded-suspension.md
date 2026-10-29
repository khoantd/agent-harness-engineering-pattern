---
id: guarded-suspension
number: "6.10"
title: Guarded Suspension
chapter: async
fit: direct
review_id: rev-guarded-suspension
figure_number: Fig. 6.10
figure_caption: The tool call sleeps at the gate until the guard turns true.
diagram: guarded-suspension.svg
analogy_title: A train held at a red signal
---
## Gist

Pause an action until its condition is true, such as waiting for the user's approval before running a risky tool.

## Everyday comparison

### A train held at a red signal

A driver reaches a red signal and stops. They do not creep forward or guess. They wait. When the signaller clears the track ahead, the light turns green and the train moves off. If the light flickers, the driver checks it again before releasing the brake.

## Classic meaning

A method call is blocked until a guard condition becomes true. It waits on a condition variable (a signal that threads can wait for). It checks the condition again after each wake-up.

## In the agent system

Some tools need permission, such as sending an email or deleting files. When the model calls one, the harness records a pending approval. It then suspends (pauses) that tool call on a condition. The chat UI shows an approval card. The user clicks Allow or Deny. The UI handler sets the decision and notifies the waiting coroutine. A coroutine is a function that can pause and resume. It checks the guard again. Then it either runs the tool or returns a denial as the tool_result (the answer sent back to the model). A timeout turns a long silence into a denial. So the call never hangs forever.

## In a large company

In an enterprise platform, an approval can wait for hours. So the harness saves the pending call and frees the worker and the sandbox (the isolated space where tools run). It resumes when the decision comes in, through a durable mechanism that survives restarts. Examples are a Temporal signal or a Step Functions task token. The approval is tied to a hash (a fingerprint) of the exact tool name and arguments. So the agent cannot change the email after it was approved. The approver's identity is checked against RBAC (role-based access control: permissions given by job role). Separation of duties applies to high-risk actions, so the person who asks is not the one who approves. Every decision goes to the audit log, including timeouts.

## Step by step

1. The tool call reaches the gate while its decision is still unset.
1. The harness posts an approval card and waits on a condition.
1. The user's click sets the decision and wakes the waiter.
1. The call wakes, checks the guard again, and runs or returns a denial.

## Code sketch

```python
async def guarded_run(call, ttl=300):
    try:
        async with asyncio.timeout(ttl), cond:
            await cond.wait_for(
                lambda: call.decision)
    except TimeoutError:
        call.decision = 'deny'  # default deny
    if call.decision != 'allow':
        return denied(call)
    return await call.tool.run(call.args)
async def on_click(call, choice):   # UI
    async with cond:
        call.decision = choice
        cond.notify_all()
```

## Be careful

Always pair the wait with a timeout that denies by default. Otherwise a forgotten approval card holds a worker and a sandbox forever.

## Diagram

![Fig. 6.10: The tool call sleeps at the gate until the guard turns true.](/diagrams/guarded-suspension.svg)
