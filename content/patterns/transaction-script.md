---
id: transaction-script
number: "8.21"
title: Transaction Script
chapter: architecture
fit: direct
review_id: rev-transaction-script
figure_number: Fig. 8.21
figure_caption: Each request has its own straight-line procedure that talks to the database directly.
diagram: transaction-script.svg
analogy_title: The flat-pack instruction sheet
---
## Gist

Handle each request with one procedure that runs top to bottom: load rows, call the model, run tools, write rows, return.

## Everyday comparison

### The flat-pack instruction sheet

Every flat-pack wardrobe comes with its own sheet. Step 1: lay out the panels. Step 2: fix the hinges. Step 14: hang the doors. The sheet does not teach carpentry. It does not share steps with the bookcase sheet. It lists what to do, in order, for this one item. Anyone can follow it, and you can find a mistake by its step number.

## Classic meaning

Organise business logic as procedures, one for each request or transaction. Each procedure talks to the database directly.

## In the agent system

An early harness often has one function per endpoint (web address). For example, handle_turn reads the session's messages and builds the prompt. It calls the model, then loops over the tool_use blocks (the model's requests to run tools) and runs each tool. It adds the new message rows and returns the reply. handle_approve and handle_cancel are separate procedures with their own SQL (database queries). There are no domain objects (core business objects). So each script is easy to read and you can debug it from start to end. As the harness grows, shared rules such as the token budget check get copied between scripts.

## In a large company

Transaction scripts are common in company proofs of concept. They are also common in internal tools built quickly on one model endpoint. They become a compliance problem as they multiply. Each script rebuilds its own tenant checks, audit logging, PII redaction and budget checks. (A tenant is one customer company. PII is personal data such as names and emails.) Sooner or later one of them skips a control. A common fix is to move shared rules into a service layer. Then put model access behind the LLM gateway (one shared front door to AI models). That makes usage tracking and logging the same everywhere. At the least, each script should limit steps and spending per request. It should also write an audit record for every tool call.

## Step by step

1. Each request goes to its own script, such as handle_turn.
1. The script reads the rows it needs straight from the database.
1. It calls the model and runs tools in a plain loop with a step limit.
1. It saves each message as it goes, so tool calls that ran are on record. Then it returns the reply.

## Code sketch

```python
def handle_turn(sid, text):
    msgs = db.messages(sid) + [user(text)]
    db.append(sid, msgs[-1])
    for _ in range(MAX_STEPS):
        r = model.complete(msgs, TOOLS)
        msgs.append(r.message)
        db.append(sid, r.message)
        if r.stop_reason != 'tool_use':
            return r.text
        res = [run(u) for u in r.tool_uses]
        msgs.append(user(res))  # one message
        db.append(sid, msgs[-1])
    raise StepLimit(sid)
```

## Be careful

Several scripts may end up repeating the same budget, permission and transcript logic. Then a fix lands in one script and not the others. That is the moment to pull out a service layer or domain model.

## Diagram

![Fig. 8.21: Each request has its own straight-line procedure that talks to the database directly.](/diagrams/transaction-script.svg)
