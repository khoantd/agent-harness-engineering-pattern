---
id: collection-pipeline
number: "9.01"
title: Collection Pipeline
chapter: functional
fit: direct
review_id: rev-collection-pipeline
figure_number: Fig. 9.01
figure_caption: "Each operation returns a new list, smaller or cleaner than the last."
diagram: collection-pipeline.svg
analogy_title: The orchard packing house
---
## Gist

Prepare the transcript for the model as a chain of filter, map and take steps over the message list.

## Everyday comparison

### The orchard packing house

Apples come off the truck onto a sorting line. Workers pull off the bruised ones. The rest are washed and given stickers one by one. At the end, a worker fills crates until each holds exactly forty. Every station handles the whole stream and passes a smaller or tidier stream along.

## Classic meaning

Organise work as a series of operations that each take a collection and return a new one. The usual ones are filter (keep some items), map (change each item) and reduce (combine them).

## In the agent system

Turning a stored transcript into the messages for the next request is a collection task. First the harness filters out events that are only for the screen. Then it maps old tool results to a short placeholder. This way every tool_use (the model's tool request) still has its tool_result (the tool's answer). Next it maps each record into the API's message format and cuts down outputs that are too large. Then it takes messages from the newest end until the token budget is reached. Each step is a pure operation, with no side effects, over lists that never change. So each step is easy to test, and preparing a request never changes the transcript on disk. Keep the output the same from turn to turn where you can. This matters for the prompt cache (saved work the provider can reuse when a request starts the same way). The cache only reuses an unchanged prefix, the start of the request.

## In a large company

Enterprise harnesses build the request with the same kind of chain, plus extra stages. One stage does PII redaction (removing personal data such as names and emails). Another removes content that the tenant (the customer company) has marked as not to be shared with the model. A third checks residency rules before the request leaves the region. The stored transcript is the system of record for audit, meaning the official copy. So the chain must never change it. It makes a separate derived view for each request. The cost control is cache-awareness. Stable prefixes keep prompt cache hit rates high, and that shows up directly in each tenant's bill.

## Step by step

1. Start from the full list of stored transcript records.
1. Filter out records the model should not see.
1. Map each remaining record to an API message, and cut down large content.
1. Take from the newest end until the token budget is used, then send.

## Code sketch

```python
msgs = (Seq(transcript)
        .filter(lambda r: r.kind != 'ui')
        .map(stub_if_stale)  # keep pairs
        .map(to_api_message)
        .map(truncate(max_chars=8000))
        .take_last_within(tokens=60_000)
        .to_list())
```

## Be careful

Taking from the end can split a tool_use from its tool_result. A window that slides every turn also defeats the prompt cache. Drop each pair together, and trim in larger steps.

## Diagram

![Fig. 9.01: Each operation returns a new list, smaller or cleaner than the last.](/diagrams/collection-pipeline.svg)
