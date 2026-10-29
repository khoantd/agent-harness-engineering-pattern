---
id: proxy
number: "2.14"
title: Proxy
chapter: tool-system
fit: direct
review_id: rev-proxy
figure_number: Fig. 2.14
figure_caption: "Every call passes the proxy's rules, approval and sandbox before the real tool runs."
diagram: proxy.svg
analogy_title: "The bank teller's window"
---
## Gist

Put a permission and sandbox layer with the same interface in front of every real tool, so nothing runs without passing its checks.

## Everyday comparison

### The bank teller's window

Customers never walk into the vault. They speak to a teller behind glass. The teller checks their ID, their balance and the withdrawal limit, and calls a manager for a large amount. Only then does the teller go to the vault and come back with cash. To the customer, the window works just like the vault, only safer.

## Classic meaning

A proxy is a stand-in object with the same interface as the real one. It can control who gets access to the real one.

## In the agent system

Every tool in the registry is wrapped in a GuardedTool proxy. It offers the same run(args) as the real tool. Before passing a call on, the proxy checks allow and deny rules against the tool name and arguments. Examples are writes outside the workspace, or network calls to hosts not on the list. When no rule decides, it shows an approval card to the user. Then it runs the real call inside the sandbox (a sealed space where code runs safely), with a timeout. Rules that match shell command text are easy to get around. So they only decide what needs approval, and the sandbox stays the hard boundary. On the way back, the proxy removes secrets from the result. It writes the decision to an append-only audit log (records can be added but never changed), and also to the transcript. The agent loop cannot tell the difference. And there is no path to the real tool that skips the proxy.

## In a large company

In enterprise platforms, a central policy engine such as OPA or Cedar backs the proxy. These are rule engines that decide who may do what. The engine looks at the tool name, the arguments, the user's role, the tenant and the data classification. A tenant is one customer company sharing the platform. High-risk actions need a person to approve them (human-in-the-loop). Each decision goes to an append-only audit log outside the transcript, with the approver's identity. So it survives compaction (shrinking old conversation to save space). It also supports SOC 2 audits (a common security standard). For high-risk systems, it supports EU AI Act record-keeping too. The proxy should fail closed. If the policy service cannot be reached, calls are denied, not allowed.

## Step by step

1. The loop calls run(args) on the proxy, exactly as it would on the real tool.
1. The proxy checks allow and deny rules against the tool name and arguments.
1. If no rule decides, it pauses for user approval in the UI.
1. Once allowed, it passes the call into the sandbox, then removes secrets and logs the result.

## Code sketch

```python
class GuardedTool(Tool):
    def __init__(self, real, policy, ui):
        self.real, self.policy = real, policy
        self.ui, self.name = ui, real.name
    def run(self, args):
        v = self.policy.check(self.name, args)
        if v == 'ask':
            v = self.ui.approve(self.name, args)
        if v != 'allow':
            return ToolResult.denied(v)
        out = sandbox.run(self.real, args)
        return redact(out)
```

## Be careful

A proxy only guards what it wraps. A tool registered without it, or a raw subprocess call elsewhere in the harness, is an open side door.

## Diagram

![Fig. 2.14: Every call passes the proxy's rules, approval and sandbox before the real tool runs.](/diagrams/proxy.svg)
