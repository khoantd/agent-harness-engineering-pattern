---
id: layered-architecture
number: "8.04"
title: Layered Architecture
chapter: architecture
fit: direct
figure_number: Fig. 8.04
figure_caption: "Each layer calls only the one below, so the UI can never reach a provider directly."
diagram: layered-architecture.svg
analogy_title: "The hotel's chain of staff"
---
## Gist

Stack the harness as UI, API, agent runtime and providers, where each layer calls only the layer just below it.

## Everyday comparison

### The hotel's chain of staff

A guest asks the front desk for a late checkout. The front desk asks the duty manager. The manager checks the housekeeping schedule, which depends on the laundry company's van. The guest never phones the laundry. The laundry never knows which guest asked. Each level talks only to the one beneath it.

## Classic meaning

Split a system into horizontal layers. Each layer offers services to the layer above and uses only the layer below.

## In the agent system

The top layer is the chat UI. It shows the model's words as they stream in, plus cards for each tool. Below it, the HTTP API checks who the caller is, checks the request and links it to a session. The agent runtime owns the loop. It builds the context (the text the model will see), calls the model, sends out tool calls and compacts (shortens) old history. The bottom layer holds provider clients and MCP connections. MCP is a standard way to connect tools to an AI model. The UI never calls the model directly. So rate limits, retries and token counting live in one place. A token is a small chunk of text that models count and bill by.

## In a large company

Large agent platforms usually have three tiers. The edge tier holds the API gateway, a WAF (web application firewall) and SSO (single sign-on) through OIDC, a standard login protocol. The application tier holds the session and the agent runtime. The provider tier reaches models only through an LLM gateway (one shared front door to AI models). Strict layers let you prove to auditors that no surface reaches a model or tool without passing login, policy checks and audit logging. SOC 2 and ISO 27001 are the security audit standards in question. Some concerns cut across every layer, such as tenant details and OpenTelemetry trace data. (A tenant is one customer company. OpenTelemetry is a standard for tracing requests across services.) These belong in shared middleware, not in pass-through methods. The common failure: a team adds a shortcut from a UI service straight to the model for a demo. That shortcut skips usage limits and logging.

## Step by step

1. The UI sends a user message to the API layer.
1. The API checks login and usage limits, then calls the runtime's run_turn.
1. The runtime builds the context and asks the provider layer for model replies and tool results.
1. Results flow back up through each layer as a stream of events.

## Code sketch

```python
# ui -> api -> runtime -> providers
@app.post('/sessions/<sid>/turns')
def post_turn(sid, body):
    auth.require(request.user, sid)
    return runtime.run_turn(sid, body.text)

class Runtime:
    def run_turn(self, sid, text):
        ctx = self.context.build(sid, text)
        return self.provider.complete(ctx)
```

## Be careful

Strict layers tend to grow pass-through methods that only forward calls. When a layer adds nothing, merge it. Do not add another one.

## Diagram

![Fig. 8.04: Each layer calls only the one below, so the UI can never reach a provider directly.](/diagrams/layered-architecture.svg)
