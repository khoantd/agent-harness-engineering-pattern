---
id: component
number: "8.13"
title: Component
chapter: architecture
fit: adapted
figure_number: Fig. 8.13
figure_caption: The entity is just a carrier. Behaviour comes from the components bolted onto it.
diagram: component.svg
analogy_title: Kitting out a fire engine
---
## Gist

Build an agent as a thin entity that carries plug-in components (skills, MCP servers, memory, hooks), each adding tools and prompt text.

## Everyday comparison

### Kitting out a fire engine

A fire service buys the same base truck for every engine. Then it bolts on modules: a ladder, a water pump, a cutting kit, a foam tank. A rural station picks the pump and foam. A city station picks the ladder and cutting kit. The truck just carries the modules and gives them power. Each module knows its own job.

## Classic meaning

An entity (an object) is just a container of separate components. Each component owns one kind of behaviour. Features combine by adding components, not by inheritance (building new classes on top of old ones).

## In the agent system

The harness does not have a CodingAgent subclass and a ResearchAgent subclass. Instead it has one Agent entity with a list of components. A skill component adds a prompt section and maybe a script tool. An MCP component adds that server's tools. (MCP is a standard way to connect tools to an AI model.) A memory component adds recall and remember tools. A hooks component registers pre_tool_use checks (code that runs before each tool call). On each turn, the loop asks every component for its tools and prompt pieces. Then it sends each tool_use block (the model's request to run a tool) to the component that owns that tool. A plugin can bundle several components, and you can install it for one session.

## In a large company

In large platforms the components are usually plugins from a managed internal marketplace. These are skills, MCP connectors, memory and hooks. Tenant admins approve them, pin them to a version and assign them to groups. (A tenant is one customer company.) Control here means signed plugin bundles and a security review before listing. It also means an allowlist for each tenant, checked when components attach. Hooks that carry company policy should come from managed settings. These settings must win over components that users install. Then a plugin cannot register a hook that weakens them. Each component's tools should record their source in audit logs. So you can trace a tool call back to the plugin and version that supplied it.

## Step by step

1. The harness creates an Agent entity with an id and an empty component list.
1. Installed plugins attach components such as a skill, an MCP server or memory.
1. Before each model call, the loop collects tools and prompt text from every component.
1. Each tool_use block goes to the component that registered that tool.

## Code sketch

```python
class Agent:
    def __init__(self, components):
        self.parts = components
    def tools(self):
        return [t for p in self.parts
                for t in p.tools()]
    def prompt(self):
        return '\n'.join(p.prompt()
                         for p in self.parts)

agent = Agent([PdfSkill(), McpPart(git),
               Memory(store), Hooks(policy)])
```

## Be careful

Two components might both register a tool named search. They clash silently, unless the entity rejects or prefixes duplicate names when they attach.

## Diagram

![Fig. 8.13: The entity is just a carrier. Behaviour comes from the components bolted onto it.](/diagrams/component.svg)
