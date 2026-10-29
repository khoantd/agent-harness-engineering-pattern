---
id: function-composition
number: "9.02"
title: Function Composition
chapter: functional
fit: direct
review_id: rev-function-composition
figure_number: Fig. 9.02
figure_caption: Small functions snap together into one function that is applied once.
diagram: function-composition.svg
analogy_title: Stacked camera lens filters
---
## Gist

Build one tool-result formatter by joining small single-purpose functions, then reuse that joined function everywhere.

## Everyday comparison

### Stacked camera lens filters

A photographer screws a UV filter onto the lens, a polarising filter onto that, and a neutral density filter on top. Light passes through all three, but to the camera they are one attachment. Unscrew one and the rest still work. Buy a new one and it screws onto the stack.

## Classic meaning

Join simple functions into a new function, where each one's output becomes the next one's input. In maths, compose(f, g)(x) means f(g(x)), which runs right to left. The left-to-right form used here is often called pipe.

## In the agent system

Raw tool output needs several clean-ups before it goes back to the model. The harness strips ANSI colour codes, the hidden characters that colour terminal text. It redacts (hides) anything that looks like a credential, such as a password or key. It cuts the text to a size limit and wraps it in a tool_result block (the tool's answer to the model). Each clean-up is a small pure function, with no side effects, that takes a string and returns a string. The harness composes (joins) them once into format_result. It then uses that one function for every tool. A tool with special needs composes a slightly different chain from the same parts.

## In a large company

Enterprise platforms compose tool-output cleaners in one central place. This is often the LLM gateway (the central service all model calls pass through) or a shared harness library. So every team gets the same ANSI stripping, secret redaction, PII masking and size limits. PII is personal data such as names and emails. Regex-based secret redaction, which finds secrets by text patterns, is only an extra layer of defence. The main control is that the tool runtime injects credentials from Vault or workload identity. Vault is a secrets store, and workload identity gives each service its own login. Then credentials never appear in tool output at all. Each composed formatter should have a version number and tests that use known fake secrets. Then a reordering that weakens redaction fails CI, the automatic checks run on every change.

## Step by step

1. Write each clean-up as a small function with one input and one output.
1. Compose them in order into a single named function.
1. Apply the composed function to every raw tool output.
1. Build variants by composing a different set of the same parts.

## Code sketch

```python
def compose(*fns):
    return lambda x: reduce(
        lambda acc, f: f(acc), fns, x)

format_result = compose(strip_ansi,
                        redact_secrets,
                        truncate(16_000),
                        to_tool_result)

block = format_result(proc.stdout)
```

## Be careful

Order matters. Cutting the text before redacting can split a secret in half, so the redactor misses it.

## Diagram

![Fig. 9.02: Small functions snap together into one function that is applied once.](/diagrams/function-composition.svg)
