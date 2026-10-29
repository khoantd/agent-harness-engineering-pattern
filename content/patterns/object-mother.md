---
id: object-mother
number: "12.02"
title: Object Mother
chapter: testing
fit: direct
figure_number: Fig. 12.02
figure_caption: Evals ask for setups by name. One class knows how to build them correctly.
diagram: object-mother.svg
analogy_title: The film extras agency
---
## Gist

Give evals a factory of named, ready-made test setups, such as an angry customer or a session waiting on an approval.

## Everyday comparison

### The film extras agency

A director phones the casting agency and asks for two tired commuters and a tourist with a map. The agency sends people already dressed and briefed for those parts. So nobody explains costumes on set. When the studio changes its standard costume, the agency updates every booking at once.

## Classic meaning

An Object Mother is a class with factory methods (functions that build objects). Each one returns a ready-made test object in a named state. So tests share realistic fixtures (prepared test data) without repeating setup.

## In the agent system

Eval suites need the same starting points again and again. One is a 200-turn conversation close to the compaction threshold (the point where old messages get summarised to save space). Others are a session waiting on a tool approval and a persona (a pretend user) who writes short angry messages. Another is a sandbox (walled-off workspace) with a broken test. A FixtureMother offers methods such as long_convo(200), pending_approval(tool='bash') and angry_customer(). They build valid sessions with the correct roles and sensible defaults. Each tool_use (request to run a tool) is correctly paired by id with its tool_result (the tool's answer). When the message format changes, only the mother is updated.

## In a large company

Enterprise fixture factories build synthetic (made-up) personas and sessions. Copying real production transcripts into fixtures would move customer data into code repositories and CI logs (the logs of the automatic test system). That breaks GDPR purpose limits (the EU rule that data be used only for its stated purpose) and most customer contracts. Where real traffic is needed, it is sampled with consent and has personal data removed. It is kept in a controlled eval data store with rules on how long it is kept. The mother is also the place to describe tenant shapes. A tenant is one customer company sharing the platform. Examples are a tenant whose data must stay in the EU, or a role without approval rights. This way, policy paths get tested.

## Step by step

1. An eval asks the mother for a named setup, such as pending_approval().
1. The mother builds a valid session with defaults and paired ids.
1. The eval changes only the details it cares about.
1. Many evals share the same setups, so a format change is fixed in one place.

## Code sketch

```python
class Mother:
    @staticmethod
    def pending_approval(tool='bash'):
        s = Session(user=Mother.persona())
        s.add_user('clean up the build dir')
        s.add_tool_use(tool, cmd='rm -rf out')
        s.status = 'awaiting_approval'
        return s
    @staticmethod
    def persona(mood='neutral'):
        return Persona(name='Sam', mood=mood)
```

## Be careful

A mother with dozens of nearly identical methods gets hard to find your way around. Pair it with a builder (an object that makes small changes step by step) for small variations.

## Diagram

![Fig. 12.02: Evals ask for setups by name. One class knows how to build them correctly.](/diagrams/object-mother.svg)
