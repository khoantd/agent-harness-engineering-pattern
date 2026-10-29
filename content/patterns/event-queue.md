---
id: event-queue
number: "6.05"
title: Event Queue
chapter: async
fit: direct
figure_number: Fig. 6.05
figure_caption: Events wait in the inbox until the loop reaches a turn boundary.
diagram: event-queue.svg
analogy_title: The radio request line
---
## Gist

Hold events that arrive mid-turn in a queue, so the agent loop handles them in order at a safe point.

## Everyday comparison

### The radio request line

Listeners phone in song requests while a track is playing. The producer writes each one on a card. The card goes to the back of a pile in the booth. The DJ never cuts a song off halfway. Between tracks, the DJ takes the next card from the front of the pile and plays it.

## Classic meaning

Sending an event and handling it happen at different times. The sender puts it in a queue, and the receiver empties the queue when it is ready.

## In the agent system

While the model streams a reply or a tool runs, other things keep happening. The user types a follow-up. A background subagent finishes. A file watcher fires. A scheduled trigger arrives. Handling each one at once would push it into the middle of the current turn. A turn is one round of model reply plus tool calls. That would corrupt the transcript (the saved record of the conversation). So the harness adds each event to a per-session event queue and returns. At the turn boundary, the agent loop drains (empties) the queue in arrival order. It turns the events into messages before the next model call.

## In a large company

Sometimes sessions can move between pods (the small server units that run the code). Then the per-session inbox lives in a durable store, or in a stream partition keyed by session id. A partition is one ordered slice of a stream. So events survive failover (a switch to a backup server) and stay in order. Events from webhooks, file watchers or other agents are untrusted input. So the loop should add them as clearly labelled notifications that say where they came from. It must never add them as if the user had typed them. Cap and merge events per session. Log dropped or merged events for audit.

## Step by step

1. A sender posts an event to the session queue and returns at once.
1. The current model call or tool call goes on undisturbed.
1. At the turn boundary, the loop drains queued events in arrival order.
1. Each event becomes a message in the context for the next model call.

## Code sketch

```python
inbox = collections.deque()

def post(event):        # any hook or thread
    inbox.append(event)

def at_turn_boundary(ctx):
    while inbox:
        ev = inbox.popleft()
        ctx.messages.append(ev.to_message())
```

## Be careful

Events may arrive faster than turns finish. Then merge or cap them, or the next prompt fills up with old notices.

## Diagram

![Fig. 6.05: Events wait in the inbox until the loop reaches a turn boundary.](/diagrams/event-queue.svg)
