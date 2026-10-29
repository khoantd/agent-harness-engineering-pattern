---
id: acyclic-visitor
number: "1.11"
title: Acyclic Visitor
chapter: agent-loop
fit: direct
review_id: rev-acyclic-visitor
figure_number: Fig. 1.11
figure_caption: "The block asks the visitor what it handles, so visitors never list every type."
diagram: acyclic-visitor.svg
analogy_title: "The museum's specialist tours"
---
## Gist

Let each visitor handle only the block types it knows, so a new content block type never forces edits elsewhere.

## Everyday comparison

### The museum's specialist tours

A museum runs a sculpture tour, a paintings tour and a textiles tour. Each guide stops only at the exhibits they know and walks past the rest. When the museum opens a new photography wing, it hires a photography guide. Nobody retrains the sculpture guide.

## Classic meaning

A form of Visitor with no single interface that lists every element type. Each visitor uses small interfaces, one per type, and elements check for them while the program runs.

## In the agent system

New content block types keep arriving: thinking blocks, citations, documents and server tool results. In a classic Visitor, every new type means adding a new method to every visitor. In the acyclic version, ImageBlock.accept(v) checks whether v implements ImageVisitor. ImageVisitor is a small interface, meaning a promised set of methods, for image blocks. The block calls visit_image only if v has it. A thumbnail generator implements only ImageVisitor. A new DocumentBlock comes with its own DocumentVisitor interface, and the thumbnail generator does not change. Safety visitors are the exception. A secret redactor must treat any block type it does not handle as an error. So a new DocumentBlock is blocked until the redactor learns to scan it.

## In a large company

Enterprise platforms add block types and provider formats faster than compliance tools get updated. This is where Acyclic Visitor helps and where it hurts. Feature visitors such as thumbnail makers, renderers and analytics can safely skip unknown types. Security visitors such as DLP scanners, PII redactors and audit exporters must fail closed. DLP means data loss prevention, and PII means personal data such as names and emails. Fail closed means they block anything they cannot handle. Add a CI test, an automatic check run on every code change. It fails when any block type has no handler in a required security visitor.

## Step by step

1. Declare one small visitor interface for each block type.
1. Each visitor class implements only the interfaces it needs.
1. A block's accept(v) checks whether v supports its type.
1. If it does, the block calls the visit method. If not, it skips or uses a default.

## Code sketch

```python
@runtime_checkable
class ImageVisitor(Protocol):
    def visit_image(self, b): ...

class ImageBlock(Block):
    def accept(self, v):
        if isinstance(v, ImageVisitor):
            return v.visit_image(self)
        return v.unhandled(self)  # skip/raise

class Thumbnailer(ImageVisitor):
    def visit_image(self, b):
        return shrink(b.data, 256)
```

## Be careful

Skipping unknown types is safe for a thumbnail maker. It is not safe for a redactor or a DLP scanner (a tool that stops sensitive data from leaking). These must fail closed and reject any block type they do not handle.

## Diagram

![Fig. 1.11: The block asks the visitor what it handles, so visitors never list every type.](/diagrams/acyclic-visitor.svg)
