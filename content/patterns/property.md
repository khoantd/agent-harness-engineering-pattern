---
id: property
number: "2.27"
title: Property
chapter: tool-system
fit: direct
review_id: rev-property
figure_number: Fig. 2.27
figure_caption: A lookup climbs the chain until some level has the key
diagram: property.svg
analogy_title: Table limits at a casino
---
## Gist

Give each tool a settings map that falls back to a parent map. Tools inherit defaults and change only what differs.

## Everyday comparison

### Table limits at a casino

Each blackjack table shows a small sign with its own lowest and highest bets. Anything not on the sign follows the casino's house rules. Anything the house rules leave out follows the casino group's standard rulebook. When the casino changes a house rule overnight, every table without its own sign follows it the next morning.

## Classic meaning

Objects keep their properties in a map. When a key is missing, they ask a parent object. This forms a chain of parents, called a prototype chain.

## In the agent system

Tools share many settings: timeout, retry count, output token limit, sandbox profile and approval mode. The harness keeps a root map of defaults. Each MCP server gets a child map. For example, a slow remote server sets timeout_s to 120. Each tool gets a map that holds only its own differences. A lookup such as tool.get('timeout_s') checks the tool, then its server, then the root. It returns the first value it finds. Changing a root default updates every tool that has not set its own value. A subagent's tool set can be a child map that overrides approval_mode. But it may only make it stricter. So a child never loosens what its parent requires.

## In a large company

Company platforms stack settings in layers. Platform defaults come first, then the tenant (one customer company), then the workspace or project, then the tool. The same fallback lookup finds timeouts, model choice and budgets. Security and compliance keys work differently. Tenant or company policy sets limits that lower levels can tighten but not loosen. A policy engine usually enforces this, not plain fallback. The final value, and the level that supplied it, should show in the admin console. They should also be recorded with each run for audit.

## Step by step

1. The harness creates a root map of default tool settings.
1. Each MCP server or tool family gets a child map that points to the root.
1. Each tool gets its own map with only its changes, pointing to its family.
1. A lookup checks the tool, then each parent in turn, and returns the first value found.

## Code sketch

```python
class Props:
    def __init__(self, parent=None, **own):
        self.parent, self.own = parent, own
    def get(self, k):
        if k in self.own: return self.own[k]
        if not self.parent: raise KeyError(k)
        return self.parent.get(k)

root = Props(timeout_s=30, approval='ask')
remote = Props(root, timeout_s=120)
fetch = Props(remote, approval='auto')
fetch.get('timeout_s')    # 120, from remote
```

## Be careful

Long chains make 'why is this timeout 120?' hard to answer. Keep the chain short. Have the tool inspector show which level supplied each value.

## Diagram

![Fig. 2.27: A lookup climbs the chain until some level has the key](/diagrams/property.svg)
