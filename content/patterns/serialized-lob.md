---
id: serialized-lob
number: "4.16"
title: Serialized LOB
chapter: memory
fit: direct
review_id: rev-serialized-lob
figure_number: Fig. 4.16
figure_caption: "Small columns are the label, and the transcript travels sealed in one field"
diagram: serialized-lob.svg
analogy_title: The post office parcel
---
## Gist

Store a transcript or artifact body as one packed blob column, in a row whose other columns stay small and searchable.

## Everyday comparison

### The post office parcel

The counter clerk weighs your parcel and writes the postcode, weight and sender on the label. Sorting machines route it using only the label. Nobody opens the box until it reaches the person it is addressed to.

## Classic meaning

Save a group of objects by serialising (packing) them into one large object, a LOB, in a single database field. Ordinary columns sit next to it.

## In the agent system

The sessions table has normal columns: id, user_id, title, model, updated_at and token_total. It also has a body column. That column holds the compressed JSON of every message and content block. Listing a user's recent sessions, or adding up tokens per day, reads only the small columns. The harness reads the full blob only when someone opens the session. It never needs a separate table for each kind of content block (text, tool_use, image, citation).

## In a large company

Storing transcripts as compressed blobs is common in enterprise harnesses, but it makes data controls harder. DLP scanners (data loss prevention tools) and e-discovery tools (used to find records for court cases) cannot see inside a gzip column. Erasing one message means rewriting the whole blob. So teams usually keep the data class, retention class and legal-hold flags as real columns next to the blob. They encrypt the blob with a tenant key. A tenant is one customer company on the platform. They also remove sensitive data before packing it, not after. Large blobs are often moved to object storage (a cloud file service), with only a pointer in the row. That also lets lifecycle rules (automatic storage rules) enforce retention.

## Step by step

1. On save, the harness copies the fields used for lookups into their own columns.
1. It turns the message list into JSON, compresses it and writes it to the body column.
1. List views read only the small columns.
1. Opening a session reads the body and unpacks it.

## Code sketch

```python
db.execute(
    'INSERT INTO sessions(id, user_id,'
    ' title, tokens, updated, body)'
    ' VALUES (?,?,?,?,?,?)',
    (s.id, s.user, s.title, s.tokens,
     now(), gzip(json.dumps(s.messages))))

recent = db.query(
    'SELECT id, title FROM sessions'
    ' WHERE user_id=?'
    ' ORDER BY updated DESC LIMIT 20',
    (uid,))
```

## Be careful

You cannot search inside the blob efficiently, for example for every session that called the deploy tool. Copy any field you filter on into its own column or a side index.

## Diagram

![Fig. 4.16: Small columns are the label, and the transcript travels sealed in one field](/diagrams/serialized-lob.svg)
