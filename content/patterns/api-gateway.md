---
id: api-gateway
number: "8.11"
title: API Gateway
chapter: architecture
fit: direct
review_id: rev-api-gateway
figure_number: Fig. 8.11
figure_caption: "One door checks every request once, then routes it by path."
diagram: api-gateway.svg
analogy_title: The airport security hall
---
## Gist

Put one entry point in front of all harness services. It checks identity, limits request rates and routes each request.

## Everyday comparison

### The airport security hall

Every passenger enters through one security hall, whether flying to Rome or Reykjavik. Staff check passports and bags once. Then signs send each person to the right pier. At the gate, staff still scan the boarding pass that security already checked. A new pier can open without building a new entrance.

## Classic meaning

One entry point for all clients. It sends each request to the right microservice (a small, separate service). It also handles shared concerns such as login checks and rate limits.

## In the agent system

Some harnesses split into separate services, such as sessions, tool sandboxes, file storage and usage billing. They expose all of them through one gateway at /v1. The gateway checks the API key or OAuth token (a login token). It applies rate limits and usage quotas for each org. It adds a request id so the request can be traced. It routes /v1/sessions to the session service and /v1/files to storage. It removes any identity headers the client sent. Then it forwards the checked identity as a signed internal token. The services still check that token before they apply their own permission rules. Streaming routes are passed through with long timeouts and no buffering (holding data back). Clients and SDKs see one host and one login method. Behind it, services can move or split.

## In a large company

Large companies run gateways such as Kong, Apigee, AWS API Gateway or ones based on Envoy at the edge. These check OIDC tokens (from a standard login protocol), apply WAF (web application firewall) rules and set rate limits per tenant (customer company). They also log requests. This is different from the LLM gateway on the outgoing side. That one handles model routing, provider keys, prompt logging and charging token costs to the right team. Behind the edge, services check a signed identity token. Or they use mTLS (both sides prove identity with certificates) through a service mesh (a network layer between services). So a hacked internal service cannot pretend to be a tenant. Gateways must pass streaming replies through without buffering. Their idle timeouts must be long enough for agent turns that run for minutes.

## Step by step

1. A client calls one host, for example POST /v1/sessions/{id}/turns.
1. The gateway checks identity, checks the org's quota and adds a trace id.
1. It matches the start of the path to a service and forwards the request.
1. It streams the reply back and turns internal errors into the public format.

## Code sketch

```python
ROUTES = {
    '/v1/sessions': 'http://sessions:8000',
    '/v1/files':    'http://files:8000',
    '/v1/tools':    'http://sandbox:8000',
}
def gateway(req):
    key = req.headers['x-api-key']
    org = auth.verify(key)
    limits.check(org, req.path)
    req.headers['x-identity'] = sign(org)
    upstream = match_prefix(ROUTES, req.path)
    return proxy(upstream, req, stream=True)
```

## Be careful

A gateway might start making product decisions, such as which model a turn uses. Then it becomes a second monolith that every team must change. Keep it to routing and edge work.

## Diagram

![Fig. 8.11: One door checks every request once, then routes it by path.](/diagrams/api-gateway.svg)
