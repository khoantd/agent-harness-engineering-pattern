---
id: strangler
number: "8.09"
title: Strangler
chapter: architecture
fit: direct
review_id: rev-strangler
figure_number: Fig. 8.09
figure_caption: "A router moves traffic to the new loop one intent at a time, guided by evals."
diagram: strangler.svg
analogy_title: Rebuilding a bridge lane by lane
---
## Gist

Move traffic one intent at a time from an old prompt chain to a new agent loop, until you can delete the old chain.

## Everyday comparison

### Rebuilding a bridge lane by lane

The city cannot close the river crossing for two years. So crews build a new deck beside the old bridge. They open one lane and use cones to move some of the traffic over. Each month another lane moves across. When the last car uses the new deck, the old bridge is quietly taken down.

## Classic meaning

Replace an old system bit by bit. You put a facade (a single front door) in front of it and move each feature over to new code, one piece at a time.

## In the agent system

Some harnesses are built as a fixed prompt chain: classify, retrieve, draft, format. This works for narrow requests, but it cannot choose tools as it goes. A router sits in front. It reads the request's intent (what the user wants to do) and a migration flag for that intent. Moved intents go to the new agent loop, which can use tools. The rest still go through the old chain. Both paths write the same transcript format and reply shape. So clients cannot tell which path served them. Shadow runs replay live requests through the new loop without showing the result to users. In these runs, tools with side effects (like sending email) are stubbed (replaced by fakes) or run in dry-run mode. Eval comparisons (scored tests) on those runs decide when the next intent moves over.

## In a large company

Large companies moving off old prompt chains or older chatbot platforms route traffic through a feature flag service. That service can target by tenant (one customer company). So you can turn an intent on for internal users first, then pilot tenants, then everyone. You can also roll it back at once. The gates for each move are eval suites run in CI (the automatic build and test system). They also include live numbers such as task success, how often requests go to a human, and cost per solved request. Change management records each move for audit. Regulated tenants may need to agree first before their traffic moves to a new model path. The risk is the long tail: the last few intents never move. So the old chain needs an owner and a shut-down date.

## Step by step

1. Every request enters the strangler router, which finds its intent.
1. Moved intents go to the agent loop. All others go to the old chain.
1. Both paths return the same reply shape and write the same transcript format.
1. Eval results move one intent at a time, until nobody uses the chain and it is removed.

## Code sketch

```python
MIGRATED = {'summarise', 'search_docs'}

def handle(req):
    intent = classify(req.text)
    if intent in MIGRATED:
        return agent_loop.run(req)
    return legacy_chain.run(req)

# after evals pass on shadow traffic
MIGRATED.add('draft_email')
```

## Be careful

The two paths might write different transcript or error formats. Then clients start to depend on which path served them, and the migration gets stuck.

## Diagram

![Fig. 8.09: A router moves traffic to the new loop one intent at a time, guided by evals.](/diagrams/strangler.svg)
