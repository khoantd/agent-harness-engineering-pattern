---
id: partial-response
number: "3.17"
title: Partial Response
chapter: llm-layer
fit: direct
review_id: rev-partial-response
figure_number: Fig. 3.17
figure_caption: Text reaches the user as it arrives. Tools run only once the message is complete.
diagram: partial-response.svg
analogy_title: "Election night, seat by seat"
---
## Gist

Deliver a model's answer piece by piece as it is written, or send only the fields a caller asked for.

## Everyday comparison

### Election night, seat by seat

On election night, the TV studio does not wait until dawn to read out every result at once. Each area's result is announced the moment its count finishes. Viewers watch the map fill in through the night and can go to bed early. Anyone who only wants the headline watches the strip at the bottom of the screen. It shows the seat totals and nothing else.

## Classic meaning

A partial response lets a client get part of a resource. This can be a subset of fields, or a stream of the result as it is produced. It saves bandwidth and waiting time.

## In the agent system

With streaming on, the model API sends server-sent events (SSE: a stream of small messages over one connection). First comes message_start. Then each content block gets a content_block_start event. Next comes a run of content_block_delta events. These carry text_delta or input_json_delta pieces. Each block ends with content_block_stop. Then a message_delta event carries the stop_reason (why the model stopped) and usage. Last comes message_stop. The harness sends text pieces to the chat UI at once. It holds input_json_delta pieces until a tool_use block (the model's request to run a tool) is complete. It runs tools only after the stream ends with stop_reason tool_use. It can cancel the stream when the user presses stop. Field selection is the same idea for reads. The UI polls a status endpoint. That endpoint returns only the run's state and token count, never the whole transcript.

## In a large company

In an enterprise platform, streaming passes through the LLM gateway (the central entry point for model calls). The gateway must stream from end to end. Proxies and load balancers must not hold back the response. The gateway still applies output DLP (data loss prevention: stopping sensitive data from leaving) or redaction. It often does this on a small rolling window, so users still see text quickly. Time to first token and stream completion are SLO metrics (measures tied to reliability targets). Cancelled streams are recorded, so partial output and its cost appear in the audit trail. Field selection on status and transcript endpoints also serves as data minimisation (sharing only the data needed). This supports GDPR (the EU data protection law) and least-privilege access to transcripts (giving each person only the access they need).

## Step by step

1. Open a streaming request to the model API.
1. Send each text piece to the UI and add it to the turn buffer.
1. Collect tool input pieces until each block stops. Ignore ping events and unknown events.
1. On message_delta, record stop_reason and usage. Close the turn on message_stop.
1. Run the buffered tool calls only if stop_reason is tool_use.

## Code sketch

```python
with client.messages.stream(**req) as s:
    for ev in s:
        if ev.type == 'content_block_delta' \
           and ev.delta.type == 'text_delta':
            ui.send(ev.delta.text)
        # input_json_delta: SDK buffers it
        # ping and unknown events: ignore
    msg = s.get_final_message()
if msg.stop_reason == 'tool_use':
    run_tools(msg.content)  # whole inputs
elif msg.stop_reason == 'max_tokens':
    continue_or_fail(msg)   # may be cut off
```

## Be careful

Never act on a partial tool input. A half-streamed path such as '/home/user/pro' is a valid start of the real path, and it points to the wrong file.

## Diagram

![Fig. 3.17: Text reaches the user as it arrives. Tools run only once the message is complete.](/diagrams/partial-response.svg)
