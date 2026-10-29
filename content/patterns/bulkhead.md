---
id: bulkhead
number: "7.05"
title: Bulkhead
chapter: safety
fit: direct
review_id: rev-bulkhead
figure_number: Fig. 7.05
figure_caption: "A flooded compartment stays flooded alone, and its neighbours keep serving."
diagram: bulkhead.svg
analogy_title: Watertight compartments in a hull
---
## Gist

Split sandboxes, worker pools and quotas per session or tenant (customer), so one runaway agent cannot sink the others.

## Everyday comparison

### Watertight compartments in a hull

A ship's hull is split into sealed compartments. Say the front hits ice and one compartment floods. The doors stay shut and the water stays there. The ship tilts but floats. Without the walls, one hole would fill the whole hull.

## Classic meaning

Parts of a system are kept in separate pools. If one fails or is overloaded, the others keep working.

## In the agent system

Each session runs tools in its own container. A container is an isolated box for running code. It has limits on CPU, memory, disk and processes. So a fork bomb or a 50 GB download fills only that box. A fork bomb is a program that copies itself until the machine chokes. Above that, the harness gives each tenant (customer company) its own worker pool and model concurrency quota. It also gives each slow MCP server (a tool server) its own connection pool. So a hung connector uses up its own slots, not the shared ones. Interactive chat and batch evals (large automated test runs) run in separate pools. So a large eval sweep never starves a user who is waiting for a reply.

## In a large company

Enterprise platforms build bulkheads along tenant lines. They set per-tenant token and concurrency quotas at the LLM gateway, the shared entry point for model calls. They use Kubernetes namespaces with ResourceQuota, which caps what each group can use. They run untrusted code on separate node pools (separate groups of machines). Some use cell-based deployments, so a bad tenant or release affects only one cell. A cell is a full, separate copy of the system. Sandboxes for different tenants should not share a kernel (the core of the operating system) without a stronger isolation layer. Examples are gVisor or Firecracker microVMs. Saturation metrics for each compartment feed both alerting and chargeback, which means billing each tenant for what it used.

## Step by step

1. Group workloads by tenant, session or dependency.
1. Give each group its own pool, container and quota.
1. Send each request only to its own group's compartment.
1. When one compartment fails or fills, reject its requests while the others run normally.

## Code sketch

```python
pools = {
    'chat':    Semaphore(64),
    'evals':   Semaphore(8),
    'mcp:crm': Semaphore(4),
}

async def run(kind, job):
    if pools[kind].locked():   # full: reject
        raise Rejected(kind)
    async with pools[kind]:
        async with Container(cpus=2, mem='4g',
                             pids=256) as box:
            return await box.exec(job)
```

## Be careful

Many tiny compartments leave capacity unused. Size pools from real load. Let interactive traffic borrow spare slots, but only within set limits.

## Diagram

![Fig. 7.05: A flooded compartment stays flooded alone, and its neighbours keep serving.](/diagrams/bulkhead.svg)
