---
id: servant
number: "2.19"
title: Servant
chapter: tool-system
fit: direct
review_id: rev-servant
figure_number: Fig. 2.19
figure_caption: Many tools hand their data to the same two helpers
diagram: servant.svg
analogy_title: The air pump at the petrol station
---
## Gist

Put shared chores, like checking paths or shortening results, in one helper that many tools call, not a copy per tool.

## Everyday comparison

### The air pump at the petrol station

No car comes with its own air compressor. Drivers pull up to the one air pump at the petrol station. They push the hose onto their tyre valve and set the pressure. The pump serves a small car, a van or a motorbike, because each has the same standard valve. Nobody changes their car to use it.

## Classic meaning

A helper class gives a common behaviour to a group of classes. They pass their data to it instead of each building the behaviour themselves.

## In the agent system

Many tools need the same chores done to what goes in and what comes out. A PathGuard servant takes a requested file path and works out the real full path. It follows symlinks (shortcuts that point to other files). It rejects anything outside the workspace root (the top folder the agent may use). read_file, write_file and grep all call it. A ResultTruncator servant cuts long tool output down to a token budget (a size limit in tokens, the units models read). It keeps the start and the end. It adds a note telling the model how to ask for the next part. The tools hand their data to the servant. They do not inherit from a shared base class. So the rule lives in one place, and a security fix reaches every tool at once.

## In a large company

On a company platform, the shared servants are where security and data rules live. These include keeping paths inside the workspace and shortening output. They also include PII redaction (removing personal data such as names and emails). And they include DLP scanning (data loss prevention: checking for data that must not leak). These checks run on tool results before the results enter the context window (the text the model can see). Keeping the servants in one reviewed library means a fix reaches every tool at once. It also gives auditors one place to check the control. A path check alone still has a gap called a time-of-check to time-of-use race. A symlink can change between the check and the moment the file is opened. So production sandboxes also enforce the limit in the filesystem itself. They use read-only mounts or openat-style resolution (opening each part of the path step by step from a trusted folder).

## Step by step

1. A tool gets arguments from the model, such as a file path.
1. It passes the path to the PathGuard servant, which cleans up the path and checks it.
1. The tool does its own work with the safe path.
1. It passes its raw output to the ResultTruncator servant before returning the tool_result.

## Code sketch

```python
class PathGuard:                 # servant
    def __init__(self, root):
        self.root = root.resolve()
    def safe(self, p):
        r = (self.root / p).resolve()
        if not r.is_relative_to(self.root):
            raise Denied(p)
        return r

def read_file(args, guard, trunc):
    p = guard.safe(args['path'])
    return trunc.fit(p.read_text(), 8000)
```

## Be careful

Sometimes a servant grows branches for single tools, such as if tool == 'grep'. Then it has become a god object (one object that does too much). Keep it to the shared rule and let each tool handle its own quirks.

## Diagram

![Fig. 2.19: Many tools hand their data to the same two helpers](/diagrams/servant.svg)
