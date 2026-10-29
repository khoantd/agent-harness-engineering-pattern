---
id: feature-toggle
number: "8.12"
title: Feature Toggle
chapter: architecture
fit: direct
review_id: rev-feature-toggle
figure_number: Fig. 8.12
figure_caption: Flags are read once at session start and decide what the model can see.
diagram: feature-toggle.svg
analogy_title: The gym membership keycard
---
## Gist

Decide for each account and session which tools, skills and artifact types exist, by reading flags when the session is built.

## Everyday comparison

### The gym membership keycard

Every member taps the same kind of card at the gym. But the turnstile reads what their plan includes. A basic card opens the weights floor. A premium card also opens the pool and sauna. A trial card works for two weeks. The rooms are the same for everyone. The card decides which doors open today.

## Classic meaning

Turn features on or off while the system runs, using settings. Code can ship hidden and be turned on for chosen users without a new release.

## In the agent system

When a session starts, the harness reads flags for this user. It checks them against the tenant (customer company), org, plan and cohort (test group) from the checked identity. For example: is code running allowed? Which skills and MCP connectors are allowed? (MCP is a standard way to connect tools to an AI model.) Is the new compaction (history-shortening) method on for this group? Only allowed tools go into the tools array, and only allowed skills appear in the system prompt. The tool dispatcher (the code that runs tool calls) also rejects any call outside that list. This matters because hiding a tool from the model is not the same as blocking it. Release and experiment flags stay frozen for the whole session. So the tools array and system prompt stay the same, and the prompt cache keeps working. The prompt cache is saved work the provider can reuse when a request starts the same way. Kill switches are the exception. The dispatcher checks them live on each call. So operators can stop a broken tool in running sessions without rebuilding the prompt. Rollouts start with a small share of users. They widen while evals (scored tests) and error rates stay healthy.

## In a large company

Large companies read flags through LaunchDarkly, Unleash or an OpenFeature provider (flag services). They target by tenant, plan, region and cohort. Often they let tenant admins turn connectors and skills on or off for their own org. Plan rights and admin policy are better written as permission rules in the policy engine. They should not be long-lived release flags. Do not mix up the two systems. Every flag change goes through change management and is audited. Teams test kill switches often. A rollout only widens if it meets eval and error-rate SLOs (reliability targets). The main risk is the flag service going down. So the harness needs safe defaults that fail closed (block by default) for risky tools.

## Step by step

1. A session start request arrives. The server gets tenant, org and plan from the checked identity.
1. The session builder reads each relevant flag once for that user.
1. Allowed tools, skills and artifact types go into a manifest (a fixed list) that is frozen for the session. It drives the system prompt and tools array.
1. The dispatcher rejects any tool call outside the manifest.
1. The dispatcher checks kill-switch flags live, so it can stop a tool mid-session without changing the prompt.

## Code sketch

```python
def build_session(acct):
    f = flags.evaluate(acct)   # once
    tools = [t for t in ALL_TOOLS
             if f.on('tool.' + t.name)]
    return Session(tools, f.frozen())

def dispatch(s, call):
    if call.name not in s.tool_names:
        return error('tool not enabled')
    if flags.live('kill.' + call.name):
        return error('disabled by ops')
    return run(call)
```

## Be careful

Flags that nobody removes pile up into untested combinations. Give each flag an owner and an end date. Delete it once the rollout is done.

## Diagram

![Fig. 8.12: Flags are read once at session start and decide what the model can see.](/diagrams/feature-toggle.svg)
