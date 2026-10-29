---
id: mediator
number: "5.02"
title: Mediator
chapter: multi-agent
fit: direct
figure_number: Fig. 5.02
figure_caption: "Every subagent talks to the orchestrator, and none of them talk to each other."
diagram: mediator.svg
analogy_title: The control tower
---
## Gist

Send all subagent coordination through one orchestrator, so specialists never need to know about or message each other.

## Everyday comparison

### The control tower

Pilots coming into a busy airport do not argue over runway slots with each other on the radio. Each pilot talks only to the tower. The tower sees every aircraft and tells each pilot when to land, wait or taxi. When a tenth plane arrives, nobody else's instructions change. The tower simply fits one more plane into the order.

## Classic meaning

A mediator is one object that holds the rules for how a group of objects work together. Each object talks to the mediator instead of talking to the others directly.

## In the agent system

In an orchestrator and subagent design, there is a researcher, a coder, a tester and a reviewer. Each is a subagent (a helper agent with its own job). Each one reports only to the orchestrator (the agent in charge of the plan). The orchestrator holds the plan and decides who runs next. It turns one subagent's output into the next one's task brief. It trims the brief down to what that subagent needs in its context (the text the model can see). If subagents chatted directly, the number of message paths would grow fast. Context would repeat in every exchange, and the run would be hard to follow. To add a new specialist, you teach the orchestrator one more route. The existing subagents stay the same.

## In a large company

In a company platform the orchestrator is the natural mediator. It is also the natural place to enforce rules. It checks each hand-off with the policy engine, such as OPA or Cedar (tools that answer 'is this allowed?'). It removes data that the next subagent is not cleared to see. It writes every routing decision to the audit trail. Subagents get only scoped, short-lived credentials (login details limited to their own tools that expire soon). The risk is that the mediator holds a lot of power and is a single point of failure. So give it its own SLO (a reliability target) and keep its state in a durable store (one that survives crashes). Treat changes to its routing rules as reviewed releases that must pass evals (automated quality tests) first.

## Step by step

1. A subagent finishes and returns its result to the orchestrator.
1. The orchestrator records the result in the shared plan.
1. It decides which specialist acts next and writes a focused brief for it.
1. That subagent runs with only the brief and reports back the same way.

## Code sketch

```python
class Orchestrator:
    def __init__(self, agents, plan):
        self.agents, self.plan = agents, plan
    def notify(self, sender, result):
        self.plan.record(sender, result)
        nxt = self.plan.next_step()
        if nxt:
            brief = self.brief_for(nxt, result)
            self.agents[nxt.role].send(brief)
```

## Be careful

A mediator that keeps every subagent's full output in its own context becomes a token bottleneck (it fills up and slows everything down). Store the raw output in files and keep only short summaries in the plan.

## Diagram

![Fig. 5.02: Every subagent talks to the orchestrator, and none of them talk to each other.](/diagrams/mediator.svg)
