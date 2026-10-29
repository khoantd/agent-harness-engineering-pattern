---
id: mapreduce
number: "5.06"
title: MapReduce
chapter: multi-agent
fit: adapted
figure_number: Fig. 5.06
figure_caption: "No call ever sees all the documents. Maps shrink them, the shuffle groups, and reducers combine."
diagram: mapreduce.svg
analogy_title: Election night count
---
## Gist

Turn each document into short notes with its own subagent, group the notes by theme, then combine each group into one summary.

## Everyday comparison

### Election night count

Every polling station counts its own ballot box and phones in one sheet of totals. At the regional centre, staff sort the sheets by constituency and add up each pile. The national result is built from those few sums. Nobody at the centre ever handles a paper ballot.

## Classic meaning

To process a large set of data, you run a map function on each record at the same time. You group the results by a key. Then a reduce function combines each group.

## In the agent system

Forty PDFs will not fit in one context window (the text the model can see at one time). So the harness runs a map step. It starts one subagent (helper agent) per document or chunk. All use the same summary prompt. Each one returns structured notes tagged with themes. The harness then groups the notes by theme. This is the shuffle step. Next, one reduce subagent per theme writes a summary from that theme's notes alone. A final call merges the theme sections into the report. Every model call sees a limited amount of text. So the job grows with the number of documents, not with the size of the context window.

## In a large company

Companies run map steps through a provider's batch API (a cheaper way to send many requests to be done later). Or they use a queue of workers behind the LLM gateway (one shared front door to all AI models). This gives lower cost, rate limits per tenant (per customer company) and chargeback (billing) per job. PII redaction (removing personal data such as names and emails) and DLP (data loss prevention checks) run before the map step. Source document ids travel with every note, so the final report can cite and audit its evidence. Data residency matters here (keeping data inside a set country or region). Map workers must run in the region where the documents live. The notes made along the way are stored and deleted under the same retention policy (rules on how long data is kept) as the sources.

## Step by step

1. Split the documents into pieces that each fit in one context.
1. Map: one subagent per piece runs the same prompt and returns notes tagged by theme.
1. Shuffle: the harness groups all notes by theme.
1. Reduce: one call per theme combines its notes, and a final call merges the sections.

## Code sketch

```python
notes = await gather(*[
    run('summarise', d) for d in docs])
by_theme = defaultdict(list)
for n in chain(*notes):
    by_theme[n.theme].append(n)
parts = await gather(*[
    run('synthesise', t, ns)
    for t, ns in by_theme.items()])
report = await run('merge', parts)
```

## Be careful

Map summaries lose detail. When the answer needs exact quotes or figures, carry source ids through the map step. Then the reducers can look up the originals.

## Diagram

![Fig. 5.06: No call ever sees all the documents. Maps shrink them, the shuffle groups, and reducers combine.](/diagrams/mapreduce.svg)
