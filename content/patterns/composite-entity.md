---
id: composite-entity
number: "4.07"
title: Composite Entity
chapter: memory
fit: adapted
review_id: rev-composite-entity
figure_number: Fig. 4.07
figure_caption: Everything that belongs to a session moves through one root
diagram: composite-entity.svg
analogy_title: The hospital patient chart
---
## Gist

Load and save a whole session (messages, todos, tool state, files read) as one unit through a single root object.

## Everyday comparison

### The hospital patient chart

A ward nurse does not fetch blood results from one office, the medicine list from another and scans from a third. The patient's chart binder holds all of them. It travels with the patient between wards. When the doctor signs off, the whole chart is filed together.

## Classic meaning

A large object that looks after a group of smaller objects that depend on it. Programs load and save the whole group through that one object.

## In the agent system

A Session object is the root of an aggregate (a group of objects that are always handled together). The group holds messages, a todo list and tool state, such as the shell's current folder. It also holds the set of files the agent has read and the permission grants for this session. The harness loads it with sessions.get(id) and saves it with sessions.save(s). Only the root has a public id. Code reaches the parts through the root, as in s.todos.add or s.messages.append. So resuming or forking a session moves one consistent snapshot, not five loosely linked rows. A subagent is a helper agent started by the main one. When a subagent gets a copy, the harness removes the grants and gives it a smaller set. Approvals belong to the person or agent who gave them.

## In a large company

Enterprise platforms treat the session group as the unit of ownership, retention and legal hold. Retention is how long data is kept. A legal hold means data must be kept for a court case. The root carries the tenant (customer company), owner, data class and region, and every part inherits them. That makes controls per session practical. You can export one session for an audit, delete it after an erasure request, or hold it for a lawsuit. Permissions must not travel along with the data. A policy engine such as OPA or Cedar checks the grants again. It does this whenever a different person or agent resumes the session, or the session is handed to a subagent. OPA and Cedar are tools that decide who may do what, based on written rules.

## Step by step

1. A resume request arrives with a session id.
1. The store loads the root and all its parts in one call.
1. During the turn, the loop changes parts only through the root.
1. At the end of the turn, the whole group is saved in one write.

## Code sketch

```python
class Session:              # aggregate root
    def __init__(self, sid):
        self.id = sid
        self.messages: list[Message] = []
        self.todos = TodoList()
        self.tool_state = {'cwd': '/repo'}
        self.read_files: set[str] = set()

s = sessions.get(sid)
s.todos.add('run tests')
sessions.save(s)    # one write, whole graph
```

## Be careful

If every save rewrites megabytes of transcript, the group is too big. Keep fast-growing parts like messages in their own log, and keep only references to them in the root.

## Diagram

![Fig. 4.07: Everything that belongs to a session moves through one root](/diagrams/composite-entity.svg)
