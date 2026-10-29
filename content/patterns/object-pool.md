---
id: object-pool
number: "3.13"
title: Object Pool
chapter: llm-layer
fit: direct
figure_number: Fig. 3.13
figure_caption: "Borrow, use, reset, return: nothing expensive is built for each call."
diagram: object-pool.svg
analogy_title: Bowling shoes at the lanes
---
## Gist

Keep costly resources such as sandboxes, browsers and connections ready, lend them to agents, and reset them when returned.

## Everyday comparison

### Bowling shoes at the lanes

A bowling alley does not make new shoes for every customer. You give your size, borrow a pair from the rack, bowl, and hand them back. Staff spray and dry each pair before it goes back on the shelf. If the rack is empty, you wait a few minutes for a pair to come back.

## Classic meaning

An object pool keeps a set of ready, reusable objects. Clients borrow one and give it back. This avoids the cost of creating and destroying them again and again.

## In the agent system

Starting a code sandbox container (a sealed space for running code) or a headless browser (a browser with no screen) takes seconds. Opening a fresh TLS connection (an encrypted network link) to the model API on every call also adds delay. So the harness keeps pools. There are a few warm (already started) sandboxes, a browser pool for web tools, and the HTTP client's keep-alive connection pool. An agent checks out a sandbox for a bash or code-execution tool call. When the sandbox comes back, the pool wipes the working folder, kills leftover processes and resets environment variables. Only then does it lend it again. When every instance is busy, callers wait with a timeout, or the pool grows up to a hard limit.

## In a large company

In an enterprise platform, the sandbox pool is often a pool of fresh, never-used microVMs (tiny virtual machines) or gVisor containers (containers with an extra security layer). They start in advance and are destroyed after one session instead of being reset. A reset that misses one file or credential is a data leak between tenants (customer companies). Where reuse is allowed, it stays inside one tenant, and the reset is verified. Every lease (each loan of an instance) is logged with tenant, session and instance id for the audit trail. Pool size is a cost and capacity setting per region. Teams watch it for wait time and running out, like any other SLO (reliability target).

## Step by step

1. At startup, create N warm instances and put them on the idle list.
1. A tool call takes an instance, and waits if none is free.
1. The tool runs inside the borrowed instance.
1. On return, the pool resets it and puts it back on the idle list. If the reset fails, the pool destroys it.

## Code sketch

```python
class SandboxPool:
    def acquire(self, timeout=30):
        sb = self.idle.get(timeout=timeout)
        return Lease(sb, self.release)
    def release(self, sb):
        try:
            sb.reset()  # wipe fs, procs, env
            self.idle.put(sb)
        except ResetFailed:
            sb.destroy(); self.spawn_one()

with pool.acquire() as sb:
    out = sb.run(tool_input['command'])
```

## Be careful

A resource returned dirty can leak one session's files or cookies into another user's agent. So treat the reset as critical for security, and destroy anything that fails it.

## Diagram

![Fig. 3.13: Borrow, use, reset, return: nothing expensive is built for each call.](/diagrams/object-pool.svg)
