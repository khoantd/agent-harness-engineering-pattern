---
id: presentation-model
number: "10.07"
title: Presentation Model
chapter: frontend
fit: adapted
review_id: rev-presentation-model
figure_number: Fig. 10.07
figure_caption: "One screen model class, usable on any screen, feeds several thin views and is tested on its own."
diagram: presentation-model.svg
analogy_title: The school office timetable board
---
## Gist

Keep the chat screen's state and behaviour in a plain object that several thin views copy from and tests use directly.

## Everyday comparison

### The school office timetable board

The school office keeps one master board. It says which rooms are in use, which classes are cancelled and who is covering. The corridor screens, the text alerts to parents and the sheet on the staffroom door all copy from that board. An inspector can check that every class has cover by reading the board, without walking a single corridor.

## Classic meaning

The state and behaviour of a screen live in a model that is separate from any buttons or widgets. Each view keeps itself in step with that model. It is like MVVM without a binding framework: each view copies fields by hand.

## In the agent system

A ChatScreenModel holds everything the screen shows, in terms that fit any kind of screen. It holds the rows to show and whether Stop is visible. It holds the banner text after a rate-limit error (an error saying too many requests were sent). It also holds which tool card is open and the options on the approval prompt. The same class drives the web app, the terminal app and an IDE (code editor) side panel. Each screen gets its own instance (copy) of the class. Each view is a thin adapter (connecting code). It copies fields into its widgets and passes clicks back as method calls. Unit tests (small automatic checks) call model methods directly and check the fields. They run in milliseconds, with no browser.

## In a large company

Some platforms ship web, desktop, IDE and terminal apps. They share one presentation model class per screen, often in a shared TypeScript or Kotlin Multiplatform package (code that runs on many platforms). So approval and error behaviour is the same everywhere. That matters for compliance (meeting legal and audit rules). An approval prompt that shows risk text on the web but not in the terminal is an audit finding. The model's tests give the same result every time. They run on every pull request (proposed code change). They are separate from model-graded evals, which use an AI model to score how well the agent behaves.

## Step by step

1. Harness events update the ChatScreenModel through its methods.
1. The model works out derived fields again, such as stop_visible and banner.
1. Each view catches up by copying fields into its own widgets.
1. Input in any view calls the same model method, such as approve or stop.

## Code sketch

```python
class ChatScreenModel:
    def __init__(self):
        self.rows, self.banner = [], None
        self.stop_visible = False
    def on_error(self, err):
        if err.type == 'overloaded_error':
            self.banner = 'Busy, retrying'

def test_banner():
    m = ChatScreenModel()
    m.on_error(Err('overloaded_error'))
    assert m.banner == 'Busy, retrying'
```

## Be careful

With no binding framework, each view must catch up by hand. One forgotten update call leaves a screen showing old state.

## Diagram

![Fig. 10.07: One screen model class, usable on any screen, feeds several thin views and is tested on its own.](/diagrams/presentation-model.svg)
