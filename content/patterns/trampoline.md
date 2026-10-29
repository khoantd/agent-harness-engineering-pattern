---
id: trampoline
number: "1.18"
title: Trampoline
chapter: agent-loop
fit: adapted
review_id: rev-trampoline
figure_number: Fig. 1.18
figure_caption: The driver keeps the call stack flat by running each returned step itself.
diagram: trampoline.svg
analogy_title: The choose-your-own-adventure book
---
## Gist

Run deep recursive planning as a flat loop, where each step returns the next step instead of calling it.

## Everyday comparison

### The choose-your-own-adventure book

When reading a choose-your-own-adventure book, you could keep a finger in every page you passed through. But you would soon run out of fingers. Instead, you read the note at the bottom, "turn to page 84", and flip there. You only ever hold one place in the book, however long the story runs.

## Classic meaning

Run recursive functions in a loop. Each call returns a thunk (a small package describing the next call), and a driver loop runs it until a final value appears.

## In the agent system

Some agents refine a plan one subgoal at a time. This is naturally written as a tail-recursive function, where the function's last act is to call itself. Here, plan(goal, steps) asks the model for the next subgoal and calls itself with the longer list. Python has no tail-call elimination, so it does not reuse memory for such calls. A long plan driven by the model keeps every in-between frame (a record of each unfinished call). It can then hit Python's recursion limit. With a trampoline, plan returns either Bounce(fn, args) for the next step or Done(result). A small driver loop keeps calling the bounces. This also gives the harness a natural place between steps to check the turn budget, save a checkpoint and respect a cancel request. A trampoline only flattens tail calls. A planner that branches into a tree of subgoals needs an explicit work stack instead, which is a list of pending tasks it manages itself.

## In a large company

In enterprise platforms, a durable execution engine such as Temporal or Step Functions usually replaces the trampoline's driver loop. Such an engine saves each step, so work survives crashes. Each step is a recorded activity. After a crash or deploy, the workflow continues from the last finished one. The point between bounces is where the platform enforces budgets for each tenant (each customer company). It also checks whether an operator has cancelled the run, and writes a checkpoint for audit. The risk is depth with no limit, driven by the model. So the driver needs a hard step limit set by tenant policy, not by the model's own judgement.

## Step by step

1. Rewrite the recursive planner so it returns the next call instead of making it.
1. The driver loop calls the first step.
1. While the result is a Bounce, the driver calls the function inside it.
1. When a Done arrives, the driver returns its value.

## Code sketch

```python
def plan(goal, acc):
    sub = model.next_subgoal(goal, acc)
    if sub is None:
        return Done(acc)
    return Bounce(plan, goal, acc + [sub])

def trampoline(r):
    while isinstance(r, Bounce):
        budget.check(); cancel.check()
        r = r.fn(*r.args)
    return r.value
```

## Be careful

Trampolining adds an extra layer to code that rarely goes deep. Use it only when the depth of recursion depends on model output you do not control.

## Diagram

![Fig. 1.18: The driver keeps the call stack flat by running each returned step itself.](/diagrams/trampoline.svg)
