---
id: thread-pool-executor
number: "6.08"
title: Thread-Pool Executor
chapter: async
fit: direct
review_id: rev-thread-pool-executor
figure_number: Fig. 6.08
figure_caption: Work waits in a queue for a fixed set of reused workers instead of creating more threads.
diagram: thread-pool-executor.svg
analogy_title: The taxi rank
---
## Gist

Run tool calls or whole sessions on a fixed set of reusable workers, so extra load waits in a queue instead of creating endless threads.

## Everyday comparison

### The taxi rank

A rank has a fixed number of licensed cabs. Passengers join one queue at the stand. Each cab that pulls in takes whoever is at the front. On a busy night the queue grows. But the town never gets a hundred extra taxis clogging the streets. And no cab is built for one ride and then scrapped.

## Classic meaning

A pool of worker threads takes tasks from a shared queue. The threads are reused, and the pool caps how many tasks run at once.

## In the agent system

Sometimes the model returns several tool_use blocks in one turn. A tool_use block is the model's request to run one tool. The harness sends the independent, read-only ones to a ThreadPoolExecutor, with say max_workers=8. It runs calls that change shared state one at a time. Then it returns every result in the next user message as tool_result blocks. Each result is matched to its call by tool_use_id. A tool that fails becomes a tool_result with is_error set. is_error is a flag that marks the result as an error. So one bad call does not lose the results of the other calls. A server hosting many sessions uses the same idea at a larger scale. It runs N worker processes, each running one agent session at a time. Model request concurrency and sandbox count have their own separate limits. A sandbox is an isolated space where tools run.

## In a large company

Enterprise platforms size worker pools per tenant tier and per tool class. A tenant tier is a level of customer plan. They enforce caps again at the LLM gateway, the shared entry point for model calls. There the caps cover model concurrency and tokens per minute. Parallel tool runs are limited to independent read-only calls. Anything with side effects runs one at a time, behind the approval and audit path. Pool saturation (how full the pool is) and queue wait time are exported as metrics. They drive autoscaling. One example is a Kubernetes HorizontalPodAutoscaler on a custom metric. That is the Kubernetes feature that adds or removes servers based on load.

## Step by step

1. The harness creates a pool with a fixed number of workers.
1. Each tool_use block goes into the pool's queue as a task.
1. Free workers take tasks, and the rest wait in the queue.
1. The harness collects results by call id and builds the tool_result message.

## Code sketch

```python
pool = ThreadPoolExecutor(max_workers=8)

safe = [b for b in blocks if b.read_only]
futs = {pool.submit(run_tool, b): b.id
        for b in safe}
results = {}
for f in as_completed(futs):
    try: results[futs[f]] = f.result()
    except Exception as e:
        results[futs[f]] = tool_error(e)
for b in blocks:          # writes: one by one
    if not b.read_only:
        results[b.id] = run_tool(b)
reply = [results[b.id] for b in blocks]
```

## Be careful

Tasks that wait on each other inside one small pool can deadlock it, so all of them get stuck. Keep dependent steps out of the pool, or size the pool with care.

## Diagram

![Fig. 6.08: Work waits in a queue for a fixed set of reused workers instead of creating more threads.](/diagrams/thread-pool-executor.svg)
