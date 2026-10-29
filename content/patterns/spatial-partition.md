---
id: spatial-partition
number: "11.02"
title: Spatial Partition
chapter: performance
fit: direct
figure_number: Fig. 11.02
figure_caption: The query visits two nearby cells and never touches the other sixty-two.
diagram: spatial-partition.svg
analogy_title: "The taxi dispatcher's district map"
---
## Gist

Split the embedding space into regions, so a memory or code search checks only the few cells nearest the query.

## Everyday comparison

### The taxi dispatcher's district map

A dispatcher with five hundred taxis does not check every driver when a call comes in from the old town. Her map is divided into districts. She radios only the cabs in that district and the two next to it. A cab across the river is never even considered.

## Classic meaning

Spatial partition organises objects by position in a structure that splits space, such as a grid, tree or clusters. A search for nearby objects then checks only the regions that matter.

## In the agent system

An agent's long-term memory, docs index or codebase can hold millions of embeddings. An embedding is a list of numbers, also called a vector, that stands for the meaning of a piece of text. A partitioned index such as IVF clustering splits these vectors into cells. Each cell has a centroid (its centre point). When a vector is written, it goes into the cell of its nearest centroid. At query time, the retrieval tool turns the question into an embedding and ranks the centroids by distance. It scans only the closest nprobe cells (nprobe is the number of cells to check). It returns the top-k chunks (the k best matches) in milliseconds. Partitions can also follow metadata. With shards per repository or per tenant (customer company), a memory search never crosses into another user's data.

## In a large company

In an enterprise platform, vector indexes use partitioning for speed. Examples are pgvector with IVFFlat, FAISS, or a managed vector database. Tenant isolation is enforced separately. It uses per-tenant indexes, namespaces or row-level security (database rules that limit which rows each user can see). It does not rely on which cells happen to be probed. Apply metadata filters for document permissions inside the index query itself. Filtering after an approximate search can return too few results. It can also tempt code to fall back to a query with no filter. Recall at a given nprobe is part of the retrieval eval suite. Teams check it again when the embedding model changes.

## Step by step

1. At write time, embed each chunk and put it in the cell of its nearest centroid.
1. At query time, embed the query and rank the centroids by distance.
1. Scan only the closest nprobe cells for candidate vectors.
1. Rerank the candidates and return the top-k chunks to the agent.

## Code sketch

```python
def add(chunk):
    v = embed(chunk.text)
    cell = nearest(centroids, v)
    cells[cell].append((v, chunk))

def search(query, k=8, nprobe=3):
    q = embed(query)
    near = closest(centroids, q, nprobe)
    cands = sum((cells[i] for i in near), [])
    return top_k(cands, q, k)
```

## Be careful

If you probe too few cells, you miss relevant memories that sit near a cell border. Tune nprobe on a recall eval (a test of how many right answers are found), not on speed alone.

## Diagram

![Fig. 11.02: The query visits two nearby cells and never touches the other sixty-two.](/diagrams/spatial-partition.svg)
