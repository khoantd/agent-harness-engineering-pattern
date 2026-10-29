---
id: facade
number: "2.05"
title: Facade
chapter: tool-system
fit: direct
figure_number: Fig. 2.05
figure_caption: "The model makes one call, and the facade drives four parts and returns a short summary."
diagram: facade.svg
analogy_title: The hotel concierge desk
---
## Gist

Give the model one simple tool that hides a many-step system, so the model makes one call instead of five.

## Everyday comparison

### The hotel concierge desk

A guest says: dinner for four at eight, and a taxi there. The concierge phones the restaurant, books the car, checks the traffic and hands back one card with the time and the table. The guest never sees the phone list, the taxi firm's booking system or the reservation book.

## Classic meaning

A facade gives one simple interface to a complex system. Callers then need to know less about its parts.

## In the agent system

Running a project's tests in a fresh sandbox (a sealed space where code runs safely) takes many steps. The harness must start a container, install dependencies and start the test runner. Then it must read a JUnit XML report (a standard test results file) and trim megabytes of logs. If these were five tools, the model would spend turns and context on running them. The context is the text the model can see at one time. The model could also run them in the wrong order. A run_tests facade takes one optional path filter. It does every step inside and returns a short summary of failures. The parts are still there for harness code and other facades to use. But the model's tool list stays small.

## In a large company

Enterprises give the model broad facade tools such as run_tests, open_ticket or refund_order instead of raw APIs. This shrinks the model's tool list. It also lets the platform attach one check to each business action. That means one RBAC check (role-based access control: permissions given by job role), one approval rule and one audit event. The facade is also where the platform enforces per-tenant quotas, timeouts and cost limits for the whole many-step job. A tenant is one customer company sharing the platform. The risk is that a facade hides which systems it touched. So the audit record should list every call to an inner part, even though the model only sees one summary.

## Step by step

1. The model calls run_tests with an optional path filter.
1. The facade starts or reuses the sandbox and installs dependencies.
1. It runs the test runner and reads the report.
1. It returns a short summary of failing tests as one tool_result.

## Code sketch

```python
def run_tests(path='.'):
    box = sandbox.acquire(repo)
    deps.install(box, lockfile='uv.lock')
    raw = runner.run(box, 'pytest', path)
    rep = junit.parse(raw.xml)
    return summarise(rep.failures,
                     max_tokens=800)
```

## Be careful

A facade that hides too much leaves the model stuck when something unusual breaks. Include a log path so it can dig deeper.

## Diagram

![Fig. 2.05: The model makes one call, and the facade drives four parts and returns a short summary.](/diagrams/facade.svg)
