---
id: log-aggregation
number: "5.19"
title: Log Aggregation
chapter: multi-agent
fit: direct
figure_number: Fig. 5.19
figure_caption: Scattered logs on each machine become one searchable record keyed by run id.
diagram: log-aggregation.svg
analogy_title: The hospital records office
---
## Gist

Send logs from every agent run, subagent and MCP server to one central store, indexed by run id, for search and alerts.

## Everyday comparison

### The hospital records office

Every department writes its own notes on the patient: the emergency room, the X-ray suite, the surgical ward. When the patient goes home, all those sheets go to the records office. They are filed under one hospital number. Months later, a doctor asks for that number and reads the whole stay in date order.

## Classic meaning

Services send their logs to a central logging service. It stores and indexes them, so operators can search all of them in one place.

## In the agent system

A busy harness runs hundreds of agent sessions across many worker machines. Each session's subagents, sandboxes (sealed-off places to run code) and MCP servers write their own logs. MCP is a standard way to connect tools to an AI model. A shipper on each machine forwards structured JSON log lines to a central log store. It adds the run id, agent name, machine name and time. Operators search one place for every error from a given tool. Evals (automated quality tests) and alert rules query the same data. For example, they can watch for a rising rate of permission denials. Without aggregation, debugging a failed run starts with working out which machine each subagent happened to run on.

## In a large company

Companies send structured agent logs through OpenTelemetry Collector, Fluent Bit or Vector (tools that collect and forward logs). The logs go into Elasticsearch or OpenSearch, Splunk, Loki or a cloud logging service. Every line carries a trace_id and span_id, so logs can be joined to traces (records of one request's full path). Indexes or access rules are split by tenant (customer company). Security events such as approvals, permission denials and tool calls also go to the SIEM (the security team's log monitoring system). There they are kept longer, in a tamper-evident way (any change can be detected). Secrets and PII (personal data such as names and emails) are removed at the shipper, before data leaves the machine or region.

## Step by step

1. Every part writes structured log lines tagged with the run id.
1. A shipper on each machine forwards the lines to the central store.
1. The store indexes them by run id, part, level and time.
1. People and alert rules search across all runs from one place.

## Code sketch

```python
log = logger.bind(run_id=run.id,
                  agent='researcher')
log.info('tool.start', tool='web_search')
log.warn('permission.denied', path=p)

# central query across all runs
store.query('level:warn AND'
            ' event:permission.denied'
            ' | count by agent')
```

## Be careful

Agent logs grow quickly and often hold user data. So set limits on how long logs are kept, and remove secrets before the lines leave the machine.

## Diagram

![Fig. 5.19: Scattered logs on each machine become one searchable record keyed by run id.](/diagrams/log-aggregation.svg)
