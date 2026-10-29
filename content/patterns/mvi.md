---
id: mvi
number: "10.04"
title: MVIModel-View-Intent
chapter: frontend
fit: direct
aka: Model-View-Intent
review_id: rev-mvi
figure_number: Fig. 10.04
figure_caption: "One loop: intent in, new state out, and the view redrawn from the state alone."
diagram: mvi.svg
analogy_title: Correspondence chess by post
---
## Gist

Turn every click and stream event into an intent, fold it into one fixed state, and draw the whole chat from that state.

## Everyday comparison

### Correspondence chess by post

Two players in different countries never share a board. Each one posts a card with one move. The club secretary applies the move to the official position. Then the secretary mails back a picture of the whole board. Each player resets their own board to match the picture exactly before thinking again. The pile of cards can replay every game from the first move.

## Classic meaning

In MVI, data flows in one direction only. The view sends intents (messages saying what happened). A pure function (one with no side effects) combines each intent with the current state into a new state, and the view draws that state. Unlike MVVM, there is one state value, and only this function makes new versions of it.

## In the agent system

The chat app keeps one ChatState value. It holds the messages, the run status, pending approvals and the composer draft (the text being typed). Clicks become intents, such as Send, Stop and ApproveTool. The harness event stream becomes intents too, such as TextDelta, ToolUseStarted and TurnEnded. A pure function, reduce(state, intent), returns a new state. It never changes the old one. The view redraws from the new state and uses no other input. If you record the intents, you can replay a session exactly. This helps with bug reports and eval review (checks of how well the agent behaves).

## In a large company

Recorded intent logs let support staff replay a customer's session on a new app version. This makes them strong input for debugging and evals. In a large company they are also personal data. So recording is opt-in or done for only a sample of users. PII (personal data such as names and emails) is removed at the edge, before data leaves the device. They are kept and deleted under the same rules as transcripts, following GDPR (the EU data protection law) and the tenant contract. A tenant is one customer company sharing the platform. Side-effect commands sent after a state change, such as starting a turn, should carry an idempotency key. That is an ID that makes a repeated request safe to run twice. These commands should also be switched off during replay, so a replay never triggers real work.

## Step by step

1. The view or the event stream sends an intent, such as TextDelta.
1. The reducer combines the current state and the intent into a new state.
1. The store replaces the old state with the new snapshot.
1. The view draws the whole screen from the snapshot and waits for the next intent.

## Code sketch

```python
def reduce(s, i):
    if i.kind == 'send':
        m = s.msgs + [Msg('user', i.text)]
        return s.copy(busy=True, msgs=m)
    if i.kind == 'text_delta':
        old = s.msgs[-1]
        new = old.copy(text=old.text + i.text)
        msgs = s.msgs[:-1] + [new]
        return s.copy(msgs=msgs)
    if i.kind == 'turn_end':
        return s.copy(busy=False)
    return s
```

## Be careful

Do not call the harness API from inside the reducer, because that breaks replay. Instead, return side effects (actions that change the outside world) as separate commands. They run after the state changes.

## Diagram

![Fig. 10.04: One loop: intent in, new state out, and the view redrawn from the state alone.](/diagrams/mvi.svg)
