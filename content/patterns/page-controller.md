---
id: page-controller
number: "10.09"
title: Page Controller
chapter: frontend
fit: adapted
review_id: rev-page-controller
figure_number: Fig. 10.09
figure_caption: Each route has its own controller and view. The router only links paths to controllers.
diagram: page-controller.svg
analogy_title: "Stalls at a farmers' market"
---
## Gist

Give each screen of the harness app, such as sessions, chat and settings, its own controller that handles its route.

## Everyday comparison

### Stalls at a farmers' market

There is no central till at a farmers' market. The cheese stall has its own seller who cuts, weighs and wraps cheese. The baker at the next stall handles bread. A shopper walks to the stall for what they want. A new honey stall can open on Saturday, and the others change nothing.

## Classic meaning

A page controller handles the requests for one page or action on a web site. There is one controller for each page.

## In the agent system

The app's router links each path (web address) to one controller. /sessions goes to a SessionsController. It loads the list of sessions and handles rename and delete. /chat/:id goes to a ChatController. It opens the event stream and handles send and stop. /settings goes to a SettingsController. It reads and saves permission modes and MCP server settings (MCP is a standard way to connect tools to an AI model). The router only links a path to a controller and does no shared work. So each controller owns its own page's data loading and actions. Adding a usage page means one new route and one new controller. The others need no edits.

## In a large company

Agent platforms have admin consoles for tenants, policies, MCP server allowlists (lists of approved servers), audit search and usage. A tenant is one customer company sharing the platform. These consoles are often built page by page. The team behind each backend owns its page. Each controller must limit every query to the right tenant and check the caller's role. Page controllers share no gate unless one is added. A common safeguard is a base controller or middleware (code that runs before every handler). It enforces the SSO session (single sign-on), RBAC (role-based access control: permissions given by job role) and audit logging. Then a new page cannot skip them.

## Step by step

1. The router matches the web address to one page controller.
1. That controller loads the data its page needs.
1. It draws its own view and handles that page's actions.
1. Other pages and their controllers stay untouched.

## Code sketch

```python
class SessionsController:
    def get(self, req):
        rows = store.list_sessions(req.user)
        return view('sessions', rows=rows)
    def post_rename(self, req):
        s = store.get(req.id, owner=req.user)
        s.rename(req.title)

router.add('/sessions', SessionsController)
router.add('/chat/:id', ChatController)
router.add('/settings', SettingsController)
```

## Be careful

Shared steps, such as checking login and loading the user, get copied into every controller. Move them into a base class (shared parent code), or put a front controller in front.

## Diagram

![Fig. 10.09: Each route has its own controller and view. The router only links paths to controllers.](/diagrams/page-controller.svg)
