---
id: service-stub
number: "12.04"
title: Service Stub
chapter: testing
fit: direct
figure_number: Fig. 12.04
figure_caption: The real loop runs against scripted stand-ins for the model and the tools.
diagram: service-stub.svg
analogy_title: The emergency call training room
---
## Gist

Replace the model and MCP servers with fakes that give scripted answers, so agent tests run fast, free and the same every time.

## Everyday comparison

### The emergency call training room

Trainee call handlers sit at real desks. But the caller on the line is an instructor reading from a script: a kitchen fire, then a fall at a bus stop. Every trainee hears the same call, with the same pauses and the same twist at minute three. The real emergency line is never touched. A trainee who struggles can replay the exact call.

## Classic meaning

During testing, you swap a troublesome outside service for a simple stand-in that returns set answers. This removes the test's need for the real service.

## In the agent system

The agent depends on a model client interface and an MCP client. MCP is a standard way to connect tools to an AI model. In tests, a StubModel returns a fixed list of responses, in order. First comes a tool_use (request to run a tool) for read_file, then one for edit_file. Last comes a final text block with stop_reason end_turn, meaning the model has finished. A stub MCP server lists the same tools as the real one but returns set results. It can also be told to fail or time out. Everything else runs for real: the harness loop, the permission gates, compaction (summarising old messages to save space) and the transcript logic. There is no network, no token cost and no randomness.

## In a large company

Enterprise CI (the automatic build and test system) runs the harness against stubbed or recorded model and MCP answers on every pull request. Live calls are slow, costly and give different results each time. Tests with the live model are kept for scheduled and pre-release gates. Recorded fixtures (saved test data) are captured in a record mode. Secrets, tokens and PII (personal data such as names and emails) are removed from them. They are refreshed when the model version or tool schemas change. Stubs are also the cheapest way to test error handling. Examples are 429 (too many requests) with Retry-After, 529 (overloaded), MCP timeouts and badly formed tool_use input.

## Step by step

1. The test builds a StubModel with a script, and a stub MCP server with set results.
1. The harness is connected to the stubs instead of the real clients.
1. The agent loop runs as normal, taking the next scripted response on each model call.
1. The test checks the loop's behaviour and checks that the script was used up.

## Code sketch

```python
model = StubModel([
    tool_use('read_file', path='calc.py'),
    tool_use('edit_file', path='calc.py'),
    text('Fixed the off-by-one.'),
])
mcp = StubMCP(tools={'read_file': 'def add...',
                     'edit_file': 'ok'})
agent = Harness(model=model, mcp=mcp)
agent.run('fix calc.py')
assert model.exhausted()
```

## Be careful

A stub tests the harness only against answers you imagined. Refresh the scripts from recorded real transcripts, so they stay close to what the model really sends.

## Diagram

![Fig. 12.04: The real loop runs against scripted stand-ins for the model and the tools.](/diagrams/service-stub.svg)
