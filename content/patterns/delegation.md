---
id: delegation
number: "2.18"
title: Delegation
chapter: tool-system
fit: direct
figure_number: Fig. 2.18
figure_caption: The caller sees one call and one answer. The delegate does the work.
diagram: delegation.svg
analogy_title: "The general contractor's subcontractors"
---
## Gist

A tool hands the real work to a helper object or a subagent, then returns that answer as its own result.

## Everyday comparison

### The general contractor's subcontractors

You hire one general contractor to redo your kitchen. They promise the whole job. But an electrician they bring in does the wiring, and a tiler does the tiles. You never phone the electrician. The contractor checks the work and hands you one finished kitchen.

## Classic meaning

An object offers a behaviour but passes each request to a second object that does the work. You combine objects instead of inheriting behaviour from a parent class.

## In the agent system

A research tool that the model sees may contain no search code at all. It holds a link to a delegate (the helper that does the work) and passes the request on. The heavier version hands the work to a subagent (a second agent working for the first). The tool starts a fresh agent with its own context window (the text the model can see at one time). The subagent gets a smaller set of tools and a written brief. The tool waits for the subagent's final report. It then returns that report as the tool_result (the message that gives the model the tool's answer). The main agent's context sees one call and one answer. It does not see the dozens of tool calls the subagent made along the way. You can swap the delegate, for example for a cheaper model or a different search service. Nothing changes for the caller.

## In a large company

Large companies use delegation to send work to specialist subagents. They also use it to send work to a cheaper model behind an LLM gateway (a central entry point for all model calls). The delegate must run under the caller's identity. Its tools and the data it can reach must be a subset of the caller's, never wider. Each delegation should carry a token and cost budget tied to the tenant's chargeback account. (A tenant is one customer company sharing the platform. Chargeback means billing that company for its use.) Each delegation should also pass on the trace context, so the subagent's spans (timed trace records) nest under the parent call in OpenTelemetry. Audit trails must record the delegate's own tool calls, because the parent's transcript sees only the summary.

## Step by step

1. The model calls a tool such as research(question).
1. The tool writes a brief and gives it to its delegate, here a subagent with its own context.
1. The delegate does the work with its own tools and returns a short report.
1. The tool returns that report as its tool_result, as if it had done the work itself.

## Code sketch

```python
class ResearchTool(Tool):
    name = 'research'
    def __init__(self, spawn):
        self.spawn = spawn      # the delegate
    def run(self, args):
        sub = self.spawn('researcher',
                tools=['search', 'read'])
        report = sub.run(brief(args['q']))
        return report.summary
```

## Be careful

Delegation hides cost. A one-line tool call can start a subagent that spends thousands of tokens (the units models read and write). So pass a token budget down and report usage back up.

## Diagram

![Fig. 2.18: The caller sees one call and one answer. The delegate does the work.](/diagrams/delegation.svg)
