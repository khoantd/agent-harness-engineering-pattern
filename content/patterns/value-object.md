---
id: value-object
number: "4.06"
title: Value Object
chapter: memory
fit: direct
review_id: rev-value-object
figure_number: Fig. 4.06
figure_caption: "Equal content means equal objects, and a change makes a new object"
diagram: value-object.svg
analogy_title: Paint colour chips
---
## Gist

Treat content blocks, messages and token counts as values that never change and are compared by content, so sharing and caching them is safe.

## Everyday comparison

### Paint colour chips

At the paint shop, two chips marked Harbour Blue 5015 are the same colour, whichever rack they came from. You never repaint a chip to get a new shade. You pick another chip. Because a chip never changes, you can pin it to the wall and trust it next month.

## Classic meaning

A value object is a small object that never changes after it is made. Two value objects are equal when their values are equal, not when they are the same object.

## In the agent system

TextBlock('hello'), a ToolUse block and TokenCount(input=1200, output=340) are value objects. They are frozen (they cannot change), and equality and hashing use their fields. A hash is a short fingerprint made from the content. The harness relies on this in several places. Removing duplicates compares blocks by value. Local caches use a hash of block values as the key. Usage totals add TokenCount values to make new ones, instead of changing a counter that two turns share. The provider has a prompt cache (saved work it can reuse when a request starts the same way). It matches the exact bytes of the start of the request. So the harness needs blocks that never change plus deterministic serialisation (turning data into text the same way every time). Together they keep a resent prefix byte-identical. A block in a prefix that was already sent must never change in place. If it does, the cached prefix silently stops matching.

## In a large company

Enterprise harnesses use value objects for content blocks, usage records and cost amounts. Then shared counters that change cannot corrupt audit totals or chargeback (billing each team for its own use). The risk is treating equal values as a security boundary. Two tenants (customer companies on the platform) can produce identical blocks. So any cache in the harness keyed on block values must also put the tenant and policy context in the key. Deterministic serialisation of these values also matters. That means a stable key order and fixed number formats. It lets eval and replay tools compare transcripts reliably.

## Step by step

1. Blocks and counts are created frozen.
1. To change one, you make a new copy with replace().
1. Equal content gives equal hashes, and so the same cache key.
1. Maths such as total + usage returns a new TokenCount.

## Code sketch

```python
@dataclass(frozen=True)
class TokenCount:
    input: int = 0
    output: int = 0
    def __add__(self, o):
        return TokenCount(
            self.input + o.input,
            self.output + o.output)

a, b = TextBlock('hello'), TextBlock('hello')
assert a == b and hash(a) == hash(b)
total = total + turn.usage   # new object
```

## Be careful

A frozen dataclass that holds a list can still be changed through that list. Use tuples (lists that cannot change) inside value objects, and never give them ids.

## Diagram

![Fig. 4.06: Equal content means equal objects, and a change makes a new object](/diagrams/value-object.svg)
