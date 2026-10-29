---
id: single-table-inheritance
number: "4.18"
title: Single Table Inheritance
chapter: memory
fit: direct
figure_number: Fig. 4.18
figure_caption: "Every event kind lands in one table, told apart by its kind column"
diagram: single-table-inheritance.svg
analogy_title: The lost property ledger
---
## Gist

Save every kind of transcript event in one table with a kind column, leaving empty the fields a kind does not use.

## Everyday comparison

### The lost property ledger

At a busy railway station, every found item goes into one big book. There is a column for the kind of item and columns for colour, brand, size and screen type. An umbrella leaves screen type blank. A phone leaves size blank. One book covers everything found.

## Classic meaning

Store a family of related classes in one table. The table has columns for the fields of every class, plus a column (the discriminator) that names each row's class.

## In the agent system

A transcript holds many kinds of entry: UserMessage, AssistantMessage, ToolUse, ToolResult, Compaction and PermissionDecision. With single table inheritance, they all live in one events table. It has session_id, seq (the position in order) and kind. It also has columns that may be empty (NULL): text, tool_name, tool_input, is_error and summary. Loading a session is one SELECT, ordered by (session_id, seq). The loader picks the class from the kind column. Queries across every kind need no joins (combining tables). An example is everything in session 42 after position 300.

## In a large company

A single events table is a common enterprise choice. It gives one ordered audit stream per session that is only ever added to. It is easy to index by tenant_id and seq, and to protect with row-level security (database rules that limit which rows each user sees). A tenant is one customer company on the platform. The kind column also makes rules per kind easy. Permission decisions can be kept for years for audit, while message text follows a shorter retention schedule. The mostly empty columns that hold tool inputs and message text are the ones to encrypt or tokenise (replace with harmless stand-in values). They carry most of the PII (personal data such as names and emails).

## Step by step

1. Each event kind writes into the same table, setting kind and its own columns.
1. Columns used by other kinds are left NULL (empty).
1. Loading a session is a single ordered query.
1. The loader maps each row's kind to the right class.

## Code sketch

```python
ROW_CLASS = {'user': UserMsg,
             'tool_use': ToolUse,
             'tool_result': ToolResult,
             'compaction': Compaction}

rows = db.query(
    'SELECT * FROM events WHERE sid=?'
    ' ORDER BY seq', (sid,))
events = [ROW_CLASS[r['kind']].from_row(r)
          for r in rows]
```

## Be careful

Every new kind adds mostly empty columns. The table cannot easily require tool_name only when kind is tool_use. Add CHECK constraints (database rules for each row), or switch to table inheritance when the kinds differ a lot.

## Diagram

![Fig. 4.18: Every event kind lands in one table, told apart by its kind column](/diagrams/single-table-inheritance.svg)
