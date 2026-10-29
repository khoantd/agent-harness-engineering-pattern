---
id: flyweight
number: "4.11"
title: Flyweight
chapter: memory
fit: adapted
review_id: rev-flyweight
figure_number: Fig. 4.11
figure_caption: Thousands of sessions point at one shared prompt bundle
diagram: flyweight.svg
analogy_title: Projected hymn lyrics
---
## Gist

Share one unchangeable copy of the system prompt and tool schemas across thousands of sessions, keeping only each session's own state separate.

## Everyday comparison

### Projected hymn lyrics

A cathedral used to print 600 hymn sheets for every service. Now one screen at the front shows the words to everyone. Each singer brings only what is theirs: which part they sing and where they stand.

## Classic meaning

Flyweight saves memory when you have huge numbers of small objects. It splits the shared part (intrinsic state) from the part that differs per object (extrinsic state), and shares the first.

## In the agent system

A hosted harness may run 10,000 sessions with the same 8,000-token system prompt and 40 tool schemas. A flyweight factory stores that bundle once, keyed by a content hash (a fingerprint of its contents). Every session holds a reference to one frozen PromptBundle that cannot change. Each session stores only its own messages, user id and settings. Sharing one object in memory does not by itself give cache hits. But every session turns that bundle into the same bytes. So requests also share a prompt-cache prefix at the API. The prompt cache is saved work the provider can reuse when a request starts the same way. This works as long as the requests fall within the cache's lifetime and scope. Details for each session, such as the user's name or today's date, go after the shared prefix. They are the extrinsic state.

## In a large company

In an enterprise platform the shared bundle is usually per tenant or per policy profile, not global. A tenant is one customer company on the platform. Tenants add their own instructions, and RBAC (role-based access control: permissions given by job role) filters the tool set. So the bundle's key must include the tenant and the tools it is allowed. The main control is a review step for anything that enters the shared bundle. Prompts have version numbers and go through evals (automated tests) before rollout. They must contain no user or tenant data. Provider prompt caches are kept separate per organisation or workspace. A bundle cache in the harness is not, so its keys and contents need the same care.

## Step by step

1. When a session starts, the harness hashes the prompt version and the tool set.
1. The factory returns the existing bundle for that hash, or builds it once.
1. The session stores a reference plus its own messages and settings.
1. Each request sends the shared prefix, then the session's own content.

## Code sketch

```python
_bundles: dict[str, PromptBundle] = {}

def bundle_for(version, tools):
    key = hash_of(version, tools)
    if key not in _bundles:
        _bundles[key] = PromptBundle.build(
            version, tools)       # frozen
    return _bundles[key]

s = Session(user, bundle=bundle_for(v, t))
```

## Be careful

Never put details about a user into the shared bundle. A name leaked into the flyweight shows up in every session and breaks the cache prefix.

## Diagram

![Fig. 4.11: Thousands of sessions point at one shared prompt bundle](/diagrams/flyweight.svg)
