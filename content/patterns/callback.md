---
id: callback
number: "1.13"
title: Callback
chapter: agent-loop
fit: direct
figure_number: Fig. 1.13
figure_caption: "The client hands over functions, and the loop calls them at the right moments."
diagram: callback.svg
analogy_title: The garage that rings you
---
## Gist

Pass functions into the loop, and the loop calls them when a token streams in, a tool finishes or a turn ends.

## Everyday comparison

### The garage that rings you

You drop your car at the garage and leave a note. It says: call this number when it is ready, and text me if a repair will cost more than two hundred pounds. Then you go about your day. The mechanic does not need to know who you are or what you will do next. They just ring the number at the right moments.

## Classic meaning

Pass a piece of code to other code as an argument. The other code calls it back at the right time.

## In the agent system

Several clients share one agent loop: a terminal UI, a web client, an SDK script and an eval runner. An eval runner is a tool that tests the agent automatically. Each one wants to react at different moments. The loop accepts callbacks (functions it will call later) such as on_text_delta, on_tool_start, on_tool_end and on_turn_complete. It calls each one at its moment. The terminal prints the new pieces of text (deltas). The web client pushes them over a websocket, a live two-way connection to the browser. The eval runner ignores deltas but records every tool call. The loop itself never imports any UI code.

## In a large company

Enterprise platforms attach callbacks for audit records, OpenTelemetry exporters, cost metering and webhooks. OpenTelemetry is a standard for tracing software. A webhook sends a message to another system, such as a ticketing or chat tool. Callbacks that cross a trust boundary (the edge of trusted systems) should get redacted data, with sensitive parts removed. They should be delivered asynchronously, later and separately, through a queue such as Kafka, Pub/Sub or EventBridge. Then a slow receiver cannot hold up a turn. Audit callbacks are the exception to ignoring errors. A tenant is one customer company, and regulated tenants work under strict laws. If the audit record cannot be written, regulated tenants usually require the action to fail. They do not want it to go ahead without a log.

## Step by step

1. The caller passes callback functions when it starts a run.
1. The loop stores them and starts calling the model.
1. At each event (text delta, tool start, tool end), it calls the matching callback.
1. When the turn ends, it calls on_done with the final message.

## Code sketch

```python
def show(delta):
    term.write(delta.text)

def save(msg):
    transcript.append(msg)

agent.run(prompt,
          on_text_delta=show,
          on_tool_end=lambda c, r: log(c, r),
          on_done=save)
```

## Be careful

A slow or failing callback can block or crash the loop. Give callbacks a time limit and catch their errors, so the turn still finishes.

## Diagram

![Fig. 1.13: The client hands over functions, and the loop calls them at the right moments.](/diagrams/callback.svg)
