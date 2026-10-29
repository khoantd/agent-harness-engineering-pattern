---
id: observer
number: "5.09"
title: Observer
chapter: multi-agent
fit: direct
figure_number: Fig. 5.09
figure_caption: The task list itself calls every attached observer when an item changes.
diagram: observer.svg
analogy_title: "The coach's text list"
---
## Gist

Let the UI, the orchestrator and loggers watch a shared task list and react when a subagent changes an item.

## Everyday comparison

### The coach's text list

The football coach keeps the parents' numbers in a list on her phone. When rain cancels Saturday's match, she updates the fixture and texts everyone on the list herself. Parents who join mid-season ask to be added. Nobody has to keep ringing the coach to ask whether the match is on.

## Classic meaning

A subject (the thing being watched) keeps a list of observers. When its state changes, it tells each of them automatically.

## In the agent system

The task list behind a todo tool is the subject. Three observers attach when the run starts: the chat UI's checklist panel, the orchestrator (the agent in charge) and the progress logger. Say a subagent (helper agent) calls the tool to mark task 3 done. The task list updates itself. Then it calls update on every attached observer. The panel redraws, the orchestrator thinks about what comes next, and the logger adds a line. Observers detach when the run ends. So finished sessions stop getting updates.

## In a large company

In a company harness, the observers on a task list are usually the UI, the audit writer and a metrics exporter. The audit observer must never be skipped. So teams make audit writes synchronous (finished before the call returns). Or they back them with a durable outbox (a saved list of messages that will be sent even after a crash). UI and metrics observers run in the background, so they cannot slow the agent. Some observers sit in another process or belong to another tenant (customer company). These should use a proper event stream with access control instead of direct calls.

## Step by step

1. The UI panel, orchestrator and logger call attach() on the task list.
1. A subagent changes a task through a tool call.
1. The task list saves the change and calls update() on each observer in its list.
1. Each observer reads the new state and reacts in its own way.

## Code sketch

```python
class TaskList:
    def __init__(self):
        self.items, self.observers = {}, []
    def attach(self, obs):
        self.observers.append(obs)
    def set_status(self, tid, status):
        self.items[tid] = status
        for o in self.observers:
            o.update(self, tid, status)

tasks.attach(checklist_panel)
```

## Be careful

Observers run inside the subject's call. So one slow observer, such as a remote logger, delays the subagent's tool result. Hand slow work off to run in the background.

## Diagram

![Fig. 5.09: The task list itself calls every attached observer when an item changes.](/diagrams/observer.svg)
