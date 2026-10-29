---
id: fluent-interface
number: "2.30"
title: Fluent Interface
chapter: tool-system
fit: direct
figure_number: Fig. 2.30
figure_caption: Every call returns the same builder until build() checks and freezes it
diagram: fluent-interface.svg
analogy_title: The sandwich counter in one breath
---
## Gist

Set up an agent with chained method calls that read like a sentence. Each call returns the builder for the next.

## Everyday comparison

### The sandwich counter in one breath

'Rye, turkey, swiss, toasted, cut in half, to go.' Each word passes the same half-made sandwich down the counter to the next station. 'To go' is the moment it gets wrapped and handed over. Leave out a word and you get the house default. Ask for something impossible and the counter tells you before wrapping.

## Classic meaning

An API built on method chaining. Each call returns an object for the next call, so the code reads like a small sentence in the problem's own language.

## In the agent system

Agent SDKs (software kits for building agents) often offer a fluent setup API: Agent('reviewer').model(...).system(...).tools(read, grep).max_turns(20).on_tool_use(audit).build(). Each method records one setting and returns the builder. So a whole agent definition fits in one readable expression. It is easy to review in a pull request (a proposed code change). The final build() checks that the settings fit together. For example, a shell tool must have a sandbox, and the token budget must fit the model's context window (the text the model can see at one time). Then build() returns an AgentConfig that cannot be changed. Subagent definitions start from a shared base chain and add a few calls.

## In a large company

Company teams use fluent builders to define agents in code. But the code usually turns into a declarative, versioned config file (one that states the settings, not the steps). That file goes through review, eval gates (automatic tests that must pass) and staged rollout, like any other change. The build step is a good place to enforce platform policy. For example, it can reject a shell tool with no sandbox profile. It can reject a model that is not approved for the tenant's data residency region (where the customer's data must stay). It can reject a token budget above the tenant's limit. Only the built, unchangeable config is deployed. So what was reviewed is exactly what runs.

## Step by step

1. Start a builder with the agent's name.
1. Chain calls for model, system prompt, tools, limits and hooks. Each returns the builder.
1. Call build() to check the whole setup at once.
1. Hand the unchangeable config to the harness to start runs.

## Code sketch

```python
class Agent:
    def model(self, m):
        self.cfg['model'] = m
        return self          # enables chaining

cfg = (Agent('reviewer')
       .model('large')
       .system(load('review.md'))
       .tools(read_file, grep, git_diff)
       .max_turns(20)
       .build())           # validates once
```

## Be careful

Chains hide the in-between state. A setting given twice, or in a conflicting order, can silently win. Make build() reject contradictions instead of keeping the last call.

## Diagram

![Fig. 2.30: Every call returns the same builder until build() checks and freezes it](/diagrams/fluent-interface.svg)
