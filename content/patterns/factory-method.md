---
id: factory-method
number: "2.08"
title: Factory Method
chapter: tool-system
fit: direct
figure_number: Fig. 2.08
figure_caption: "The base class owns the loop, and each subclass only decides which shell is created."
diagram: factory-method.svg
analogy_title: "A shipping firm's two divisions"
---
## Gist

Let a base runner own the agent workflow, while each subclass decides which executor or tool it creates.

## Everyday comparison

### A shipping firm's two divisions

Head office writes one delivery procedure: collect the parcel, load the vehicle, track it, get a signature. The road division fills the load step with a lorry. The sea division fills it with a container ship. The procedure never changes. Each division only decides which vehicle it brings.

## Classic meaning

A base class has a method for creating an object. Its subclasses (child classes that build on it) decide which class that method actually makes.

## In the agent system

A BaseRunner runs the turn loop, the approval flow and the writing of the transcript (the saved record of the conversation). Whenever it needs a command executor, it calls self.make_shell(). LocalRunner overrides make_shell, meaning it replaces it with its own version. Its version returns a shell on the user's machine. CloudRunner returns a shell inside a container with no network access. Tests make one more subclass. It returns a fake shell that replays recorded output. The loop is written and tested once, and only the creation step changes.

## In a large company

Enterprise platforms use this shape to support several execution backends behind one audited loop. One is a runner on a developer's laptop. One is a sandbox runner hosted on Kubernetes (a system that runs containers at scale). One is a recorded-replay runner for evals and regression gates. Evals are automated tests of the agent, and regression gates block changes that break old behaviour. Approvals, audit logging and budget checks live in the base class. So a new backend cannot skip them by mistake. Change management should treat a new subclass as an item for security review. The factory method decides where commands really run and what network they can reach.

## Step by step

1. BaseRunner.run() starts the loop and needs an executor.
1. It calls its own make_shell() method instead of a constructor.
1. The subclass's version returns a local shell, a sandbox shell or a fake.
1. The loop uses the returned shell through the shared interface.

## Code sketch

```python
class BaseRunner:
    def run(self, task):
        shell = self.make_shell()
        return self.loop(task, shell)
    def make_shell(self):
        raise NotImplementedError

class LocalRunner(BaseRunner):
    def make_shell(self):
        return LocalShell(cwd=self.repo)

class CloudRunner(BaseRunner):
    def make_shell(self):
        return SandboxShell(net=False)
```

## Be careful

One subclass for each variation adds up fast. When the choice is plain config, pass in a factory function instead.

## Diagram

![Fig. 2.08: The base class owns the loop, and each subclass only decides which shell is created.](/diagrams/factory-method.svg)
