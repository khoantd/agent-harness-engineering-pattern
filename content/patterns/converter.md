---
id: converter
number: "2.04"
title: Converter
chapter: tool-system
fit: direct
review_id: rev-converter
figure_number: Fig. 2.04
figure_caption: "One converter owns every mapping between internal types and the wire, both ways."
diagram: converter.svg
analogy_title: The interpreter at a summit
---
## Gist

Translate tool specs, calls and results between the harness's own types and each provider's wire format, in both directions.

## Everyday comparison

### The interpreter at a summit

An interpreter sits in a glass booth at the back of the hall. A minister speaks French, and the interpreter says the same words in English into the delegates' headsets. When the reply comes, they do the reverse. Neither minister learns the other's language. The meaning stays the same. Only the form changes, and it changes both ways.

## Classic meaning

A converter is a separate object that changes data from one form to another. It usually has one function for each direction.

## In the agent system

Inside the harness, a tool is a ToolSpec, a call is a ToolCall and an output is a ToolResult. Each model provider wants something else on the wire, meaning in the exact format it sends and receives. One expects input_schema at the top level. Another puts parameters under a function key. Results go back as tool_result blocks with text or image content and an is_error flag. A provider converter owns all of these mappings in both directions. It turns a spec into the wire format. It turns a tool_use block into a ToolCall, and back again when the history is sent again. It turns a ToolResult into content blocks. Adding a provider then touches only one class. Round-trip tests (converting out and back again) can prove that nothing is lost.

## In a large company

Some platforms send traffic to several providers through an LLM gateway (a central service that routes all model traffic). They keep one standard internal message format and one converter per provider. The converter is a natural place to pull out OpenTelemetry GenAI attributes, such as the model name and token use. OpenTelemetry is a standard for tracing requests. Round-trip tests and golden-file tests (comparisons against saved, known-good provider messages) should run in CI as a regression gate. CI is the automatic checks that run on every code change, and a regression gate blocks changes that break old behaviour. This matters because a quiet mapping change can drop tool errors or image content. PII redaction (removing personal data such as names and emails) can also happen here. It runs just before content leaves the platform's trust boundary for an outside provider.

## Step by step

1. Before a request, the converter turns each ToolSpec into the provider's tool format.
1. When the response arrives, it reads each tool_use block into a ToolCall.
1. After the tool runs, it turns each ToolResult into a tool_result block that points to the call id.
1. On the next turn, it turns stored ToolCalls back into tool_use blocks, so the history replays exactly.
1. Round-trip tests check that converting out and back gives an equal object.

## Code sketch

```python
class MessagesConverter:
    # spec_out(): ToolSpec -> tools[] entry
    def call_in(self, b):
        return ToolCall(b.id, b.name, b.input)
    def call_out(self, c):  # history replay
        return dict(type='tool_use', id=c.id,
            name=c.name, input=c.args)
    def result_out(self, r):
        return dict(type='tool_result',
            tool_use_id=r.call_id,
            content=r.blocks,
            is_error=r.is_error)
```

## Be careful

Converters break quietly when a provider adds a new block type. Fail loudly on unknown types instead of dropping them.

## Diagram

![Fig. 2.04: One converter owns every mapping between internal types and the wire, both ways.](/diagrams/converter.svg)
