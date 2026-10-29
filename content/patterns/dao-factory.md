---
id: dao-factory
number: "4.03"
title: DAO Factory
chapter: memory
fit: direct
figure_number: Fig. 4.03
figure_caption: "Choosing the factory chooses every DAO, so stores never mix"
diagram: dao-factory.svg
analogy_title: The travel adapter kit
---
## Gist

Choose a storage system once at startup and get a matching set of DAOs (transcripts, memories, artifacts) that all use it.

## Everyday comparison

### The travel adapter kit

Before a trip you pick the kit for the country you will visit. Every plug in the box fits that country's sockets: one for the laptop, one for the phone, one for the shaver. You never end up with one British plug and two European ones. That is because you chose the kit, not the single plugs.

## Classic meaning

A factory that hands out a whole family of DAOs for one data source. To switch storage, the program picks a different factory.

## In the agent system

The harness reads its config at startup. Local mode wants an embedded database (one stored in a local file) and the local file system. Cloud mode wants a managed SQL server and object storage (a cloud service for storing files). Evals (automated test runs) want everything in memory. There is one factory per mode. It returns transcripts(), memories() and artifacts(), all connected to the same storage and credentials. A DAO is a small object that handles storage for one kind of record. The session service asks the factory for DAOs and never checks the mode itself. So a laptop run, a hosted run and an eval run can never mix stores.

## In a large company

In an enterprise system spread across several regions, the factory choice depends on where the tenant lives as well as on the mode. A tenant is one customer company on the platform. An EU tenant gets a factory whose DAOs all point at EU databases, EU buckets and an EU KMS key. A KMS is a key management service for encryption keys. Building the whole family from one tenant placement record stops a transcript landing in one region while its artifacts land in another. Each family's credentials should come from workload identity (the platform proving which service is asking) or a secrets manager such as Vault. They should be fetched when the DAOs are created. They should never come from config files the agent can read.

## Step by step

1. At startup the harness reads the deployment mode from config.
1. It creates the matching factory once.
1. Services ask the factory for each DAO they need.
1. Every DAO in the family shares the same connection, storage bucket and credentials.

## Code sketch

```python
class DAOFactory(Protocol):
    def transcripts(self) -> TranscriptDAO:...
    def artifacts(self) -> ArtifactDAO: ...

class LocalFactory(DAOFactory):
    def transcripts(self):
        return FileTranscriptDAO(self.root)
    def artifacts(self):
        return FileArtifactDAO(self.root)

FACTORIES = {'local': LocalFactory,
             'cloud': CloudFactory,
             'eval': MemoryFactory}
f = FACTORIES[cfg.mode](cfg)   # once
```

## Be careful

If you will only ever have one storage system, the factory is just extra ceremony. Add it when a second real one arrives. In-memory fakes for evals count.

## Diagram

![Fig. 4.03: Choosing the factory chooses every DAO, so stores never mix](/diagrams/dao-factory.svg)
