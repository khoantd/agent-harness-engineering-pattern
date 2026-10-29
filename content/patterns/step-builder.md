---
id: step-builder
number: "2.12"
title: Step Builder
chapter: tool-system
fit: direct
figure_number: Fig. 2.12
figure_caption: "Each step type offers only the next call, so build() is out of reach until all are set."
diagram: step-builder.svg
analogy_title: The airport check-in kiosk
---
## Gist

Force a subagent or request spec through its required steps in a set order, so build() is out of reach until each is set.

## Everyday comparison

### The airport check-in kiosk

The kiosk will not show seats until you scan a passport. It will not print a bag tag until you have a seat. Each screen offers only the next button. You cannot walk away with a boarding pass that has no name on it. No screen ever let you skip the name.

## Classic meaning

A step builder is a kind of builder where each step returns a type that shows only the next valid step. So the type system makes sure the steps come in order and none are missed.

## In the agent system

Starting a subagent (a helper agent for one task) needs a model, a system prompt, a tool set and a token budget. A forgotten budget means a run that never stops. A SubagentSpec step builder starts with a ModelStep that has only .model(). That returns a PromptStep with only .system(). Next comes a ToolsStep with only .tools(), then a BudgetStep with only .budget(). Only the final BuildStep offers optional extras and .build(). A type checker (a tool that checks code types before it runs) flags a missing step before the harness runs. The order matches how people review specs: model, instructions, abilities, limits.

## In a large company

Enterprise platforms use step builders, or similar schema checks, for specs where a missing field is a compliance or cost failure. Examples are a subagent without a budget, or a job without a data classification. Another is an agent with no named owner who answers for it in an audit. Type checks catch the gap during development. But specs that arrive as YAML files or API messages skip the type checker. So the platform must also check the same required fields while running. The harness and the LLM gateway (a central service that routes model traffic) must also enforce the budget in the spec. They must not just trust it as a statement.

## Step by step

1. SubagentSpec.new() returns a ModelStep that shows only .model().
1. Each call returns the next step type: prompt, then tools, then budget.
1. Only the final BuildStep has .build(), next to optional extras.
1. A skipped step shows up as a type error before anything runs.

## Code sketch

```python
spec = (SubagentSpec.new()
        .model('fast-model')
        .system(REVIEW_PROMPT)
        .tools(['grep', 'read'])
        .budget(tokens=50_000)
        .build())

class ModelStep:
    def model(self, m) -> 'PromptStep':
        return PromptStep(m)
# ModelStep has no .build(): skipping fails
```

## Be careful

A step builder adds one class for each step. So keep it for specs where a missing field is dangerous, not for every options object.

## Diagram

![Fig. 2.12: Each step type offers only the next call, so build() is out of reach until all are set.](/diagrams/step-builder.svg)
