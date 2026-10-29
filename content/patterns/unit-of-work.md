---
id: unit-of-work
number: "4.08"
title: Unit of Work
chapter: memory
fit: direct
review_id: rev-unit-of-work
figure_number: Fig. 4.08
figure_caption: Writes wait in the unit of work until the end of the turn decides what happens to them
diagram: unit-of-work.svg
analogy_title: The supermarket trolley
---
## Gist

Collect a turn's memory, todo and message writes, then save them all together at the end of the turn, or cancel them all.

## Everyday comparison

### The supermarket trolley

You walk the aisles putting items into the trolley. Sometimes you change your mind and put one back. Nothing is yours until you reach the till and pay once for everything. If your card is declined, you leave the trolley, and the shop's stock is exactly as it was.

## Classic meaning

A unit of work keeps a list of the objects changed during one task. At the end it writes all the changes, and settles any conflicts, as one step.

## In the agent system

During one agent turn, the model might save two memories, update the todo list, write an artifact and add three messages. The harness does not write each change right away. It registers each one with a TurnUnitOfWork. If the turn ends cleanly, uow.commit() writes everything in one transaction (a group of database writes that all succeed or all fail). The turn might fail instead. The user might cancel, a token limit might be hit, or a tool might throw an error. Then uow.rollback() drops the waiting writes. The saved session never shows half a turn. A retried turn does not create duplicate memories.

## In a large company

In an enterprise platform, the unit of work for a turn usually maps to one database transaction on the session store. Tool runs are recorded separately. They go into an append-only audit log (a record you can add to but never edit) or a durable workflow engine such as Temporal. Temporal is a system that runs long tasks and remembers each step even after crashes. The key rule is that rollback only affects the agent's own state. It never touches the audit trail of actions taken on outside systems. Each turn's commit should carry an idempotency key, a unique id that makes a repeated request safe. Then a retry after a lost reply does not duplicate memories or billing records.

## Step by step

1. Starting a turn starts a unit of work.
1. Each write is registered as new, changed or deleted, not saved yet.
1. If the turn finishes, commit() writes all changes in one transaction.
1. If the turn is stopped or fails, rollback() drops them and the store stays untouched.

## Code sketch

```python
def run_turn(session, uow):
    reply = call_model(session)
    for m in reply.new_memories:
        uow.register_new(m)
    uow.register_dirty(session.todos)
    uow.register_new(reply.message)

with TurnUnitOfWork(db) as uow:
    run_turn(session, uow)
# __exit__: commit() on success,
# rollback() on any exception
```

## Be careful

Rollback cannot undo a sent email or a git push. It also must not erase the record of a tool that already ran. Log executed tool calls outside the unit of work. Put a separate check in front of tools that cannot be undone.

## Diagram

![Fig. 4.08: Writes wait in the unit of work until the end of the turn decides what happens to them](/diagrams/unit-of-work.svg)
