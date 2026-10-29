---
id: cqrs
number: "8.07"
title: CQRSCommand Query Responsibility Segregation
chapter: architecture
fit: direct
aka: Command Query Responsibility Segregation
review_id: rev-cqrs
figure_number: Fig. 8.07
figure_caption: Commands change state on one side. The transcript is read from a separate view on the other.
diagram: cqrs.svg
analogy_title: The referee and the scoreboard
---
## Gist

Send user requests down a command path, and show the transcript from a separate read model fed by events.

## Everyday comparison

### The referee and the scoreboard

On the pitch, only the referee's decisions can change the score. Each decision goes to the official scorer. The giant scoreboard decides nothing. It is a display rebuilt from the scorer's log and laid out so fans can read it at a glance. Forty thousand people read it, while one person writes to it.

## Classic meaning

CQRS splits the part that changes data (commands) from the part that answers questions (queries). Then you can shape and scale each part for its own job.

## In the agent system

Commands such as send_message, approve_tool_call and cancel_turn go to a command handler. The handler checks each one against the session's current state and then drives the agent runtime. The runtime adds events to an event log. A projector (code that turns events into a ready-to-read view) folds those events into a read model shaped for the transcript UI. That view holds messages with tool cards, approval status and token counts. The UI reads and subscribes to that view. It never asks the runtime for its internal state. So you can rebuild a heavy transcript view or a search index without touching the loop.

## In a large company

In large platforms, CQRS appears as one append-only session log (a log you only add to) that feeds several read models. These include the transcript view and an admin console for compliance review. They also include a search index for eDiscovery (finding records for legal cases) and a cost dashboard per tenant (customer company). The write side runs approvals and policy checks. It must check against the true, current state. It must never check against a read model that may be behind. Read models must use the same tenant and RBAC filters as the write side. RBAC is role-based access control: permissions given by job role. GDPR erasure requests (a person's legal right to have data deleted) must reach every view. That is easier when you can rebuild views from a log with sensitive parts removed. CQRS does not need event sourcing (storing every change as an event). But teams often combine the two here, because the log also serves as the audit trail.

## Step by step

1. The client sends a command such as approve_tool(call_id).
1. The command handler checks it against current state and lets the runtime act.
1. The runtime adds events like tool_approved and tool_result to the log.
1. A projector updates the transcript view, and the client gets the change on its stream.

## Code sketch

```python
def approve_tool(cmd):           # write side
    s = sessions.load(cmd.sid)
    s.require_pending(cmd.call_id)
    log.append(ToolApproved(cmd.call_id),
               expected=s.version)

def project(ev):                 # read side
    view = views[ev.sid]
    view.card(ev.call_id).status = 'approved'
    push(ev.sid, view.diff())
```

## Be careful

The read model runs slightly behind the write side. A client that sends approve and reads again at once may see the old state. Show the change straight away in the UI, or wait for the event.

## Diagram

![Fig. 8.07: Commands change state on one side. The transcript is read from a separate view on the other.](/diagrams/cqrs.svg)
