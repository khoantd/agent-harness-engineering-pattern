---
id: monad
number: "9.05"
title: Monad
chapter: functional
fit: direct
figure_number: Fig. 9.05
figure_caption: "Steps run on the Ok track, and the first Err skips straight to the end."
diagram: monad.svg
analogy_title: The railway with two tracks
---
## Gist

Chain tool steps that return Result values (a success or an error), so the first error skips the rest and arrives as one clean failure.

## Everyday comparison

### The railway with two tracks

Picture a railway line where every station has a set of points (track switches). If the train's paperwork is in order, it goes on along the main line to the next station. If anything is wrong, the points send it onto a side track. That track runs straight to the end of the line, skipping every remaining station. No station needs to check whether the train has already failed.

## Classic meaning

A type that wraps a value with extra context, such as the chance of failure. It provides bind, which chains functions that return that type and handles the context for you.

## In the agent system

Running a tool call has several steps, and each one can fail. The harness parses the JSON arguments and checks them against the schema (the expected shape). It checks permissions, runs the tool and formats the output. Each step returns Ok(value) for success or Err(reason) for failure. bind chains the steps, so the next step runs only on Ok. The first Err passes through the rest untouched. It becomes a tool_result with is_error set, a flag that marks the tool's answer as an error. The model reads it and can correct itself. The harness never throws an exception in the middle of the chain. Every failure carries a clear message instead of a stack trace, which is a dump of the program's internal calls.

## In a large company

Enterprise harnesses use Result chains so that failures are typed (labelled by kind) and auditable. This covers failures in validation, authorization, running the tool and output filtering. Without this, they get lost in exception traces. The error kind drives policy. Denials are logged as security events. Timeouts and HTTP 429 or 5xx errors (rate limits and server failures) are retried with backoff, waiting longer each time. But this happens only when the step is idempotent (safe to run twice with the same result). Validation errors go back to the model. Error messages sent to the model should be cleaned first. Stack traces and internal hostnames are a common way for data to leak out.

## Step by step

1. Each step takes a plain value and returns Ok or Err.
1. Start the chain with Ok(raw tool_use input).
1. bind runs the next step only when the current value is Ok.
1. At the end, Ok becomes a tool_result and Err becomes an error tool_result.

## Code sketch

```python
res = (Ok(block.input)
       .bind(validate(schema))
       .bind(authorize(perms))
       .bind(execute(tool))
       .map(format_output))

if res.is_ok:
    reply = tool_result(block.id, res.value)
else:
    reply = tool_error(block.id, res.error)
```

## Be careful

Wrapping everything in Result hides which failures are worth retrying. Carry an error kind, so the loop can retry timeouts but not denials.

## Diagram

![Fig. 9.05: Steps run on the Ok track, and the first Err skips straight to the end.](/diagrams/monad.svg)
