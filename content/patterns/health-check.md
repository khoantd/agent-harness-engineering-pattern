---
id: health-check
number: "7.08"
title: Health Check
chapter: safety
fit: direct
review_id: rev-health-check
figure_number: Fig. 7.08
figure_caption: Regular probes keep a status board that the router trusts before each call.
diagram: health-check.svg
analogy_title: Lifeguard towers radioing in
---
## Gist

Probe connectors, browsers and remote devices on a schedule, and send work only to the ones that report healthy.

## Everyday comparison

### Lifeguard towers radioing in

On a long beach, the head lifeguard calls each tower every quarter hour: 'Tower three, status?' A tower that answers 'clear' stays green on the board. Say a tower misses two calls in a row. It turns red. Swimmers are sent to other flags, and someone runs down the sand to check.

## Classic meaning

A service offers a probe, a small test call that reports whether it and its dependencies work. Monitors and routers act on the answer.

## In the agent system

A harness depends on parts that fail quietly. An MCP server's process may die. MCP is a standard way to connect tools to an AI model. A headless browser (one with no screen) may hang. A remote device may go to sleep. An OAuth token (a login pass) may expire. A health checker probes each one on a timer. It uses a cheap real call: an MCP ping or tools/list, a blank-page navigation, or a device heartbeat. tools/list is the MCP request that lists a server's tools. The checker records each status with a timestamp. The tool router checks the board before each call. If a connector is down, it returns a clear 'connector unavailable' tool_result instead of a 60-second timeout. It hides a connector's tools only after a long outage. That is because every change to the tools list invalidates the prompt cache. The prompt cache is saved work the provider can reuse when a request starts the same way. A readiness endpoint says whether a host can take traffic. It reflects only the host's own dependencies. Then the load balancer can drain (stop sending traffic to) a broken host. A liveness check says whether the process is alive. It stays a plain process check. So a shared outage does not restart every pod.

## In a large company

Enterprise harnesses expose Kubernetes liveness and readiness probes. They keep liveness to a cheap in-process check. Then an outage at a shared dependency, such as the model provider, does not restart every pod at once. A pod is the small server unit Kubernetes runs. Connector health is tracked per tenant (customer company) where credentials are per tenant. One customer's expired OAuth token is not an outage for everyone. Health state feeds SLO dashboards (views of reliability targets) and status pages. Probes use their own low-privilege credentials, so they never touch real user data.

## Step by step

1. A timer starts probes for each registered dependency.
1. Each probe makes a cheap real call with a short timeout.
1. Results update a status board with state and last-seen time.
1. The tool router and UI check the board before using a dependency.

## Code sketch

```python
async def probe_all():
    for dep in deps:
        try:
            await wait_for(dep.ping(), 3)
            board[dep.name] = ('up', now())
        except Exception as e:
            board[dep.name] = ('down', e)

def usable_tools():
    return [t for t in tools
            if board[t.server][0] == 'up']
```

## Be careful

A check that only proves the process is alive can pass while every real call fails. Probe the actual capability with a cheap real request.

## Diagram

![Fig. 7.08: Regular probes keep a status board that the router trusts before each call.](/diagrams/health-check.svg)
