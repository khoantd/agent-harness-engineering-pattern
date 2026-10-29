---
id: reactor
number: "6.07"
title: Reactor
chapter: async
fit: direct
figure_number: Fig. 6.07
figure_caption: "One wait covers every connection, and ready ones go to their handlers."
diagram: reactor.svg
analogy_title: The switchboard operator
---
## Gist

Run one event loop that waits on many streaming connections at once and sends each ready event to its handler.

## Everyday comparison

### The switchboard operator

One operator sits in front of a panel of sockets. They do not watch any single line. They wait for a lamp to light. When one does, they plug in the cord for that caller. They deal with it in seconds and turn back to the panel. Hundreds of lines share one pair of hands, because each job is short.

## Classic meaning

A single wait watches many handles (open connections or files) at once. Each event that arrives goes to a registered handler that must not block.

## In the agent system

A harness server holds thousands of open connections. Some are SSE streams from the model provider. SSE (Server-Sent Events) is a way to stream text over HTTP. Some are WebSocket links (two-way live connections) to chat clients. Some are stdio pipes (standard input and output) to local MCP servers. MCP is a standard way to connect tools to an AI model. A single asyncio event loop registers them all with the OS selector, such as epoll or kqueue. The selector is the operating system feature that reports which sockets have data. When a socket has bytes, the loop calls that connection's handler. The handler adds a token delta (a small piece of new text). Or it forwards text to the right client, or reads a JSON-RPC reply. JSON-RPC is the message format MCP uses. Handlers must return quickly. So CPU-heavy work, such as tokenising a large file, goes to a thread pool.

## In a large company

Enterprise harness gateways run several event-loop processes per host behind a load balancer. They use sticky routing for WebSocket and SSE sessions, which keeps each session on the same process. During deploys they drain connections gracefully, letting them finish before shutdown. Event-loop lag is a key health metric. It measures how late the loop is in handling events. It is exported through OpenTelemetry, a standard for traces and metrics. It matters because one blocking handler slows every tenant (customer company) on that loop. Per-tenant connection limits and idle timeouts protect shared hosts. They stop one customer's clients from using up all the file descriptors (the limited slots for open connections).

## Step by step

1. Each connection registers a handler with the event loop.
1. The loop blocks once in select or epoll across all handles.
1. For each ready handle, it calls the registered handler.
1. Handlers do one small non-blocking step and return to the loop.

## Code sketch

```python
sel = selectors.DefaultSelector()
sel.register(model_sse, READ, on_token)
sel.register(client_ws, READ, on_user_msg)
sel.register(mcp_pipe, READ, on_rpc_reply)

while running:
    for key, _ in sel.select():
        key.data(key.fileobj)   # dispatch
```

## Be careful

One blocking call inside a handler freezes every stream on the loop. A synchronous HTTP request, one that waits for its answer, is an example.

## Diagram

![Fig. 6.07: One wait covers every connection, and ready ones go to their handlers.](/diagrams/reactor.svg)
