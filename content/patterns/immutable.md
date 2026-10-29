---
id: immutable
number: "7.09"
title: Immutable
chapter: safety
fit: direct
review_id: rev-immutable
figure_number: Fig. 7.09
figure_caption: "History can only grow, so an edit attempt is refused and a new entry is added instead."
diagram: immutable.svg
analogy_title: "Yesterday's newspaper"
---
## Gist

Make transcript entries, configs and policies read-only once created, so any change makes a new version and history stays intact.

## Everyday comparison

### Yesterday's newspaper

Once the morning paper is printed and delivered, nobody edits it. If a story was wrong, a later edition prints a correction that points back to it. The archive keeps every edition exactly as printed. So anyone can check what was said and when.

## Classic meaning

An immutable object cannot change after it is built. Any change returns a new object instead.

## In the agent system

Once a transcript entry is added, it is a frozen record. The transcript is the saved record of the conversation. Each entry's hash chains to the previous entry. A hash is a short fingerprint of the content. So a compromised tool or a confused agent cannot quietly rewrite what the user approved. Permission policies and system-prompt configs load as frozen objects. A change creates a new version with a new id. Each session records which version it ran under. Compaction does not edit old turns either. Compaction shrinks the history by summarising it. It adds a summary entry that points to the turns it replaces. Frozen objects can also be shared across threads and sessions with no locks.

## In a large company

Enterprise audit trails for agent actions are stored append-only. One example is WORM object storage (write once, read many) such as S3 Object Lock. The head of the chain is anchored now and then in a separate system, so tampering can be detected. Immutability clashes with GDPR erasure and retention rules. GDPR is the EU data protection law, which can require deleting personal data. So platforms keep personal data encrypted under per-subject or per-tenant keys. To erase the data, they delete the key. This is called crypto-shredding. Versioned, immutable policy and prompt configs also make change management and incident review repeatable.

## Step by step

1. Build the record or config once, with all fields set.
1. Freeze it and compute a hash over its content and the entry before it.
1. Any change creates a new object that points to the old one.
1. Readers share it without locks and can check the hash chain.

## Code sketch

```python
@dataclass(frozen=True)
class Entry:
    role: str
    content: str
    prev_hash: str

    @property
    def hash(self):       # covers every field
        return h(self.prev_hash, self.role,
                 self.content)

e2 = Entry('user', 'hi', e1.hash)
# e2.content = 'x'  -> FrozenInstanceError
```

## Be careful

Freezing objects in memory protects nothing if the store allows edits. Back it with append-only storage, where records can be added but never changed. Check the hash chain on load.

## Diagram

![Fig. 7.09: History can only grow, so an edit attempt is refused and a new entry is added instead.](/diagrams/immutable.svg)
