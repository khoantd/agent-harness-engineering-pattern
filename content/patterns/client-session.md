---
id: client-session
number: "4.23"
title: Client Session
chapter: memory
fit: direct
figure_number: Fig. 4.23
figure_caption: "The client carries the whole conversation, so any replica can answer"
diagram: client-session.svg
analogy_title: "The pilgrim's credential"
---
## Gist

Keep the conversation on the client, which sends the full message history with every request, so the server stores nothing between calls.

## Everyday comparison

### The pilgrim's credential

Walkers on the Camino carry a small booklet that gets stamped at every hostel. The hostels keep no record of who passed through. Any hostel can see the whole journey so far by reading the booklet. If the walker loses it, the record is gone.

## Classic meaning

Keep session state on the client and send it to the server with every request. The server keeps no data for each session.

## In the agent system

This is how a plain messages API works. The client keeps the list of messages. On every turn it sends all of it, with the system prompt and tool definitions. Any server replica (any copy of the server) can answer any request. Nothing needs to expire. The client can freely edit, shorten or branch its history. There are costs too. First, the request gets bigger every turn. Prompt caching (the provider reusing saved work when a request starts the same way) cuts the token price, but not the bytes sent. Second, there is trust: a client can rewrite history, including tool results. Third, the history is lost if the client crashes before saving.

## In a large company

Enterprises often prefer stateless calls to the model provider, where the provider keeps nothing between calls. Sometimes this is under zero data retention terms (the provider stores no data). They keep the official history in their own harness, not in the browser. History kept on a client falls outside server-side retention, erasure and DLP (data loss prevention) controls. So storing transcripts locally on company devices needs its own policy. Fowler's classic fix, signing or encrypting the state the client holds, still applies. But the safer enterprise rule is to always check approvals and tool results again against the server's records.

## Step by step

1. The client adds the user's message to its local history.
1. It sends the whole history, the system prompt and the tools in one request.
1. Whichever replica receives it calls the model and returns the reply.
1. The client adds the reply, and the server forgets the exchange.

## Code sketch

```python
history = []        # lives in the client

def send(text):
    history.append({'role': 'user',
                    'content': text})
    r = client.messages.create(
        model=MODEL, system=SYSTEM,
        tools=TOOLS, messages=history)
    history.append({'role': 'assistant',
                    'content': r.content})
    return r
```

## Be careful

Never base security decisions on history the client holds. A client can fake earlier tool_result blocks (tool outputs) or approvals. So check permissions again on the server.

## Diagram

![Fig. 4.23: The client carries the whole conversation, so any replica can answer](/diagrams/client-session.svg)
