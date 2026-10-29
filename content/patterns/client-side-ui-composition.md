---
id: client-side-ui-composition
number: "10.14"
title: Client-Side UI Composition
chapter: frontend
fit: direct
review_id: rev-client-side-ui-composition
figure_number: Fig. 10.14
figure_caption: Each service ships its own piece. The shell only lays them out and passes messages.
diagram: client-side-ui-composition.svg
analogy_title: The trade-show hall
---
## Gist

Let the chat shell build its screen from pieces owned by separate services: the transcript, the artifact viewer and widgets.

## Everyday comparison

### The trade-show hall

The organiser rents the hall, draws the floor plan and runs the entrance and the signs. Each exhibitor designs, builds and staffs its own booth in its assigned space. Visitors walk through one show. When a booth is rebuilt overnight, the organiser and the neighbouring booths do nothing.

## Classic meaning

Each microservice team (a team owning one small, separate service) ships its own piece of the screen. A shell in the browser loads those pieces and puts them together into one page while the app runs.

## In the agent system

The chat app is a thin shell. It owns the layout, the login and an event bus (a shared channel for passing messages). The transcript pane comes from the chat service. The artifact panel comes from an artifact service. It loads into a sandboxed iframe, a walled-off frame on its own origin (its own web address). Inline widgets such as a map or chart are bundles (packed code files) from a widget service. The shell mounts (places) each piece into a slot. It passes messages between them, such as open artifact 42 from a link in the transcript. Each service releases its piece on its own schedule.

## In a large company

Large agent platforms build the app from team-owned pieces. They use module federation or web components (two ways to load separate code pieces into one page). The shell owns SSO (single sign-on), the design system and a typed message bus (one that checks the shape of each message). Untrusted pieces, such as artifacts, run in sandboxed iframes on a separate origin. A strict Content Security Policy (a browser rule limiting what may run) applies. The shell checks the origin and the schema (expected shape) of every postMessage, the browser's way of sending messages between frames. A manifest (a list of versions) pins each piece's version. So one piece can be rolled back without redeploying the shell.

## Step by step

1. The shell loads with layout slots and a shared event bus.
1. It fetches each piece's code or frame from the service that owns it.
1. Pieces mount into their slots and draw on their own.
1. Actions across pieces, such as opening an artifact from a transcript link, go through the bus.

## Code sketch

```python
shell = Shell(layout='chat')
shell.mount('main',
    remote('chat-svc/transcript.js'))
shell.mount('side',
    iframe('artifacts-svc/view/42',
           sandbox='allow-scripts'))
shell.mount('inline',
    remote('widgets-svc/map.js'))
shell.bus.on('open_artifact',
    lambda id: shell.slot('side').load(id))
```

## Be careful

If each piece packs its own copy of a UI framework, the app gets heavy and slow to load. Share core libraries through the shell.

## Diagram

![Fig. 10.14: Each service ships its own piece. The shell only lays them out and passes messages.](/diagrams/client-side-ui-composition.svg)
