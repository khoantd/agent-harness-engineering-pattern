---
id: composite-view
number: "10.10"
title: Composite View
chapter: frontend
fit: direct
review_id: rev-composite-view
figure_number: Fig. 10.10
figure_caption: "Messages and blocks share one interface, so a new piece of text finds its leaf by walking the tree."
diagram: composite-view.svg
analogy_title: A toy spaceship built from sub-assemblies
---
## Gist

Build the transcript as a tree of message parts, so text, tool cards and artifact cards all draw through one shared interface.

## Everyday comparison

### A toy spaceship built from sub-assemblies

The building-brick instructions have you make the cockpit, each wing and the engine pod from separate bags. Each part is complete on its own and clicks onto the body with the same studs. Lift the ship, and everything comes with it. Pull off a wing, and you can rebuild it without touching the cockpit.

## Classic meaning

A screen is built from smaller views arranged in a tree. Each one is managed on its own, so a page is put together from reusable parts.

## In the agent system

The TranscriptView holds one MessageView per message. Each assistant MessageView holds child views, chosen by content block type (the kind of piece inside a message). TextView is for text. ThinkingView is for a folded-up thinking block. ToolCardView is for a tool_use, the model's request to run a tool. The card is later matched to its tool_result (the tool's answer) by tool_use_id. That result arrives in the next user message. If the tool call produced an artifact (a file or page the agent made), the card holds an ArtifactCardView child. Every part has the same two functions: render() to draw itself and update(delta) to take in new text. Suppose a streamed piece of text arrives for block 2 of the last message. The transcript passes it down the tree, and only that leaf (end part) redraws.

## In a large company

Enterprise transcripts can run to thousands of blocks. So the views are virtualised: only the parts visible on screen are drawn. Each part is keyed by message id and block id. Each leaf type is a natural place for policy. For example, a tool card can hide redacted fields (data removed for privacy). A citation view can show document sensitivity labels. An older app may meet block types it does not know. It should show a safe placeholder for them, so a server upgrade never breaks the whole tree.

## Step by step

1. The transcript view creates one message view per message.
1. Each message view creates a child view per content block, chosen by block type.
1. render() on the top view draws the children, in order, all the way down.
1. A streamed piece of text is passed down the tree to the one leaf it belongs to.

## Code sketch

```python
BLOCK_VIEWS = {'text': TextView,
               'thinking': ThinkingView,
               'tool_use': ToolCardView}

class MessageView(View):
    def __init__(self, msg):
        self.kids = [BLOCK_VIEWS[b.type](b)
                     for b in msg.content
                     if b.type in BLOCK_VIEWS]
    def render(self):
        return div(*(k.render()
                     for k in self.kids))
```

## Be careful

If one new piece of text makes the whole tree redraw, long transcripts get slow. Give each part a stable key (a fixed ID), so only the changed leaf redraws.

## Diagram

![Fig. 10.10: Messages and blocks share one interface, so a new piece of text finds its leaf by walking the tree.](/diagrams/composite-view.svg)
