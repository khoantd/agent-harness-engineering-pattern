---
id: abstract-factory
number: "2.09"
title: Abstract Factory
chapter: tool-system
fit: direct
figure_number: Fig. 2.09
figure_caption: "Choosing one factory chooses the whole family, so environments never mix."
diagram: abstract-factory.svg
analogy_title: The theatre costume department
---
## Gist

Create a whole matching family of tools, such as a shell and a file system, for one environment, so local and sandboxed tools never mix.

## Everyday comparison

### The theatre costume department

When the company stages Hamlet, the wardrobe pulls every cloak, crown and sword from the Elsinore rail. For next month's space opera, the same request for the prince's outfit returns a silver flight suit. Nobody walks on stage in a Hamlet doublet with a laser pistol. Every piece comes from one show's rail.

## Classic meaning

An abstract factory gives one interface for creating families of related objects. Callers never name the exact classes.

## In the agent system

A coding agent needs a shell, a file system tool and often a browser. They must agree on where the workspace lives. A ToolkitFactory interface declares make_shell, make_fs and make_browser. LocalToolkit returns tools that act on the user's disk. SandboxToolkit returns tools that all target the same container and mounted volume. A sandbox is a sealed space where code runs safely. The session picks one factory from its environment setting. So a file the sandbox file system writes is always visible to the sandbox shell. And no code path can pair a local shell with a sandboxed file system.

## In a large company

Enterprises use toolkit families to tie every tool in a session to one execution environment and one data region. For example, an EU sandbox family has a shell, file system and browser that all run in EU infrastructure. They all follow the same egress policy (rules for outgoing network traffic). Data residency (keeping data in a set region) and isolation then come from the chosen factory. Each tool no longer has to remember them. The rule is this. The platform chooses the family from tenant policy when the session starts. A tenant is one customer company sharing the platform. Any attempt to mix families within a session is rejected and logged.

## Step by step

1. The session reads its environment setting: local or sandbox.
1. It selects the matching toolkit factory.
1. It calls make_shell, make_fs and make_browser on that one factory.
1. The resulting family is registered and shares one workspace.

## Code sketch

```python
class ToolkitFactory(Protocol):
    def make_shell(self): ...
    def make_fs(self): ...

class SandboxToolkit(ToolkitFactory):
    def __init__(self, box):
        self.box = box
    def make_shell(self):
        return ContainerShell(self.box)
    def make_fs(self):
        return VolumeFS(self.box.mount)

kit = KITS[session.env](env_handle)
tools = [kit.make_shell(), kit.make_fs()]
```

## Be careful

Adding a new kind of tool means changing every factory in the family. So keep the family small and stable.

## Diagram

![Fig. 2.09: Choosing one factory chooses the whole family, so environments never mix.](/diagrams/abstract-factory.svg)
