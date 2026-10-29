---
id: visitor
number: "1.10"
title: Visitor
chapter: agent-loop
fit: direct
review_id: rev-visitor
figure_number: Fig. 1.10
figure_caption: "Blocks send the call to the right method, and operations live in visitors."
diagram: visitor.svg
analogy_title: The fire safety inspector at the mall
---
## Gist

Keep content block classes stable, and put each operation that runs across them, like token counting or redaction, in its own visitor class.

## Everyday comparison

### The fire safety inspector at the mall

A fire inspector walks through a shopping centre: the bakery, the cinema, the pharmacy. Each shop lets the inspector in and shows what matters for its kind of business. The bakery shows its ovens, the cinema its projection booth, and the pharmacy its chemical store. Next month a different inspector, checking access for disabled visitors, walks the same route with a different checklist. The shops change nothing.

## Classic meaning

Put an operation on a structure's elements into a separate object. Then you can add new operations without changing the element classes.

## In the agent system

Content blocks (the pieces of a message, such as text, images and tool calls) rarely change. But the list of operations run over them keeps growing. The harness counts tokens, redacts (hides) secrets before logging, and renders blocks to the terminal or to HTML. It also converts them to another provider's format. With Visitor, each block has a single accept(v) method. That method calls the matching method on the visitor v, such as v.visit_text(self) or v.visit_tool_use(self). A new operation is a new visitor class with one method per block type. The block classes and the code that walks the transcript stay the same.

## In a large company

Enterprise platforms run several visitors over every transcript. One does PII redaction (removing personal data such as names and emails) before logs and traces are exported. One adds classification tags for data residency, the rules about which country data must stay in. One converts formats for an LLM gateway (a central service all model calls pass through) that sits in front of several providers. One exports records for audit. Keeping each as a separate visitor lets compliance teams own and test the redactor apart from the rendering code. The risk is coverage. A redaction visitor must handle every block type, including nested tool results and documents. Otherwise sensitive data reaches log storage.

## Step by step

1. Each block class writes accept(visitor) so it calls the matching visit method.
1. An operation is a visitor class with one visit method per block type.
1. The harness walks the transcript and calls block.accept(visitor) on each block.
1. The visitor builds up its result, such as a token total or a redacted copy.

## Code sketch

```python
class ToolUseBlock(Block):
    def accept(self, v):
        return v.visit_tool_use(self)

class Redactor(Visitor):
    def visit_text(self, b):
        return scrub(b.text)
    def visit_tool_use(self, b):
        return scrub_json(b.input)  # deep

clean = [b.accept(Redactor()) for b in blocks]
```

## Be careful

Adding a new block type means updating every visitor. If new block types arrive often, use Acyclic Visitor or plain methods on the blocks instead.

## Diagram

![Fig. 1.10: Blocks send the call to the right method, and operations live in visitors.](/diagrams/visitor.svg)
