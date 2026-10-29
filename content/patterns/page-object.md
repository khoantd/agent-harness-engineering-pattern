---
id: page-object
number: "12.03"
title: Page Object
chapter: testing
fit: adapted
review_id: rev-page-object
figure_number: Fig. 12.03
figure_caption: Callers speak in user actions. Only the page object knows the selectors.
diagram: page-object.svg
analogy_title: The museum tour guide
---
## Gist

Hide a chat screen's selectors behind methods like send() and approve_tool(), so evals and browser agents speak in user actions.

## Everyday comparison

### The museum tour guide

Visitors on a tour ask to see the Dutch paintings or the dinosaur hall. They never need the floor plan. The guide knows which wing, staircase and room each request means. When the museum moves the dinosaurs to the east wing, only the guide learns the new route. Every tour still asks for the dinosaur hall.

## Classic meaning

A page object wraps a web page in an object. Its methods stand for the things a user can do on the page. So tests do not depend on how the page's HTML is built.

## In the agent system

End-to-end tests (tests that drive the whole app like a real user) use a ChatPage object. It has methods such as send(text), wait_for_turn_end(), approve_tool(name), open_artifact(n) and transcript_text(). Inside, it knows the selectors (the codes that find elements on the page) for the composer and the stop button. It also knows how to tell that streaming has finished. The same idea helps browser tools for agents. A page object for a known site gives the agent steady, high-level actions. The agent does not have to make raw clicks on fragile screen positions. A page object given to an agent leaves out approval controls. So the agent can never approve its own tool calls. When the screen is redesigned, only the page object changes.

## In a large company

Enterprise teams run page-object test suites in Playwright or Selenium (tools that drive a real browser). They run against every app build in CI, the automatic build and test system. Selectors use stable test ids, so redesigns do not break the gate. Sometimes a browser-using agent drives internal web apps. Then a page object or a narrow set of tools limits it to approved actions. Each action gets a permission check, like any other tool. The approval controls of the agent harness itself must never be reachable through such a set of tools. That would let the agent approve itself.

## Step by step

1. The test or agent calls a high-level method, such as send('hi').
1. The page object turns it into browser actions on known selectors.
1. It waits for the right signal, such as the stop button disappearing.
1. It returns plain data, such as the transcript text, for checking.

## Code sketch

```python
class ChatPage:
    def __init__(self, browser):
        self.b = browser
    def send(self, text):
        self.b.fill('#composer', text)
        self.b.press('#composer', 'Enter')
    def wait_for_turn_end(self):
        self.b.wait_hidden('[data-stop]')
    def approve_tool(self, name):
        self.b.click(f'#{name} .allow')
```

## Be careful

Putting checks inside page objects mixes checking with driving. Return data, and let the test decide what is correct.

## Diagram

![Fig. 12.03: Callers speak in user actions. Only the page object knows the selectors.](/diagrams/page-object.svg)
