---
id: execute-around
number: "2.29"
title: Execute Around
chapter: tool-system
fit: direct
review_id: rev-execute-around
figure_number: Fig. 2.29
figure_caption: "Setup and cleanup belong to the wrapper, so no tool can skip them"
diagram: execute-around.svg
analogy_title: The cleanroom airlock
---
## Gist

Run every tool inside a function that sets up the sandbox first and always cleans it up afterwards, even on failure.

## Everyday comparison

### The cleanroom airlock

In a chip factory, an engineer cannot simply walk onto the floor. The airlock dresses them in a gown and runs an air shower, then lets them work. On the way out it takes the gown back and logs the time. The routine is the same whatever job they came to do. Nobody skips the exit half.

## Classic meaning

A method does the setup and the cleanup around a block of code the caller passes in. So callers cannot forget either half.

## In the agent system

Running a code tool needs setup. It needs a scratch folder and a container or a slice of a VM (an isolated mini computer). It needs the workspace files mounted (made available inside), a network policy, and limits on CPU and clock time. Afterwards, the container must be stopped, temporary files deleted and logs collected. The harness offers one context manager, sandbox(profile), that does all of this. (A context manager is a Python block that runs setup at the start and cleanup at the end.) It runs the tool's body in the middle. Tool authors write only the body. A crash, a timeout or the user pressing stop still reaches the finally block (the cleanup code that always runs). So leftover containers do not pile up between turns.

## In a large company

Company platforms wrap every sandboxed action this way. First they get a short-lived workload identity credential (a temporary login for the job). They open an audit span (a timed audit record). They start an isolated container or microVM (a very small virtual machine) with an egress policy (rules for outgoing network traffic). Afterwards they revoke the credential, collect logs and destroy the sandbox. But if the harness process itself crashes, its finally block never runs. So production systems pair the wrapper with an outside reaper (a process that finds and removes leftovers). Or they use a durable execution engine such as Temporal, which keeps running cleanup steps even after crashes. Platforms track sandbox lifetimes and cleanup failures as metrics. Leftover sandboxes cost money. They can also break data-residency rules (rules about where data may be stored).

## Step by step

1. The executor enters sandbox(profile) and passes control to the tool body.
1. The wrapper starts the container, mounts files and applies limits.
1. The body runs its command inside the sandbox and either returns or raises an error.
1. Either way, the finally block collects logs, stops the container and deletes temporary files.

## Code sketch

```python
@contextmanager
def sandbox(profile):
    box = containers.start(profile)
    try:
        box.mount(workspace, ro=profile.ro)
        yield box
    finally:
        box.collect_logs(transcript)
        box.kill(); box.cleanup()

with sandbox(DEFAULT) as box:
    out = box.exec(req.command, timeout=60)
```

## Be careful

Cleanup cannot depend on the body behaving well. Enforce time limits from a watchdog (a separate timer process) outside the sandbox. A body that hangs never hands control back to the finally block.

## Diagram

![Fig. 2.29: Setup and cleanup belong to the wrapper, so no tool can skip them](/diagrams/execute-around.svg)
