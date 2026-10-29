---
id: ambassador
number: "3.02"
title: Ambassador
chapter: llm-layer
fit: direct
review_id: rev-ambassador
figure_number: Fig. 3.02
figure_caption: The agent speaks plain HTTP locally. The sidecar deals with the outside world.
diagram: ambassador.svg
analogy_title: "The reporter's local fixer"
---
## Gist

Run a sidecar, a helper beside the harness, that owns the model connection: keys, TLS encryption, retries, timeouts and telemetry.

## Everyday comparison

### The reporter's local fixer

A foreign reporter arrives in a new city and hires a fixer who goes everywhere with them. The reporter says who they want to interview. The fixer handles permits, translation, phone lines that drop, and checkpoints that want paperwork. The reporter's notebook holds only the story. A fixer who knows a different city can replace this one, and the reporter's job does not change.

## Classic meaning

An ambassador is a helper service that runs next to a client. It sends network requests for the client and adds features such as retries, monitoring and security.

## In the agent system

The harness does not call the provider directly. It sends plain HTTP requests to a sidecar on localhost (the same machine). The sidecar runs in the same pod or container group (a set of containers deployed together). It holds the API key and handles TLS (the encryption on the connection to the provider). It adds retries with backoff (waiting longer before each new try) and enforces timeouts. It also sends out metrics and traces (records of each call's path and timing) for every model call. The sidecar does not care what language the caller uses. So a Python agent worker and a TypeScript UI server share one connection policy. To rotate keys or change egress rules (rules about which outside addresses traffic may reach), you redeploy the sidecar, not the agent code.

## In a large company

In an enterprise platform, the ambassador is usually a service-mesh or egress sidecar. A service mesh is a network layer that manages traffic between services. Examples are Envoy, a mesh proxy, or a small LLM-proxy container. It gets short-lived credentials through workload identity (each service proves who it is) or Vault (a secrets store). It never shows them to the agent process. The sidecar applies the same rules for every language. These include mTLS (both sides prove who they are with certificates) and egress allowlists (approved outside addresses). They also include timeouts and OpenTelemetry spans (standard trace records) with GenAI attributes (fields that describe model calls). The sidecar also removes PII (personal data such as names and emails) from outgoing prompts. Platform teams change its settings through change management (a formal review and approval process). So the docs must say that the sidecar owns retry and timeout policy, and that these are turned off in the SDK.

## Step by step

1. The harness sends a model request to the sidecar on localhost.
1. The sidecar checks who the caller is. It adds the key, a timeout and a trace id (a tag that follows the request).
1. It forwards the request to the provider over TLS. It retries only failures that happen before any response bytes arrive.
1. It streams the response back and passes mid-stream errors through to the harness. It also records latency and token metrics.

## Code sketch

```python
# harness: no keys, no retry logic
client = ModelClient(
    base_url='http://localhost:8787')
resp = client.messages.create(**req)

# ambassador sidecar, same pod
@app.post('/v1/messages')
async def relay(req):
    req.headers['x-api-key'] = vault.key()
    return await retry(upstream.post, req,
                       timeout=60)
```

## Be careful

If both the harness and the ambassador retry, one failure turns into many calls. Decide which side owns retries, and turn them off on the other side.

## Diagram

![Fig. 3.02: The agent speaks plain HTTP locally. The sidecar deals with the outside world.](/diagrams/ambassador.svg)
