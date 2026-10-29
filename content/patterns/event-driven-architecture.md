---
id: event-driven-architecture
number: "8.06"
title: Event-Driven Architecture
chapter: architecture
fit: direct
review_id: rev-event-driven-architecture
figure_number: Fig. 8.06
figure_caption: Senders publish once. Each listener picks the events it needs.
diagram: event-driven-architecture.svg
analogy_title: The station departure board
---
## Gist

Every harness part publishes typed events and reacts to them, so the loop never calls the UI, store or meter directly.

## Everyday comparison

### The station departure board

When a train pulls in, the signal box announces it once. The display boards update. The cleaners head for the carriages. The café gets its trolley ready, and the taxi rank sees the crowd coming. The driver never phones any of them. Each team listens for the announcements that concern it.

## Classic meaning

Parts talk by sending and receiving events through a broker or stream. A sender does not know who will react.

## In the agent system

The agent loop sends events onto a stream for each session. Examples are message_start, text_delta, tool_use, tool_result and turn_complete. The chat UI subscribes over SSE (a live stream of updates to a browser) to show text and tool cards. The transcript writer saves every event. The usage meter adds up tokens (small chunks of text that models bill by) for billing. A notifier sends a phone alert when a long background run finishes. You can add a new listener, such as a test logger, without changing the loop. The stream keeps events in order for each session. So a client that reconnects can replay everything after its last event id.

## In a large company

Large platforms usually run the session stream on Kafka, Google Pub/Sub or Amazon EventBridge. These are services that carry events between systems. They split the stream by session id. That keeps order within each session while the listeners scale out. Listeners include the audit archive with a retention policy (how long to keep data) and the chargeback meter (billing each team). They also include DLP scanners (data loss prevention: tools that catch leaks of sensitive data) and test sampling. Each one is in its own consumer group, so each reads the stream on its own. Events should carry the tenant id (which customer company) and trace context (W3C traceparent, a standard tracking header). They should also carry a schema version that a schema registry checks. The key risk: raw events contain prompts and tool outputs with PII (personal data such as names and emails). So topics need encryption and access lists for each listener. Data also needs redaction (removing sensitive parts) before it reaches analytics.

## Step by step

1. The loop and the tool runner publish typed events to the session stream.
1. The broker adds each event to the log with a sequence number.
1. Each subscriber picks out the event types it cares about.
1. Each subscriber reads from its own cursor (its place marker) on the log. A slow one falls behind and catches up. It does not block the loop.

## Code sketch

```python
bus.publish(sid, Event('tool_use', call))

@bus.subscribe('text_delta')
def to_ui(ev): sse[ev.sid].send(ev.data)

@bus.subscribe('*')
def persist(ev): transcript.append(ev)

@bus.subscribe('turn_complete')
def bill(ev): meter.add(ev.usage)
```

## Be careful

When handlers send more events, the chains get hard to follow. Put a correlation id (one shared tracking number) on every event. Without it, a stuck turn is very hard to trace.

## Diagram

![Fig. 8.06: Senders publish once. Each listener picks the events it needs.](/diagrams/event-driven-architecture.svg)
