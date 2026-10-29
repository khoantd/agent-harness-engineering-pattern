---
id: metadata-mapping
number: "4.17"
title: Metadata Mapping
chapter: memory
fit: direct
review_id: rev-metadata-mapping
figure_number: Fig. 4.17
figure_caption: One generic engine follows a declared map instead of code for each type
diagram: metadata-mapping.svg
analogy_title: The airport baggage hall
---
## Gist

Describe how memory records map to store fields in one table of settings, and let shared code do every load and save.

## Everyday comparison

### The airport baggage hall

The conveyor system knows nothing about skis, prams or suitcases. It reads one routing table: flight 117 goes to belt 4, flight 220 to belt 7. When a new route opens, someone adds a line to the table. Nobody rewires the conveyor.

## Classic meaning

Keep the details of how objects map to storage as data (metadata). Then shared, generic code reads that data to load and save the objects.

## In the agent system

A harness may keep memories, artifacts and scheduled tasks in a vector store (a database that finds text by meaning) and in a SQL table. It does not write a separate mapper by hand for each type. Instead, each record class declares a mapping. For example, the text field goes to meta.body. user_id goes to meta.uid as a scope key (a field that limits whose data you can see). The vector is computed from the text by the embedder. One generic save() and one load() follow that map. Adding a field means adding a line. The same metadata can also generate the store's schema, and the optional filters that a memory search tool offers the model. Scope keys are different. The harness fills them from the caller's identity and never lets the model set them.

## In a large company

Enterprise teams add data governance tags to the mapping metadata. Each field gets a PII class (what kind of personal data it is) and a retention period. It also gets a residency rule (where the data must be stored) and an encryption requirement. Then generic code can redact, encrypt and delete data in the same way for every record type. The same metadata can feed a data catalog and the records of processing that GDPR (the EU data protection law) expects. Scope fields like tenant_id and user_id must be enforced by the harness and by the store. A tenant is one customer company on the platform. For example, use Postgres row-level security (database rules that limit which rows each user sees). Never rely on whatever filters a caller or the model supplies.

## Step by step

1. Each record type declares its field mapping as data.
1. Generic save() follows the mapping, converting and placing each field.
1. Generic load() follows it backwards to rebuild the object.
1. Schemas and search filters are generated from the same mapping.

## Code sketch

```python
MEMORY_MAP = [
    Field('id',   to='id'),
    Field('text', to='meta.body'),
    Field('user', to='meta.uid', scope=True),
    Field('text', to='vector', via=embed),
]

def save(obj, mapping, store):
    rec = {}
    for f in mapping:
        val = f.convert(getattr(obj, f.name))
        put(rec, f.to, val)
    store.upsert(rec)
```

## Be careful

Metadata hides behaviour. When a field quietly stops being saved, the bug is in a table nobody reads as code. So check the mapping when the program starts.

## Diagram

![Fig. 4.17: One generic engine follows a declared map instead of code for each type](/diagrams/metadata-mapping.svg)
