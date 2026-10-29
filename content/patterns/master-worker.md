---
id: master-worker
number: "5.03"
title: Master-Worker
chapter: multi-agent
fit: direct
review_id: rev-master-worker
figure_number: Fig. 5.03
figure_caption: "The master owns the task table, so a lost task simply goes back to pending."
diagram: master-worker.svg
analogy_title: The orchard picking boss
---
## Gist

A master agent splits a big job into separate tasks, gives them to worker subagents, and collects or reassigns the results.

## Everyday comparison

### The orchard picking boss

At harvest the boss chalks a row number on each picker's bucket. She keeps a clipboard showing who has which row. Full crates come back to her trailer. When a picker goes home sick at noon, the boss crosses out that name. She gives the unfinished row to whoever is free next.

## Classic meaning

A master process splits work into tasks and hands them to a pool of workers. It gathers their results and gives a failed worker's task to another worker.

## In the agent system

Picture a migration agent that must update 300 files. It acts as master. It lists the files and groups them into batches. It starts one worker subagent (a helper agent) per batch, each with a brief and a token budget (a limit on how much text it may use). The master tracks each task's state (pending, running or done) in a task table. Workers send back a short result message, not their full transcripts. This keeps the master's context (the text its model can see) small. Sometimes a worker runs out of time, or its result fails a check. Then the master marks the batch pending again and gives it to the next free worker.

## In a large company

Company teams usually run the master as a durable workflow, using Temporal or AWS Step Functions (systems that save each step so work survives a crash). Workers run as activities (single steps of that workflow). So the task table survives a crash. Retries, timeouts and heartbeats (regular 'I am still alive' signals) are set in configuration instead of written by hand. Limits on how many workers run at once are set per tenant (per customer company). The LLM gateway (one shared front door to all AI models) enforces them again. So one large job cannot use up shared rate limits. Each worker run is tagged with the job id and cost centre for chargeback (billing each team for its use). Batches that still fail after their retry limit go to a review queue instead of looping forever.

## Step by step

1. The master splits the job into separate tasks and records them as pending.
1. It starts workers up to a limit on how many run at once, one task each.
1. Each worker runs in its own context and returns a short result.
1. The master marks tasks done, puts failed or timed-out ones back, and stops when the table is complete.

## Code sketch

```python
state = {b.id: 'pending' for b in batches}
tries = Counter()
while not finished_all(state):
    free = MAX_WORKERS - running(state)
    for b in pending(state)[:free]:
        state[b.id] = 'running'
        spawn('migrator', b, timeout=600)
    for r in await next_results():  # incl.
        tries[r.id] += 1           # timeouts
        if r.ok and verify(r):
            state[r.id] = 'done'
        elif tries[r.id] >= 3:
            state[r.id] = 'failed'
        else: state[r.id] = 'pending'
```

## Be careful

Master-worker suits tasks that are truly independent and safe to run again. So run each worker in its own git branch or worktree (a separate copy of the files). Then a batch that is handed out again starts clean, and two workers never edit the same files.

## Diagram

![Fig. 5.03: The master owns the task table, so a lost task simply goes back to pending.](/diagrams/master-worker.svg)
