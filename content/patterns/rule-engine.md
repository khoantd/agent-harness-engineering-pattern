---
id: rule-engine
number: "1.17"
title: Rule Engine
chapter: agent-loop
fit: direct
review_id: rev-rule-engine
figure_number: Fig. 1.17
figure_caption: "Facts go in, rules match, and the matching actions come out."
diagram: rule-engine.svg
analogy_title: The insurance claims desk
---
## Gist

Check a set of written rules against each turn's facts to decide routing, approvals and compaction, without hard-coded branches.

## Everyday comparison

### The insurance claims desk

A claims handler works from a rulebook, not from instinct. Claims under five hundred pounds with photos are paid at once. Anything mentioning a flood goes to a specialist. A third claim in one year triggers a fraud check. When the company changes its policy, it edits the rulebook. The handlers apply the new rules the next morning.

## Classic meaning

Keep business rules apart from the program code by writing them as condition-action pairs. An engine checks them against a set of facts.

## In the agent system

Each turn, the harness gathers facts. These include context usage, the requested tool and a risk class for its arguments. They also include the user's plan tier, the working directory and the time of day. A rule engine checks rules loaded from a settings file. One rule says: if the context is over 80 percent full, compact it (shrink it) first. Another says: if a command classifier marks the shell command as destructive, require approval. A command classifier is code that reads a command and labels how risky it is. A third says: if the task is classified as simple, send it to a smaller model. Matching rules produce actions, and the loop applies them in priority order. Operators change behaviour by editing rules as data. The rules can be tested against recorded turns.

## In a large company

Enterprise platforms keep two kinds of rules apart. Operational rules handle routing, compaction and model choice. Authorization rules decide who may do what. A dedicated policy engine checks them, such as OPA with its Rego language, or Cedar. Both kinds are kept as versioned policy-as-code, meaning rules stored and tracked like program code. They are reviewed through change management. They are unit-tested in CI (automatic checks on every change) against recorded turns. Every decision is logged with its policy version for audit. The key risk is fail-open behaviour, where the system allows actions when something breaks. If the engine or its rule bundle is not available, authorization decisions must default to deny.

## Step by step

1. Load the rules from configuration at startup or when they change.
1. At each turn, collect the facts into a dictionary (a set of named values).
1. Check every rule's condition against the facts.
1. Apply the actions of matching rules in priority order.

## Code sketch

```python
RULES = [  # loaded from rules.yaml
  {'if': {'ctx_pct': {'gt': 80}},
   'then': 'compact_first', 'prio': 1},
  {'if': {'cmd_risk': {'eq': 'high'}},
   'then': 'require_approval', 'prio': 0},
  {'if': {'task': {'eq': 'simple'}},
   'then': 'use_small_model', 'prio': 2}]

hits = [r for r in RULES
        if match(r['if'], facts)]
hits.sort(key=lambda r: r['prio'])
for r in hits:
    apply(r['then'])
```

## Be careful

Rules that affect each other are hard to reason about, for example when one rule's action changes another rule's facts. Keep actions independent, or check the rules only once per turn.

## Diagram

![Fig. 1.17: Facts go in, rules match, and the matching actions come out.](/diagrams/rule-engine.svg)
