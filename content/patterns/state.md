---
id: state
number: "1.03"
title: State
chapter: agent-loop
fit: direct
figure_number: Fig. 1.03
figure_caption: "Each state owns its own transitions, so a tool cannot run before approval."
diagram: state.svg
analogy_title: The laundromat washing machine
---
## Gist

Make each phase of the loop its own state object, so each state decides how to react to messages, interrupts and tool results.

## Everyday comparison

### The laundromat washing machine

Press the start button on a washing machine, and what happens depends on where it is in the cycle. While it fills with water, the door can still open. During the spin, the door stays locked and the button does nothing. When it finishes, the light turns green and the door opens. It is the same button with a different response, because each stage has its own rules.

## Classic meaning

Let an object change its behaviour when its internal state changes. It does this by handing the work to a separate object for each state.

## In the agent system

An agent session moves through clear phases: Idle, CallingModel, AwaitingApproval, RunningTool and Done. The same event means different things in each phase. A new user message starts a turn when the session is Idle. The same message waits in a queue while a tool is running (RunningTool). Pressing Esc in CallingModel stops the reply that is streaming in. Pressing Esc in AwaitingApproval counts as saying no. Each phase can be written as a state class with methods such as on_message, on_interrupt and on_tool_result. This replaces a tangle of if-statements. It also makes illegal transitions impossible to write by accident. A transition is a move from one state to another. An illegal one is, for example, running a tool without approval.

## In a large company

On an enterprise platform, the harness saves the session state to storage, not just in memory. So a session in AwaitingApproval can wait hours for a human reviewer. It can then continue on another worker (another server). Durable workflow engines such as Temporal or Step Functions model these phases directly. They save each step so the work survives crashes. Every transition is written to an append-only audit log, a record that can be added to but never changed. Each record holds the actor, the tool call and the decision. The important control is in the approval step. It checks the approver's role through RBAC (role-based access control: permissions given by job role) or a policy engine. This way the person who asked cannot approve their own high-risk action.

## Step by step

1. The session keeps a reference to its current state object.
1. Every event (message, interrupt, model reply, approval) goes to that state.
1. The state handles the event and returns the next state.
1. The session switches to the new state, and the screen shows it.

## Code sketch

```python
class AwaitingApproval(State):
    def on_approve(self, s):
        return RunningTool(self.call)
    def on_deny(self, s):
        s.add_result(self.call, 'denied')
        return CallingModel()
    def on_message(self, s, m):
        s.queue.append(m)  # hold it
        return self
```

## Be careful

Do not let tools or hooks set the state field directly. Every change of state should go through the current state's methods.

## Diagram

![Fig. 1.03: Each state owns its own transitions, so a tool cannot run before approval.](/diagrams/state.svg)
