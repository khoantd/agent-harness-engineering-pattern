---
id: front-controller
number: "10.08"
title: Front Controller
chapter: frontend
fit: direct
review_id: rev-front-controller
figure_number: Fig. 10.08
figure_caption: Every request passes the same checks before any handler sees it.
diagram: front-controller.svg
analogy_title: The hospital front desk
---
## Gist

Send every request to the harness server through one entry handler that checks identity, logs, and passes it to the right handler.

## Everyday comparison

### The hospital front desk

Every visitor, courier and patient enters the hospital through the same front desk. The desk checks ID, hands out a badge, writes the arrival in the log and points each person to the right ward. The wards never check badges themselves, because nobody reaches them without passing the desk.

## Classic meaning

One handler receives all requests for a web app. It does the shared work, then passes each request to a specific command or view.

## In the agent system

The harness server has one entry point that every app request hits. That includes starting a turn, listing sessions, uploading a file and answering an approval. It checks the session token (proof of who is logged in). It finds the user's tenant, the customer company they belong to. It applies the rate limit for that tenant (a cap on how many requests it may send). It adds a trace id, a label used to follow the request through the system. Only then does it look up the route table and call the matching handler. New endpoints get authentication (checking who the user is) and audit logging for free. A fix to token checking goes into one file. Handlers still check that the user may act on this specific session or file. Checking identity at the door is not object-level authorization (permission for one specific item).

## In a large company

In large company setups, the front controller's job is usually split in two. An API gateway at the edge (a shared front door for all requests) checks OIDC tokens (sign-in proof from the company login system). It also applies per-tenant rate limits and terminates TLS, meaning it decrypts the secure connection. Then an entry point inside the app finds the tenant, starts an OpenTelemetry span (one timed step in a trace) and writes the audit record. Permission for a specific item still belongs in each handler. An example is whether this user may resume this session. It can also be a shared policy check against OPA or Cedar (policy engines that answer "is this allowed?"). A route table written as plain data lets security reviewers see every open endpoint in one place.

## Step by step

1. An app request arrives at the single entry handler.
1. The handler checks the session's identity and the rate limit.
1. It tags the request with a trace id and logs it.
1. It looks up the route and passes the request to the turn, sessions or upload handler.

## Code sketch

```python
ROUTES = {'POST /turn': turn_handler,
          'GET /sessions': sessions_handler,
          'POST /upload': upload_handler}

def front_controller(req):
    user = auth.verify(req.token)
    limiter.check(user)
    req.trace_id = new_trace_id()
    key = f'{req.method} {req.path}'
    return ROUTES[key](req, user)
```

## Be careful

A front controller that collects business logic becomes the file every team edits. Keep it to shared checks and routing.

## Diagram

![Fig. 10.08: Every request passes the same checks before any handler sees it.](/diagrams/front-controller.svg)
