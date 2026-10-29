---
id: repository
number: "4.01"
title: Repository
chapter: memory
fit: direct
review_id: rev-repository
figure_number: Fig. 4.01
figure_caption: "The loop asks one collection, and the repository decides which store answers"
diagram: repository.svg
analogy_title: The library circulation desk
---
## Gist

Give the agent's memory a simple list-like interface (add, search, remove), so loop code never talks to the database directly.

## Everyday comparison

### The library circulation desk

You ask the librarian for books on tide pools. She might get them from the open shelves, the basement or another library. You just get a pile of books at the desk. You return them to the same desk, and she decides where each one goes.

## Classic meaning

A repository sits between your main program and the storage code. It lets the program treat stored objects like an ordinary collection.

## In the agent system

The agent loop (the code that runs the model turn after turn) asks a MemoryRepository for what matters to this turn: repo.search(query, k=5). Here k is the number of results. Behind the repository there might be a vector store (a database that finds text by meaning). It uses embeddings, which are lists of numbers that stand for meaning. It could also be a SQL table of past chats or a folder of markdown memory files. The repository speaks in the harness's own objects, such as Memory and Turn. It applies scope, such as the user id and how recent a memory is. It also hides the embedding call. You can swap the vector store, or use a simple in-memory repository in evals (automated test runs), without changing any loop code.

## In a large company

In an enterprise platform, the memory repository is the one checkpoint where tenant and user scope get fixed. A tenant is one customer company sharing the platform. The scope comes from the logged-in identity, so neither loop code nor the model can widen a search. The repository is also where right-to-erasure requests land (a person's legal right to have their data deleted). remove() and a forget_user() call must delete the memory text, its embedding and any cached copies. Some vector stores offer separate namespaces or indexes per tenant. Postgres with pgvector (a vector search add-on) and row-level security (database rules that limit which rows each user can see) can also do this. These enforce scope below the repository as a second line of defence.

## Step by step

1. The loop builds a search query from the latest user message.
1. It calls repo.search(query, k), limited to the current user.
1. The repository embeds the query, searches its store and turns each hit into a Memory object.
1. The loop puts those memories into the context window and saves new facts with repo.add().

## Code sketch

```python
class MemoryRepo(Protocol):
    def add(self, m: Memory): ...
    def search(self, q, k=5) -> list: ...
    def remove(self, mem_id): ...

class VectorMemoryRepo(MemoryRepo):
    def __init__(self, index, tenant, user):
        self.index = index
        self.ns = f'{tenant}/{user}'  # scope
    def search(self, q, k=5):
        hits = self.index.query(embed(q),
            top_k=k, namespace=self.ns)
        return [Memory.from_hit(h)
                for h in hits]
```

## Be careful

Do not let store-specific query syntax, such as filter dicts or bits of SQL, leak out through the repository. Once callers depend on it, the abstraction is gone.

## Diagram

![Fig. 4.01: The loop asks one collection, and the repository decides which store answers](/diagrams/repository.svg)
