---
id: sharding
number: "4.22"
title: Sharding
chapter: memory
fit: direct
review_id: rev-sharding
figure_number: Fig. 4.22
figure_caption: "The tenant's region limits the choice, and the hash only picks a shard inside it"
diagram: sharding.svg
analogy_title: Conference registration desks
---
## Gist

Split session and memory stores by tenant, so each shard holds one slice of the data and each turn touches one shard.

## Everyday comparison

### Conference registration desks

At a 5,000-person conference, the badge desks are split by surname: A to F, G to M, N to S, T to Z. Each desk keeps only its own box of badges, so its queue moves quickly. You walk straight to your desk. A crowd at one desk never slows the others.

## Classic meaning

Split the rows of your data across several databases, using a shard key to decide where each row goes. Each database (a shard) stores and serves only its part of the rows.

## In the agent system

A hosted harness with millions of users keeps transcripts, memories and vector indexes (search indexes by meaning) in many shards. A tenant is one customer company on the platform. First, the router looks up the tenant's home region in a tenant directory (a lookup table about each tenant). It also checks whether the tenant is pinned to a fixed shard. Then it picks a shard within that region using consistent hashing of tenant_id. Consistent hashing is a way of spreading keys so that adding a shard moves only a few of them. A turn reads and writes one shard's transcript table and one tenant's vector namespace (its own section of the index). That limits index size and stops one busy tenant from slowing everyone. Hashing alone cannot keep data in a region, which is why the region comes first. Tenants that share a shard are separated only logically, not physically. So tenant filters or row-level security (database rules that limit which rows each user sees) still run on every query. Only a dedicated shard gives physical separation.

## In a large company

Enterprise agent platforms usually combine regional or cell-based deployment with sharding inside each region. A cell is a self-contained copy of the whole system. A tenant directory records each tenant's home region and any dedicated cell. A hash is used only inside that boundary. Regulated or very large customers often get a dedicated shard or cell with its own encryption keys. That is the only setup that truly gives physical separation. Shared shards still need tenant_id on every row. They also need enforcement such as row-level security or a vector namespace for each tenant. Admin queries across shards must be audited, because they get around the separation the design depends on.

## Step by step

1. A turn request arrives with the tenant id of the logged-in user.
1. The router looks up the tenant's region, and any pinned shard, in the tenant directory.
1. If there is no pinned shard, it hashes the tenant id onto the shard ring for that region only.
1. Transcript, memory and vector reads and writes stay in that shard, filtered by tenant.

## Code sketch

```python
RINGS = {'eu': ring([db_eu1, db_eu2]),
         'us': ring([db_us1, db_us2])}

def shard_for(tenant):
    t = directory.get(tenant)  # region, pin
    if t.pinned:               # big tenants
        return t.pinned
    return RINGS[t.region].node(tenant)

db = shard_for(req.tenant_id)
mems = db.memories.search(
    q, tenant=req.tenant_id, user=req.user)
```

## Be careful

Plain modulo hashing (hash number divided by shard count) moves almost every tenant when you add a shard. Use consistent hashing or a directory. Keep queries that reach out to every shard off the busy path.

## Diagram

![Fig. 4.22: The tenant's region limits the choice, and the hash only picks a shard inside it](/diagrams/sharding.svg)
