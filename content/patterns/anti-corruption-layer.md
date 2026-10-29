---
id: anti-corruption-layer
number: "8.08"
title: Anti-Corruption Layer
chapter: architecture
fit: direct
review_id: rev-anti-corruption-layer
figure_number: Fig. 8.08
figure_caption: "Three formats go in, and one standard tool model comes out."
diagram: anti-corruption-layer.svg
analogy_title: The conference interpreter booth
---
## Gist

Translate every MCP server's odd schemas, names and error shapes into one standard tool model before core code sees them.

## Everyday comparison

### The conference interpreter booth

At an international trade conference, delegates speak a dozen languages, each with its own idioms. Interpreters in a glass booth turn every speech into one working language. Only then does it reach the chair's headphones. The chair runs the meeting in that language only. A new delegation needs a new interpreter, not a new chair.

## Classic meaning

A layer that translates between your own data model and an outside system's model. It stops the outside design from leaking into your code.

## In the agent system

MCP is a standard way to connect tools to an AI model. Connected MCP servers disagree about almost everything. Arguments may be snake_case or camelCase. They use different JSON Schema drafts (versions of a format for describing data). Results come as text blocks or nested JSON. Errors come as isError flags, HTTP codes or plain strings. One translator per server maps each of these into the harness's own types: ToolSpec, ToolResult and ToolError. It adds a prefix to tool names to avoid clashes. It drops fields the core does not understand. The permission engine, the context builder and the transcript only ever see these standard types. When a server changes its schema, only its translator changes.

## In a large company

In a large platform the ACL sits in the MCP connector layer. It often sits behind an MCP gateway that the platform team runs for all tenants (customer companies). Besides translating, it is the natural place for several controls. It can allow only approved servers and pin tool descriptions that security has reviewed. It can map outside error codes to standard ones. It can tag every result with its source for audit. Results that cross the layer should pass DLP scanning (data loss prevention: checks that catch leaks of sensitive data). They should also be marked as untrusted before they enter the context window (the text the model can see at one time). The risk is a connector update that quietly changes a tool description. That is why the layer compares description hashes (short fingerprints of the text) on each connect.

## Step by step

1. On connect, the ACL (anti-corruption layer) reads the server's tool list and maps each tool to a standard ToolSpec.
1. When the model calls a tool, the ACL converts the standard arguments into the server's own format.
1. It converts the raw reply or error back into a ToolResult or ToolError.
1. It rejects and logs any shape it cannot map. It never passes it through.

## Code sketch

```python
class McpTranslator:
    def to_spec(self, raw):
        name = self.prefix + '__' + raw['name']
        schema = normalise(raw['inputSchema'])
        return ToolSpec(name, schema)
    def to_result(self, raw):
        if raw.get('isError'):
            raise ToolError(text_of(raw))
        return ToolResult(text_of(raw))
```

## Be careful

An ACL that passes unknown fields through "just in case" stops protecting anything. Also, translating is not cleaning. Tool descriptions and results stay untrusted. So pin (lock) the approved descriptions and flag any change.

## Diagram

![Fig. 8.08: Three formats go in, and one standard tool model comes out.](/diagrams/anti-corruption-layer.svg)
