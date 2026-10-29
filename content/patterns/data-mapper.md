---
id: data-mapper
number: "4.04"
title: Data Mapper
chapter: memory
fit: direct
review_id: rev-data-mapper
figure_number: Fig. 4.04
figure_caption: "Neither side knows the other's shape, and only the mapper knows both"
diagram: data-mapper.svg
analogy_title: The removal crew
---
## Gist

Keep objects like Memory and Turn unaware of storage by putting a separate mapper between them and the store.

## Everyday comparison

### The removal crew

Movers take apart your sofa, lamp and bookcase. They wrap them and pack them into numbered crates that fit the van and the warehouse racks. At the new house they unpack and rebuild everything. Your sofa never learns about crate numbers. The warehouse never learns about your living room.

## Classic meaning

A layer of mappers moves data between objects and a database. The objects and the database stay independent of each other, and of the mapper too.

## In the agent system

In the harness, a Memory has text, source, created_at and importance. It has methods like is_stale(). The vector store (a database that finds text by meaning) wants something else. It wants an id, a list of numbers called a vector, and a flat set of text labels called metadata. A MemoryMapper converts between the two. One way is to_record: it embeds the text (turns it into a vector), flattens the fields and turns dates into text. The other way is from_hit: it reads the metadata and adds the similarity score (how close the match was). The Memory class imports nothing from the store's client library. So you can test it without a database. You can also move it to a different store by rewriting only the mapper.

## In a large company

The mapper is where an enterprise platform decides what reaches the vector store as readable text. So it is the natural place for PII redaction (removing personal data such as names and emails). It is also where the stored text can be encrypted field by field. And it is where records get tagged with tenant, data classification and retention class. A tenant is one customer company on the platform. Many vector stores copy metadata into managed services outside the main database. So copying raw memory text into metadata spreads it to more places and regions. That makes a data breach bigger. Keeping the mapping in one class also makes a DPIA (data protection impact assessment) or a security review easier. One file shows exactly which fields leave your code.

## Step by step

1. Normal code creates and changes Memory objects without any save calls.
1. On save, the mapper turns each Memory into a record with a vector and flat metadata.
1. On load, the mapper reads search hits and rebuilds Memory objects with scores.
1. If the store's layout changes, only the mapper needs to change.

## Code sketch

```python
class MemoryMapper:
    def to_record(self, m: Memory):
        return {'id': m.id,
            'vector': embed(m.text),
            'meta': {'tenant': m.tenant,
                'text': m.text, 'src': m.source,
                'ts': m.ts.isoformat()}}
    def from_hit(self, h) -> Memory:
        md = h.meta
        return Memory(id=h.id,
            tenant=md['tenant'],
            text=md['text'], source=md['src'],
            ts=parse_iso(md['ts']),
            score=h.score)
```

## Be careful

A mapper roughly doubles the code compared with objects that save themselves. For a few flat records with no logic, that cost may not be worth it.

## Diagram

![Fig. 4.04: Neither side knows the other's shape, and only the mapper knows both](/diagrams/data-mapper.svg)
