---
id: table-module
number: "8.22"
title: Table Module
chapter: architecture
fit: direct
review_id: rev-table-module
figure_number: Fig. 8.22
figure_caption: "One module per table works on whole record sets, which pass from module to module."
diagram: table-module.svg
analogy_title: The school office registers
---
## Gist

Write one module per table or collection (sessions, messages, tool_calls) that holds the logic for all its rows at once.

## Everyday comparison

### The school office registers

The school office has one clerk for the attendance register and another for the lunch register. Ask the attendance clerk who missed Monday. They scan one page for the whole year group. Neither clerk keeps a folder for each pupil. Each one owns one register and the questions you can ask of it.

## Classic meaning

One object handles the business logic for every row in a database table or view. It works on sets of records, not one object per row.

## In the agent system

A MessagesModule offers for_session(sid), token_total(rows) and trim_to_budget(rows, limit). A ToolCallsModule offers pending(rows) and mark_approved(ids). The turn handler gets a record set (a batch of rows) of messages from one module. It hands that set to the next module. This suits harnesses already built on a SQL or dataframe-style store (data kept as tables). Bulk jobs come naturally. Examples are expiring every tool call older than an hour, or totalling tokens per org. (A token is a small chunk of text that models bill by.) This pattern sits between Transaction Script and Domain Model. Logic is grouped by table, but there is no object for each message.

## In a large company

Table modules suit company reporting and control jobs that work on whole sets of rows. Examples are totalling tokens per tenant for chargeback (billing each customer), expiring old approvals, or applying retention rules and legal holds across the messages table. (A tenant is one customer company. A legal hold stops data from being deleted during a legal case.) These jobs run in batches against a data warehouse or the live database. So every query must be limited to one tenant id. Ideally row-level security (rules in the database that limit which rows each user sees) enforces this. Each module should not have to remember a filter. GDPR erasure (a person's legal right to have data deleted) fits this shape too. One module call can remove every row about one person. The risk is a bulk update that crosses tenants because someone missed a filter.

## Step by step

1. The turn handler asks MessagesModule for the session's record set.
1. It passes that record set to functions such as trim_to_budget.
1. ToolCallsModule works on the waiting tool-call rows for the same session.
1. Each module writes its changes back to its own table.

## Code sketch

```python
class MessagesModule:  # one per table
    def for_session(self, sid):
        return db.select('messages', sid=sid)
    def trim_to_budget(self, rows, limit):
        # cut at turn edges so no tool_use
        # loses its tool_result
        keep, total = [], 0
        for t in reversed(turns(rows)):
            total += tokens(t)
            if total > limit: break
            keep = t + keep
        return keep
```

## Be careful

Table modules fit badly when a rule covers more than one table. One example is a tool call that changes the session's state. That logic drifts into the handler, with no clear home.

## Diagram

![Fig. 8.22: One module per table works on whole record sets, which pass from module to module.](/diagrams/table-module.svg)
