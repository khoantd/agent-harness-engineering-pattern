---
id: pipeline
number: "1.16"
title: Pipeline
chapter: agent-loop
fit: direct
review_id: rev-pipeline
figure_number: Fig. 1.16
figure_caption: Each stage narrows the data and passes it on.
diagram: pipeline.svg
analogy_title: The water treatment works
---
## Gist

Prepare context in fixed stages: find candidates, rerank them by relevance, shorten the best ones, then insert them into the prompt.

## Everyday comparison

### The water treatment works

River water first passes through screens that catch branches. Then it goes to settling tanks where mud sinks, then through sand filters, and finally to a stage that kills germs. Each stage does one job and hands cleaner water to the next. Engineers can upgrade the filters without touching the screens.

## Classic meaning

Pass data through a series of stages, where each stage's output is the next stage's input. Then each stage can be built, tested and replaced on its own.

## In the agent system

Before calling the model, a retrieval-augmented harness runs a context pipeline. Retrieval-augmented means it looks up documents and adds them to the prompt. The retriever pulls fifty chunks (short pieces of text) from a vector store and a keyword index. A vector store finds text by meaning, and a keyword index finds it by words. A reranker scores the chunks against the query and keeps eight. A compressor trims each one to the sentences that matter. An injector formats them as document blocks in the prompt, with source ids. Each stage takes the query and a list of chunks, and returns a new list. So a team can swap the reranker model without touching the other stages. They can also add a stage, such as one that removes duplicates or one that checks access rights. Evals (automated quality tests) can score each stage on its own.

## In a large company

Enterprise retrieval pipelines add stages that a demo leaves out. These include an access-control filter that drops chunks the user may not read. They include a residency filter, for rules on where data must stay. They also include PII redaction (removing personal data such as names and emails) and provenance tagging, which records where each chunk came from for citations. The access check must use the end user's identity. It must run before reranking and injection. Once a chunk reaches the context window (the text the model can see), the model can repeat it. Each stage is traced with OpenTelemetry, a standard for recording what software does. Each is also scored by offline evals (tests run outside live traffic). So a reranker change can be held back until retrieval quality is proven, before rollout.

## Step by step

1. The user's query enters the first stage.
1. Retrieve returns a broad set of candidate chunks.
1. Rerank and compress narrow down and shorten the set.
1. Inject formats the remaining chunks into the context window for the model call.

## Code sketch

```python
stages = [retrieve(k=50), rerank(top=8),
          compress(max_tokens=2000), inject]

def run(query):
    data = []
    for stage in stages:
        data = stage(query, data)
    return data  # prompt-ready blocks

prompt = run(user_msg)
```

## Be careful

Any stage can drop the one chunk that mattered. Log what each stage removed, so a bad answer can be traced back to its stage.

## Diagram

![Fig. 1.16: Each stage narrows the data and passes it on.](/diagrams/pipeline.svg)
