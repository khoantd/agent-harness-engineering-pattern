---
id: dirty-flag
number: "4.14"
title: Dirty Flag
chapter: memory
fit: direct
figure_number: Fig. 4.14
figure_caption: Only changed notes pay for a new embedding
diagram: dirty-flag.svg
analogy_title: The hotel make-up-room card
---
## Gist

Mark a memory or summary as changed when its source changes, and re-embed or re-summarise only when that mark is set.

## Everyday comparison

### The hotel make-up-room card

Housekeeping does not strip every bed every morning. Guests who want service hang the card on the door handle, and the cleaner only enters those rooms. Rooms without a card are skipped. The card comes off once the room is done.

## Classic meaning

Use a flag to track whether worked-out data is out of date. Set the flag when the source changes. Recompute only when the flag is set and the result is needed.

## In the agent system

Re-embedding a memory file (turning its text into numbers for search again) costs model calls. So does making a new conversation summary. The harness keeps a dirty flag, or a saved content hash (a fingerprint of the content), for each derived item. A derived item is one built from other data. When someone edits a memory note, the file watcher sets embedding_dirty. When new messages pass the summary point, it sets summary_dirty. Before each turn, a refresh step recomputes only the items whose flag is set, then clears the flag. A quiet session with no new content costs nothing extra. The cached prompt prefix also stays byte-identical, so the provider can keep reusing it.

## In a large company

Enterprise platforms use dirty flags or content hashes to control spending on embeddings and summaries. That spending shows up directly in cost dashboards for each tenant (customer company) and in chargeback (billing each team for its own use). The trap specific to enterprises is deletion. When a memory or document is deleted for retention or erasure reasons, the derived embedding, summaries and caches must be wiped. Marking them for recompute is not enough. A summary that already includes the deleted fact has to be rebuilt from the remaining sources. So it is worth recording lineage, meaning which sources each derived item came from.

## Step by step

1. A write to the source sets the flag.
1. Before the derived value is needed, the harness checks the flag.
1. If it is set, the harness recomputes the embedding or summary and clears the flag.
1. If it is clear, the harness reuses the saved result with no model call.

## Code sketch

```python
class MemoryNote:
    def __init__(self, text):
        self.text, self.vec = text, None
        self.dirty = True
    def edit(self, text):
        self.text, self.dirty = text, True
    def vector(self):
        if self.dirty:        # changed?
            self.vec = embed(self.text)
            self.dirty = False
        return self.vec
```

## Be careful

A missed flag is worse than a wasted recompute. If any write path forgets to set it, the agent works from an old summary. When writes come from many places, use content hashes instead.

## Diagram

![Fig. 4.14: Only changed notes pay for a new embedding](/diagrams/dirty-flag.svg)
