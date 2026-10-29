---
id: factory-kit
number: "2.10"
title: Factory Kit
chapter: tool-system
fit: direct
figure_number: Fig. 2.10
figure_caption: "Builders are registered once and frozen, and each profile picks names and gets fresh tools."
diagram: factory-kit.svg
analogy_title: Surgical tray cards
---
## Gist

Build a frozen kit of named tool builders once at startup, then make exactly the tool set each agent profile asks for.

## Everyday comparison

### Surgical tray cards

The hospital's sterile supply room keeps a laminated card for every operation. When the day's schedule says appendectomy, a technician reads that card. They lay out exactly those instruments on a fresh tray. Only the head nurse adds new cards. Whoever is filling trays at two in the morning never does.

## Classic meaning

A factory whose list of things it can make is set up first, usually as a map from names to builder functions. Then the list is locked so it cannot change.

## In the agent system

At startup, the harness fills a ToolKit with builder functions. bash builds a sandboxed shell. grep builds a search tool. read builds a file reader that can only see the workspace. The kit is then frozen. Agent profiles such as reviewer.yaml list only names. kit.create(['grep', 'read']) returns a fresh tool set for that subagent (a helper agent for one task). The kit is closed after startup. So no profile can reach a tool the operator did not install. Each subagent also gets new tool instances, not shared ones that others can change.

## In a large company

In enterprise platforms, the frozen kit is the tool catalogue the operator has approved. Only tools that passed security review are added at startup. Tenant or team profiles can choose from it but can never add to it. A tenant is one customer company sharing the platform. Per-tenant allowlists (lists of what is allowed) narrow the kit further. Each profile change goes through change management, with an eval run (an automated test of the agent) before rollout. Fresh instances for each subagent also stop per-user credentials and state from leaking between sessions that run at the same time.

## Step by step

1. The harness registers a builder function for each tool name that can be installed.
1. It freezes the kit, so no names can be added while running.
1. A subagent profile lists the tool names it needs.
1. kit.create(names) calls each builder and returns a fresh tool set.

## Code sketch

```python
kit = ToolKit()
kit.add('bash', lambda: Bash(box=sandbox))
kit.add('grep', lambda: Grep(root=repo))
kit.add('read', lambda: ReadFile(root=repo))
kit.freeze()

profile = load('agents/reviewer.yaml')
tools = kit.create(profile.tools)
# -> [Grep(...), ReadFile(...)]
kit.create(['curl'])  # raises UnknownTool
```

## Be careful

A builder might return one shared object instead of a new one. Then subagents overwrite each other's state.

## Diagram

![Fig. 2.10: Builders are registered once and frozen, and each profile picks names and gets fresh tools.](/diagrams/factory-kit.svg)
