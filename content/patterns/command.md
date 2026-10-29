---
id: command
number: "2.01"
title: Command
chapter: tool-system
fit: direct
figure_number: Fig. 2.01
figure_caption: A tool call becomes a command object before anything runs it.
diagram: command.svg
analogy_title: The restaurant order ticket
---
## Gist

Turn every tool call into an object that the harness can queue, log, approve, retry or undo.

## Everyday comparison

### The restaurant order ticket

A waiter does not cook. They write your order on a ticket and clip it to the rail. The ticket can wait in line. Any free cook can pick it up. The head chef can check it. If you change your mind, someone tears it up. The ticket is the order, kept apart from the person who cooks it.

## Classic meaning

A request is wrapped up as an object. Other code can then queue it, log it or undo it without knowing how it runs.

## In the agent system

A tool call is the model's request to run a tool, like reading a file. The model sends it as a tool_use block (a part of its reply that names the tool, its inputs and a call id). The harness wraps that block in a ToolCommand object. The object holds the tool name, the arguments and the call id. It then travels through the permission gate (the step that decides if the call may run), the execution queue and the transcript (the saved record of the conversation). The call is now data, not a function that runs at once. So the harness can pause it for the user to approve. It can replay it in an eval (an automated test of the agent). It can log it for audit. And it can run a compensating undo (an action that reverses the effect) when a later step fails.

## In a large company

Enterprise platforms save each tool call as a durable command record (one stored safely, so it survives crashes). The record is keyed by the tool_use id. That id also works as an idempotency key (a label that makes a repeat safe). So if a worker retries or a workflow replays, the same payment or email is never sent twice. Durable execution engines such as Temporal or AWS Step Functions keep long tasks running through crashes. They run these commands as activities (single steps) with retry rules. The command log feeds an append-only audit store (records can be added but never changed). The store is kept under SOC 2 and ISO 27001 controls, two common security standards. The key rule is this. The platform retries a command automatically only if it is marked idempotent (safe to run twice with the same result) or reversible. Every other command needs a person to approve it, or a compensating action.

## Step by step

1. The model returns a tool_use block with a name, an input and an id.
1. The harness builds a ToolCommand and puts it on the execution queue.
1. A permission check approves, edits or rejects the command.
1. The executor runs it, records the result, and keeps undo data when the tool supports it.

## Code sketch

```python
class ToolCommand:
    def __init__(self, tool, args, cid):
        self.tool, self.args = tool, args
        self.id = cid
    def execute(self):
        return self.tool.run(**self.args)
    def undo(self):
        return self.tool.revert(self.id)

cmd = ToolCommand(tools['write_file'],
                  block.input, block.id)
queue.put(cmd)
```

## Be careful

Some commands change the outside world, like sending an email or paying an invoice. These often cannot be undone. Mark them as irreversible and ask for approval before they run.

## Diagram

![Fig. 2.01: A tool call becomes a command object before anything runs it.](/diagrams/command.svg)
