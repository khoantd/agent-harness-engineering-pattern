---
id: event-aggregator
number: "5.11"
title: Event Aggregator
chapter: multi-agent
fit: direct
figure_number: Fig. 5.11
figure_caption: "Sources and listeners each know one object, the hub, instead of each other."
diagram: event-aggregator.svg
analogy_title: The newsroom wire desk
---
## Gist

Collect events from every harness part in one hub, so listeners sign up once instead of connecting to each source.

## Everyday comparison

### The newsroom wire desk

Reports pour in from news agencies, freelance reporters and police scanners. No editor watches every feed. Everything lands at the wire desk. The sports editor asks the desk for anything about football. The business editor asks for markets. A new feed plugs into the desk, and no editor even notices.

## Classic meaning

One object receives events from many sources. Subscribers sign up with that one object instead of with each source.

## In the agent system

A harness has many event sources. They include the tool runner, the subagent pool, the file watcher, the permission gate and the model client's stream. Without a hub, the status bar, the transcript writer and the cost meter would each connect to every source. An event aggregator is the one object they all share. Sources call hub.emit to send an event. Listeners call hub.on with an event type to sign up. The hub usually lives inside the same program. It runs handlers right away, one after another. This is unlike a pub-sub broker (a separate message service) on a network. It also gives one place to add filtering, ordering or recording.

## In a large company

Company harnesses use an in-process event hub as the one place to attach three things. These are audit logging, OpenTelemetry span events (records in a standard format for tracing what software does) and cost metering. So every tool call and approval is recorded without changing each part. A forwarder on the hub sends chosen events to the platform's central stream, such as Kafka or EventBridge. From there they feed the SIEM (the security team's log monitoring system) and analytics. Keep handlers isolated, so an error in one listener cannot stop the emit or block the audit handler. Redact event data (remove secrets and personal data) before it leaves the process.

## Step by step

1. At startup, listeners sign up handlers with the hub by event type.
1. Parts of the harness send events to the hub as things happen.
1. The hub looks up the handlers for that event type.
1. It calls each handler in the order they signed up.

## Code sketch

```python
class EventHub:
    def __init__(self):
        self.handlers = defaultdict(list)
    def on(self, kind, fn):
        self.handlers[kind].append(fn)
    def emit(self, kind, **data):
        for fn in self.handlers[kind]:
            fn(**data)

hub.on('tool.done', cost_meter.add)
tool_runner.hub = subagents.hub = hub
```

## Be careful

When everything talks only to the hub, it gets hard to see who reacts to what. So keep an automatically generated list of event types and their handlers.

## Diagram

![Fig. 5.11: Sources and listeners each know one object, the hub, instead of each other.](/diagrams/event-aggregator.svg)
