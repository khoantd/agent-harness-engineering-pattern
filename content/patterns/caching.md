---
id: caching
number: "3.12"
title: Caching
chapter: llm-layer
fit: direct
review_id: rev-caching
figure_number: Fig. 3.12
figure_caption: A hit skips the expensive work. A miss pays once and fills the cache.
diagram: caching.svg
analogy_title: "The library's reserve shelf"
---
## Gist

Reuse work already paid for: cache the stable start of the prompt with the provider, and save repeatable tool results locally.

## Everyday comparison

### The library's reserve shelf

In exam season, students ask for the same twenty textbooks all day. The librarian does not send a porter to the basement every time. She keeps copies on a reserve shelf behind the desk. Those requests are answered in seconds. Anything else still comes from the basement. The shelf is refreshed when the reading list changes.

## Classic meaning

Caching stores the results of expensive operations. When the same request comes again, the answer comes from fast storage instead of being worked out again.

## In the agent system

Every turn sends the tool definitions, system prompt and earlier conversation again. This stable part at the start is the prefix. The harness marks the end of the prefix with a cache_control breakpoint. The provider can then reuse its processed work when a later request starts with exactly the same prefix. The first call pays a cache-write premium, an extra charge above the normal input price. Later calls report cache_read_input_tokens. These cost a fraction of the normal input price, and the reply comes faster. The cache entry expires after about five minutes without a hit. A longer TTL (time to live) costs more to write. Prefixes shorter than a minimum length, which depends on the model, are not cached at all. The harness also has its own local cache. It memoises (saves the result of) read-only tool calls, such as fetching the same URL or reading an unchanged file. The cache key includes the tenant (customer company), the user, the tool name and the arguments. It also includes a content hash (a fingerprint of the content) or a short TTL. Anything with side effects or time-sensitive data skips the cache.

## In a large company

In an enterprise platform, the provider's prompt caches are kept separate per organisation or workspace. But the harness's own caches must be keyed by tenant and principal (the user or service). These include tool results, retrieval results and rendered prompts. They must also respect data classification, retention rules and right-to-erasure (a person's legal right to have their data deleted). Teams track cache hit rate and cache-write spend per agent as cost metrics. A template change that breaks the prefix shows up as a sudden jump in the bill. Shared caches such as Redis (a fast shared data store) should be encrypted and split by tenant. They should not hold regulated data unless retention policy allows it.

## Step by step

1. Order the prompt so tools and system text come first and rarely change.
1. Put a cache breakpoint after the stable prefix.
1. On the next call, the provider matches the prefix and bills cached reads.
1. For tool calls, check the local cache before running the tool, and store the result after.

## Code sketch

```python
system = [{'type': 'text', 'text': RULES,
           'cache_control':
               {'type': 'ephemeral'}}]

@memo(key=lambda ctx, a: (ctx.tenant,
      ctx.user, a['url'], day()))
def fetch_page(ctx, a):
    return http.get(a['url']).text

r = client.messages.create(model=M,
    system=system, tools=TOOLS, messages=h)
log(r.usage.cache_read_input_tokens,
    r.usage.cache_creation_input_tokens)
```

## Be careful

A timestamp or random id near the top of the system prompt changes the prefix on every call. Then every call pays the cache-write premium, and none ever gets a cheap read.

## Diagram

![Fig. 3.12: A hit skips the expensive work. A miss pays once and fills the cache.](/diagrams/caching.svg)
