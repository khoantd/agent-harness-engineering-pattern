---
id: self-registration
number: "5.20"
title: Self-Registration
chapter: multi-agent
fit: direct
review_id: rev-self-registration
figure_number: Fig. 5.20
figure_caption: The service announces itself and keeps its entry alive. Silence gets it removed.
diagram: self-registration.svg
analogy_title: Signing in with the market warden
---
## Gist

Each agent service or MCP server tells a registry its name, address and tools at startup, and keeps renewing that entry.

## Everyday comparison

### Signing in with the market warden

Stallholders at a street market arrive at dawn and sign the warden's book with their pitch number, name and what they sell. Shoppers ask the warden where to find cheese. Traders wave at the warden's hut every few hours. Anyone not seen by noon is crossed off, so shoppers are never sent to an empty pitch.

## Classic meaning

A running copy of a service signs itself up with the service registry (a directory of live services) when it starts. It renews its entry with heartbeats (regular 'still alive' signals) and removes itself when it shuts down.

## In the agent system

An MCP server (MCP is a standard way to connect tools to an AI model) or a specialist agent service starts up. It calls the harness registry with its name, endpoint (address) and tool list, such as search_issues and create_issue. It also gives a TTL (a time limit after which the entry expires). It sends a heartbeat before the TTL runs out. On a clean shutdown it removes its entry. Orchestrators (the agents in charge) ask the registry which tools or agents to offer the model on the next turn. The registry removes entries whose heartbeats stop. So a crashed server drops out of the tool list instead of causing failed tool calls.

## In a large company

Self-registration suits internal agent services that hold a workload identity (login details issued to the program itself). Examples are a SPIFFE ID or a cloud service account. The registry checks that identity on every registration and heartbeat. Many companies prefer third-party registration instead. In that setup, the platform registers the running copies. This can be Kubernetes with its service endpoints, or a registrar that watches deployments. Then a hacked or badly set up service cannot advertise itself. Either way, the tool catalog shown to models is filtered by an allowlist and by RBAC (role-based access control: permissions given by job role) for each tenant (customer company). Every change to a registration is audited.

## Step by step

1. The service starts and registers its name, endpoint and tool list with a TTL.
1. It sends heartbeats to renew the entry.
1. Orchestrators ask the registry what is live and available.
1. If heartbeats stop, the registry removes the entry.

## Code sketch

```python
async def main():
    srv = McpServer('issues', tools)
    await registry.register(
        name='issues', url=srv.url,
        tools=[t.name for t in tools], ttl=30)
    try:
        async with every(10, registry.renew,
                         'issues'):
            await srv.serve()
    finally:
        await registry.deregister('issues')
```

## Be careful

A registry entry is only a claim. So the registry must authenticate (check the identity of) every service that registers. Accept only servers on an allowlist. Then check that the server's live tool schemas (the formats of its tools) match what it registered, before showing them to the model.

## Diagram

![Fig. 5.20: The service announces itself and keeps its entry alive. Silence gets it removed.](/diagrams/self-registration.svg)
