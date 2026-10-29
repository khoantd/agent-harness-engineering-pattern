---
id: identity-map
number: "4.09"
title: Identity Map
chapter: memory
fit: adapted
figure_number: Fig. 4.09
figure_caption: Three retrievals of the same chunk become one object in context
diagram: identity-map.svg
analogy_title: The wedding seating plan
---
## Gist

Keep one in-memory object per document id while building context, so a file or memory found twice enters the window once.

## Everyday comparison

### The wedding seating plan

Cousin Ana is on the bride's list and on the groom's list. The planner checks her name against the seating chart before writing a place card. So Ana gets one seat and one meal, not two. When her diet needs change, there is only one card to correct.

## Classic meaning

An identity map makes sure each object is loaded only once. It keeps every loaded object in a lookup table by its id, and returns the existing one on later requests.

## In the agent system

In one turn, vector search (search by meaning) returns chunk doc-17#3, a piece of a document. A grep tool (a text search tool) finds the same part of the file. A memory lookup pulls it in again. Without care, the context window (the text the model can see at one time) holds three copies. That wastes tokens and suggests to the model that the fact is extra important. The harness keeps an identity map for each turn. Its key is the source and chunk id, or the path and a content hash (a fingerprint of the content). It returns the object that is already loaded. The context builder then cites it as [2] instead of pasting it again. If a tool edits a file, the file is also updated in only one place.

## In a large company

Enterprise harnesses limit the identity map to one request or session and to one tenant (one customer company on the platform). A map shared across the whole process and keyed only by document id would hand one tenant's document to another. The key should also include the source system and the access decision. Two users may be allowed to see different versions or redactions of the same document. Removing duplicate chunks this way also cuts token spending per tenant. It also makes citations in audit logs point to one stable source.

## Step by step

1. Search tools return keys such as doc-17#3.
1. The harness looks up each key in the identity map.
1. If the key is missing, the document is loaded once and stored in the map.
1. If the key is found, the existing object and its citation number are reused.

## Code sketch

```python
class IdentityMap:
    def __init__(self): self._m = {}
    def get(self, key, load):
        if key not in self._m:
            self._m[key] = load(key)
        return self._m[key]

idmap = IdentityMap()          # per turn
for hit in rag_hits + grep_hits:
    doc = idmap.get(hit.key, store.load)
    ctx.cite(doc)      # same doc, same [n]
```

## Be careful

Limit the map to one turn or one session. A map that lives forever across the whole program keeps serving old file contents after the file changes on disk.

## Diagram

![Fig. 4.09: Three retrievals of the same chunk become one object in context](/diagrams/identity-map.svg)
