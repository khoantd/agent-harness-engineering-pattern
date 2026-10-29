---
id: bloc
number: "10.06"
title: Bloc
chapter: frontend
fit: direct
review_id: rev-bloc
figure_number: Fig. 10.06
figure_caption: "One event goes in, and a stream of states comes out over time."
diagram: bloc.svg
analogy_title: The automatic car wash
---
## Gist

Feed screen events into a component's input and listen to the stream of states it sends back, so one Send gives many states.

## Everyday comparison

### The automatic car wash

You drive up, press one button and roll onto the conveyor belt. You cannot steer or reach the brushes. You watch the sign over the tunnel change: Soaping, Rinsing, Waxing, Drying, Done. One press at the entrance produces a whole series of signs. If the dryer jams, the sign reads Fault instead.

## Classic meaning

Bloc means Business Logic Component. It receives events through a sink (an input slot), runs logic that may wait on other work, and sends its results out as a stream of states. Widgets rebuild from each state. Unlike Flux, one event can produce a whole series of states over time.

## In the agent system

A ChatBloc accepts events such as SendPressed, StopPressed and ApprovalGiven on its sink. Its SendPressed handler is an async generator, a function that can wait and hand out several results over time. First it yields (sends out) Sending. Then it waits on the harness stream and yields Streaming, with the growing text, after each new piece. It yields AwaitingApproval when a tool needs permission. It ends with Done or Failed. Widgets only listen to the state stream and rebuild. They never call the harness. A StopPressed event cancels the running handler. It then calls the harness cancel endpoint, so the server stops the turn. Finally it sends out Cancelled.

## In a large company

Enterprise agents often have mobile apps built with Flutter (a toolkit for phone apps). There, one bloc per screen keeps streaming, approval and error states testable. CI (the automatic build and test system) feeds them recorded event sequences. Cancelling is the critical path. StopPressed must reach a cancel endpoint on the server, so tools stop and spending ends. The cancel is written to the audit trail (the permanent record of who did what). Failed states should turn server error types into clear messages, without showing internal details. Examples are 429 (too many requests) with Retry-After, and 529 (overloaded).

## Step by step

1. The widget adds SendPressed to the bloc's event sink.
1. The bloc's handler yields Sending and opens the harness stream.
1. Each new piece of streamed text yields a new Streaming state with the text so far.
1. When the turn ends, the bloc yields Done, and widgets rebuild on every state.

## Code sketch

```python
class ChatBloc(Bloc):
    async def on_send(self, ev):
        yield Sending()
        text = ''
        async for d in harness.stream(ev.msg):
            text += d.text
            yield Streaming(text)
        yield Done(text)

bloc.add(SendPressed('fix the test'))
```

## Be careful

Sending a state for every token (small piece of text) floods widgets with rebuilds. Collect the new pieces and send at most one Streaming state per frame (one screen refresh).

## Diagram

![Fig. 10.06: One event goes in, and a stream of states comes out over time.](/diagrams/bloc.svg)
