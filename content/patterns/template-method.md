---
id: template-method
number: "1.04"
title: Template Method
chapter: agent-loop
fit: direct
figure_number: Fig. 1.04
figure_caption: "The outline is fixed, and subclasses fill in only the marked slots."
diagram: template-method.svg
analogy_title: "The builder's standard house plan"
---
## Gist

Fix the order of a turn's steps in a base class, and let each agent type change only the hooks it needs.

## Everyday comparison

### The builder's standard house plan

A housing developer builds every home in the same order: foundation, frame, roof, then the inside. Buyers choose the kitchen tiles, the bathroom fittings and the paint. But nobody gets to put the roof on before the walls. The plan is fixed, and the choices are slots inside it.

## Classic meaning

Write the outline of a process in one method of a base class. Subclasses can replace certain steps, but they cannot change the outline.

## In the agent system

A harness base class (shared parent code that other classes build on) defines run_turn(). This method builds the system prompt, trims the context, calls the model, sends out tool calls and records the turn. The method is final. That means subclasses (classes built on the base class) cannot replace it. A coding agent overrides (replaces) system_prompt() to add the repository's rules. It also overrides on_tool_result() to run a linter (a code style checker) after edits. A research subagent overrides only select_tools(), so it can use just search and fetch. The outline never changes. So certain rules hold for every agent type. For example, every turn is logged to the transcript, and the token budget is checked before each call.

## In a large company

Platform teams ship a base agent whose fixed outline enforces rules for every tenant (each customer company on the platform). The outline passes on the user's identity and runs policy checks before each tool call. It removes PII (personal data such as names and emails) before logging. It also records OpenTelemetry spans (timed records of work, in a standard format) and checks each tenant's budget. Product teams build subclasses and override only prompts, tool choice and result handling. The risk is a team skipping the outline by calling the model client directly. To stop this, the LLM gateway (the central service all model calls pass through) should reject such calls. It rejects any call that does not carry the platform's tenant and trace headers, which are labels attached to each request.

## Step by step

1. The base class writes run_turn() as a fixed list of steps.
1. Some steps call hook methods that have a default behaviour.
1. A subclass overrides only the hooks it cares about.
1. Every agent type runs the same outline with its own changes.

## Code sketch

```python
class BaseAgent:
    def run_turn(self, msgs):  # fixed
        sp = self.system_prompt()  # hook
        resp = self.model.create(
            system=sp, messages=msgs)
        for call in resp.tool_calls:
            out = self.tools.run(call)
            self.on_tool_result(call, out)
        self.transcript.record(resp)
class CodingAgent(BaseAgent):
    def system_prompt(self):
        return BASE + REPO_RULES
```

## Be careful

If subclasses start to override run_turn() itself, the guarantees are lost. Mark it final and add a new hook instead.

## Diagram

![Fig. 1.04: The outline is fixed, and subclasses fill in only the marked slots.](/diagrams/template-method.svg)
