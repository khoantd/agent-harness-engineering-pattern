---
id: multi-agent
section_id: ch-multi-agent
number: 05
title: Multi-Agent Orchestration
kick: "Chapter 5 · Many agents, one goal"
patterns:
  - actor-model
  - mediator
  - master-worker
  - fork-join
  - fan-out-fan-in
  - mapreduce
  - leader-followers
  - leader-election
  - observer
  - publish-subscribe
  - event-aggregator
  - data-bus
  - polling-pub-sub
  - microservices-messaging
  - microservices-aggregator
  - saga
  - commander
  - distributed-tracing
  - log-aggregation
  - self-registration
  - service-locator
---

## Summary

One agent eventually runs out of room or time. Several agents can split the work and run side by side, but then they must coordinate, pass messages and be tracked. These patterns come from large distributed systems, where those problems were solved first.
