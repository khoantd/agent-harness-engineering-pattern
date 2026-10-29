---
id: double-checked-locking
number: "6.16"
title: Double-Checked Locking
chapter: async
fit: direct
review_id: rev-double-checked-locking
figure_number: Fig. 6.16
figure_caption: "The second check, made under the lock, stops a racing thread from building twice."
diagram: double-checked-locking.svg
analogy_title: Lighting the stage before the show
---
## Gist

Create a shared client only when first needed, checking once without the lock and again under it, so only one thread builds it.

## Everyday comparison

### Lighting the stage before the show

Any stagehand who sees the stage is dark heads for the lighting booth. Only one person fits in the booth, so the others queue at its door. The first one in turns the lights up. The next one in looks at the board. The lights are already on, so they leave without touching anything.

## Classic meaning

Lazy initialisation builds something only on first use. To cut locking cost, code checks the condition before taking the lock and checks again after.

## In the agent system

Some things are costly to build: model provider clients, MCP connections and tokenizer tables. A client is the object that talks to a service. MCP is a standard way to connect tools to an AI model. Building these opens connection pools, fetches tool lists and loads vocabularies. A harness creates them on first use. But many sessions may reach first use at the same moment. The getter first checks for the client without locking. Every later call takes this fast path. If the client is missing, the getter takes a lock and checks again before building. So a thread that lost the race reuses the new client. It does not open a second pool. Some things carry credentials, such as an MCP connection authorised as one user. These are cached per tenant and principal, never as one global instance. A tenant is one customer company. A principal is the user or service the access belongs to.

## In a large company

In an enterprise harness, lazily built clients are usually per tenant (customer company) or per principal (user or service). That is because they carry API keys, OAuth tokens or a region-specific endpoint. The regional endpoint is for data residency, which means keeping data in a certain region. So the cache key must include whichever of those vary. A singleton is one shared instance for the whole process. A global singleton holding one user's MCP authorisation is a cross-tenant data leak. Cached clients also need a way to refresh when credentials rotate (get replaced). Credentials may rotate in Vault or in a KMS-backed secret store, which is protected by a key management service. Clients should not live for the life of the process.

## Step by step

1. A caller checks whether the shared client exists, and returns it if so.
1. If not, it takes the init lock.
1. It checks again, since another caller may have built it meanwhile.
1. Only if it is still missing does it build and publish the client.

## Code sketch

```python
_clients, _lock = {}, threading.Lock()

def get_client(tid):         # per tenant
    c = _clients.get(tid)          # check 1
    if c is None:
        with _lock:
            c = _clients.get(tid)  # check 2
            if c is None:
                c = ModelClient(creds(tid))
                _clients[tid] = c
    return c
```

## Be careful

Publishing the built object must be one atomic step (it happens all at once) after construction. A CPython name binding gives that. Java needs a volatile field and C++ needs an atomic. Otherwise a reader can see a half-built client.

## Diagram

![Fig. 6.16: The second check, made under the lock, stops a racing thread from building twice.](/diagrams/double-checked-locking.svg)
