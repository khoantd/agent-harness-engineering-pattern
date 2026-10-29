---
id: collecting-parameter
number: "1.15"
title: Collecting Parameter
chapter: agent-loop
fit: direct
figure_number: Fig. 1.15
figure_caption: One list travels through every check and fills up along the way.
diagram: collecting-parameter.svg
analogy_title: The wedding guest book
---
## Gist

Pass one collector object through a series of steps, so each step adds its findings instead of returning separate results to merge.

## Everyday comparison

### The wedding guest book

At a wedding, the guest book travels from table to table. Each guest writes a line and passes it on. At the end of the night, the couple has one book with every message. Nobody had to gather loose cards from each table.

## Classic meaning

Pass a collecting object into methods, so each one can add its results. This builds one combined result across many calls.

## In the agent system

A code review subagent (a helper agent started by the main one) runs several checks. It uses grep (a text search tool) to find TODO notes and scans the diff (the code changes) for secrets. It also runs the tests and checks the changelog. Each check gets the same Findings object. It adds issues with the file, line and severity. After the last check, the subagent turns the collected findings into one report message for the orchestrator (the agent in charge). The same shape appears when a harness adds up usage across smaller calls. One UsageCollector is passed into every model call and tool call. The turn total is read from it at the end.

## In a large company

Enterprise platforms use collecting parameters to add up usage and cost across a turn, its subagents and its tool calls. This feeds the per-tenant chargeback ledger, the record used to bill each customer company. They also use them for compliance findings gathered by review agents. Sometimes subagents run in parallel or on other workers (other servers). Then each returns its own partial collection, and the parent merges them. This is because a shared, changeable collector cannot cross process boundaries. Some findings contain pieces of code or data. Redact them (remove the sensitive parts) before writing them to tickets or audit storage.

## Step by step

1. Create an empty collector at the start of the task.
1. Pass it into each step or tool wrapper.
1. Each step adds what it found or what it used.
1. Read the collector once at the end to build the report or the totals.

## Code sketch

```python
findings = Findings()
check_todos(diff, findings)
scan_secrets(diff, findings)
run_tests(repo, findings)

def scan_secrets(diff, out):
    for ln in diff.added_lines():
        if KEY_RE.search(ln.text):
            out.add(ln.path, ln.no, 'high')
report = findings.to_markdown()
```

## Be careful

If steps run in parallel, the collector needs a lock, so only one step writes at a time. Otherwise each step should return its own list to merge afterwards.

## Diagram

![Fig. 1.15: One list travels through every check and fills up along the way.](/diagrams/collecting-parameter.svg)
