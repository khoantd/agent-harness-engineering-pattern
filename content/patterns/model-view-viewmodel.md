---
id: model-view-viewmodel
number: "10.03"
title: Model-View-ViewModel
chapter: frontend
fit: direct
review_id: rev-model-view-viewmodel
figure_number: Fig. 10.03
figure_caption: "Bindings keep widgets and view model fields in sync, with no hand-written glue."
diagram: model-view-viewmodel.svg
analogy_title: The motorised mixing desk
---
## Gist

Bind chat widgets to a view model's watched fields, so typing, streaming and busy states stay in sync without hand-written glue code.

## Everyday comparison

### The motorised mixing desk

At a concert, the sound engineer pushes a fader (a sliding volume control), and the singer gets louder. That works because the fader is bound to that channel's level. For the encore, the engineer loads a saved setting. The faders then slide by themselves to the stored positions. Nobody writes instructions linking hand to channel. The desk keeps both sides matched, in both directions.

## Classic meaning

A view model offers state and commands as bindable properties (fields a screen element can be linked to). A binding framework keeps the view and the view model in sync. The view model talks to the model. Unlike MVP, nobody calls the view's methods; the bindings copy changes automatically.

## In the agent system

A ChatViewModel holds observable fields (values that announce when they change). They are draft, messages, busy, pending_approval and token_usage. It also has commands such as send and stop. The composer's text box has a two-way binding to draft, so each side updates the other. The Send button is enabled or disabled by a computed value, can_send, which is worked out from other fields. The transcript list is bound to messages. When the harness streams a text_delta (a small new piece of text), the view model updates messages. The binding layer then redraws only that row. The view model imports no widgets (screen elements). So a unit test can simply set draft and call send.

## In a large company

Enterprise apps built on binding frameworks use the view model as the single place where server policy becomes screen state. Examples are pending approvals, remaining budget and data residency banners (notices about which country data is kept in). View models are plain objects, so they get fast unit tests in CI (the automatic build and test system). Screenshot tests catch visual mistakes separately. App analytics should never log whole bound fields that hold user text. Drafts often contain PII (personal data such as names and emails) or pasted secrets.

## Step by step

1. When the screen opens, the binding layer links widget properties to view model fields.
1. Typing updates draft through the two-way binding, and can_send is worked out again.
1. The send command calls the session service and sets busy.
1. New streamed text updates messages, and the bound widgets redraw on their own.

## Code sketch

```python
class ChatViewModel:
    draft = observable('')
    messages = observable([])
    busy = observable(False)
    @computed
    def can_send(self):
        return self.draft and not self.busy
    def send(self):
        self.busy = True
        session.start_turn(self.draft)
        self.draft = ''
```

## Be careful

If you update a bound messages field on every token (a small piece of text), it redraws on every token. So coalesce deltas per animation frame: collect the new pieces and apply them once per screen refresh. Also keep two-way bindings few. Chains of them make the order of updates hard to follow.

## Diagram

![Fig. 10.03: Bindings keep widgets and view model fields in sync, with no hand-written glue.](/diagrams/model-view-viewmodel.svg)
