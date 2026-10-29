---
id: marker-interface
number: "2.23"
title: Marker Interface
chapter: tool-system
fit: adapted
figure_number: Fig. 2.23
figure_caption: "The gate routes calls by their tags, not by what the tools do"
diagram: marker-interface.svg
analogy_title: Hazard placards on lorries
---
## Gist

Tag tools as read-only, destructive or approval-required with empty markers. The permission gate checks them before running anything.

## Everyday comparison

### Hazard placards on lorries

A tanker lorry carries an orange placard with a number on it. The placard does not change how the lorry drives. But at the tunnel entrance, the officer reads it and sends flammable loads the long way round. One small sign, checked by someone else, decides the route.

## Classic meaning

An empty interface (or a flag) with no methods marks a class as having some property. Other code can test for it.

## In the agent system

Tool classes inherit from empty marker types such as ReadOnly, Destructive or NeedsApproval. Or they carry matching flags, like readOnlyHint and destructiveHint, in an MCP tool's annotations. (MCP is a standard way to connect tools to an AI model.) The markers add no methods. The permission gate checks them before each call. Read-only tools run at once, even in plan mode. Destructive ones pause and wait for the user's approval. Network tools are blocked in an offline sandbox. The scheduler reads the same tags. It runs read-only calls in parallel and runs anything that writes one at a time.

## In a large company

Company platforms tag tools with markers such as read-only, destructive, external network or handles PII (personal data such as names and emails). The policy engine (OPA/Rego or Cedar, tools that decide what is allowed) combines those tags with the user's role and the tenant's settings. (A tenant is one customer company sharing the platform.) It then decides to run, ask or deny. Tags on third-party MCP tools, including readOnlyHint and destructiveHint, count only as untrusted hints. So the platform keeps its own reviewed labels in the tool registry (the central list of approved tools). Tools with no label should need approval by default. Every decision goes into the audit trail, along with the tags that led to it.

## Step by step

1. Each tool declares its markers when it is defined.
1. The model sends a tool_use block (its request to run a tool) naming some tool.
1. The permission gate checks the tool's markers against the session's mode.
1. It runs the call, asks the user, or refuses, without knowing what the tool actually does.

## Code sketch

```python
class ReadOnly: pass       # markers carry
class Destructive: pass    # no methods

class ListDir(Tool, ReadOnly): ...
class DeleteFile(Tool, Destructive): ...

def gate(tool, mode):
    if isinstance(tool, Destructive):
        return 'ask'
    if isinstance(tool, ReadOnly):
        return 'run'
    return 'run' if mode == 'auto' else 'ask'
```

## Be careful

A marker is only a claim made by the tool's author. Do not trust the hints on third-party MCP tools. Keep your own policy list for them.

## Diagram

![Fig. 2.23: The gate routes calls by their tags, not by what the tools do](/diagrams/marker-interface.svg)
