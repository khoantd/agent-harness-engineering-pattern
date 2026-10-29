---
id: optimistic-offline-lock
number: "4.20"
title: Optimistic Offline Lock
chapter: memory
fit: direct
figure_number: Fig. 4.20
figure_caption: "No one waits, and the late writer finds out at save time and merges"
diagram: optimistic-offline-lock.svg
analogy_title: The theatre box office
---
## Gist

Let the agent and a person edit one document without locks, and check at save time whether someone changed it first.

## Everyday comparison

### The theatre box office

You look at the seating plan and think it over with a coffee. Then you come back to buy row F seat 12. Nobody held the seat for you. At the till the clerk checks it is still free. If someone bought it meanwhile, you see the current plan and choose again.

## Classic meaning

Avoid clashes between people working at the same time by checking for a conflict when saving. A stale write is rejected, instead of locking the data while people work.

## In the agent system

An agent reads an artifact, such as a doc, a spec or a config file, at the start of a long turn. It spends a minute planning edits, while the user types in the same doc. When the agent saves, the harness sends the version number it read. The store compares it with the current version. If the version has moved on, the store rejects the write. The harness then fetches the newer content. It has the model redo its edit on top of it. Or it runs a three-way merge, which combines both sets of changes using the original as a guide. Then it saves again. Nothing was locked while the model was thinking, so the person was never blocked.

## In a large company

In enterprise collaboration tools, an agent that edits shared documents, tickets or configuration must use that system's own conflict checks. It must not just overwrite. On HTTP APIs this means ETags (version tags on a resource) sent back with an If-Match header. A merge may combine an agent's edit with a human's. Then the result should be shown for review, or recorded with both authors in the audit trail. Silent agent merges over human edits are a risk for change management (the process for controlling changes). Repeated conflicts on the same item are a sign to send the work through a clear handoff or approval step.

## Step by step

1. The agent reads the document and remembers its version.
1. It works on its edits without holding a lock.
1. It saves with expected_version, and the store rejects the save if the version has moved.
1. On a conflict, it fetches the latest version, merges its change and saves again.

## Code sketch

```python
doc = store.get(doc_id)       # text + version
new = agent.edit(doc.text)
try:
    store.save(doc_id, new,
               expected=doc.version)
except VersionConflict as c:
    merged = merge3(doc.text, new,
                    c.current.text)
    store.save(doc_id, merged,
               expected=c.current.version)
```

## Be careful

This optimistic approach suits conflicts that are rare. If the agent and a person clash on most saves, split the document or hand over editing on purpose. Do not keep merging again and again.

## Diagram

![Fig. 4.20: No one waits, and the late writer finds out at save time and merges](/diagrams/optimistic-offline-lock.svg)
