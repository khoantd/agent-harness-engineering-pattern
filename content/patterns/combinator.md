---
id: combinator
number: "9.03"
title: Combinator
chapter: functional
fit: direct
review_id: rev-combinator
figure_number: Fig. 9.03
figure_caption: Operators combine checks into a bigger check of the same shape.
diagram: combinator.svg
analogy_title: The box of interlocking toy bricks
---
## Gist

Build complex permission rules or output checkers from a few basic checks and operators such as all_of, any_of and not_.

## Everyday comparison

### The box of interlocking toy bricks

A child's brick set has only a few shapes: the flat plate, the two-stud brick and the hinge. Every piece clicks onto every other. So those few shapes become a castle, a truck or a rocket. Nobody needs a special castle piece, because the connectors do the work.

## Classic meaning

Build complex functions by combining simpler ones. You use higher-order functions (functions that take and return functions) of the same type.

## In the agent system

Permission policies grow fast when written as nested if-statements. With combinators, the harness offers basic predicates over a tool call. A predicate is a check that answers true or false, such as read_only, in_workspace and matches(glob). A glob is a file name pattern, like *.env. The harness also offers the operators all_of, any_of and not_. Each one takes predicates and returns a new predicate. Take the policy all_of(not_(matches('*.env')), any_of(read_only, in_workspace)). It is itself a predicate. So it can be nested further, tested on its own, and built from configuration. The same approach builds output checkers and parsers for structured model output.

## In a large company

Enterprise policy languages such as Cedar and Rego are combinator systems at heart. They join small conditions with and, or and not into policies that can be tested and versioned. Platforms often let tenants (customer companies) build their own tool policies from approved basic checks. The platform wraps its required deny rules around the outside, so a tenant rule cannot weaken them. Each decision should carry an explanation of the deciding branch into the audit log. Reviewers and incident responders depend on it.

## Step by step

1. Define basic predicates that take a tool call and return true or false.
1. Define operators that take predicates and return a new predicate.
1. Combine them into a policy expression.
1. Call the policy on each tool call before it runs.

## Code sketch

```python
def all_of(*ps):
    return lambda c: all(p(c) for p in ps)
def any_of(*ps):
    return lambda c: any(p(c) for p in ps)
def not_(p):
    return lambda c: not p(c)

allow = all_of(not_(matches('*.env')),
               any_of(read_only,
                      in_workspace))
if not allow(call): ask_user(call)
```

## Be careful

Deeply nested combinators are hard to debug. Give each policy an explain() method that reports which branch made the decision.

## Diagram

![Fig. 9.03: Operators combine checks into a bigger check of the same shape.](/diagrams/combinator.svg)
