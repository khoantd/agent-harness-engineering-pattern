---
id: chain-of-responsibility
number: "1.05"
title: Chain of Responsibility
chapter: agent-loop
fit: adapted
review_id: rev-chain-of-responsibility
figure_number: Fig. 1.05
figure_caption: Each hook can stop the call or pass it to the next one.
diagram: chain-of-responsibility.svg
analogy_title: Airport departure checkpoints
---
## Gist

Pass each tool call through an ordered chain of hooks that can block, change or pass it on. Only the chain's end lets it run.

## Everyday comparison

### Airport departure checkpoints

Between the kerb and the plane door, a passenger meets the check-in desk, passport control, the security scanner and the gate agent. Each one checks a single thing. They either wave you on to the next one or stop you there. None of them needs to know what the others check. The airport can add a new checkpoint without retraining the rest.

## Classic meaning

Give more than one object a chance to handle a request. Link the handlers in a chain and pass the request along until one handles it.

## In the agent system

Before a tool call runs, the harness passes it through a chain of PreToolUse hooks. A hook is a small piece of code that runs at a set moment, here just before a tool is used. The chain might start with an allowlist check (a list of allowed tools). Next comes a path guard that blocks writes outside the workspace (the project folder the agent works in). Then a secrets scanner looks for passwords and keys. Last comes a prompt that asks the user to approve. Each hook gets the call and returns deny, modify or pass. A deny stops the chain at once. It becomes an error tool_result (the tool's answer, marked as an error) that the model can read. A pass hands the call to the next hook. Hooks managed by the organisation sit at the front of the chain. User settings cannot remove or override them. So a user hook that says allow can only skip the final approval prompt, never a required guard. Users and plugins add their own hooks after the managed ones, without changing harness code.

## In a large company

In enterprise platforms, the chain usually starts with a call to a central policy engine such as OPA or Cedar. A policy engine is a service that decides what is allowed from written rules. Next comes DLP scanning (data loss prevention: checking for sensitive data that must not leak). Then come allowlists for each tenant (each customer company), and finally a human approval step for high-risk actions. Every decision goes into the audit trail. The record holds the deciding hook, the policy version and the principal (the user or service making the request). Auditors for SOC 2 and ISO 27001, two common security standards, expect to see this. The key risk is ordering. Required guards managed by the organisation must run first and fail closed, which means they block when something goes wrong. That way a plugin hook or a timeout can never turn into a silent allow.

## Step by step

1. The model sends a tool_use block, and the harness wraps it as a request.
1. The first hook checks it and returns deny, modify or pass.
1. On pass, the request goes to the next hook. On deny, the chain stops.
1. If the last hook passes it, the tool runs with the input, which may have been changed.

## Code sketch

```python
class PathGuard(Hook):
    def handle(self, call, nxt):
        p = call.input.get('path')
        if p:
            rp = Path(ROOT, p).resolve()
            if not rp.is_relative_to(ROOT):
                return Deny('outside root')
        return nxt(call)

ROOT = Path(WORKSPACE).resolve()
chain = [Allowlist(), PathGuard(),
         SecretScan(), AskUser()]
result = run_chain(chain, call, execute)
```

## Be careful

In a long chain, it is hard to see which hook made the decision. Log the name of the deciding hook with every allow and every deny.

## Diagram

![Fig. 1.05: Each hook can stop the call or pass it to the next one.](/diagrams/chain-of-responsibility.svg)
