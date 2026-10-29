---
id: mvp
number: "10.02"
title: MVPModel-View-Presenter
chapter: frontend
fit: direct
aka: Model-View-Presenter
figure_number: Fig. 10.02
figure_caption: The view and the model never touch. The presenter sits between them.
diagram: mvp.svg
analogy_title: The theatre prompter
---
## Gist

Make the transcript view passive. A presenter reads the conversation, decides what to show, and tells the view what to display.

## Everyday comparison

### The theatre prompter

An actor on stage never opens the script. When a line is needed, the prompter, hidden in a box below the stage, reads the script. The prompter whispers the exact words, and the actor says them. The actor signals what happened on stage, such as a dropped prop or a missed cue. The prompter decides what comes next. An understudy can step in, and neither the script nor the prompter changes.

## Classic meaning

MVP is a kind of MVC where the view is thin and passive. A presenter holds the display logic and stands between the view and the model. Unlike MVC, the view never reads the model itself.

## In the agent system

The transcript view offers a small interface (a fixed list of functions). Examples are show_messages, show_spinner, disable_composer and an on_send callback (a function the view calls when the user presses Send). The view holds no logic. The ChatPresenter receives on_send. It adds the message to the Conversation model and starts the turn. When the model changes, the presenter decides how to show it. It may fold up a long tool result, or show a retry banner after an overloaded error. It disables the composer (the typing box) while a run is active. The view is only an interface. So tests can give the presenter a fake view that records each call, with no browser needed.

## In a large company

Regulated teams (teams under strict legal rules) like MVP for approval and consent screens. With a fake view, unit tests (small automatic checks) can prove one thing. A destructive tool call never appears without its Deny option or its risk banner. The presenter also turns tenant policy into controls. A tenant is one customer company sharing the platform. The server sends policy decisions, such as which actions a role may take. The presenter turns them into enabled or disabled buttons. The server must still enforce those policies, because a hidden button is not an access control.

## Step by step

1. The view passes the user's Send event to the presenter.
1. The presenter updates the Conversation model and starts a turn.
1. As new text arrives, the model tells the presenter, not the view.
1. The presenter formats the state and calls view methods such as show_messages.

## Code sketch

```python
class ChatPresenter:
    def __init__(self, view, convo):
        self.v, self.c = view, convo
        view.on_send = self.send
        convo.on_change = self.refresh
    def send(self, text):
        self.c.append('user', text)
        self.v.disable_composer()
    def refresh(self):
        self.v.show_messages(self.c.rows())
```

## Be careful

Presenters grow too big when every small display rule goes into them. Move pure formatting into helper functions. Then the presenter only decides what to show.

## Diagram

![Fig. 10.02: The view and the model never touch. The presenter sits between them.](/diagrams/mvp.svg)
