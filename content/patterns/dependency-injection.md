---
id: dependency-injection
number: "8.15"
title: Dependency Injection
chapter: architecture
fit: direct
figure_number: Fig. 8.15
figure_caption: The loop gets its helpers ready-made and never builds them itself.
diagram: dependency-injection.svg
analogy_title: "The scrub nurse's instrument tray"
---
## Gist

Build the model client, tool registry and stores at startup, and pass them into an agent loop that never builds its own.

## Everyday comparison

### The scrub nurse's instrument tray

A surgeon does not walk to the supply room in the middle of an operation. Before the first cut, the scrub nurse lays out exactly the instruments this operation needs. The nurse hands each one over when asked. The surgeon's skill is the same whatever brand of scalpel is on the tray. A teaching theatre can lay out practice instruments instead.

## Classic meaning

Give an object the things it depends on from outside, usually through its constructor. The object does not create or look them up itself.

## In the agent system

The composition root is the one place where the program is wired together, such as main or a small container. It reads the settings and creates the Anthropic SDK client with its retry policy. It connects MCP servers into a ToolRegistry. (MCP is a standard way to connect tools to an AI model.) It opens the transcript store and builds a PermissionPolicy. Then it builds AgentLoop(model, tools, store, policy). The loop only calls methods on what it was given. In evals (scored tests) and unit tests, the same loop gets a scripted FakeModel, stub (fake) tools and an in-memory store. So a full turn runs offline and gives the same result every time.

## In a large company

A multi-tenant platform serves many tenants (customer companies). Its composition root builds long-lived shared services once, such as the LLM gateway client (one shared front door to AI models) and connection pools. It builds tenant-specific parts for each request. Examples are a tool registry filtered by tenant policy, and a store tied to the tenant's own section of data. Secrets come in at startup from Vault, a cloud KMS (key management service) or workload identity. They are not read from settings files. The main risk is a lifetime mistake. A singleton (one shared object for the whole program) might capture one tenant's keys or tool list. Then it leaks them to every other tenant. Plain wiring also makes it easy to pass in OpenTelemetry tracers and fakes for eval checks in CI. OpenTelemetry is a standard for tracing requests. CI is the automatic build and test system.

## Step by step

1. At startup, the composition root reads settings and secrets.
1. It builds each dependency: model client, tool registry, store and policy.
1. It passes them into the AgentLoop constructor.
1. Tests build the same loop with fakes in place of the real clients.

## Code sketch

```python
def compose(cfg):
    model = SdkModel(cfg.api_key, retries=3)
    tools = ToolRegistry.from_mcp(cfg.servers)
    store = PgStore(cfg.db_url)
    return AgentLoop(model, tools, store)

# in an eval
loop = AgentLoop(FakeModel(script),
                 StubTools(), MemoryStore())
```

## Be careful

A container that finds dependencies by name hides wiring mistakes until the program runs. For most harnesses, plain constructor calls in one setup function are clearer.

## Diagram

![Fig. 8.15: The loop gets its helpers ready-made and never builds them itself.](/diagrams/dependency-injection.svg)
