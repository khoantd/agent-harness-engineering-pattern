---
id: iterator
number: "1.08"
title: Iterator
chapter: agent-loop
fit: direct
review_id: rev-iterator
figure_number: Fig. 1.08
figure_caption: Consumers pull one item at a time and never see the source behind it.
diagram: iterator.svg
analogy_title: The sushi conveyor belt
---
## Gist

Go through stream events, turns or stored messages one at a time with next(), without loading or exposing the whole source.

## Everyday comparison

### The sushi conveyor belt

At a conveyor-belt sushi bar, you never see the kitchen's order list. Plates arrive in front of you one at a time, and you take the next one when you are ready. The chef may be slicing fresh fish or taking plates from the fridge. Either way, your side of the counter works the same.

## Classic meaning

Give a way to go through the items of a collection one by one, without showing how the collection is stored.

## In the agent system

A streaming model reply arrives as server-sent events (SSE: small messages the server pushes one after another). Their names include message_start, content_block_delta and content_block_stop. The SDK (the provider's code library) wraps the raw stream of bytes in an async iterator. An async iterator hands out items one at a time as they arrive, without freezing the program. So the harness can write async for event in stream and show text deltas (new pieces of text) as they come in. The same idea is used in other places. A transcript iterator reads JSONL lines (one JSON record per line) from disk only when needed. A paginated iterator over a long history fetches the next page only when the consumer asks. Consumers never care whether the items come from a network socket, a file or an API.

## In a large company

Enterprise platforms usually stream model output through an LLM gateway, a central service that all model calls pass through. The gateway iterates over the provider's SSE events (server-sent events) and sends them on to clients. While doing so, it counts tokens for chargeback (billing each customer). It also scans each delta (new piece of text) for DLP violations. DLP means data loss prevention, which stops sensitive data from leaking. Long transcripts and audit logs are read with paginated or cursor-based iterators from object storage or a database. A cursor marks where the last read stopped. These records are never loaded into memory all at once. The risk is that inline streaming DLP sees text one delta at a time. So a secret split across two deltas can slip through, unless the scanner keeps a sliding window (a short memory of recent text).

## Step by step

1. The harness wraps the source (a stream, a file or a paged API) in an iterator object.
1. The consumer asks for the next item.
1. The iterator reads just enough of the source to make one item.
1. When the source runs out, the iterator signals the end and the loop stops.

## Code sketch

```python
async for ev in client.stream(req):
    if (ev.type == 'content_block_delta'
        and ev.delta.type == 'text_delta'):
        ui.append(ev.delta.text)
    elif ev.type == 'message_stop':
        break

def turns(path):  # lazy over a JSONL file
    with open(path) as f:
        for line in f:
            yield json.loads(line)
```

## Be careful

An iterator over a live stream can be read only once. If both the screen and the transcript writer need the events, keep a copy of them.

## Diagram

![Fig. 1.08: Consumers pull one item at a time and never see the source behind it.](/diagrams/iterator.svg)
