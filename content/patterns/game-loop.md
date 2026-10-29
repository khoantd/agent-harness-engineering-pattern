---
id: game-loop
number: "1.01"
title: Game Loop
chapter: agent-loop
fit: adapted
review_id: rev-game-loop
figure_number: Fig. 1.01
figure_caption: "The run is one cycle, repeated until the model stops asking for tools."
diagram: game-loop.svg
analogy_title: "The ship's navigator taking fixes"
---
## Gist

Run the agent as a loop: build the request, call the model, run any tools it asks for, and repeat until it stops asking.

## Everyday comparison

### The ship's navigator taking fixes

At sea, the navigator does not plan the whole trip once and walk away. Every hour they read the instruments and mark the ship's position on the chart. Then they set a new direction and wait for the next reading. The ship arrives because this small cycle repeats. The trip ends when the harbour is in sight.

## Classic meaning

A main loop that keeps taking input, updating state and producing output. It keeps the pace of the program separate from any single event.

## In the agent system

Every harness has a loop at its centre, wrapped around the call to the model. Each pass sends the system prompt (the standing instructions) and the transcript (the conversation so far). It also sends the tool schemas (descriptions of the tools the model may use). Then the harness looks at the reply. If the reply has tool_use blocks (the model's requests to run a tool), the harness runs those tools. It puts the matching tool_result blocks (the tools' answers) into the next user message and goes round again. If stop_reason (the field that says why the model stopped) is end_turn, the model has finished. The loop ends and the final text goes to the user. Other stop reasons need their own handling. max_tokens means the reply was cut off at the length limit. A cut-off tool_use must never be run. pause_turn means a server-side tool (a tool the provider runs) paused a long turn. The harness should then send the request again to continue. The harness checks its guards at the start of every pass. These are max_turns (a limit on turns), a token budget (a limit on how much text the run may use) and a cancel flag. This is also where it handles compaction (shrinking old context to save space) and user messages waiting in a queue.

## In a large company

In a large company platform, the agent loop usually runs inside a durable execution engine such as Temporal or AWS Step Functions. A durable execution engine saves each step, so the work survives a crash. If a worker (the server running the job) crashes, the run picks up from the last finished model call or tool call. Each pass of the loop is traced with OpenTelemetry, a standard for recording what software does. It uses the GenAI semantic conventions, which are agreed names for model and tool records (called spans). Each pass is also charged against a per-tenant token budget. A tenant is one customer company sharing the platform. The LLM gateway (a central service that all model calls pass through) enforces this budget. The key control is a hard limit per run on turns, tokens and wall-clock time (real elapsed time). Tenant policy sets this limit, not the prompt.

## Step by step

1. Build the request from the system prompt, the transcript and the tool definitions.
1. Call the model and stream the reply to the screen as it arrives.
1. If the reply has tool_use blocks, run them and add the tool_result blocks.
1. Check the stop conditions (end_turn, max_turns, budget, cancel), then loop again or stop.

## Code sketch

```python
while turn < max_turns and not cancelled:
    turn += 1
    resp = model.create(system=sys_prompt,
                        messages=msgs,
                        tools=tools)
    msgs.append(resp.as_message())
    if resp.stop_reason == 'max_tokens':
        raise Truncated(resp)  # never run it
    if resp.stop_reason == 'pause_turn':
        continue  # resend to resume
    calls = resp.tool_use_blocks()
    if not calls:
        break  # end_turn: answer is ready
    msgs.append(run_tools(calls))
```

## Be careful

A loop with no turn limit or budget check can run forever. This happens when the model keeps calling the same failing tool.

## Diagram

![Fig. 1.01: The run is one cycle, repeated until the model stops asking for tools.](/diagrams/game-loop.svg)
