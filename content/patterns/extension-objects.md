---
id: extension-objects
number: "2.22"
title: Extension Objects
chapter: tool-system
fit: direct
figure_number: Fig. 2.22
figure_caption: The same question gets an extension from one tool and None from another
diagram: extension-objects.svg
analogy_title: "The stand mixer's attachment hub"
---
## Gist

Let harness parts ask a tool, while running, for optional extras such as streaming, undo or preview, without enlarging every tool's interface.

## Everyday comparison

### The stand mixer's attachment hub

A stand mixer has a covered port on its front. One kitchen fits a pasta roller there, another fits a mincer, and most fit nothing at all. A recipe that needs mincing first checks whether the mincer is attached. If not, it tells the cook to chop by hand. The mixer itself stays the same machine.

## Classic meaning

You add new interfaces to an object without changing its class. Clients ask for named extension objects that provide the extra behaviour.

## In the agent system

Every tool has a small core interface: name, schema and run. But some tools can do more. A shell tool can stream its output line by line. An edit tool can show a diff preview (the changes, before it applies them). It can also keep an undo record afterwards. A browser tool can return a screenshot. The harness does not add stream(), preview() and undo() to every tool. Instead it calls tool.get_extension('preview'). It gets back either an object that offers Previewable or None. The approval card shows a diff when a preview exists. If none exists, it shows the raw arguments. The streaming renderer listens only to tools that return a Streaming extension.

## In a large company

Company harnesses use optional extensions for features that only some tools support. One is a dry run or diff preview for human-in-the-loop approvals (where a person approves each action). Another is an undo record for change management. A third is a cost estimate for budget checks. The MCP protocol (a standard way to connect tools to an AI model) uses a similar idea for the whole connection. Client and server agree on capabilities during initialize, the first exchange. Sometimes an approval depends on a preview. Then the platform should save a hash (a short fingerprint) of the previewed diff with the approval in the audit trail. It should then check that the change it actually made matches that hash.

## Step by step

1. Each tool registers the extension objects it supports, under capability names.
1. A harness part asks the tool for the extension it needs.
1. If one comes back, that part uses its richer interface.
1. If not, that part falls back to the plain run() path.

## Code sketch

```python
class EditTool(Tool):
    def __init__(self):
        self.ext = {'preview': DiffPreview(),
                    'undo': EditUndo()}
    def get_extension(self, name):
        return self.ext.get(name)

pv = tool.get_extension('preview')
if pv: ui.show_diff(pv.render(args))
else:  ui.show_args(args)
```

## Be careful

If every tool ends up with the same extension, move it into the core interface. Extension lookups are for features that are truly optional.

## Diagram

![Fig. 2.22: The same question gets an extension from one tool and None from another](/diagrams/extension-objects.svg)
