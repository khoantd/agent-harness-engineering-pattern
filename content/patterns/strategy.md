---
id: strategy
number: "2.02"
title: Strategy
chapter: tool-system
fit: direct
review_id: rev-strategy
figure_number: Fig. 2.02
figure_caption: "The tool's name and schema stay fixed while the backend behind it is swapped."
diagram: strategy.svg
analogy_title: Interchangeable camera lenses
---
## Gist

Keep one tool name and schema, but swap the code behind it, such as which backend a search tool uses.

## Everyday comparison

### Interchangeable camera lenses

A photographer keeps the same camera body all day. They twist on a different lens for a portrait, a landscape or a distant bird. The shutter button, the viewfinder and the memory card never change. Only the glass in front decides how the light comes in.

## Classic meaning

Several ways of doing the same job sit behind one shared interface. The caller picks one while running, without changing its own code.

## In the agent system

The model sees one search tool. Its input schema (the fixed list of inputs it accepts) is query and max_results. Its description does not promise any particular backend (the system that does the real searching). Behind it, the harness holds a SearchStrategy interface with several versions. One uses a hosted web search API. One uses a vector store (a database for search by meaning) over the user's documents. One uses local ripgrep (a fast file search program) when the machine is offline. The config or the workspace type picks the strategy when the session starts. So the tool definition in the request stays byte-identical, exactly the same down to each character. That keeps the prompt cache hitting. The prompt cache is saved work the provider can reuse when a request starts the same way. Evals (automated tests of the agent) plug in a canned strategy that returns fixed results.

## In a large company

Enterprise deployments pick the strategy per tenant (one customer company sharing the platform) from central config. One tenant searches an internal index hosted in its own region, for data residency (keeping data in a set region). Another uses a public web provider through an egress proxy (a gate that controls outgoing traffic). Eval runs use a canned strategy. The platform makes this choice from tenant policy, never from the model or from user input. Every strategy must apply the same document-level access checks. Then a cheaper backend cannot get around permissions. Record the chosen strategy as a span attribute in OpenTelemetry (a standard for tracing requests). Teams can then compare quality and cost for each backend.

## Step by step

1. The harness reads its config and picks a SearchStrategy for this session.
1. The search tool is registered with one schema, whatever the choice.
1. The model sends a tool_use block for search with a query.
1. The tool hands the work to the chosen strategy and formats its hits as one tool_result.

## Code sketch

```python
class SearchStrategy(Protocol):
    def search(self, q, k): ...

class SearchTool:
    name = 'search'
    def __init__(self, strategy):
        self.strategy = strategy
    def run(self, query, max_results=5):
        hits = self.strategy.search(
            query, max_results)
        return format_hits(hits)

tool = SearchTool(STRATEGIES[cfg.search])
```

## Be careful

Strategies may return results of different shape or quality. Then the model cannot learn what the tool does. Convert every strategy's output to one format.

## Diagram

![Fig. 2.02: The tool's name and schema stay fixed while the backend behind it is swapped.](/diagrams/strategy.svg)
