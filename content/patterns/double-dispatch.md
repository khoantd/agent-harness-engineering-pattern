---
id: double-dispatch
number: "1.12"
title: Double Dispatch
chapter: agent-loop
fit: direct
figure_number: Fig. 1.12
figure_caption: "The event type picks the method, and the current state picks its behaviour."
diagram: double-dispatch.svg
analogy_title: "The referee's foul call"
---
## Gist

Choose the handler from two runtime types at once: the incoming event's type and the session's current state.

## Everyday comparison

### The referee's foul call

A football referee's decision depends on two things together: what the foul was and where it happened. A trip in midfield gives a free kick. The same trip inside the penalty box gives a penalty. A handball on the goal line may add a red card. The rulebook is a grid of foul type against pitch position, not one list.

## Classic meaning

A way to pick which method to call from the runtime types of two objects (their actual types while the program runs). Usually the first object calls back into the second.

## In the agent system

The harness receives several event types: UserMessage, Interrupt, ToolResult and ApprovalReply. Meanwhile the session can be in several states: Idle, Streaming and RunningTool. The right action depends on both. A UserMessage in Idle starts a turn, but in RunningTool it waits in a queue. An Interrupt in Streaming cancels the request, but in RunningTool it kills the child process (the separate program running the tool). The event's dispatch(state) method calls state.on_user_message(self) or state.on_interrupt(self). So the language's own method lookup picks the right cell in the event-by-state grid. No type switches (long if-else checks on type) are needed.

## In a large company

In practice, enterprise harnesses dispatch on more than two things: event type, session state, and the caller's role or tenant tier. A tenant is one customer company, and its tier is its service level. Once the role axis appears, many teams move the grid into a policy engine such as OPA or Cedar. A policy engine decides what is allowed from written rules. Event-by-state behaviour stays in code, and identity-based decisions go in policy. Then each part can be reviewed by its own owners. The control is a default cell that denies or queues. So an unexpected combination is rejected and logged instead of acted on. An example is an approval reply that arrives while the session is Idle.

## Step by step

1. An event arrives, and the harness calls event.dispatch(current_state).
1. The event calls back the state method named after its own type.
1. That state method runs the behaviour for this event in this state.
1. It returns the next state, which handles the next event.

## Code sketch

```python
class Interrupt(Event):
    def dispatch(self, state):
        return state.on_interrupt(self)

class RunningTool(State):
    def on_interrupt(self, ev):
        self.proc.kill()
        return Idle()
    def on_user_message(self, ev):
        self.pending.append(ev)
        return self
```

## Be careful

The grid grows as types times states. When most cells share a default, a small lookup table is easier to read than many methods.

## Diagram

![Fig. 1.12: The event type picks the method, and the current state picks its behaviour.](/diagrams/double-dispatch.svg)
