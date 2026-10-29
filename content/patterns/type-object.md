---
id: type-object
number: "2.24"
title: Type Object
chapter: tool-system
fit: direct
figure_number: Fig. 2.24
figure_caption: New tools arrive as records that point at a few shared handlers
diagram: type-object.svg
analogy_title: Creature cards in a game expansion
---
## Gist

Define each tool as a data record (name, schema, handler) instead of a new class, so adding a tool adds no code.

## Everyday comparison

### Creature cards in a game expansion

When a board game publishes an expansion, it does not rewrite the rulebook. It prints new creature cards with a name, speed, strength and special ability. Every figure on the board points to its card. The same rules read whatever the card says.

## Classic meaning

You describe a family of types as instances of one single class. New types can then be added as data while the program runs, not as new subclasses.

## In the agent system

An MCP tool definition is a type object. (MCP is a standard way to connect tools to an AI model.) It is a JSON record with name, description, inputSchema (the allowed arguments) and annotations. Every server's tools are instances of one ToolDef type, not separate classes. The harness has one general ToolCall class. Each ToolCall points at its ToolDef for checking and display, the way a game figure points at its card. Teams add tools by editing a JSON or YAML file (simple text formats for data). The file links a definition to an existing handler, such as a web endpoint, a shell command template or an MCP call. The harness loads these files at startup. Settings shared by every call of a type, such as the default timeout and cost class, live on the definition.

## In a large company

Company platforms often run a central tool catalog. Each tool is a versioned definition record. It holds the owner, data classification, allowed tenants (customer companies), timeout and cost class. It points at one of a small set of reviewed handler types. New tools then go through change management as data. Someone opens a pull request (a proposed change) to the catalog. Then an eval run (a set of automatic tests) checks the agents that will see the tool. Then someone approves it before rollout. The handler table is the security boundary. So it stays small, and no definition can point at any URL or command without review.

## Step by step

1. The harness loads definitions from JSON, YAML or a tools/list reply into ToolDef instances.
1. Each ToolDef names a general handler and holds the schema and shared settings.
1. When the model calls a tool, the harness creates a ToolCall that points to its ToolDef.
1. Checks, timeouts and display read from the ToolDef, not from a subclass.

## Code sketch

```python
class ToolDef:             # the type object
    def __init__(self, d):
        self.name = d['name']
        self.schema = d['inputSchema']
        self.timeout = d.get('timeout', 30)
        self.handler = HANDLERS[d['handler']]

class ToolCall:            # an instance
    def __init__(self, tdef, args):
        validate(args, tdef.schema)
        self.tdef, self.args = tdef, args
```

## Be careful

Tools defined as data are only as safe as the handlers they can point at. Keep the handler table small and reviewed. Do not let settings files reach any code they like.

## Diagram

![Fig. 2.24: New tools arrive as records that point at a few shared handlers](/diagrams/type-object.svg)
