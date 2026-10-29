---
id: role-object
number: "7.04"
title: Role Object
chapter: safety
fit: adapted
review_id: rev-role-object
figure_number: Fig. 7.04
figure_caption: The session stays the same object while roles come and go around it.
diagram: role-object.svg
analogy_title: Festival volunteer vests
---
## Gist

Attach role objects such as editor or operator to a session while it runs, each carrying the permissions it grants.

## Everyday comparison

### Festival volunteer vests

At a music festival, one volunteer might wear a yellow steward vest in the morning. After lunch they wear a green first-aid vest. The person stays the same. The vest decides which gates they pass, which radio channel they use and which tent they may enter. A volunteer can hold two vests. The coordinator can take one back at any time.

## Classic meaning

A core object gets different views for different contexts. Each view is a separate role object that can be added or removed while the program runs.

## In the agent system

A Session core holds identity, transcript and settings. Roles attach as separate objects. Viewer can read files. Editor can write inside the workspace. Operator can run shell commands and send messages. Reviewer can approve other agents' tool calls. The permission gate asks the session for its roles. It lets each role decide with allows(call). Access may be added mid-session, from the user's entitlements or an audited admin grant. Entitlements are the access the user really holds. Then the harness attaches a role. When access is revoked, it removes one. It does not change a permissions blob or create a subclass of Session. A session never gains a role its user does not hold.

## In a large company

In an enterprise platform, a session's roles come from the user's identity provider groups and the tenant's policy. A tenant is one customer company. An agent never holds a role its user lacks. This avoids the confused-deputy problem, where a trusted helper is tricked into using power its requester should not have. Granting a role mid-session is an audited event. It has an approver, a scope and an expiry. This follows the style of just-in-time access, where access is given only when needed and for a short time. 'Any role allows' logic cannot express explicit deny. So high-risk restrictions belong in a policy engine such as Cedar or OPA. The gate asks that engine as well as the roles.

## Step by step

1. Create the session core with identity and transcript.
1. Attach role objects based on the user's grants or the workspace policy.
1. At each tool call, the gate asks the session's roles whether any allows it.
1. Add or remove roles mid-session as access is granted or revoked.

## Code sketch

```python
s = Session(user='ana')
s.add_role(Editor(paths=['/repo']))
s.add_role(Operator(shell=True, net=False))
s.add_role(Reviewer())

def allowed(s, c):     # any role may allow
    return any(r.allows(c) for r in s.roles)

s.remove_role(Reviewer)    # access revoked
```

## Be careful

Role checks spread across the codebase drift apart over time. Send every permission question through one gate that asks the roles.

## Diagram

![Fig. 7.04: The session stays the same object while roles come and go around it.](/diagrams/role-object.svg)
