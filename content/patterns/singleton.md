---
id: singleton
number: "3.15"
title: Singleton
chapter: llm-layer
fit: direct
figure_number: Fig. 3.15
figure_caption: "Every caller reaches the one client, which owns the only connection pool."
diagram: singleton.svg
analogy_title: One conductor for the orchestra
---
## Gist

Share one model client and settings object across the whole process, so every agent uses the same connection pool, credentials and limits.

## Everyday comparison

### One conductor for the orchestra

Eighty musicians watch the same baton. Suppose a second conductor stood up and beat a slightly different tempo. Half the strings would follow one, and half the other. There is one podium and one person on it, and everyone knows where to look.

## Classic meaning

A singleton makes sure a class has only one instance. It also gives one global way to reach that instance.

## In the agent system

A harness process usually creates one SDK client (the provider's code library) at startup. It shares that client across the agent loop, subagents and background workers. That one instance owns the HTTP connection pool (open network links kept for reuse). It also owns the API key, default timeouts and the retry policy. If each subagent built its own client, the process would open extra connections. Each copy would also track rate limits on its own. Settings loaded from environment variables and config files work the same way. get_settings() returns one cached object.

## In a large company

In an enterprise platform, one client per process is fine for shared plumbing. Examples are the HTTP connection pool and telemetry exporters (code that sends out metrics and traces). But credentials and limits are usually per tenant (customer company). So in a multi-tenant worker, the singleton should not hold a single API key. Settings come from a config service or the environment. Secrets come from Vault or a cloud KMS (key management service). Key rotation must refresh the cached client without a restart. Dependency injection (handing the object in, instead of grabbing it globally) keeps tests and per-tenant overrides possible.

## Step by step

1. On first use, build the client from settings and keep it at module level.
1. Every later call returns that same instance.
1. All agents and workers share its connection pool and retry policy.
1. Tests replace it through an explicit override hook.

## Code sketch

```python
from functools import cache

@cache
def get_settings():
    return Settings.from_env()

@cache
def get_client():
    s = get_settings()
    return ModelClient(api_key=s.api_key,
                       max_retries=s.retries,
                       timeout=s.timeout)
```

## Be careful

A singleton is global mutable state (shared data anyone can change) in disguise. Pass it into agents instead of calling get_client() deep inside tools. Otherwise tests cannot swap in a fake.

## Diagram

![Fig. 3.15: Every caller reaches the one client, which owns the only connection pool.](/diagrams/singleton.svg)
