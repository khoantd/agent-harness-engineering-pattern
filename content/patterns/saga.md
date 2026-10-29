---
id: saga
number: "5.16"
title: Saga
chapter: multi-agent
fit: adapted
review_id: rev-saga
figure_number: Fig. 5.16
figure_caption: Forward steps commit one by one. A failure runs the recorded compensations backwards.
diagram: saga.svg
analogy_title: Booking a wedding
---
## Gist

Run a multi-step job across agents as a chain of steps, each paired with an action that undoes it.

## Everyday comparison

### Booking a wedding

The couple books the venue, then the caterer, and pays a deposit each time. Then they try to book a band. No band is free that weekend, and there is no single undo button. So they ring the caterer to cancel, then the venue. Each one has its own cancellation terms. They work back through the bookings in reverse order.

## Classic meaning

A saga handles a business task that spans several services. It runs as a series of local steps, and each step commits (is made final) on its own. If one step fails, compensating steps undo the steps already done. There are two styles. In choreography, each service reacts to the event from the step before. In orchestration, a central orchestrator tells each service what to do.

## In the agent system

A release job uses three agents. A coder agent creates a branch. A database agent runs a migration (a change to the database structure) on staging. A deploy agent ships to staging. No single transaction can cover git, a database and a deploy tool at once. So each step commits on its own and registers a compensation, an action that undoes it. Here that means delete the branch, or run the down-migration. This is an orchestrated saga. One coordinator tells each agent what to do. It writes every finished step to a durable saga log (a record saved so it survives a crash). In a choreographed saga, by contrast, each agent reacts to the previous agent's event, and there is no central coordinator. When the deploy fails, the coordinator reads the log. A restarted copy of the coordinator can do this too. It runs each compensation in reverse order and retries each one until it succeeds. Then it reports the state the system was left in. Between steps, other users can see the half-finished state, because a saga gives no isolation.

## In a large company

Company teams build agent sagas on a durable orchestrator such as Temporal or AWS Step Functions (systems that save each step so work survives a crash). Or they use choreography over Kafka or EventBridge events, when separate teams own the participants. Every step and compensation carries an idempotency key (a unique id that makes a repeat safe). The saga log is the audit record of what changed and what was undone. Some compensations cannot run automatically. These go to a human approval queue. Change-management policy often requires one more rule. Any agent step that touches production must have a tested compensation before it is allowed into the job.

## Step by step

1. The coordinator runs step 1 and records it, with its compensation, in the saga log.
1. It continues step by step, recording each success.
1. A step fails, and the coordinator stops moving forward.
1. It runs the compensations of the finished steps in reverse order and logs the outcome.

## Code sketch

```python
steps = [(create_branch, delete_branch),
         (migrate_db, migrate_down),
         (deploy, None)]  # last: no undo
for i, (act, undo) in enumerate(steps):
    try:
        act(ctx, key=f'{sid}:{i}')
        log.mark(sid, i, 'done')  # durable
    except StepFailed:
        for j in reversed(log.done(sid)):
            comp = steps[j][1]
            if comp:  # idempotent, retried
                retry_until_ok(comp, ctx)
        raise
```

## Be careful

A compensation is a new forward action. It cannot unsend an email. So plan a correction step for any effect that cannot be reversed.

## Diagram

![Fig. 5.16: Forward steps commit one by one. A failure runs the recorded compensations backwards.](/diagrams/saga.svg)
