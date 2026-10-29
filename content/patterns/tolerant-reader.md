---
id: tolerant-reader
number: "3.16"
title: Tolerant Reader
chapter: llm-layer
fit: adapted
figure_number: Fig. 3.16
figure_caption: "Messy text goes in, a strict typed object comes out, and the model is asked again only when it truly matters."
diagram: tolerant-reader.svg
analogy_title: The examiner marking messy scripts
---
## Gist

Read model output by taking what you need and ignoring the rest, fixing small mistakes instead of crashing on them.

## Everyday comparison

### The examiner marking messy scripts

An experienced examiner marking a maths paper looks for the answer and the key steps. Crossed-out working, arrows in the margin and a doodle in the corner do not lose marks. She only stops and flags a paper when the answer itself is missing or cannot be read.

## Classic meaning

A tolerant reader reads only the parts of a message it needs. It accepts unknown fields, a different order and small variations. So it keeps working when the sender changes its output.

## In the agent system

A model asked for JSON (a common text format for structured data) does not always return clean JSON. It may wrap it in a markdown fence ( marks) or add a sentence before it. It may leave a trailing comma, return numbers as strings or invent an extra field. A tolerant reader in the harness removes fences and pulls out the first balanced object (from the first { to its matching }). It applies a gentle repair. Then it reads only the required fields, converts simple types and ignores unknown keys. The harness reads verdicts from grader models (models that score answers) and plans from planner subagents this way. Only when a required field is truly missing does the harness send a short correction request back to the model.

## In a large company

In an enterprise platform, the first defence is to avoid parsing free text at all. Teams use tool calls or structured outputs with a JSON schema (a formal description of the expected shape). The tolerant reader stays for the remaining edges, such as grader verdicts and output from third-party models. Parse failures and repairs are counted per prompt version and model. So a regression (something that gets worse) after a model upgrade shows up in evals (quality tests) before users see it. Anything parsed from model output that drives a privileged action still gets strict checking. It also passes a policy check before it runs, for example with OPA or Cedar (policy engines that decide what is allowed).

## Step by step

1. Remove code fences and any text before the JSON.
1. Pull out the first balanced JSON object and fix small syntax errors.
1. Read the required fields, convert simple types and ignore extra keys.
1. If a required field is missing, ask the model for a corrected answer.

## Code sketch

```python
def read_verdict(text):
    raw = strip_fences(text)
    obj = repair_json(first_obj(raw))
    # take what we need, ignore the rest
    return Verdict(
        score=int(obj['score']),   # '7' ok
        reason=obj.get('reason', ''))

try:
    v = read_verdict(reply.text)
except (KeyError, ValueError):
    ask_model_to_fix(reply)
```

## Be careful

Tolerance belongs only at the edge where text is parsed. Pass strict, typed objects inward. Never 'repair' input that authorises a destructive tool action (one that deletes or changes things).

## Diagram

![Fig. 3.16: Messy text goes in, a strict typed object comes out, and the model is asked again only when it truly matters.](/diagrams/tolerant-reader.svg)
