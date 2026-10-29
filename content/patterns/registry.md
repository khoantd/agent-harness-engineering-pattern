---
id: registry
number: "2.06"
title: Registry
chapter: tool-system
fit: direct
review_id: rev-registry
figure_number: Fig. 2.06
figure_caption: "Every tool enters through one map, which both lists the tools and finds each call."
diagram: registry.svg
analogy_title: The coat check at a concert hall
---
## Gist

Keep one map from names to tools, which the harness uses to list tools for the model and to route each tool_use call.

## Everyday comparison

### The coat check at a concert hall

Every coat handed over gets a numbered tag and a matching hook. At the interval, nobody searches the racks. You show tag 214, and the attendant walks straight to hook 214. Coats from the afternoon show and the evening show share one system. A missing number is noticed at once.

## Classic meaning

A registry is a well-known object that other code uses to find shared objects and services by name.

## In the agent system

Three kinds of tools go into one ToolRegistry at startup. These are built-in tools, tools adapted from MCP servers and plugin tools. MCP is a standard way to connect tools to an AI model. Each tool is stored under a unique name such as read_file or mcp__github__create_issue. The registry produces the tools array sent with each request. A tool_use block is the model's request to run a tool. When one arrives, the dispatcher (the harness code that routes calls) looks up block.name and calls that handler. Duplicate names fail when they are registered, not later when they are called. An unknown name returns an is_error tool_result (a result marked as a failure), so the model can correct itself.

## In a large company

In a multi-tenant platform, the registry is filtered on each request by tenant, role and data classification. A tenant is one customer company sharing the platform. This filter often uses a policy engine such as OPA or Cedar, which are rule engines that decide who may do what. So the model only sees tools the current user is allowed to use. The dispatcher must repeat the permission check on every call. The model can send any tool name. A resumed transcript may also name tools that have since been taken away. Record each session's tool list in the audit trail. Then a review after an incident can show exactly which tools were available.

## Step by step

1. Each tool source registers its tools by unique name at startup.
1. The registry lists schemas for the request's tools array.
1. A tool_use block arrives, and the dispatcher calls registry.get(block.name).
1. The handler runs, or an unknown name returns an error result.

## Code sketch

```python
class ToolRegistry:
    def __init__(self):
        self._tools = {}
    def register(self, tool):
        if tool.name in self._tools:
            raise DuplicateTool(tool.name)
        self._tools[tool.name] = tool
    def get(self, name):
        return self._tools.get(name)
    def schemas(self):
        return [t.spec() for t in
                self._tools.values()]
```

## Be careful

Changing the tools array during a session breaks the prompt cache (saved work the provider can reuse when a request starts the same way). This is because tools sit at the start of the cached prefix. Freeze the list for each session. Bring in late tools through deferred loading (adding them later without changing the start of the request).

## Diagram

![Fig. 2.06: Every tool enters through one map, which both lists the tools and finds each call.](/diagrams/registry.svg)
