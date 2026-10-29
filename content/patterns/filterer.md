---
id: filterer
number: "7.03"
title: Filterer
chapter: safety
fit: direct
figure_number: Fig. 7.03
figure_caption: "Each filtered() call returns the same type, so the narrowing can go on."
diagram: filterer.svg
analogy_title: Stacked sieves in a soil lab
---
## Gist

Give a tool or content collection a filtered() method that returns a smaller collection of the same type, chained per session.

## Everyday comparison

### Stacked sieves in a soil lab

A soil technician pours a sample into a stack of sieves. Coarse mesh is on top and fine mesh below. Each tray catches what passed the one above. What it holds is still soil that could go through another sieve. The sample never changes kind. It only gets smaller at each level, until just what the test needs is left.

## Classic meaning

A container returns filtered copies of itself through filtered(predicate). A predicate is a yes-or-no test. Filters can chain without showing the container's insides.

## In the agent system

The harness loads a full ToolRegistry, the list of all tools it knows. It holds every built-in tool plus every tool from each connected MCP server. MCP is a standard way to connect tools to an AI model. A given session should only see some of them. So the harness calls registry.filtered(by_role).filtered(by_project).filtered(not_deferred). Each step returns a new ToolRegistry. So the result still supports lookup, schema export and more filtering. The final registry is serialised (turned into text) into the tools parameter of the model request. The same shape works for memory entries, or for search results filtered by the user's access.

## In a large company

In enterprise harnesses, the first filters come from entitlements, the access the customer has bought and allowed. First comes the tenant admin's allow-list of MCP servers and tools. Then come RBAC or ABAC rules mapped from identity provider groups through SSO (single sign-on). RBAC gives permissions by job role. ABAC gives permissions based on attributes such as team or region. The same shape applies to retrieval, which means looking up documents for the model. There, document ACLs (access control lists) should be applied as a filter inside the vector store query. A vector store is a database that finds similar text. Trimming a top-k list afterwards can return too few results, and it is easy to forget. Visibility filters are a usability layer. So the executor checks authorisation again and logs every call.

## Step by step

1. Load the full registry of built-in and MCP tools.
1. Apply filtered() with the session's role test.
1. Chain more filtered() calls for project scope and loaded state.
1. Send the final registry's schemas as the request's tools list.

## Code sketch

```python
class ToolRegistry:
    def filtered(self, pred):
        return ToolRegistry(
            t for t in self.tools if pred(t))

visible = (registry
    .filtered(lambda t: t.risk <= role.cap)
    .filtered(lambda t: t.server in project)
    .filtered(lambda t: not t.deferred))
request.tools = visible.schemas()
```

## Be careful

A filtered list hides tools from the model, but it does not stop a crafted call. Hiding a tool is not the same as blocking it. Enforce the same rule again when the tool runs.

## Diagram

![Fig. 7.03: Each filtered() call returns the same type, so the narrowing can go on.](/diagrams/filterer.svg)
