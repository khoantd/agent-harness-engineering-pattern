---
id: onion-architecture
number: "8.02"
title: Onion Architecture
chapter: architecture
fit: direct
figure_number: Fig. 8.02
figure_caption: "Dependencies point inward, and the parts that change often live on the outside."
diagram: onion-architecture.svg
analogy_title: A castle with rings of walls
---
## Gist

Put the agent's core logic at the centre, and make every outer layer depend inward, never outward.

## Everyday comparison

### A castle with rings of walls

The keep at the centre holds what matters most. Each wall around it serves the one inside it. You can rebuild the outer gate or swap the moat without touching the keep. But the keep never needs to know which gate is in use today.

## Classic meaning

The code is arranged in rings, like an onion, with the core business ideas (the domain model) at the centre. Dependencies always point toward the centre, and infrastructure such as databases lives on the outside.

## In the agent system

The innermost ring holds pure ideas: Turn, Message, ToolCall and Plan. Around it sit domain services such as context compaction (shrinking old conversation to save space) and permission rules. The application ring runs the agent loop (the cycle of calling the model and running its tools). The outer ring holds the parts that change often. These are the Anthropic SDK client, MCP servers, the database and the web UI. MCP is a standard way to connect tools to an AI model. Swapping a model provider or a vector store (a database for search by meaning) only touches the outer ring.

## In a large company

Enterprise platforms use the onion to keep the agent core free of any one model vendor. The outer ring holds the LLM gateway client (for a central service that routes all model traffic). It also holds MCP connectors, the identity provider and the audit sink (where audit records are sent). All of these sit behind ports, which are interfaces declared further in. A regulated customer can then swap a provider for data residency (keeping data in a set country or region) or for buying reasons. It can also run the same core against a private deployment. Neither change touches the policy logic. Enforce the dependency rule in CI (the automatic checks that run on every code change) with an import linter. Keep policy decisions in the inner rings, so unit tests and evals (automated tests of the agent) check them directly.

## Step by step

1. Define core types (Turn, Message, ToolCall) with no imports from outer layers.
1. Write the loop and policy logic against interfaces that inner rings declare.
1. Build those interfaces in the outer ring with real SDKs and stores.
1. Connect them together at startup.

## Code sketch

```python
# core/turn.py: imports nothing outward
class ModelPort(Protocol):
    def complete(self, msgs): ...

# infra/anthropic.py: depends inward
class AnthropicModel(ModelPort):
    def complete(self, msgs):
        return sdk.messages.create(
            model=MODEL, messages=msgs)
```

## Be careful

A single import of an SDK type into the core quietly breaks the onion. Enforce the rule with an import linter (a tool that checks which code may import which).

## Diagram

![Fig. 8.02: Dependencies point inward, and the parts that change often live on the outside.](/diagrams/onion-architecture.svg)
