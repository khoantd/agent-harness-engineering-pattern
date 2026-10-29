---
id: specification
number: "7.02"
title: Specification
chapter: safety
fit: direct
review_id: rev-specification
figure_number: Fig. 7.02
figure_caption: Small reusable rules combine into a tree that judges each proposed action.
diagram: specification.svg
analogy_title: The casting call notice
---
## Gist

Write permission rules as small predicates (yes-or-no tests) combined with and, or and not, then test each action against them.

## Everyday comparison

### The casting call notice

A casting call says: over 18, AND able to sing, AND either dances or plays guitar, AND NOT under contract elsewhere. Each line is a separate test. The director can reuse it for the next show. Putting the lines together makes the brief. Checking an applicant means going down the list.

## Classic meaning

A business rule becomes an object with an is_satisfied_by(candidate) method. Rules can be combined with boolean operators: and, or, not.

## In the agent system

Here is a policy for browser actions. Allow a form submission if the URL is localhost AND the credentials are test credentials AND the user asked for it. OR allow it if the user approved this exact action. Each clause is a Specification object: IsLocalhost, TestCreds, UserRequested, Approved. Each has is_satisfied_by(action). Each leaf (a single basic rule) reads facts the harness itself holds. These are the parsed URL, the credential's source, the recorded user turns and the approval record. A leaf never trusts claims the model puts in the tool arguments. The policy is built with &, | and ~ (and, or, not). It is unit-tested clause by clause. It can also explain itself. So the harness can tell the model which clause failed, in the denial tool_result.

## In a large company

Enterprise platforms usually move these rules into a policy engine. Examples are OPA with its Rego language, or Cedar. There, policies are versioned, code-reviewed and tested in CI (automatic checks on every change). Each check writes a decision log for audit. Cedar has a rule that a matching forbid overrides any permit. This gives explicit deny, which plain OR combining lacks. Every attribute fed to the policy must come from the identity provider and harness records, never from model output. Attributes include the tenant (customer company), the principal (the acting user), the resource and the approval state.

## Step by step

1. Write each rule as a small spec with is_satisfied_by(action).
1. Combine specs with and, or and not into a policy.
1. At the permission gate, check the policy against the proposed tool call.
1. If it fails, report which clause failed so the model can adjust.

## Code sketch

```python
class Spec:
    def __and__(s, o): return And(s, o)
    def __or__(s, o):  return Or(s, o)
    def __invert__(s): return Not(s)

policy = (IsLocalhost() & TestCreds()
          & UserRequested()) | Approved()

if not policy.is_satisfied_by(action):
    return deny(policy.explain(action))
```

## Be careful

Deeply nested specs get hard to read. Name the middle-level policies, such as safe_local_submit, and test each leaf on its own.

## Diagram

![Fig. 7.02: Small reusable rules combine into a tree that judges each proposed action.](/diagrams/specification.svg)
