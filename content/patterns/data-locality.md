---
id: data-locality
number: "11.01"
title: Data Locality
chapter: performance
fit: adapted
figure_number: Fig. 11.01
figure_caption: Stable bytes at the start get reused. Only the changing end is computed fresh.
diagram: data-locality.svg
analogy_title: "The scrub nurse's instrument tray"
---
## Gist

Put stable content first in the prompt and keep a session's often-used data together, so caches hit and loads stay cheap.

## Everyday comparison

### The scrub nurse's instrument tray

Before every operation, the scrub nurse lays out the same instruments in the same order on one tray beside the surgeon. The surgeon's hand goes to the right place without looking. Nothing has to be fetched from a cupboard during the operation. Only items for today's patient go at the far end of the tray.

## Classic meaning

Data locality means storing items that are used together next to each other in memory. The CPU cache (a small fast memory) and prefetcher (which loads data ahead of time) can then serve them instead of slower main memory.

## In the agent system

Prompt caches and the provider's KV cache (the model's saved internal work for text it has already read) reuse work only for an identical prefix. The match starts from the very first token. So the harness orders every request from most stable to least stable. Tool definitions come first, then the system prompt. Next come long-lived project context and earlier turns. Only then come the new user message and fresh tool results. Timestamps, request ids and per-turn instructions go at the end, never at the top. On the storage side, a session's transcript, memory files and recent tool results live in one record or one shard (one slice of the database). So building a turn's context takes a single read.

## In a large company

In an enterprise platform, prompt layout is a governed template. The platform owns the order of tools, system policy text and tenant context. A tenant is one customer company. A template change that breaks the cached prefix is caught before release by cost and latency regression gates (checks that block a release that makes things worse). Per-tenant context goes after the shared platform prefix. This way the common part can be reused, while tenant data stays in its own section. On the storage side, keeping a session's hot (often-used) data in one record or shard also helps with data residency and erasure. Data residency means keeping data in an approved region. It is simpler because one tenant's session lives in one place.

## Step by step

1. Sort prompt sections by how often they change, most stable first.
1. Move changing items (time, ids, retrieved snippets) after the last cache breakpoint.
1. Add new turns at the end, so earlier bytes never shift.
1. Store each session's often-used data together, so one read builds the context.

## Code sketch

```python
def build_request(s, user_msg):
    return {
      'tools': TOOLS,        # never changes
      'system': [RULES, s.project_ctx],
      'messages': s.history + [  # append
          {'role': 'user', 'content': [
              user_msg, f'now: {clock()}']}],
    }
```

## Be careful

Putting a retrieved document or the current date near the top of the prompt shifts every later byte. Then the cache is lost on every turn.

## Diagram

![Fig. 11.01: Stable bytes at the start get reused. Only the changing end is computed fresh.](/diagrams/data-locality.svg)
