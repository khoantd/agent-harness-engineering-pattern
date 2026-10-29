---
id: server-session
number: "4.24"
title: Server Session
chapter: memory
fit: direct
figure_number: Fig. 4.24
figure_caption: "The client holds a ticket, and the server holds the conversation"
diagram: server-session.svg
analogy_title: "The dry cleaner's ticket"
---
## Gist

Keep the conversation, sandbox and files on the server under a session id, and the client sends only the id and new message.

## Everyday comparison

### The dry cleaner's ticket

You hand over a coat and get a small paper ticket with a number. The shop keeps the coat, its note about the wine stain and the promised date. You carry only the number. Any assistant at the counter can find your coat with it.

## Classic meaning

Keep session state on the server. A session id names it, and the client shows that id with each request.

## In the agent system

Hosted agent services keep the transcript, tool state, sandbox container and files on the server, under a session_id. A sandbox container is a locked-down space where tools run. The client sends {session_id, message} and streams back events. Requests stay small. The server is the authority on what really happened, so tool results and approvals cannot be faked. The same session can continue on another device. In return, the server must store, expire, shard (split across databases) and protect sessions. It must also send each request to wherever that session's state lives.

## In a large company

Most enterprise agent platforms keep sessions on the server. Then retention, legal hold, erasure, audit export and data residency (where data is stored) are all enforced in one place the company controls. Each request is checked against the logged-in identity from SSO (single sign-on) or OIDC (a standard login protocol). The check covers the tenant (customer company) and the RBAC role, as well as the owner. RBAC is role-based access control: permissions given by job role. Admins, shared sessions and support access all need clear rules that are audited. Session stores should be encrypted with tenant keys and kept in the tenant's region. They should expire on a written schedule, not be kept forever.

## Step by step

1. The client sends a new message with its session id.
1. The server checks that the caller owns the session, then loads it.
1. It runs the turn with the full context and sandbox held on the server.
1. It saves the session and streams the reply back to the client.

## Code sketch

```python
@app.post('/sessions/{sid}/messages')
def post_message(sid, body, user):
    s = sessions.load(sid)
    if s.owner != user.id:
        raise Forbidden()
    s.messages.append(user_msg(body.text))
    reply = run_turn(s)     # server-side
    sessions.save(s)
    return stream(reply)
```

## Be careful

Server sessions need expiry, size limits and an owner check on every request. If a session id can be guessed, a whole transcript can leak.

## Diagram

![Fig. 4.24: The client holds a ticket, and the server holds the conversation](/diagrams/server-session.svg)
