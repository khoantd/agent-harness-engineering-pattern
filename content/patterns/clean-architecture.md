---
id: clean-architecture
number: "8.03"
title: Clean Architecture
chapter: architecture
fit: direct
figure_number: Fig. 8.03
figure_caption: Use cases own the ports. Controllers carry data in and presenters carry it out.
diagram: clean-architecture.svg
analogy_title: The courthouse and the law
---
## Gist

Arrange the harness in four rings (entities, use cases, adapters, frameworks), with every code dependency pointing inward.

## Everyday comparison

### The courthouse and the law

The law sits at the centre and changes slowly. Court procedures apply it to a case: filing, hearing, ruling. Clerks turn messy paperwork into the forms those procedures expect. They also print rulings for the outside world. You can replace the building, the phones and the filing software without changing a single law.

## Classic meaning

The system is built as rings inside rings: entities, use cases, interface adapters and frameworks. Code in an outer ring may depend on an inner ring, never the other way. Data crosses each ring as simple structures.

## In the agent system

Entities (the core objects) hold the stable agent rules. For example, a Turn ends with an assistant message. A ToolCall needs a result before the next model call. Use cases such as RunTurn, ApproveToolCall and CompactContext direct those entities. Each use case owns its own input and output ports (fixed plug shapes for data). Interface adapters come in two kinds. Controllers turn an HTTP request into a RunTurnInput. Presenters turn a TurnOutput into SSE events (a live stream of updates to a browser) or a terminal line. The outer ring holds the web server, the Anthropic SDK, MCP clients and the database. MCP is a standard way to connect tools to an AI model. Compared with Onion Architecture, Clean makes the use case the main unit of design. It also splits controllers from presenters.

## In a large company

Large companies use the use case ring as the natural place for permission, audit and approval rules. Each use case, such as ApproveToolCall, matches one business action that can be audited. One presenter per surface lets the same RunTurn output feed many places. It can feed SSE for the web app, message edits for a chat integration and JSON for the public API. Frameworks stay in the outer ring. Examples are the LLM gateway client (one shared front door to AI models), the Kafka producer (code that sends events to Kafka, a message stream) and the Postgres driver. So changing a provider or region for data residency (keeping data in a certain country) means swapping adapters. The risk is ceremony. Platform teams should use the full rings for the shared core and let small internal tools stay simpler.

## Step by step

1. A controller in the adapter ring turns an incoming request into a plain input model.
1. The use case loads entities through a gateway interface it owns and applies the rules.
1. It hands a plain output model to its output port.
1. A presenter formats that output for the screen, such as SSE events or terminal lines.

## Code sketch

```python
class RunTurn:  # use case ring
    def __init__(self, gateway, presenter):
        self.gw, self.out = gateway, presenter
    def execute(self, inp: RunTurnInput):
        conv = self.gw.load(inp.session_id)
        turn = conv.start_turn(inp.text)
        self.gw.save(conv)
        self.out.present(TurnOutput(turn.id))

class SsePresenter:  # adapter ring
    def present(self, o): sse.send(o)
```

## Be careful

Four rings, plus input and output models for every use case, is a lot of ceremony. It is too heavy for a small tool with one screen. Merge rings until each boundary is worth its cost.

## Diagram

![Fig. 8.03: Use cases own the ports. Controllers carry data in and presenters carry it out.](/diagrams/clean-architecture.svg)
