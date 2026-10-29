---
id: virtual-proxy
number: "2.15"
title: Virtual Proxy
chapter: tool-system
fit: adapted
review_id: rev-virtual-proxy
figure_number: Fig. 2.15
figure_caption: "The stub costs one line in the prompt, and the real tool loads once, on first use."
diagram: virtual-proxy.svg
analogy_title: "The library's closed stacks"
---
## Gist

Use a light stub in place of a costly tool, and load its full schema or start its server only when first needed.

## Everyday comparison

### The library's closed stacks

The catalogue lists a rare atlas with a shelf mark and a one-line description. But the atlas itself sits in a basement store. Only when a reader hands in a request slip does a porter bring it up to the reading room. After that, it stays on the desk for the day, and nobody fetches it twice.

## Classic meaning

A virtual proxy waits to create or load a costly object until someone actually uses it.

## In the agent system

A session may have hundreds of MCP tools available. MCP is a standard way to connect tools to an AI model. Putting every full JSON schema (the full description of a tool's inputs) in the system prompt would cost tens of thousands of tokens. It would also start servers that are never used. So the harness registers a stub for each tool. A stub is a light stand-in that holds only the tool's name and a one-line description. The model may pick a deferred tool (one not fully loaded yet) for the first time. It may do this through a tool search call, or directly. Then the stub starts the MCP server and fetches the full schema. It adds the schema to the context and swaps in the real adapter. Later calls go straight through.

## In a large company

Enterprise platforms often reach hundreds of MCP servers through a gateway (one central entry point). So they delay both schema loading and server start-up. This keeps the token cost of each request low, and it cuts cold-start load (the cost of starting servers) for every tenant. A tenant is one customer company sharing the platform. Lazy loading (loading only when needed) must still respect permissions. Tool search should return only tools the user is allowed to use. A server started on first use should get that user's credentials at that moment. Track first-use delay and loader failures as metrics. A slow or failing loader looks to users like a turn that has stalled.

## Step by step

1. The system prompt lists deferred tools by name and one-line description only.
1. The model picks a deferred tool for the first time, usually through a tool search call.
1. The stub starts its server, fetches the full schema and adds it after the cached prefix.
1. The arguments are checked against the real schema, and a mismatch returns an error that includes the schema.
1. The stub keeps the real tool, so later calls skip the loading step.

## Code sketch

```python
class LazyTool(Tool):
    def __init__(self, name, desc, loader):
        self.name, self.desc = name, desc
        self._load, self._real = loader, None
    def real(self):
        if self._real is None:
            self._real = self._load()
            ctx.add_schema(self._real.spec)
        return self._real
    def run(self, args):
        real = self.real()
        if not real.spec.valid(args):
            return ToolResult.retry(real.spec)
        return real.run(args)
```

## Be careful

Loading a schema during a session changes the prompt. So add new schemas after the cached prefix (the start of the request that the prompt cache saves). Do not reorder the tool list.

## Diagram

![Fig. 2.15: The stub costs one line in the prompt, and the real tool loads once, on first use.](/diagrams/virtual-proxy.svg)
