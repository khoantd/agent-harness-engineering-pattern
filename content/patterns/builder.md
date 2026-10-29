---
id: builder
number: "2.11"
title: Builder
chapter: tool-system
fit: direct
figure_number: Fig. 2.11
figure_caption: "Parts arrive from different places, and build() checks them together before sending."
diagram: builder.svg
analogy_title: The custom bicycle workshop
---
## Gist

Put together a large model request piece by piece, from system blocks, tools, history, cache breakpoints and limits, then check it once.

## Everyday comparison

### The custom bicycle workshop

A frame builder does not hand you a bike in one go. You choose the frame size, then the gears, then the wheels, then the handlebars. Each part is clamped on in the work stand. Only when everything is fitted does the mechanic test the brakes and wheel it out the door.

## Classic meaning

A builder keeps the steps for making a complex object apart from the finished object. The same step-by-step process can then make different results.

## In the agent system

One model request can hold many parts. It can have a system prompt in layers, dozens of tool schemas and a long message history. It can have cache_control breakpoints (markers for where the prompt cache should save work). It can also have a thinking budget and max_tokens (a cap on reply length). A RequestBuilder lets the loop add these parts as they become known. System blocks come from settings and memory files. Tools come from the registry. History comes from the transcript after compaction (shrinking old conversation to save space). Then build() checks the whole request once. The total tokens must fit in the context window (the text the model can see at one time). The cache breakpoints must stay within the provider's limit. Every tool_result must be paired with its tool_use. Subagent and eval versions reuse the same builder with different parts.

## In a large company

Enterprise harnesses put all request assembly in one builder, so platform policy is applied in one place. This policy includes required system blocks, such as acceptable-use rules. It includes tenant-specific redaction (hiding sensitive parts) of history. It includes per-tenant max_tokens and budget caps. It also includes placing cache breakpoints only on content that is safe to reuse. A tenant is one customer company sharing the platform. A multi-tenant platform usually sends all tenants through one provider account. So the builder must never put one tenant's data in a prefix built for another. build() is also a good place to stamp the tenant id and trace id as metadata. The LLM gateway (a central service that routes model traffic) uses them for cost chargeback, which bills cost to each team. OpenTelemetry traces (a standard for tracing requests) use them too.

## Step by step

1. The loop creates a RequestBuilder for this turn.
1. Settings, memory, registry and transcript each add their part.
1. build() checks the token budget, the cache breakpoints and the tool pairing.
1. The finished request is sent to the model API.

## Code sketch

```python
req = (RequestBuilder(model=MODEL)
       .system(BASE_PROMPT)
       .system(memory.text(), cache=True)
       .tools(registry.schemas())
       .messages(transcript.compacted())
       .max_tokens(8000)
       .build())  # validates budget + pairs
resp = client.messages.create(**req)
```

## Be careful

If build() does no checking, the builder is only a long constructor. Put the checks across fields there, or skip the pattern.

## Diagram

![Fig. 2.11: Parts arrive from different places, and build() checks them together before sending.](/diagrams/builder.svg)
