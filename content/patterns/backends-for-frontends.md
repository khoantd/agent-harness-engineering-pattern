---
id: backends-for-frontends
number: "8.10"
title: Backends For Frontends
chapter: architecture
fit: direct
figure_number: Fig. 8.10
figure_caption: "Each surface gets a backend shaped for it, and all of them share one core."
diagram: backends-for-frontends.svg
analogy_title: "The theatre's three box offices"
---
## Gist

Give each surface (CLI, web, team chat) its own thin backend that fits one shared agent core to that surface.

## Everyday comparison

### The theatre's three box offices

A theatre sells seats at the window, over the phone and to school groups. The window clerk prints tickets on the spot. The phone team reads out which seats are free and takes card details. The groups desk handles invoices and blocks of seats. All three book from the same seating plan. But each desk is set up for the people in front of it.

## Classic meaning

Build a separate backend for each kind of client app. Each backend fits how that client works, and its team usually owns it. All the backends sit in front of shared services.

## In the agent system

The agent core offers one session API: start a session, run a turn, stream events. The CLI (command-line tool) backend adds local file access, hints for drawing text in the terminal, and handling for when the user interrupts. The web backend packages events as SSE (a live stream of updates to a browser). It also draws tool cards and artifacts, and stores uploads. The team-chat backend answers webhooks (calls from the chat platform) within the platform's few-second limit. It links chat threads to sessions. It turns the live stream into message edits every so often. Each backend changes at its own surface's pace. And the core stays free of special cases like "if surface == 'chat'".

## In a large company

Large agent products ship on many surfaces at once. These include a web app, IDE (code editor) plugins, Slack or Microsoft Teams apps, a mobile app and a public API. Each has a BFF (backend for frontend) owned by that surface's team. Each chat BFF must link the chat platform's user id to the company identity from the IdP (identity provider, the company's login system). It does this through SSO (single sign-on) account linking. It then passes that identity to the core. So RBAC (role-based access control: permissions given by job role) and tenant policy are decided in one central place. A tenant is one customer company. BFFs also deal with platform limits, such as time limits to answer webhooks and limits on how fast you can edit messages. The risk is policy drift. So approval rules, DLP (data loss prevention) and audit logging must live in the shared core. Never rebuild them inside a BFF.

## Step by step

1. A surface sends input in its own shape: a keystroke, an HTTP post or a chat webhook.
1. Its backend maps that to the core's session API and adds surface details.
1. The core runs the turn and streams general events back.
1. The backend reshapes the events for its surface, such as SSE frames or edited chat messages.

## Code sketch

```python
class ChatBff:  # team-chat surface
    def on_webhook(self, ev):
        ack_soon(ev)  # platform time limit
        sid = threads.session_for(ev.thread)
        stream = core.run_turn(sid, ev.text)
        msg = chat.post(ev.channel, '...')
        for e in stream.coalesce(ms=800):
            msg.edit(render(e))
```

## Be careful

Backends may start to copy agent logic, such as permission checks. Then the surfaces drift apart. Keep policy in the core, and keep only display work in each backend.

## Diagram

![Fig. 8.10: Each surface gets a backend shaped for it, and all of them share one core.](/diagrams/backends-for-frontends.svg)
