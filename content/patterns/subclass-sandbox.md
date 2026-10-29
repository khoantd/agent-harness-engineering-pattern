---
id: subclass-sandbox
number: "8.14"
title: Subclass Sandbox
chapter: architecture
fit: direct
review_id: rev-subclass-sandbox
figure_number: Fig. 8.14
figure_caption: "Subclasses only touch the base class, and every building block passes through the sandbox."
diagram: subclass-sandbox.svg
analogy_title: "The pottery studio's shared kit"
---
## Gist

Let plugin and skill authors subclass one base class, and build behaviour only from the safe building blocks it provides.

## Everyday comparison

### The pottery studio's shared kit

Students at a pottery studio can make any shape they like. But they may only use the studio's clay, wheels and glazes, and the kiln that staff load and fire. Nobody brings a blowtorch from home. The studio can change kiln brands or glaze suppliers. Every student's technique still works, because they only ever touched the shared kit.

## Classic meaning

Subclasses define behaviour using a set of protected operations from a base class. This keeps the subclasses separate from the rest of the system.

## In the agent system

A plugin SDK (a kit for building plugins) offers a Skill base class with protected methods. These read files inside the workspace, call a tool through the permission gate, send an event to the UI, ask the user to confirm, and log. Plugin authors override run() and combine those building blocks. They do not import the HTTP client, the database driver or subprocess (the module that runs other programs). The pattern keeps plugins separate from the rest of the code. But a base class is not a security boundary. So outside plugins run in an isolated process or a WASM runtime (a sealed space for running code). There, each building block is an RPC (a remote call) back to the host. The host enforces sandbox rules, approvals and rate limits in one place. It can also change how a building block works, say from local disk to a remote sandbox, without breaking any plugin.

## In a large company

Large company plugin SDKs follow this shape, so platform teams can control what extensions do. Every file read, tool call and user prompt goes through building blocks. These apply RBAC (role-based access control: permissions given by job role), approvals, DLP (data loss prevention) and audit logging. Real isolation comes from running plugin code in containers, gVisor, Firecracker microVMs or WASM runtimes. (These are all sealed spaces for running code.) The code gets no ambient credentials (keys lying around for it to grab). Network policy limits where it can send data. Plugins are signed, reviewed and pinned to a version for each tenant (customer company). The host can also turn one off centrally. The risk is building-block creep. Each new building block widens what every plugin can do, so it needs its own security review.

## Step by step

1. The harness ships a base class with a small set of protected building blocks.
1. A plugin subclasses it and writes run() using only those building blocks.
1. The plugin runs in an isolated process or WASM runtime, with no direct file, network or subprocess access.
1. Each building block calls back to the host. The host applies the workspace sandbox, the permission gate and rate limits.
1. A check on imports at load time gives authors early errors. But the isolation is the real security boundary.

## Code sketch

```python
class Skill:
    def _read(self, p): return ws.read(p)
    def _tool(self, name, **args):
        return gate.call(name, args)
    def _emit(self, ev): bus.publish(ev)
    def run(self, task): ...

class ChangelogSkill(Skill):
    def run(self, task):
        log = self._tool('git_log', n=50)
        self._emit(Draft(summarise(log)))
```

## Be careful

The base class might gain a building block for every plugin request. Then it becomes a god object (one class that does everything). Add building blocks slowly, and make each one safe on its own.

## Diagram

![Fig. 8.14: Subclasses only touch the base class, and every building block passes through the sandbox.](/diagrams/subclass-sandbox.svg)
