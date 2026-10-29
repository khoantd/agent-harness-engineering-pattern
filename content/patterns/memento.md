---
id: memento
number: "1.07"
title: Memento
chapter: agent-loop
fit: direct
figure_number: Fig. 1.07
figure_caption: "The session makes and reads snapshots, and the store only keeps them."
diagram: memento.svg
analogy_title: The film set continuity photo
---
## Gist

Save a snapshot of the session's messages and file edits before each risky step, so the user can go back to any earlier turn.

## Everyday comparison

### The film set continuity photo

Before the crew breaks for lunch, the continuity supervisor photographs the set. She records the half-full glass, the open book and the actor's loosened tie. She does not need to understand why each prop is where it is. After lunch, the photo lets everyone put the scene back exactly as it was. Then the next take matches the last one.

## Classic meaning

Save an object's inner state in a sealed snapshot, without exposing its internals. Later, the object can be put back into that state.

## In the agent system

Before each turn that edits files, the session makes a checkpoint. A checkpoint is a copy of the message list plus the original contents of every file the turn is about to change. A checkpoint store keeps these snapshots by turn number, without looking inside them. When the user runs a rewind command, the session restores the chosen checkpoint. It rewrites the files and cuts the transcript back to that turn. So both the conversation and the workspace (the project files) return to that point. Long sessions keep only recent checkpoints, or store file diffs (only the changes) to save disk space.

## In a large company

In an enterprise harness, checkpoints hold transcripts and file contents. So they take on the strictest data classification of anything inside them. They need encryption at rest (encrypted while stored). The keys must belong to each tenant (each customer company) and come from a KMS (key management service). They need a retention period (how long data is kept) that matches the tenant's policy. They must be deleted when a GDPR erasure request arrives, which is a person's legal request under EU privacy law to delete their data. Durable execution engines give a similar rewind point at the workflow level. These are systems that save each step of a workflow so it can resume. The control to explain to users is this. Rewinding the workspace never reverses effects outside it. Those effects must be covered by compensating actions (steps that undo an effect) or by approvals instead.

## Step by step

1. Before a turn with edits, the session snapshots the messages and the files it will touch.
1. The checkpoint store saves the snapshot under the turn number.
1. The user asks to go back to an earlier turn.
1. The store hands back that snapshot, and the session restores itself from it.

## Code sketch

```python
class Session:
    def checkpoint(self):
        files = self.fs.copy(self.touched)
        return Snapshot(self.msgs[:], files)
    def restore(self, snap):
        self.msgs = list(snap.msgs)
        self.fs.write_all(snap.files)

store[turn] = session.checkpoint()
session.restore(store[6])  # /rewind 6
```

## Be careful

Snapshots cannot undo actions outside the workspace, such as a sent message or a deployed build. Tell the user this when they rewind.

## Diagram

![Fig. 1.07: The session makes and reads snapshots, and the store only keeps them.](/diagrams/memento.svg)
