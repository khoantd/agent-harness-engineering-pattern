---
id: service-to-worker
number: "10.13"
title: Service to Worker
chapter: frontend
fit: direct
figure_number: Fig. 10.13
figure_caption: The work finishes before any view is chosen or drawn.
diagram: service-to-worker.svg
analogy_title: The garage service desk
---
## Gist

Run the turn to the end first, then choose and draw a result view, so views only show results that already exist.

## Everyday comparison

### The garage service desk

You leave your car at the desk and go for a coffee. The mechanics inspect it in the workshop. Only when the work is finished does the desk print your paperwork. The form depends on the outcome: a pass certificate, a list of repairs or a quote for parts. The desk clerk never picks up a spanner.

## Classic meaning

A front controller and a dispatcher handle the request and run the business logic first. Then they hand control to a view. The view draws the prepared data, with help from view helpers.

## In the agent system

This suits an endpoint that does not stream, such as a scheduled task run or a summarise-this-session call. The controller passes the request to the agent loop. The loop calls the model and tools until the turn ends. The loop returns a TurnResult with the final text, the tool calls, the stop_reason (why the model stopped) and the usage. The dispatcher then picks the view from that result. It shows a summary page for end_turn and an error page for max_tokens (the reply hit its length limit). It shows an approval page if a tool is waiting for permission. Views get a finished result they cannot change, and they never call the model.

## In a large company

Enterprise platforms use this style for batch and scheduled agent work, such as nightly report runs. But they run the turn in a durable workflow engine like Temporal or AWS Step Functions. These tools keep long jobs going even through crashes. The server replies 202 Accepted (request received, work in progress) with a job id. The result view is drawn when the app polls (checks back) or a webhook (a call back from the server) fires. So gateway timeouts never cut a long turn in half. The stored TurnResult carries its trace id and usage. So the page shown, the audit log and the chargeback ledger (the record used for billing) all agree.

## Step by step

1. The front controller receives the request and checks who sent it.
1. The dispatcher runs the agent loop to the end and gets a TurnResult.
1. It chooses a view based on stop_reason and pending approvals.
1. The view draws the prepared result, using view helpers for formatting.

## Code sketch

```python
def handle(req):
    result = agent_loop.run(req.session,
                            req.prompt)
    if result.pending_approval:
        view = 'approval'
    elif result.stop_reason == 'end_turn':
        view = 'summary'
    else:
        view = 'error'
    return render(view, result=result)
```

## Be careful

In this style, a long agent turn keeps the response waiting. So use it for short or background work, and stream interactive chat instead.

## Diagram

![Fig. 10.13: The work finishes before any view is chosen or drawn.](/diagrams/service-to-worker.svg)
