---
id: service-locator
number: "5.21"
title: Service Locator
chapter: multi-agent
fit: direct
figure_number: Fig. 5.21
figure_caption: Callers know only a name. The locator decides which live connector answers to it.
diagram: service-locator.svg
analogy_title: Ringing directory enquiries
---
## Gist

Code asks a central locator for a connector or agent by name while running, instead of having each one handed in.

## Everyday comparison

### Ringing directory enquiries

You need a plumber in a town you have never visited. You ring directory enquiries and give a name, and the operator reads you a number. You do not need every phone book in the country. If the plumber moves, the operator gives you the new number next time.

## Classic meaning

A service locator is a central registry object. Code calls it to get a service by name. It hides how the service is made or found.

## In the agent system

Skills and subagent code often need a connector they did not create. Examples are the web search MCP client, the issue tracker or a reviewer subagent. MCP is a standard way to connect tools to an AI model. The code calls locator.get('issues'). The locator returns a live client from its cache. If there is none, it builds one using the factory (a function that makes the client) registered under that name. So a skill written once can run in harnesses with different connectors installed, as long as the names match. The cost is hidden dependencies. You cannot tell which connectors a piece of code needs until it runs.

## In a large company

In a harness shared by many tenants (customer companies), the locator must find clients per tenant and per user. It looks them up by name plus identity. It fetches credentials from Vault or a cloud secrets manager (safe stores for passwords and keys) when it builds the client. Otherwise a cached client built with one tenant's token could serve another tenant. The name table usually comes from a connector catalog that an admin has approved. So a skill can only get connectors that policy allows for that tenant. Lookups are logged. This gives auditors a record of which connectors each skill actually used.

## Step by step

1. At startup the harness registers a factory for each name in the locator.
1. Code calls get(name) when it needs a connector or agent.
1. The locator returns a cached client or builds one from the factory.
1. An unknown name raises a clear error that the harness reports back to the model.

## Code sketch

```python
class Locator:
    def __init__(self, table):
        self.table, self.live = table, {}
    def get(self, name):
        if name not in self.live:
            make = self.table[name]
            self.live[name] = make()
        return self.live[name]

issues = locator.get('issues')
```

## Be careful

A locator hides what code depends on. So in the harness core, prefer explicit injection (passing each dependency in directly). Keep the locator for plugins and skills that load while the harness runs.

## Diagram

![Fig. 5.21: Callers know only a name. The locator decides which live connector answers to it.](/diagrams/service-locator.svg)
