---
id: data-bus
number: "5.12"
title: Data Bus
chapter: multi-agent
fit: direct
figure_number: Fig. 5.12
figure_caption: "Every message reaches every member, and each member does its own filtering."
diagram: data-bus.svg
analogy_title: The site radio channel
---
## Gist

Connect every agent to one shared bus that carries all messages, and let each member decide which messages to act on.

## Everyday comparison

### The site radio channel

On a building site everyone carries a walkie-talkie tuned to one channel. The crane driver says a load is swinging over the east side. The scaffolders hear it, the electricians hear it, and so does the tea van. Each person decides whether the message concerns them. Nobody keeps a list of who should be told.

## Classic meaning

Parts of a system attach to a shared bus (a common channel) and post messages onto it. Every attached member sees every message and filters for itself.

## In the agent system

A small team of agents can share one bus inside the program. The planner, coder, tester, a UI panel and the transcript writer all attach to it. Every message (plan.updated, file.saved, tests.failed) goes onto the bus and reaches all members. Each member checks the message type and ignores what it does not handle. There is no routing table. That keeps things simple while the team is small and there are few messages. The bus is also one single place to record every message into the transcript for replay.

## In a large company

The main company objection is that a broadcast bus breaks least privilege (giving each part only the access it needs). Every member sees every message and any tenant data in it, including UI panels and third-party plugins. A tenant is one customer company sharing the platform. So platforms limit a data bus to one session in one process. Traffic between sessions or between tenants moves to topic-based brokers with ACLs (access lists). When a bus is used, recording every message to the transcript gives a full audit and replay log. But that log must follow the same retention rules (how long data is kept) and redaction rules (removing secrets and personal data).

## Step by step

1. Each agent attaches to the bus when it starts.
1. An agent posts a typed message onto the bus.
1. The bus hands the message to every attached member.
1. Each member filters by message type and acts only on the ones it handles.

## Code sketch

```python
class DataBus:
    def __init__(self):
        self.members = []
    def attach(self, m):
        self.members.append(m)
    def post(self, msg):
        for m in self.members:
            m.receive(msg)

class Tester(Member):
    def receive(self, msg):
        if msg.type == 'file.saved':
            self.queue_tests(msg.path)
```

## Be careful

Every member receives every message, so the bus copes badly with growth. Once members ignore most of the traffic, move to topics or an event aggregator.

## Diagram

![Fig. 5.12: Every message reaches every member, and each member does its own filtering.](/diagrams/data-bus.svg)
