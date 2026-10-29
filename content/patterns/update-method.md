---
id: update-method
number: "1.02"
title: Update Method
chapter: agent-loop
fit: adapted
figure_number: Fig. 1.02
figure_caption: "The loop knows one call, and each subsystem decides what that call does."
diagram: update-method.svg
analogy_title: "The zookeeper's feeding round"
---
## Gist

Give each part of the harness its own update hook, and let the loop call every hook once per turn.

## Everyday comparison

### The zookeeper's feeding round

Every morning the zookeeper walks the same path past every enclosure. The penguins get fish, the giraffes get acacia leaves, and the tortoise gets lettuce and a quick shell check. The keeper does not need to remember each animal's diet. Each enclosure has its own routine posted on the gate. The round simply visits them all in turn.

## Classic meaning

Each object in a simulation has an update method. The main loop calls it on every active object once per frame.

## In the agent system

Between model calls, a harness has many small jobs that must move forward a little each turn. The token meter works out how much text has been used so far. The compactor watches the context window (the text the model can see at one time). It checks whether the window is nearly full and must be shrunk. A todo tracker reminds the model if its task list is out of date. A poller collects background tasks that have finished. The harness does not write all of this into the loop itself. Instead, each subsystem (each separate part of the harness) registers an object with an on_turn(ctx) method. Here ctx is the context object that holds this turn's information. The loop goes through the list of registered objects once per turn. So adding a new behaviour means one new registration, not a change to the loop.

## In a large company

Enterprise harnesses use per-turn update hooks for duties that touch every part of the system. One example is a budget meter. It reports spending to the chargeback ledger (the record used to bill each customer). Another is a policy refresher that picks up changed tenant settings. A tenant is one customer company sharing the platform. A third is a DLP monitor that samples new context. DLP (data loss prevention) means tools that stop sensitive data from leaking. Each hook should send its own OpenTelemetry span. OpenTelemetry is a standard for tracing software, and a span is one timed record of work. This way a slow part shows up against the turn latency SLOs (reliability targets for how fast a turn finishes). The control to enforce is this. The platform registers the hooks that tenants require, and a user or plugin setting cannot remove them or change their order.

## Step by step

1. Subsystems register objects that have an on_turn(ctx) method.
1. At the start of each turn, the loop builds a TurnContext (this turn's shared information).
1. The loop calls on_turn(ctx) on every registered object, in order.
1. Each object reads or changes the context, then the model call goes ahead.

## Code sketch

```python
class Compactor:
    def on_turn(self, ctx):
        if ctx.tokens > 0.8 * ctx.window:
            ctx.msgs = summarise(ctx.msgs)

systems = [BudgetMeter(), Compactor(),
           TaskPoller(), TodoNudger()]

for turn in agent_loop():
    for s in systems:
        s.on_turn(turn.ctx)
```

## Be careful

Sometimes one update needs another update's result. Then the order of registration matters, so write that order down or merge those parts.

## Diagram

![Fig. 1.02: The loop knows one call, and each subsystem decides what that call does.](/diagrams/update-method.svg)
