---
id: hexagonal-architecture
number: "8.01"
title: Hexagonal Architecture
chapter: architecture
fit: direct
figure_number: Fig. 8.01
figure_caption: "The core talks only to ports, so adapters on either side can be swapped without touching it."
diagram: hexagonal-architecture.svg
analogy_title: The camper van hookup points
---
## Gist

Put the agent core in the middle, and let every model, tool, store and screen plug in through a named port.

## Everyday comparison

### The camper van hookup points

A camper van has three standard inlets on its side: mains power, fresh water and waste. Every campsite has different posts and taps. So you carry a short adapter cable or hose for each one. The kitchen, lights and shower inside never change. Only the adapter at the inlet changes. You can even test the whole van on your driveway with a garden hose.

## Classic meaning

This pattern is also called Ports and Adapters. The application names a port (a fixed plug shape) for everything it talks to, and an adapter connects each port to one real technology.

## In the agent system

The agent core declares its ports as interfaces (lists of functions with no code behind them). ChatPort is for whoever drives a session, such as a person typing. ModelPort, ToolPort and StorePort are for things the core itself drives. Driving adapters turn their input into calls on ChatPort. Examples are a CLI (command-line tool), a web socket handler (code that keeps a live browser connection open) and an eval runner (code that runs test cases). Driven adapters fill in the outbound ports. They use the Anthropic SDK, an MCP client (MCP is a standard way to connect tools to an AI model) and a Postgres or file store. The core only speaks through ports. So a test suite can run the real loop against a scripted fake model and an in-memory store.

## In a large company

In a large company, the ModelPort adapter usually talks to the internal LLM gateway (one shared front door to all AI models), not straight to a provider SDK. This keeps routing, key custody (who holds the secret API keys) and per-tenant cost tracking outside the core. A tenant is one customer company sharing the platform. Driving adapters multiply: web, IDE (code editor), chat apps, a public API and batch jobs. They all enter through the same inbound port. That port is where the checked tenant and user details should be attached, once. Policy decisions can sit behind a driven PolicyPort. OPA or Cedar (policy engines that answer "is this allowed?") can sit behind it. This keeps permission checks testable with a fake. The key control: every driven adapter for tenant data gets the tenant scope from the port call. It must never take it from shared global state.

## Step by step

1. The core defines inbound and outbound ports as plain interfaces.
1. Driving adapters (CLI, web, eval runner) turn their input into calls on the inbound port.
1. The core runs the turn and calls ModelPort, ToolPort and StorePort when needed.
1. Driven adapters turn those calls into SDK requests, MCP calls and database writes.

## Code sketch

```python
class ModelPort(Protocol):
    def complete(self, msgs, tools): ...
class ToolPort(Protocol):
    def run(self, call): ...

class AgentCore:
    def __init__(self, model, tools, store):
        self.model, self.tools = model, tools
        self.store = store

core = AgentCore(SdkModel(), McpTools(),
                 FileStore('runs/'))
```

## Be careful

Do not shape a port after one vendor's API. For example, a port that takes one provider's own message format lets that adapter leak into the core. Design each port around what the agent needs.

## Diagram

![Fig. 8.01: The core talks only to ports, so adapters on either side can be swapped without touching it.](/diagrams/hexagonal-architecture.svg)
