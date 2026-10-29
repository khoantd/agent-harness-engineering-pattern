---
id: serialized-entity
number: "4.15"
title: Serialized Entity
chapter: memory
fit: direct
figure_number: Fig. 4.15
figure_caption: The whole run folds into one blob and unfolds on another worker
diagram: serialized-entity.svg
analogy_title: Packing the tent
---
## Gist

Save a whole live object, such as an agent checkpoint, as one blob of data that can be stored, sent and restored elsewhere.

## Everyday comparison

### Packing the tent

At the end of a camping trip you fold the tent, poles, pegs and cover into one bag. Nobody writes down where each peg was. At the next campsite you tip out the bag and put up the same tent again.

## Classic meaning

Serialise (turn into text or bytes) a group of connected objects, for example as JSON, so it can be stored or sent. Later, deserialise it back into equal objects.

## In the agent system

Sometimes a long-running agent pauses to wait for approval. Sometimes a scheduled task hands work to a fresh worker (another machine or process). In both cases the harness serialises a Checkpoint. It holds the messages, todo list, tool state, the waiting tool call, model settings and a schema version number. The blob (one block of stored data) goes to object storage (a cloud service for files) or into a queue message. Any worker can deserialise it and carry on the loop. So a run can wait hours for a human without keeping a live process. Moving a session between machines is just a file copy.

## In a large company

Lasting checkpoints are how enterprise agents survive long approval waits, deploys and machine failures. They are often kept in object storage, encrypted by the storage service with the tenant's own KMS key, in the tenant's home region. A tenant is one customer company on the platform, and a KMS is a key management service. Checkpoints must never hold live credentials or OAuth tokens (login tokens for other services). Tool state should hold references instead. The worker that resumes swaps them for fresh credentials through workload identity (the platform proving which service is asking). Sometimes a checkpoint resumes a waiting tool call after a human approved it. Then the approval should be tied to a hash (fingerprint) of that exact call, and the blob should be signed. That way a changed checkpoint cannot run something nobody approved.

## Step by step

1. At a pause point the harness builds a Checkpoint from the live state.
1. It serialises the Checkpoint with a version number and compresses it.
1. It stores the blob under the session's key.
1. A later worker loads it, upgrades old versions and resumes the loop.

## Code sketch

```python
@dataclass
class Checkpoint:
    v: int
    messages: list
    todos: list
    pending_call: dict | None

blob = gzip(json.dumps(asdict(ckpt)))
blobs.put(f'ckpt/{sid}', blob)
# later, on any worker:
d = json.loads(gunzip(blobs.get(key)))
ckpt = Checkpoint(**migrate(d))
```

## Be careful

Never unpickle checkpoints from sources you do not trust. Unpickling (loading Python's pickle format) can run hidden code. Keep a version field and upgrade steps, because yesterday's blob must still load in today's code.

## Diagram

![Fig. 4.15: The whole run folds into one blob and unfolds on another worker](/diagrams/serialized-entity.svg)
