---
id: gateway
number: "3.01"
title: Gateway
chapter: llm-layer
fit: adapted
review_id: rev-gateway
figure_number: Fig. 3.01
figure_caption: "Callers see one client. Routing, keys and failover live behind it."
diagram: gateway.svg
analogy_title: The alliance check-in desk
---
## Gist

Send every model call through one client that holds the keys, picks a provider and switches over when one is down.

## Everyday comparison

### The alliance check-in desk

At a big airport, partner airlines share one check-in desk. You show your passport once. The agent books you onto whichever partner has a seat on your route. If one airline cancels, the same desk rebooks you on another, and you do not queue again. You never deal with the airlines one by one.

## Classic meaning

A gateway is one object that wraps access to an outside system. Callers use its simple interface and never deal with the system directly.

## In the agent system

The agent loop (the code that runs the model turn after turn) never imports a provider SDK (the provider's own code library). It calls gateway.complete(request). The gateway adds API keys (secret passwords for the provider) from the secret store. It turns the request into the provider's wire format (the exact shape that provider expects). It then routes the request by model alias, region or tenant policy. A model alias is a short name, like 'large', that points to real models. A tenant is one customer company sharing the platform. The gateway also records usage and latency (how long each call takes) for every call in one place. Sometimes a provider returns errors or is marked unhealthy. Then the gateway sends the same request to the next configured route. It returns a response in one standard shape. So subagents (helper agents started by the main agent) and scheduled tasks all get the same behaviour.

## In a large company

In an enterprise platform, this is the LLM gateway (the central entry point for all model calls). Every agent, subagent and batch job must use it. It often runs as a central service, such as LiteLLM, Envoy AI Gateway or a cloud API gateway. Traffic to model providers is blocked everywhere else. The gateway enforces several rules in one place. It uses workload identity (each service proves who it is) instead of fixed keys. It keeps a list of allowed providers for each tenant. It enforces data residency (keeping data in an approved country or region). It tracks token budgets and chargeback tags for each tenant (labels for billing costs back to each team). It also keeps an audit record of which model served each call. The main risk is that failover (switching to a backup route) crosses a residency or contract boundary. So policy must decide which routes are allowed, not provider health alone.

## Step by step

1. An agent or subagent calls gateway.complete with messages, tools and a model alias.
1. The gateway looks up the alias, gets a list of provider routes and adds the keys.
1. It writes the request in that provider's format and sends it.
1. If the provider is down, the gateway marks it unhealthy and tries the next route.
1. It returns one response in a standard shape, with usage attached.

## Code sketch

```python
class ModelGateway:
    def complete(self, req, tenant):
        routes = self.policy.allowed(
            tenant, self.routes[req.model])
        for p in routes:  # residency, vendor
            if not p.healthy():
                continue
            try:
                r = p.send(req, self.keys)
            except ProviderDown:
                p.mark_down(); continue
            self.meter.record(tenant, r.usage)
            return p.decode(r)
        raise NoProviderAvailable(req.model)
```

## Be careful

A gateway might quietly switch to a weaker model. That can change how the agent behaves in the middle of a task. So log every reroute and record which model actually answered.

## Diagram

![Fig. 3.01: Callers see one client. Routing, keys and failover live behind it.](/diagrams/gateway.svg)
