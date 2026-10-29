---
id: notification
number: "7.12"
title: Notification
chapter: safety
fit: direct
figure_number: Fig. 7.12
figure_caption: "Every validator writes to one shared report, which goes back in a single reply."
diagram: notification.svg
analogy_title: The driving test score sheet
---
## Gist

Collect every guardrail and validation error in one notification object, then report them together instead of failing on the first.

## Everyday comparison

### The driving test score sheet

A driving examiner does not stop the test at your first wobble. They mark every fault on the sheet as you drive: a missed mirror check, a late signal, a rolling stop. At the end you get the whole sheet at once. So you know everything to practise before the next try.

## Classic meaning

Errors and other details are gathered in an object that goes back to the caller. This replaces throwing an exception for each problem.

## In the agent system

The model may propose a tool call or a plan. Then several validators (checking steps) run. One checks the arguments against the schema, the expected shape of the input. Others check paths against an allow-list and check the budget. Another does a dry run of the shell command, testing it without real effects. Each validator adds to a Notification instead of raising an error on the first failure. If the notification holds errors, the harness returns one tool_result with is_error set. is_error is a flag on the tool_result block that marks it as an error. The tool_result lists all the errors. So the model fixes everything in a single retry. It does not find problems one round trip at a time. The same object feeds the approval card, which shows the user every warning together.

## In a large company

Enterprise harnesses use the collected validation report in two places: the model's single retry and the human approval card. They write the same structured findings to the audit log. Error text sent to the model should not reveal internal policy details, secrets or other tenants' paths. A tenant is one customer company. This matters because the transcript may be stored, exported or read by later tools. Validation categories are worth tracking as metrics. A spike in one denial type often signals a broken tool schema or a prompt-injection campaign.

## Step by step

1. Create an empty notification for the proposed call.
1. Run each validator, which adds errors or warnings instead of raising.
1. If the notification holds errors, return them all in one tool_result.
1. Otherwise run the call and show any warnings in the UI.

## Code sketch

```python
note = Notification()
for check in (schema_ok, path_allowed,
              within_budget, dry_run):
    check(call, note)   # adds, never raises

if note.has_errors():
    return tool_error(call.id, note.errors)
result = execute(call)
ui.show_warnings(note.warnings)
```

## Be careful

Some findings must stop validation at once, such as a detected prompt injection (hidden text that tries to give the model orders). Let those validators stop instead of collecting more from hostile input.

## Diagram

![Fig. 7.12: Every validator writes to one shared report, which goes back in a single reply.](/diagrams/notification.svg)
