---
id: fork-join
number: "5.04"
title: Fork/Join
chapter: multi-agent
fit: direct
figure_number: Fig. 5.04
figure_caption: Each parent forks its children and continues only after joining all of them.
diagram: fork-join.svg
analogy_title: The pit stop
---
## Gist

Split a task into parts for parallel subagents, maybe splitting again, and continue only when every child has finished.

## Everyday comparison

### The pit stop

The car stops. Four crews jump at the four wheels at once while another crew refuels. Nobody waves the car out when the first wheel is on. The crew chief lifts the board only when every crew has raised a hand. Then the car leaves as one.

## Classic meaning

You split a task into smaller parts that run at the same time (fork). Each part may split again. Then you wait for all of them and combine their results (join).

## In the agent system

Say an agent is asked to audit a monorepo (one large code repository holding many packages). It forks one subagent (helper agent) per top-level package. A subagent facing a large package may fork again, one per directory. Each parent then waits at the join. It waits for all its children before summarising their findings and returning to its own parent. The harness sets a maximum depth and a total budget of subagents. This matters because forking again and again multiplies token spend quickly. The join is a barrier (a point that everyone must reach before anyone moves on). So the slowest child sets the pace for its parent.

## In a large company

In production, platform policy limits the forking. It sets a maximum depth, a maximum number of children per parent, and a token budget per run. The harness and the LLM gateway (one shared front door to all AI models) enforce these limits. When a limit is passed, the run stops cleanly. Durable execution engines such as Temporal (systems that save each step so work survives a crash) treat the join as child workflows. So a crashed parent can resume without forking finished children again. In OpenTelemetry (a standard for recording what software does), each child span (a timed record of one piece of work) is linked to its parent. This shows the cost and time of every branch. That supports chargeback (billing each team for its use) and SLO reports (reports on reliability targets).

## Step by step

1. The parent agent checks whether the task is small enough to do directly.
1. If not, it splits the task and forks a child subagent for each part.
1. Children run in parallel and may fork further, within the depth limit.
1. Each parent joins all its children, merges their results and returns upward.

## Code sketch

```python
async def audit(path, depth=0):
    parts = split(path)
    if depth >= MAX_DEPTH or len(parts) < 2:
        return await run_agent('auditor', path)
    kids = [spawn(audit, p, depth + 1)
            for p in parts]  # fork
    res = await asyncio.gather(*kids)  # join
    return merge(res)
```

## Be careful

One stuck child holds up its whole branch at the join. So give every forked subagent a timeout. Decide in advance whether partial results are acceptable.

## Diagram

![Fig. 5.04: Each parent forks its children and continues only after joining all of them.](/diagrams/fork-join.svg)
