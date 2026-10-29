---
id: composite
number: "1.09"
title: Composite
chapter: agent-loop
fit: direct
figure_number: Fig. 1.09
figure_caption: "Containers and leaves answer the same call, so the caller never checks types."
diagram: composite.svg
analogy_title: Freight on a warehouse pallet
---
## Gist

Treat a message, a tool result and a single text block through the same interface, because content blocks sit inside each other.

## Everyday comparison

### Freight on a warehouse pallet

A pallet holds cartons, a carton holds boxes, and a box holds single items. The forklift scale weighs any of them the same way: put it on and read the number. A carton's weight is just the total of what is inside. So nobody needs a special method for each level.

## Classic meaning

Arrange objects in a tree, and let other code treat a single object and a group of objects in the same way.

## In the agent system

A message's content is a list of blocks: text, image, tool_use and tool_result. A tool_result (the answer from a tool) can itself contain text and image blocks. The harness gives every block the same small interface (the same set of methods), such as token_count(), render() and redact(). Leaves (blocks with nothing inside them) answer directly. Containers like Message and ToolResult ask their children and combine the answers. So counting the tokens (the small text units models count) of a whole transcript becomes one call on the root (the top of the tree). It no longer needs nested loops that check each block's type.

## In a large company

In enterprise platforms, DLP, PII redaction and audit export all walk this content tree before anything leaves the trust boundary. DLP (data loss prevention) stops sensitive data from leaking. PII redaction removes personal data such as names and emails. The trust boundary is the edge of the systems the company trusts. A redactor must go down into nested tool_result content, including images and documents. A scanner that checks only top-level text blocks misses most leaked data. Token counts made locally from the tree are only estimates. So chargeback (billing each customer) and budget limits should use the usage numbers reported by the provider. They can also use the numbers from the LLM gateway, the central service all model calls pass through.

## Step by step

1. Define one Block interface with the operations the harness needs.
1. Write leaves (TextBlock, ImageBlock) that answer directly.
1. Write containers (Message, ToolResult) that loop over their children.
1. Callers use the operation on any node, from one block to a full transcript.

## Code sketch

```python
class TextBlock(Block):
    def tokens(self):
        return count(self.text)

class ToolResult(Block):
    def tokens(self):
        return 8 + sum(c.tokens()
                       for c in self.content)

total = sum(m.tokens() for m in transcript)
```

## Be careful

Do not force methods onto the shared interface when they make no sense for every block. A leaf with fifteen methods that do nothing is a warning sign.

## Diagram

![Fig. 1.09: Containers and leaves answer the same call, so the caller never checks types.](/diagrams/composite.svg)
