---
id: lazy-loading
number: "4.10"
title: Lazy Loading
chapter: memory
fit: direct
review_id: rev-lazy-loading
figure_number: Fig. 4.10
figure_caption: Only the schema the model asks for ever enters the context
diagram: lazy-loading.svg
analogy_title: The furniture showroom tag
---
## Gist

Put short placeholders for tool schemas and file contents into context, and load the full version only when the agent asks.

## Everyday comparison

### The furniture showroom tag

The showroom floor shows one of each table and chair. Each has a small tag with an aisle and bin number. Nobody carries every flat-pack box to the checkout. You note the tags for what you want, and only those boxes come down from the warehouse racks.

## Classic meaning

A lazy-loaded object does not hold all its data yet, but it knows how to get it. It waits to load the data until something first uses it.

## In the agent system

Say a harness is connected to 200 tools through MCP (a standard way to connect tools to an AI model). It does not paste every tool's JSON schema (the description of a tool's inputs) into the request. It calls tools/list once per server, which returns every tool's full definition. It keeps those definitions in a local registry (a lookup list in the harness). It sends the model only a tool search tool plus short descriptions of what is available. MCP has no way to fetch one tool's schema on its own. So the lazy step is putting a stored schema into context, not fetching it from the server. When the model searches for a tool, the harness loads that one full schema into context. Then the model can call it with valid arguments. The harness adds discovered schemas after the cached prefix, as tool search on the provider side does. That keeps the prompt cache (saved work the provider can reuse when a request starts the same way) valid. Editing the front of the tools list would break it from that point on. Files work the same way. Context holds a FileRef with the path, size and a summary. The content is read only when the model calls read_file.

## In a large company

Enterprise tool catalogs can hold hundreds of connectors, so lazy loading is standard. But the search index must be filtered for each user before the model sees it. This uses RBAC or ABAC. RBAC is role-based access control, which gives permissions by job role. ABAC is attribute-based access control, which uses facts about the user and the request. Without this filter, tool names and descriptions reveal systems that the user cannot access. The harness must also check permission again when a found tool is actually called. Finding a tool is not the same as being allowed to use it. Gateways (services that sit in front of MCP servers) often keep the catalog and the allow lists for each tenant. A tenant is one customer company on the platform. Gateways also keep the audit of which schemas each session was shown.

## Step by step

1. When it connects, the harness calls tools/list and keeps every schema in a local registry.
1. The request carries only a search tool and short descriptions, not the schemas.
1. The model calls the search tool and names what it needs.
1. The harness loads that one schema from the registry into context, after the cached prefix.
1. The model calls the real tool with valid arguments, and the other schemas never enter the context.

## Code sketch

```python
class LazyTool:
    def __init__(self, name, blurb, reg):
        self.name, self.blurb = name, blurb
        self._reg, self._schema = reg, None
    @property
    def schema(self):
        if self._schema is None:  # first use
            self._schema = self._reg.load(
                self.name)
        return self._schema

# reg was filled once from tools/list
stub = {'name': t.name, 'desc': t.blurb}
```

## Be careful

Each lazy load costs a round trip. A loop over lazy references turns into N separate fetches. Load ahead of time the few tools or files that almost every turn uses.

## Diagram

![Fig. 4.10: Only the schema the model asks for ever enters the context](/diagrams/lazy-loading.svg)
