---
id: domain-model
number: "8.20"
title: Domain Model
chapter: architecture
fit: direct
figure_number: Fig. 8.20
figure_caption: The handler calls one method. The objects enforce the rules among themselves.
diagram: domain-model.svg
analogy_title: The orchestra that knows its parts
---
## Gist

Put turn-handling rules inside rich objects like Conversation, Turn and ToolCall, so behaviour lives with the data it protects.

## Everyday comparison

### The orchestra that knows its parts

In an orchestra each player knows their own part. The oboist knows when to come in. The timpanist tunes their own drums. Each section leader keeps their section together. The conductor gives cues, not finger positions. How to play the violin lives with the violinist, not in a manual on the conductor's stand.

## Classic meaning

An object model of the business area that joins data and behaviour. Business rules are written as methods on the objects themselves.

## In the agent system

A Conversation aggregate (a group of objects saved and changed as one unit) owns its Turns. Its submit() method refuses new input while a turn is still running. A ToolCall moves through pending, approved, running and done. It rejects any step that breaks that order. A TokenBudget charges usage and reports when it runs out. (A token is a small chunk of text that models count and bill by.) The request handler just loads the Conversation, calls one method and saves it. Some rules matter a lot. For example, every tool_use (the model's request to run a tool) must get a tool_result before the next model call. Rules like this are enforced in one place. They are unit-tested without a database.

## In a large company

In large platforms, the domain model is where approval rules become code that is enforced. ToolCall.approve can require that the approver has the right role and is not the person who asked. This supports separation of duties (no one person can both ask and approve). Aggregates such as Conversation carry the tenant id (which customer company) and the data class. So the objects themselves can check rules on how long data is kept and where it is stored. Each change of state sends out domain events (records of what happened) that feed the audit trail. The risk is that permission checks drift out of the model and into handlers on some surfaces. So unit-test the invariants that compliance depends on at the model level.

## Step by step

1. The handler loads a Conversation aggregate from its repository (its storage class).
1. It calls a behaviour method such as conversation.submit(text).
1. The objects check invariants (rules that must always hold) and update each other: Turn, ToolCall, TokenBudget.
1. The repository saves the whole aggregate in one go.

## Code sketch

```python
class ToolCall:
    def approve(self, by):
        if self.state != 'pending':
            raise BadTransition(self.state)
        self.state = 'approved'
        self.approver = by

class Conversation:
    def submit(self, text):
        if self.turns and self.turns[-1].open:
            raise TurnInProgress()
        self.turns.append(Turn.start(text))
```

## Be careful

Loading the full rich model on every turn gets slow for long transcripts. Load old turns only when needed, or keep them as summaries inside the aggregate.

## Diagram

![Fig. 8.20: The handler calls one method. The objects enforce the rules among themselves.](/diagrams/domain-model.svg)
