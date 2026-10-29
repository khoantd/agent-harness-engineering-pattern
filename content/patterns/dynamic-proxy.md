---
id: dynamic-proxy
number: "2.16"
title: Dynamic Proxy
chapter: tool-system
fit: adapted
review_id: rev-dynamic-proxy
figure_number: Fig. 2.16
figure_caption: "Stubs are built from schemas, and every stub sends its call to one handler"
diagram: dynamic-proxy.svg
analogy_title: The learning universal remote
---
## Gist

Build tool stand-ins while the program runs, from JSON schemas, and send every call through one shared handler.

## Everyday comparison

### The learning universal remote

You point your old TV remote at a learning universal remote and press each button once. Now the universal remote shows a button for every function it heard. Nobody wired those buttons by hand. Whichever one you press, the same transmitter inside sends the right code to the right device.

## Classic meaning

A proxy (a stand-in object) is created while the program runs for a given interface. Every method call on it goes to one shared handler.

## In the agent system

MCP is a standard way to connect tools to an AI model. When an MCP server connects, the harness asks it for tools/list (its list of tools). The server answers with each tool's name, description and JSON input schema (a description of the allowed arguments). But the harness has no Python class written for any of these tools. So a proxy factory reads each schema and builds a stub on the spot. A stub is a small stand-in function with the right name, help text and argument checks. Every stub passes its call to one shared invoke handler. That handler packs the arguments into a tools/call request and sends it to the server over the connection. It then turns the reply into a tool_result block (the message that gives the model the tool's answer). So connecting a new server adds new tools without anyone writing or deploying code. The tool list can also change later. When the server sends notifications/tools/list_changed, the harness fetches tools/list again and rebuilds the stubs.

## In a large company

Large companies rarely let a newly connected MCP server show its tools straight to the model. Instead, the stubs go through a tool registry (a central list of approved tools). The registry pins (locks in) each tool's name, schema and a hash of its description. A hash is a short fingerprint that changes when the text changes. If a description changes, the tool goes back for review. The one shared handler is the natural single checkpoint for policy. There it attaches the tenant (one customer company sharing the platform) and the user's identity. It asks the policy engine (OPA or Cedar, tools that decide what is allowed) whether the call may run. It adds credentials from a secrets manager, out of the model's sight. It also records an OpenTelemetry span (a timed trace record) for each call. The main risk is tool poisoning, or a remote server quietly changing its tool descriptions later (a rug-pull). The registry pin and the allowlist guard against both.

## Step by step

1. The harness connects to an MCP server and asks for tools/list.
1. For each schema, a factory builds a stub with the tool's name and argument checks.
1. The harness registers the stubs and offers their schemas to the model.
1. When the model calls one, the stub gives the name and arguments to the shared handler. The handler sends tools/call and returns the result.

## Code sketch

```python
def invoke(client, schema, args):  # handler
    validate(args, schema['inputSchema'])
    return client.call(schema['name'], args)

def make_stub(client, s):
    stub = lambda **a: invoke(client, s, a)
    stub.__name__ = s['name']
    stub.__doc__ = s['description']
    return stub

for s in client.list_tools():
    tools[s['name']] = make_stub(client, s)
```

## Be careful

Generated stubs trust whatever the server sends. A hostile server can hide instructions to the model inside tool names or descriptions. So check names and descriptions against an allowlist (a list of approved items) before you show them to the model.

## Diagram

![Fig. 2.16: Stubs are built from schemas, and every stub sends its call to one handler](/diagrams/dynamic-proxy.svg)
