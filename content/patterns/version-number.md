---
id: version-number
number: "4.21"
title: Version Number
chapter: memory
fit: direct
figure_number: Fig. 4.21
figure_caption: "Both writers read v4, and the counter lets only the first one win"
diagram: version-number.svg
analogy_title: Revision stamps on building drawings
---
## Gist

Stamp every stored artifact, memory and session with a counter that goes up on each write, so stale reads and writes can be caught.

## Everyday comparison

### Revision stamps on building drawings

Every architect's drawing has a box in the corner reading Rev A, Rev B, Rev C. On site, the foreman checks the drawing in hand against the latest revision before pouring concrete. A change request marked against Rev B when Rev D is current goes straight back to the office.

## Classic meaning

Store a version number on each record and raise it with every update. Use it to spot old data and to do optimistic locking (checking for conflicts at save time instead of locking).

## In the agent system

Every artifact, memory file and session row carries a whole-number version. Writes are compare-and-set, which means they only apply if the value is still what you expect. The SQL looks like this: UPDATE ... SET body = ?, version = version + 1 WHERE id = ? AND version = ?. If zero rows are updated, someone else wrote first. The number also tags derived data, meaning data built from the record. An embedding, a summary or a cached render records which version it was built from. So the harness knows when to rebuild it. The UI can also tell the user the doc changed since the agent last read it.

## In a large company

Enterprise APIs show version numbers as ETags (version tags on a resource) or resource versions. Agents that write to them should send If-Match, or the same kind of compare-and-set. Then edits made by a human and an agent at the same time are caught. Record in the audit log which version the agent read and which it wrote. Then you can rebuild exactly what the agent saw when it acted. The same numbers let derived data such as embeddings and summaries be marked out of date exactly when the source changes or is deleted.

## Step by step

1. Every reader gets the version together with the content.
1. Every writer sends the version it read along with its update.
1. The database applies the update only if the version still matches, then raises it by one.
1. Zero rows updated tells the writer its copy is out of date.

## Code sketch

```python
def save(art, body):
    n = db.execute(
        'UPDATE artifacts SET body=?,'
        ' version=version+1'
        ' WHERE id=? AND version=?',
        (body, art.id, art.version))
    if n == 0:
        raise StaleVersion(art.id)
    art.version += 1
```

## Be careful

Timestamps are a poor substitute. Two writes in the same millisecond, or clocks that differ between workers, defeat them. Use a whole number that the database raises.

## Diagram

![Fig. 4.21: Both writers read v4, and the counter lets only the first one win](/diagrams/version-number.svg)
