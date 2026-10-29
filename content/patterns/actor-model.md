---
id: actor-model
number: "5.01"
title: Actor Model
chapter: multi-agent
fit: adapted
review_id: rev-actor-model
figure_number: Fig. 5.01
figure_caption: Subagents share nothing. Work and results move only as messages between mailboxes.
diagram: actor-model.svg
analogy_title: Lighthouse keepers and the mail boat
---
## Gist

Run each subagent as a sealed-off actor that keeps its own context and only reacts to messages in its mailbox.

## Everyday comparison

### Lighthouse keepers and the mail boat

Each keeper lives alone on a rock with a private logbook that nobody else reads. The only contact is the mail boat. It drops letters in a box on the jetty. The keeper opens them one at a time, acts on each, and sends replies back on the next boat. No keeper ever rows across to adjust another keeper's lamp.

## Classic meaning

Actors are units of work that run at the same time. Each one keeps its own private state, talks to others only by sending messages without waiting, and handles one message at a time from its mailbox.

## In the agent system

Each subagent (a helper agent started by the main agent) has its own context window (the text the model can see at one time). It also has its own system prompt and its own set of tools. The orchestrator (the agent that hands out and tracks the work) cannot reach into that context. Work arrives as a message, a task brief, placed in the subagent's inbox. The subagent's loop takes one message at a time. So its transcript never mixes two tasks together. Results travel back the same way, as a message to the orchestrator's own inbox. Nothing is shared, so a supervisor can restart a crashed subagent without damaging anyone else's state. But the message it was working on survives only if the mailbox is durable (saved so it survives a crash). The mailbox must also remove the message only after the reply has been sent.

## In a large company

Large companies run long-lived agents as actors on a durable runtime, so mailboxes survive restarts. Examples are Temporal workflows (a system that saves each step so work can resume after a crash), Akka or Orleans. Another option is to give each agent its own Kafka or SQS queue (message services that store messages until they are read). Each actor carries its own tenant id (which customer company it works for). It also carries scoped credentials from workload identity (login details issued to the program itself, limited to what it needs) and its own token budget. This makes isolation and chargeback (billing each team for its own use) easy. The control to add is supervision. A parent watches its child actors and restarts, escalates or stops the ones that fail. It records each decision in the audit trail.

## Step by step

1. The orchestrator sends a task message to the subagent's mailbox.
1. The subagent takes one message and runs its loop inside its private context.
1. It may send messages to other actors, including subagents it starts.
1. It posts a result message to the orchestrator's mailbox and takes the next message.

## Code sketch

```python
class SubagentActor:
    def __init__(self, prompt):
        self.inbox = asyncio.Queue()
        self.ctx = [system(prompt)]  # private
    async def run(self):
        while True:
            m = await self.inbox.get()
            out = await turn(self.ctx, m.body)
            await m.reply_to.put(out)

coder.inbox.put_nowait(Msg(task, orc.inbox))
```

## Be careful

Actors that stop and wait for each other's replies can deadlock (get stuck forever, each waiting on the other). So give every request a timeout, and avoid requests that go round in a circle between subagents.

## Diagram

![Fig. 5.01: Subagents share nothing. Work and results move only as messages between mailboxes.](/diagrams/actor-model.svg)
