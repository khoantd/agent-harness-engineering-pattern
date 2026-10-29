---
id: context-object
number: "1.14"
title: Context Object
chapter: agent-loop
fit: direct
figure_number: Fig. 1.14
figure_caption: "One object carries the turn's facts to every component that needs them."
diagram: context-object.svg
analogy_title: "The patient's travelling folder"
---
## Gist

Bundle everything one turn needs (ids, budget, working folder, permissions, cancel signal) into one object passed to every component.

## Everyday comparison

### The patient's travelling folder

When a hospital patient moves from admissions to X-ray to surgery, a folder travels on the trolley with them. It holds the wristband number, allergies, consent forms and the doctor's notes. Every department reads what it needs from the same folder. Nobody has to phone the other departments.

## Classic meaning

Put the state and services that many layers need into one object, and pass that object along. This replaces passing many separate parameters.

## In the agent system

Every turn touches many components: the model client, the tool runner, hooks, the tracer and the code that starts subagents. Each one needs some of these facts: the session id, turn number, working directory, permission mode, remaining token budget, abort signal and trace span. A trace span is one timed record of work, used for tracing. The harness builds a TurnContext at the start of the turn. It passes that single object down every call. Say you add a field, such as the active MCP servers. MCP is a standard way to connect tools to an AI model. You change only the context class and the code that reads it. You do not change every function signature in between, meaning the list of inputs each function takes.

## In a large company

In an enterprise harness, the context object carries the tenant id (which customer company this is) and the authenticated principal (the verified user or service). It also carries the principal's OIDC claims, which are identity facts from the login system. It holds the data residency region (where data must stay), the W3C trace context (a standard trace id) and the remaining per-tenant budget. Every tool, policy check and log line reads identity from it. The identity fields should be immutable (unchangeable), so no component can raise its own privileges mid-turn. Raw credentials do not belong in it. Instead, keep a handle, which is a reference. The tool runner swaps it for a short-lived token from Vault or workload identity. Vault is a secrets store, and workload identity gives each service its own login. This way secrets never reach prompts, logs or the model.

## Step by step

1. At the start of a turn, the loop builds a TurnContext.
1. It passes ctx to the model client, the tool runner and the hooks.
1. Each component reads the fields it needs and may record usage back into it.
1. When the turn ends, the context is thrown away or saved with the trace.

## Code sketch

```python
@dataclass
class TurnContext:
    session_id: str
    turn: int
    cwd: Path
    perms: PermissionMode
    budget: TokenBudget
    cancel: AbortSignal

ctx = TurnContext(sid, n, cwd, mode, b, sig)
resp = model.call(msgs, ctx)
out = tools.run(resp.tool_calls, ctx)
```

## Be careful

A context object that collects every global value in the system becomes a hidden bag of dependencies. Keep it for one turn only, and keep it small.

## Diagram

![Fig. 1.14: One object carries the turn's facts to every component that needs them.](/diagrams/context-object.svg)
