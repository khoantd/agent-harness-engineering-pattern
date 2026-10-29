---
id: table-inheritance
number: "4.19"
title: Table Inheritance
chapter: memory
fit: direct
figure_number: Fig. 4.19
figure_caption: "Shared fields live once, and each kind adds its own table on the same id"
diagram: table-inheritance.svg
analogy_title: The vet clinic file
---
## Gist

Keep fields shared by all events in a base table, and each kind's own fields in a separate table linked by event id.

## Everyday comparison

### The vet clinic file

Every animal gets the same front card: name, owner, weight and visit date. Behind it the vet staples a sheet for the species. A dog's sheet lists vaccinations and microchip. A parrot's lists wing clipping and beak checks. Reception reads only the front cards. The vet pulls the sheet for the animal on the table.

## Classic meaning

Store a family of related classes with one table per class. Each subclass table holds only its own fields and shares the base table's primary key (the id that names each row).

## In the agent system

All agent events share id, session_id, seq (position in order), created_at and tokens. These live in a base events table. Each kind of event gets its own table with the same id. tool_calls has (id, tool, input, duration_ms, exit_code). approvals has (id, decision, reviewer). compactions has (id, summary, dropped_tokens). Timeline and cost queries read only the base table. Tool analytics join (combine) events with tool_calls. That table can have NOT NULL constraints (rules that a field must be filled) and an index on tool for fast lookups.

## In a large company

Enterprise teams often use this layout, also called class table inheritance, for the analytics and audit side of an agent platform. There, approvals, tool calls and compactions need their own rules, indexes and access controls. Separate tables let a security team give auditors read access to approvals without showing message text. Retention jobs can also delete content tables while keeping the base event skeleton. The cost is reads that need many joins. So the busy resume path usually stays on a denormalised log (one flat table with everything together). These tables are then filled from that log.

## Step by step

1. Writing an event adds a base row, plus a row with the same id in its kind's table.
1. Queries across all kinds, such as cost per session, read only the base table.
1. Queries about one kind join the base table to that kind's table.
1. Each kind's table enforces its own rules.

## Code sketch

```python
class Event(Base):        # table: events
    id: int; sid: str; seq: int; tokens: int
class ToolCall(Event):    # table: tool_calls
    tool: str; input: dict; exit_code: int
class Approval(Event):    # table: approvals
    decision: str; reviewer: str

slow = db.query(
    'SELECT e.sid, t.tool FROM events e'
    ' JOIN tool_calls t USING (id)'
    ' WHERE t.duration_ms > 30000')
```

## Be careful

Loading a full mixed transcript needs a join, or one query per kind. So this layout suits audit and analytics better than the busy path of resuming a session.

## Diagram

![Fig. 4.19: Shared fields live once, and each kind adds its own table on the same id](/diagrams/table-inheritance.svg)
