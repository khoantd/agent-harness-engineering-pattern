---
id: separated-interface
number: "8.19"
title: Separated Interface
chapter: architecture
fit: direct
figure_number: Fig. 8.19
figure_caption: "The core and implementations both point at the interface package, never at each other."
diagram: separated-interface.svg
analogy_title: The shipping container standard
---
## Gist

Keep SDK interfaces in one package and their implementations in others, so code depends on the contract, never a provider.

## Everyday comparison

### The shipping container standard

A published standard sets a shipping container's size, corner fittings and lock rods. Ports build cranes to it, and factories build boxes to it, often without ever meeting. A crane in one port lifts a box made on another continent. This works because both depend on the standard, not on each other.

## Classic meaning

Put an interface (a list of functions with no code behind them) in a different package from the code that fills it in. Then clients only depend on the package that holds the interface.

## In the agent system

A harness-interfaces package declares ModelClient, ToolHost and TranscriptStore. It imports no outside libraries. The agent core and the plugin SDK depend only on that package. Separate packages, such as harness-anthropic, harness-mcp and harness-postgres, fill in the interfaces. They pull in the heavy libraries. A user who installs the CLI (command-line tool) with a local SQLite store never downloads the Postgres driver. And a third party can publish a new sandbox backend without any change to the core.

## In a large company

Large platforms publish the interface package as the contract for internal teams and third parties. These groups build tool hosts, model adapters or storage backends. The package uses semantic versioning (version numbers that signal breaking changes). It comes with contract tests that every implementation must pass. So a bank can plug in its own LLM gateway client (its shared front door to AI models). Or it can plug in an on-premises vector store (a database for search by meaning, run in its own building). It does not need to fork (copy and change) the core. Supply-chain controls apply to the implementation packages. These are signed artifacts, an SBOM (a list of every library inside) and dependency scanning. The risk is a breaking change to the interface package spreading through every plugin. So removals need a published warning period.

## Step by step

1. Put interface definitions and shared types in a small package with no heavy libraries.
1. Make the core and plugins import only that package.
1. Fill in each interface in its own package, which depends on the interface package.
1. Choose implementations at install time and wire them in at startup.

## Code sketch

```python
# harness_interfaces/model.py
class ModelClient(Protocol):
    def complete(self, req: Request) -> Reply:
        ...

# harness_anthropic/client.py
from harness_interfaces import ModelClient
class AnthropicClient(ModelClient):
    def complete(self, req):
        return self.sdk.messages.create(...)
```

## Be careful

Do not split every interface into its own package when there is only one implementation. That adds version-tracking pain for no gain. Split only where real alternatives exist.

## Diagram

![Fig. 8.19: The core and implementations both point at the interface package, never at each other.](/diagrams/separated-interface.svg)
