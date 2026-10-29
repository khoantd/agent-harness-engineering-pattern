---
id: multiton
number: "3.14"
title: Multiton
chapter: llm-layer
fit: direct
figure_number: Fig. 3.14
figure_caption: "Same key, same instance. A new key creates exactly one more."
diagram: multiton.svg
analogy_title: Embassy row in the capital
---
## Gist

Keep exactly one client per key, such as provider and model or tenant, created on first use and shared after that.

## Everyday comparison

### Embassy row in the capital

A capital city has one embassy per country. Ask a taxi for the French embassy, and you always arrive at the same building. When a new country is recognised, its embassy opens, and from then on that is the one. There is never a second French embassy across town giving out different visas.

## Classic meaning

A multiton is like a Singleton (a class with only one instance), but it keeps a map of named instances. It guarantees one instance for each key.

## In the agent system

Each provider and model pair needs its own client. Each client has its own base URL, credentials, connection pool and rate-limit tracker. ModelClient.get(provider, model) returns the existing client for that key. On first use, it builds one. It does this under a lock (a guard that lets only one task in at a time). So two subagents running at the same time do not both build it. Every agent that asks for the same key shares one connection pool and one view of remaining quota. Another tenant's key (another customer company) gets a separate client with its own API key.

## In a large company

In an enterprise platform, a multiton keyed by tenant (customer company) holds a model client for each tenant. Each client has its own credentials, base URLs for in-region endpoints, and budgets. So tenant isolation is built into the structure, not a parameter on each call. With thousands of tenants, the map needs a size limit and eviction (removing old entries). Evicted clients must be closed cleanly to release their connections. Keys must come from the logged-in tenant context, never from request input. Otherwise one tenant could get another tenant's client.

## Step by step

1. A caller asks for the client keyed by provider and model, or by tenant.
1. The class looks up the key in its map of instances.
1. If the key is missing, it builds the client under a lock and stores it.
1. Every later caller with that key gets the same instance.

## Code sketch

```python
class ModelClient:
    _all = {}
    _lock = threading.Lock()

    @classmethod
    def get(cls, provider, model):
        key = (provider, model)
        with cls._lock:
            if key not in cls._all:
                cls._all[key] = cls(*key)
            return cls._all[key]
```

## Be careful

A key might include a value that changes often, such as a per-request timeout. Then each call creates a new instance, and the multiton quietly becomes a memory leak.

## Diagram

![Fig. 3.14: Same key, same instance. A new key creates exactly one more.](/diagrams/multiton.svg)
