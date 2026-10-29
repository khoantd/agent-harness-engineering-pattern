---
id: write-ahead-log
number: "4.12"
title: Write-Ahead Log
chapter: memory
fit: direct
figure_number: Fig. 4.12
figure_caption: "The plan reaches the disk before the tool runs, so a crash leaves a readable trail"
diagram: write-ahead-log.svg
analogy_title: "The ship's logbook"
---
## Gist

Write each tool call to a lasting log before running it, so a crashed run can restart exactly where it stopped.

## Everyday comparison

### The ship's logbook

Before the officer on watch changes course, the order goes in the logbook with the time. If the bridge loses power in a storm, the next officer reads the log. They know the heading, the speed and the last order given, even though the instruments were reset.

## Classic meaning

Write every change into a log that you only add to, and save it safely to disk before you make the change. After a crash, you can rebuild the state by reading the log.

## In the agent system

Before the harness runs a tool call, it adds a tool_use record to the session's JSONL transcript. JSONL is a file with one JSON record per line. Then it calls fsync, which forces the data onto the disk. When the tool returns, it adds the tool_result. If the process dies in the middle of a turn, the harness reads the end of the log on restart. A tool_use with no matching tool_result marks an interrupted call. The harness reruns the call if the tool is idempotent (safe to run twice with the same result). Otherwise it tells the model the call was interrupted. It never silently loses the call or runs it twice.

## In a large company

Enterprise harnesses rarely trust a local fsync on a container's temporary disk. So they write the log to lasting storage that is copied to several places. Or they hand it to a durable execution engine such as Temporal or AWS Step Functions. These are services that run long tasks and record each step before and after it runs. The log is also the audit trail. So it holds tool inputs and outputs that may contain PII (personal data such as names and emails) or secrets. Those must be redacted and encrypted at rest with each tenant's keys. A tenant is one customer company on the platform. The log must also follow a set retention policy (rules for how long data is kept). Recovery should pass idempotency keys (unique ids that make a repeated request safe) to outside APIs. Then a rerun after a crash is safe by design.

## Step by step

1. The model sends a tool_use block, its request to run a tool.
1. The harness adds it to the log and flushes it to disk.
1. Only then does the tool run, and its result is added and flushed.
1. On restart, the harness deals with any tool_use at the end with no matching result before the loop goes on.

## Code sketch

```python
def run_tool(call):
    wal.append({'type': 'tool_use',
                'id': call.id,
                'in': call.input})
    wal.fsync()              # durable first
    out = tools[call.name](**call.input)
    wal.append({'type': 'tool_result',
                'id': call.id, 'out': out})
    wal.fsync()

def recover():
    return [e for e in wal.tail()
            if unmatched(e)]
```

## Be careful

Flushing to disk on every streamed token is far too slow. Log at message and tool boundaries. And remember that the log does not make a tool that is unsafe to repeat safe to rerun.

## Diagram

![Fig. 4.12: The plan reaches the disk before the tool runs, so a crash leaves a readable trail](/diagrams/write-ahead-log.svg)
