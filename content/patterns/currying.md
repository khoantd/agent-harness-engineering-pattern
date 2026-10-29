---
id: currying
number: "9.04"
title: Currying
chapter: functional
fit: direct
figure_number: Fig. 9.04
figure_caption: Each stage fixes one argument and hands on a smaller function.
diagram: currying.svg
analogy_title: The prepaid return envelope
---
## Gist

Turn a tool runner with many inputs into a chain of one-input functions, fixing the sandbox at startup and permissions per session.

## Everyday comparison

### The prepaid return envelope

An online shop puts a return envelope in every parcel. Its address is printed and the postage is already paid. All you add is the item you are sending back. The shop fixed two of the three things long before you opened the box.

## Classic meaning

Turn a function with several arguments into a series of functions that each take one argument. This allows partial application, which means filling in some arguments early.

## In the agent system

Running a tool needs a sandbox (a locked-down area where code runs safely), a permission policy and the tool call itself. But the harness learns these at different times. It picks the sandbox when it starts. It sets the permission policy when a session begins. A tool call arrives every turn. So run_tool is written as a curried function. Startup code fills in the sandbox to make run_in_sandbox. The session fills in the policy to make session_run. The loop then just calls session_run(call). Subagents (helper agents) get their own partly filled runner, with a stricter policy and the same sandbox.

## In a large company

Enterprise harnesses use the same staging. They fix the tenant configuration when a worker (a server process) starts. They fix the authenticated principal (the verified user or service) and its policy when a session starts. The tool call comes each turn. Identity is fixed early inside a closure, a function that remembers the values it was given. This means the model can supply only the call. It can never supply the tenant, role or credentials. This removes a whole class of confused-deputy bugs, where a trusted program is tricked into using its power for someone else. Short-lived credentials captured this way must be refreshed or fixed again when they expire. They should not be kept for the whole of a long session.

## Step by step

1. Write the runner so each argument can be given separately.
1. At startup, fill in the sandbox to get a narrower function.
1. At session start, fill in the permission policy.
1. In the loop, call the resulting one-input function with each tool call.

## Code sketch

```python
def run_tool(sandbox):
    def with_perms(perms):
        def run(call):
            perms.check(call)
            return sandbox.exec(call)
        return run
    return with_perms

in_sbx = run_tool(DockerSandbox())  # boot
session_run = in_sbx(user_perms)    # session
result = session_run(call)          # turn
```

## Be careful

Curried layers hide which values were fixed where. Name each partial function after what it has captured.

## Diagram

![Fig. 9.04: Each stage fixes one argument and hands on a smaller function.](/diagrams/currying.svg)
