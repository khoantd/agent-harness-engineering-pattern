---
id: bridge
number: "3.03"
title: Bridge
chapter: llm-layer
fit: direct
figure_number: Fig. 3.03
figure_caption: "Two families grow on their own, joined by one reference."
diagram: bridge.svg
analogy_title: The universal remote
---
## Gist

Keep the family of agent types apart from the family of model backends, so each side can grow without a class for every pair.

## Everyday comparison

### The universal remote

A universal remote comes in a basic model with volume and channel buttons. A deluxe model can also record and pause. Separately, every TV brand uses its own infrared codes. Any remote can drive any brand, because it holds the code set for the TV it is paired with. Nobody makes a 'deluxe remote for brand X'.

## Classic meaning

A bridge separates an abstraction (what something does) from its implementation (how it does it). One reference joins the two families, so each can change on its own.

## In the agent system

The agent side has its own family of classes. ChatAgent, CodingAgent and ResearchAgent differ in system prompt, tools and loop policy. The backend side has another family. A backend is the code that actually talks to a model. There is a hosted API backend, a cloud-platform backend and a local inference backend (running the model on your own machines). Each backend knows its own request format, streaming quirks and login method. Each agent holds a reference to a ModelBackend. It calls only that backend's narrow interface: generate, stream and count_tokens. Three agents and three backends need six classes, not nine combinations. A new backend works with every agent from day one.

## In a large company

In an enterprise platform, the backend side often covers three options. One is a direct provider API. Another is the same models through a cloud platform such as Bedrock, Vertex AI or Azure. The third is a self-hosted model for sensitive work. Policy picks the backend for each tenant (one customer company sharing the platform). The implementor interface (the backend's side of the bridge) stays narrow. So the platform can move a regulated tenant to an in-region or private backend without touching agent classes. Add a conformance and eval suite (automated tests of behaviour and quality) and run it against every backend. Streaming, tool calling and token counting differ in small ways between deployments of the same model.

## Step by step

1. Define a narrow ModelBackend interface with generate, stream and count_tokens.
1. Write one backend class per provider or deployment.
1. Write agent classes against that interface, and pass in a backend when you create each agent.
1. Choose the pairing in config. For example, use CodingAgent with a local backend in tests.

## Code sketch

```python
class Agent:                 # abstraction
    def __init__(self, backend):
        self.backend = backend

class CodingAgent(Agent):
    def step(self, msgs):
        return self.backend.generate(
            CODE_PROMPT, msgs, TOOLS)

class LocalBackend(ModelBackend): ...
class HostedBackend(ModelBackend): ...

agent = CodingAgent(LocalBackend())
```

## Be careful

Keep the backend interface to what every provider can support. If one provider's special feature leaks into it, the bridge quietly becomes an adapter for just one provider.

## Diagram

![Fig. 3.03: Two families grow on their own, joined by one reference.](/diagrams/bridge.svg)
