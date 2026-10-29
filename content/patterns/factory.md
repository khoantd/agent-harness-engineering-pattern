---
id: factory
number: "2.07"
title: Factory
chapter: tool-system
fit: direct
figure_number: Fig. 2.07
figure_caption: "Names in config go in, and finished tools with shared dependencies come out."
diagram: factory.svg
analogy_title: The car rental desk
---
## Gist

Create tools from a name and a config entry, so agent definitions list tools as data instead of building them in code.

## Everyday comparison

### The car rental desk

You tell the clerk: compact, automatic, three days. You get a key fob. You never walk the lot, check the oil or register the plate. Behind the desk, someone picks a car of the right class, fuels it and fills in the paperwork. The same desk hands out vans and convertibles too.

## Classic meaning

A factory is an object whose job is to create other objects. One creation call hides which exact class gets made.

## In the agent system

An agent definition file says tools: [bash, web_fetch, read_file]. It also has settings for each tool, such as a timeout or a list of allowed domains. A ToolFactory maps each name to a constructor (the code that builds that tool). It injects shared dependencies, meaning it hands each tool the shared parts it needs. These include the sandbox handle, the HTTP client and credentials. Then it returns ready Tool objects. Subagent definitions, eval configs and user settings all go through the same factory. So a tool is always built the same way, with the same safety defaults.

## In a large company

Enterprise tool factories inject credentials that belong to one user and expire soon. They get these from a secrets manager such as HashiCorp Vault, or from cloud workload identity (identity the cloud gives to running code). They do not use one shared service credential. So every call to another system can be traced to a user and is limited by that user's permissions. The factory is the right place to apply tenant defaults. A tenant is one customer company sharing the platform. These defaults include egress allowlists (the outside hosts a tool may reach), timeouts and regional endpoints. Then no agent definition can build a tool without them. Credentials stay inside the tool object. They must never be written into the transcript or the model context (the text the model can see).

## Step by step

1. The harness loads the agent definition and its tools list.
1. For each entry, it calls ToolFactory.create(name, settings).
1. The factory picks the class, injects shared dependencies and applies defaults.
1. The finished tools are registered for the session.

## Code sketch

```python
class ToolFactory:
    def __init__(self, deps):
        self.deps = deps
    def create(self, name, cfg):
        if name == 'bash':
            return BashTool(
                self.deps.box, cfg.timeout)
        if name == 'web_fetch':
            return WebFetch(
                self.deps.http, cfg.domains)
        raise UnknownTool(name)
```

## Be careful

Sometimes creating a tool is one constructor call with no shared dependencies. Then a factory only adds an extra step. Call the class directly.

## Diagram

![Fig. 2.07: Names in config go in, and finished tools with shared dependencies come out.](/diagrams/factory.svg)
