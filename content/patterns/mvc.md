---
id: mvc
number: "10.01"
title: MVCModel-View-Controller
chapter: frontend
fit: direct
aka: Model-View-Controller
review_id: rev-mvc
figure_number: Fig. 10.01
figure_caption: "Input goes through the controller. The view reads the model, never the controller."
diagram: mvc.svg
analogy_title: The cricket scorer and the scoreboard
---
## Gist

Split the chat app into three parts: a model that holds the conversation, a view that shows it, and a controller that changes it.

## Everyday comparison

### The cricket scorer and the scoreboard

At a cricket ground, the umpire signals a boundary. The scorer watches only the umpire and writes four runs into the scorebook. The scoreboard crew never talk to the umpire. They read the scorebook and change the numbers on the big board. If the board breaks, the book is still right. A second board across the ground can read the same book.

## Classic meaning

MVC splits an app into three parts. The model holds the data, views show it, and controllers handle input and update the model.

## In the agent system

The Conversation model holds the messages, the tool calls (the model's requests to run tools) and the run status. It knows nothing about the screen. The transcript view (the list of messages on screen) subscribes to the model, which means it asks to be told about changes. It redraws when a message is added, or when a streamed delta (a small new piece of text arriving live) makes one longer. The input controller owns the composer, the box where the user types. On Enter, it adds the user's message to the model and asks the harness to start a turn. On Escape, it asks the harness to cancel the run. The harness then records the cancelled status in the model. Streamed events from the agent loop also go into the model. So the view has exactly one place to read from.

## In a large company

In a large company, the transcript store on the server is the system of record (the official copy). It is used for audits and for rules about how long data is kept. The Conversation model in the app is only a cache (a local copy). The app reloads it from the server after a reconnect. Controller actions such as cancel must reach the server. Only the server can stop running tools and stop token spend (the cost of model usage). Client telemetry (usage data the app sends home) that watches the model should remove PII (personal data such as names and emails) before events leave the browser.

## Step by step

1. The user types in the composer, and the input controller receives the key presses.
1. The controller adds a user message to the Conversation model and starts a turn.
1. Streamed pieces of text from the agent loop make the assistant's message in the model longer.
1. The model tells the transcript view, which reads the model and redraws.

## Code sketch

```python
class InputController:
    def __init__(self, convo, harness):
        self.convo, self.h = convo, harness
    def on_enter(self, text):
        self.convo.append('user', text)
        self.h.start_turn(self.convo.id)

convo.subscribe(transcript_view.redraw)
harness.on_delta(convo.extend_last)
```

## Be careful

Do not let the view also read the harness stream directly. Then there are two sources of truth (two places that each claim to be correct). The transcript on screen slowly stops matching the saved conversation.

## Diagram

![Fig. 10.01: Input goes through the controller. The view reads the model, never the controller.](/diagrams/mvc.svg)
