---
id: raii
number: "7.11"
title: RAIIResource Acquisition Is Initialization
chapter: safety
fit: direct
aka: Resource Acquisition Is Initialization
figure_number: Fig. 7.11
figure_caption: Every way out of the scope passes through the same release step.
diagram: raii.svg
analogy_title: The kayak rental and your car keys
---
## Gist

Tie a sandbox, browser or temp workspace to a scope, so it is released on every exit path, including errors and cancellation.

## Everyday comparison

### The kayak rental and your car keys

At the lake, you only get a kayak by handing over your car keys. You only get the keys back by returning the kayak to the same counter. You may paddle for an hour, tip over, or give up after five minutes. Every route home passes the counter. So every kayak comes back.

## Classic meaning

A resource is taken when an object is set up. It is released when the object's scope (the block of code where it exists) ends. So the resource lives exactly as long as the scope.

## In the agent system

Each session that uses tools takes costly resources. These include a container (an isolated box for running code), a headless browser, a temp directory, a port forward and a lock on the workspace. The harness wraps each one in a context manager, which is Python's with or async with block. Or it uses an ExitStack, a helper that manages several context managers at once. So release runs whenever the scope ends. The turn may finish, or a tool may raise an error. The user may press Stop, which cancels the task. Or the token budget may run out. Without this, a cancelled session leaves orphaned containers running and billing in the background.

## In a large company

Scope-based cleanup does not survive a process crash, an OOM kill or a node failure. An OOM kill is when the system stops a process for running out of memory. So enterprise platforms pair it with a reaper. The reaper deletes sandboxes, browsers and volumes past a TTL (a time-to-live limit). It finds orphans through labels or Kubernetes owner references. Resources are tagged with tenant and session ids. A tenant is one customer company. So leaked capacity shows up in per-tenant cost reports and chargeback, which bills each tenant for its use. Teardown also wipes scratch data. This matters when a workspace held customer files.

## Step by step

1. Enter a scope that takes the resource and returns a handle.
1. Use the handle for the session's tool calls.
1. Leave the scope by any route: return, error or cancellation.
1. The scope's exit releases every resource in reverse order of taking them.

## Code sketch

```python
async def run_session(task):
    async with AsyncExitStack() as stack:
        box = await stack.enter_async_context(
            Sandbox(image='py3.12'))
        pg = await stack.enter_async_context(
            Browser(headless=True))
        return await agent_loop(task, box, pg)
    # browser closed, then sandbox destroyed,
    # even on error or cancellation
```

## Be careful

Cleanup that waits on a slow network call can itself be cut short by a second cancellation. Shield critical teardown from cancellation. Run a reaper (a cleanup job) for anything that still leaks.

## Diagram

![Fig. 7.11: Every way out of the scope passes through the same release step.](/diagrams/raii.svg)
