---
id: prototype
number: "2.13"
title: Prototype
chapter: tool-system
fit: direct
review_id: rev-prototype
figure_number: Fig. 2.13
figure_caption: Each subagent starts as a deep copy of one tuned template plus a small change.
diagram: prototype.svg
analogy_title: "The tailor's sample suit"
---
## Gist

Copy a tuned agent or tool config template and change only a few fields, instead of building each version from scratch.

## Everyday comparison

### The tailor's sample suit

A tailor keeps a sample jacket on the rail. It has already been fitted, pinned and tested. For a new customer, the tailor copies its pattern and changes only the sleeve length and the cloth. The sample stays on the rail untouched, ready to be copied again.

## Classic meaning

You make new objects by copying an existing sample object, the prototype. Then you adjust the copy.

## In the agent system

A well-tuned code reviewer subagent (a helper agent for one task) has a long system prompt and a chosen tool list. It also has a model choice, stop rules and hooks (code that runs at set moments). The orchestrator is the main agent that hands out work. To send reviewers over several folders, it deep-copies the reviewer template. A deep copy copies everything inside, including nested lists. Then it sets only the folder scope and output file on each copy. Put those changes in the first user message, not the system prompt. Then every clone keeps the template's tools and system prompt exactly the same, byte for byte. So all clones can reuse one prompt cache entry (saved work the provider can reuse when a request starts the same way). But that entry exists only once the first request starts to respond. So start one clone before the rest. The template itself is never changed. The next batch of copies starts from the same known state.

## In a large company

Enterprises keep approved agent templates in a catalogue with versions, reviewed like code. Teams make new versions by copying a template and changing a small, allowed set of fields, such as scope or output location. The fields that matter for safety are locked. These include tools, model and policy hooks. This stops a copy from quietly widening its permissions. Record the template version on each subagent that starts. This supports audits and tracking of eval regressions (drops in automated test results). Templates should be plain data. Then a deep copy never copies live clients or credentials.

## Step by step

1. The harness loads a named template, such as reviewer, from the template store.
1. The orchestrator deep-copies it once for each task.
1. Each copy gets its own small changes, such as scope and output path.
1. The copies start as subagents, while the template stays unchanged.

## Code sketch

```python
base = templates.get('reviewer')

def variant(scope):
    spec = copy.deepcopy(base)
    spec.scope = scope
    spec.output = f'reviews/{scope}.md'
    return spec

specs = [variant(d) for d in
         ['api/', 'web/', 'db/']]
for s in specs: harness.spawn(s)
```

## Be careful

A shallow copy shares nested lists such as tools or hooks. So one copy's edit leaks into the template and the other copies. Always deep-copy.

## Diagram

![Fig. 2.13: Each subagent starts as a deep copy of one tuned template plus a small change.](/diagrams/prototype.svg)
