---
id: service-layer
number: "8.16"
title: Service Layer
chapter: architecture
fit: direct
review_id: rev-service-layer
figure_number: Fig. 8.16
figure_caption: "Every surface calls the same few operations, which direct everything behind them."
diagram: service-layer.svg
analogy_title: The post office counter
---
## Gist

Offer the harness through a few app operations, such as create_session and send_turn, that every surface calls the same way.

## Everyday comparison

### The post office counter

At the counter you ask for a few things: send this parcel, collect that one, buy stamps. Behind the counter, the clerk weighs, prices and prints a label. The clerk takes payment and drops the parcel in the right sack. You never touch the scales or the sorting bins. The same counter serves walk-ins, businesses and phone bookings.

## Classic meaning

Mark the edge of an app with a layer of services. For each thing a client can do, a service directs the domain objects (the core business objects) and the database transaction.

## In the agent system

A SessionService offers create_session, send_turn, approve_tool_call, cancel_turn and fork_session. Each operation checks that the caller is allowed and loads the session. Then it runs the agent loop or the permission policy. It saves state in one transaction (a group of database changes that succeed or fail together). It returns a result or a stream of events. The web API, the CLI (command-line tool), scheduled tasks and the SDK all call these same operations. So rules like "only one running turn per session" are enforced in one place. Domain objects such as Conversation and PermissionPolicy stay free of web and login code.

## In a large company

In large platforms the service layer applies several controls to every operation, whichever surface called it. It asks a policy engine such as OPA or Cedar whether the action is allowed. It writes audit records and checks each tenant's budget. (A tenant is one customer company.) It also uses idempotency keys (tags that make a repeated request safe to run twice). Linking each operation to a named permission makes RBAC easy to review. RBAC is role-based access control: permissions given by job role. It also gives auditors one place to inspect for SOC 2 (a security audit standard). Long turns usually pass to a durable workflow, such as Temporal, once the operation saves. (A durable workflow survives crashes and restarts.) So the service returns a handle instead of keeping a request open. The risk is surfaces that call repositories directly and skip these controls. Internal batch jobs count too.

## Step by step

1. A surface calls an operation such as send_turn(session_id, text).
1. The service checks the caller is allowed and loads the session from its repository (its storage class).
1. It directs the domain objects: the loop, the permission policy, the budget.
1. It saves the changes and returns a stream or result to the caller.

## Code sketch

```python
class SessionService:
    def send_turn(self, user, sid, text):
        with self.uow:
            s = self.repo.load_for_update(sid)
            self.authz.require(user, s, 'w')
            if s.has_running_turn():
                raise Busy(sid)
            s.mark_turn_running()
            self.repo.save(s)
        # model call starts after commit
        return self.loop.start(s, text)
```

## Be careful

A surface might skip the service and call the loop or repository directly. Then the shared rules quietly stop applying to it.

## Diagram

![Fig. 8.16: Every surface calls the same few operations, which direct everything behind them.](/diagrams/service-layer.svg)
