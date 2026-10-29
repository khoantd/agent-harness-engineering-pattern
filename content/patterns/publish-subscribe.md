---
id: publish-subscribe
number: "5.10"
title: Publish-Subscribe
chapter: multi-agent
fit: direct
figure_number: Fig. 5.10
figure_caption: "Publishers name a topic, never a receiver. The broker sends each event on to all its subscribers."
diagram: publish-subscribe.svg
analogy_title: Tuning in to a radio frequency
---
## Gist

Agents publish events such as file.changed or task.done to named topics, and every agent subscribed to a topic gets them.

## Everyday comparison

### Tuning in to a radio frequency

A station broadcasts traffic news on one frequency and music on another. It has no idea who is listening, or how many. A taxi driver tunes to traffic. A hairdresser tunes to music. A new listener can switch on at any moment, and the station changes nothing.

## Classic meaning

Publishers send messages to topics without knowing who will receive them. A broker (a go-between service) delivers each message to every subscriber of that topic.

## In the agent system

In a coding run with several agents, the coder agent publishes file.changed with the file path and a diff hash (a short fingerprint of the change). The test agent publishes task.done with its verdict. A broker keeps a list of subscribers for each topic. The broker can live inside the harness or be an outside message service. The lint agent (a code style checker) and the index refresher both subscribe to file.changed. The orchestrator (the agent in charge) subscribes to task.done. Publishers never address subscribers. So a new watcher, such as a docs-updater agent, joins just by subscribing to an existing topic.

## In a large company

At company scale, the broker is Kafka, Google Pub/Sub, Amazon SNS with SQS, or EventBridge. Teams own topics. Message formats (schemas) are registered and versioned. Tenant isolation (keeping each customer company's data apart) uses separate topics per tenant, or ACLs (access lists) on who may subscribe. This matters because a subscriber added to a shared topic quietly receives every tenant's events. Keep events small. They carry ids rather than raw prompts or PII (personal data such as names and emails). Set the broker's retention (how long it keeps messages) to match the data retention policy.

## Step by step

1. Subscribers tell the broker which topics they want.
1. An agent publishes an event to a topic and carries on.
1. The broker looks up the topic's subscribers.
1. It delivers a copy to each one, and each handles it on its own.

## Code sketch

```python
bus.subscribe('file.changed', lint_agent)
bus.subscribe('file.changed', reindex)
bus.subscribe('task.done', orchestrator)

# inside the coder agent's write tool
bus.publish('file.changed',
            {'path': p, 'sha': sha})
```

## Be careful

Events that wake agents can cause more events. So guard against loops. For example, a formatter agent's own edits can publish file.changed again and wake itself.

## Diagram

![Fig. 5.10: Publishers name a topic, never a receiver. The broker sends each event on to all its subscribers.](/diagrams/publish-subscribe.svg)
