---
id: commander
number: "5.17"
title: Commander
chapter: multi-agent
fit: adapted
review_id: rev-commander
figure_number: Fig. 5.17
figure_caption: "The commander keeps retrying and logging until every step is done, without rolling back."
diagram: commander.svg
analogy_title: "The stage manager's cue calls"
---
## Gist

A commander agent pushes a multi-service job through to the end, retrying failed steps from a saved log until all succeed.

## Everyday comparison

### The stage manager's cue calls

During the show, the stage manager calls each cue over the headset: 'lights twelve, go'. Then she waits to hear 'lights done'. If the sound desk does not answer, she calls again, and keeps calling until it does. She ticks every confirmed cue in the prompt book. So if she is replaced at the interval, her deputy knows exactly where the show is.

## Classic meaning

A coordinator manages a job that spans several services. It tracks the state of each step and retries failures, waiting longer each time (backoff). It records progress so it can pick up again after a crash.

## In the agent system

Publishing a release takes three steps. Push a tag to the repository service, upload a package to a registry, and post release notes through a messaging connector. Unlike a saga, the commander aims to finish rather than undo. Say the registry returns a 503 (a 'service unavailable' error). The commander schedules that step to try again later with backoff, and it keeps the tag. It writes each step's state to a durable transaction log (a record saved so it survives a crash). So if the harness restarts, it picks up the half-finished job. A step that uses up its retries goes to a person through the approval UI.

## In a large company

In company platforms, the commander is usually a durable workflow engine such as Temporal or Step Functions. Its retry rules, timeouts and saved history act as the transaction log directly. Every call carries an idempotency key. So retries after a 429 (too many requests), a 503 or a timeout cannot publish twice. Errors that retrying cannot fix go straight to a human approval or incident queue. Runbooks (written procedures for operators) say who owns a job that has been sent to a person. The saved log also serves as audit evidence for change management.

## Step by step

1. The commander records a new job and its steps as pending.
1. It calls each service in turn and records every success.
1. A failed step is tried again later with backoff.
1. Retries go on until every step succeeds, or a step goes to a person after its retry limit.

## Code sketch

```python
txn = log.resume_or_begin(tid, STEPS)
for step in txn.pending():
    key = f'{tid}:{step}'  # idempotency
    for n in range(MAX_TRIES):
        r = call(step, txn.data, key=key)
        if r.ok:
            log.mark(txn, step, 'done')
            break
        if not r.retryable:  # e.g. 400
            break
        await sleep(r.retry_after
                    or backoff(n))
    if not txn.is_done(step):
        return escalate(txn, step)
```

## Be careful

Retrying until success is safe only for idempotent steps (safe to run twice with the same result). So give every call an idempotency key (a unique id that marks a repeat). Otherwise a retry may publish the package twice.

## Diagram

![Fig. 5.17: The commander keeps retrying and logging until every step is done, without rolling back.](/diagrams/commander.svg)
