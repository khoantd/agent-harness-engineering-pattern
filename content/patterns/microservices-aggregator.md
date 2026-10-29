---
id: microservices-aggregator
number: "5.15"
title: Microservices Aggregator
chapter: multi-agent
fit: adapted
review_id: rev-microservices-aggregator
figure_number: Fig. 5.15
figure_caption: The user asks once and gets one answer. The aggregator hides the specialists and names any gaps.
diagram: microservices-aggregator.svg
analogy_title: "The travel agent's holiday folder"
---
## Gist

One aggregator calls several specialist subagents, then merges their partial outputs into a single answer for the user.

## Everyday comparison

### The travel agent's holiday folder

You ask for a week in Crete. The agent rings the airline for flights, the hotel for a room and the hire firm for a car. Then she hands you one folder with a single plan and a single price. You never hear the three phone calls. If no car was free, the folder says so on one line.

## Classic meaning

A service receives a request, calls several backend services and combines their replies into one answer. This is called API Composition, and it all happens inside one request. It is different from the message Aggregator in Enterprise Integration Patterns. That one collects related messages that arrive over time and sends one combined message when the set is complete.

## In the agent system

A user asks for a release readiness report. The aggregator agent sends focused requests to three subagents (helper agents). One reports test results, one writes the changelog and one runs a security scan. Each returns structured output that follows a schema (a fixed format) the aggregator set. The aggregator checks the parts against each other and removes duplicates. It flags conflicts, such as two subagents disagreeing about a version number. Then it writes one reply or artifact. The user and the chat UI talk to one endpoint. They never need to know how many subagents produced the answer.

## In a large company

In a company platform, this is the API Composition layer behind an API gateway (the single front door for requests). One endpoint signs the user in with SSO (single sign-on). It calls specialist agents or services using that user's delegated identity (acting on the user's behalf with the user's permissions). Then it returns one response. Each branch has its own timeout and circuit breaker (a switch that stops calling a failing service for a while). The reply marks missing sections clearly. So a report that matters for compliance is never quietly incomplete. The aggregator is also where the cost of each request is added up and charged to the tenant (customer company).

## Step by step

1. The user's request reaches the aggregator.
1. It sends a focused request to each specialist subagent.
1. Each subagent returns its part as structured output.
1. The aggregator merges and checks the parts and returns one answer, naming any missing part.

## Code sketch

```python
async def readiness(release):
    asks = {'tests': ask('tests', release),
            'log': ask('changelog', release),
            'scan': ask('security', release)}
    timed = [wait_for(a, 120)
             for a in asks.values()]
    res = await gather(*timed,
                       return_exceptions=True)
    parts = dict(zip(asks, res))
    missing = [k for k, v in parts.items()
               if isinstance(v, Exception)]
    ok = {k: v for k, v in parts.items()
          if k not in missing}
    return report(merge(ok), missing)
```

## Be careful

The aggregator is the only place where a partial failure is visible. So it must say which section is missing instead of hiding the gap.

## Diagram

![Fig. 5.15: The user asks once and gets one answer. The aggregator hides the specialists and names any gaps.](/diagrams/microservices-aggregator.svg)
