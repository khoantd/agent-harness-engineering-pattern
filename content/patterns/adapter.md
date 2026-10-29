---
id: adapter
number: "2.03"
title: Adapter
chapter: tool-system
fit: direct
review_id: rev-adapter
figure_number: Fig. 2.03
figure_caption: "Each foreign interface gets one adapter, so the loop only ever calls Tool.run()."
diagram: adapter.svg
analogy_title: The travel plug adapter
---
## Gist

Wrap MCP servers and outside APIs so each one looks like a native tool, with the harness's own name, schema and run method.

## Everyday comparison

### The travel plug adapter

You land in London with a laptop charger built for American sockets. You do not rewire the charger or rip out the wall socket. A small plastic block takes two flat pins on one side and offers three square pins on the other. The charger and the socket each keep their own shape. Only the adapter knows both.

## Classic meaning

An adapter changes the interface of an existing piece of code into the one a caller expects. Parts that do not fit together can then work together.

## In the agent system

The agent loop (the cycle of calling the model and running tools) knows one contract. A Tool has a name, a description, an input_schema, and run(args) that returns a ToolResult. MCP is a standard way to connect tools to an AI model. An MCP server speaks JSON-RPC instead, a message format for calling remote functions. It uses tools/list to list its tools and tools/call to run one. A REST API speaks HTTP, with its own auth headers and status codes. The harness writes one adapter for each outside source. An MCP adapter maps tools/call replies into a ToolResult. It turns isError, JSON-RPC errors and timeouts into error results. An HTTP adapter maps 4xx and 5xx responses (the HTTP error codes) the same way. Each adapted tool carries its server name as a prefix, such as mcp__github__create_issue. So two servers cannot clash on the same name. The loop, the permission gate and the transcript never learn where a tool really lives.

## In a large company

Enterprises usually keep adapters in one central MCP or tool gateway. The gateway sits in front of approved internal APIs and third-party MCP servers. So every tool reaches the loop through one path that is audited and rate-limited (capped in how often it can be called). Remote MCP servers over streamable HTTP should sign in with OAuth (a standard for granting access), as the MCP authorization spec describes. The tokens are limited to the user and held by the adapter. They are never placed in the model context (the text the model can see). Treat tool descriptions from third parties as untrusted input. Pin server versions (lock them to a known version) and review any change to a description. An altered description can steer the model.

## Step by step

1. At startup, the harness connects to each MCP server and lists its tools.
1. It wraps every remote tool in an adapter that follows the Tool interface.
1. The model calls the tool by name, exactly like a built-in tool.
1. The adapter turns the call into tools/call or HTTP and maps the reply back into a ToolResult.

## Code sketch

```python
class McpToolAdapter(Tool):
    def __init__(self, client, srv, spec):
        self.client, self.spec = client, spec
        self.name = f'mcp__{srv}__{spec.name}'
    def run(self, args):
        try:
            r = self.client.call_tool(
                self.spec.name, args)
        except McpError as e:
            return ToolResult.error(str(e))
        return ToolResult(
            content=r.content,
            is_error=r.isError)
```

## Be careful

Some adapters turn remote failures into empty successes. This misleads the model. Pass errors and timeouts through as is_error results (results marked as failures).

## Diagram

![Fig. 2.03: Each foreign interface gets one adapter, so the loop only ever calls Tool.run().](/diagrams/adapter.svg)
