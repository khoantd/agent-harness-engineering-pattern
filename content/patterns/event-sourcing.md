---
id: event-sourcing
number: "4.13"
title: Event Sourcing
chapter: memory
fit: direct
figure_number: Fig. 4.13
figure_caption: "The log is the truth, and every view is rebuilt from it"
diagram: event-sourcing.svg
analogy_title: The chess score sheet
---
## Gist

Store a session as events that are only ever added, and rebuild any view (model context, chat UI, a fork) by replaying them.

## Everyday comparison

### The chess score sheet

Club players write every move on a score sheet: 1. e4 e5 2. Nf3 Nc6. Nobody photographs the board. From the sheet you can rebuild the position at move 30. You can go back to move 12 to study a mistake, or start a new game from that position.

## Classic meaning

Save an object's state as the list of events that changed it. Work out the current state by replaying those events in order.

## In the agent system

The harness stores events such as user_message, assistant_message, tool_use, tool_result, compaction and rewind. Compaction means replacing old messages with a summary. Rewind means going back to an earlier point. The harness never stores a current context that it edits. The context sent to the model is a projection (a view built from the events). To build it, the harness replays the events, applies compaction summaries and drops branches that were rewound. The chat UI is another projection, and a cost report is a third. Rewinding to a checkpoint, or forking a subagent (a helper agent) from turn 12, means replaying events up to event 12 into a new stream. Nothing in the original history is overwritten.

## In a large company

Enterprise agent platforms often store sessions as events, because the event log is also the audit trail that regulators and security teams ask for. It is often streamed to Kafka (a system for moving streams of events) or something similar, for analytics and a SIEM (a security monitoring system). The hard conflict is with the right to erasure (a person's legal right to have their data deleted). The history is only ever added to, so events cannot simply be deleted. The usual answer is crypto-shredding. Personal content is encrypted with a key per person or per tenant (customer company), and the key is destroyed on request. The event structure stays in place. Projections and snapshots built from the log must then be rebuilt or wiped. Otherwise the erased data survives in a read view.

## Step by step

1. Every change is added as a new event, and nothing is edited in place.
1. To build the next request, the harness folds the events into a list of messages.
1. Other readers fold the same events into their own views.
1. Rewind and fork replay the first part of the events into a new stream.

## Code sketch

```python
events = store.read(session_id)

def project_context(events, upto=None):
    msgs = []
    for e in events[:upto]:
        if e.type == 'message':
            msgs.append(e.msg)
        elif e.type == 'compaction':
            msgs = [e.summary]
        elif e.type == 'rewind':
            msgs = msgs[:e.to]
    return msgs
```

## Be careful

Replaying thousands of events every turn gets slow. Save snapshots of the built context from time to time, and replay only the events after the latest snapshot.

## Diagram

![Fig. 4.13: The log is the truth, and every view is rebuilt from it](/diagrams/event-sourcing.svg)
