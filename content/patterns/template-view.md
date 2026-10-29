---
id: template-view
number: "10.11"
title: Template View
chapter: frontend
fit: direct
review_id: rev-template-view
figure_number: Fig. 10.11
figure_caption: The layout lives in the template. Each block only supplies values for its gaps.
diagram: template-view.svg
analogy_title: The wedding invitation print shop
---
## Gist

Draw tool cards and status lines from page templates with blanks, filled from the content block's fields when shown.

## Everyday comparison

### The wedding invitation print shop

The print shop keeps a few card designs with gaps in the wording. The gaps are for the couple's names, the date and the place. When a new order arrives, the clerk types the details into the gaps and runs the press. Hundreds of couples get cards in the same layout. Change the font on one design, and every future order that uses it changes too.

## Classic meaning

A template view makes a web page from a fixed page template with markers in it. When the page is made, each marker is replaced with a worked-out value.

## In the agent system

Each content block type (kind of piece in a message) has a template file. tool_card.html shows the tool name, a summary of its input, a status badge and a result you can fold up. approval.html shows the command, the reason, and Allow and Deny buttons. The renderer (the code that draws the screen) picks the template by block type. It fills the placeholders from the fields of the tool_use (the model's request to run a tool) and the tool_result (the tool's answer). It escapes every value, which means special characters are made harmless. So model output cannot inject markup (sneak page code into the screen). Designers change the layout in templates. They do not touch the code that handles the event stream.

## In a large company

Model output and tool results are untrusted input. So enterprise apps use a template engine that escapes values automatically (autoescaping). They also use a strict Content Security Policy, a browser rule that limits which scripts may run. Any markdown (formatted text) shown on screen also goes through an HTML sanitiser such as DOMPurify, which strips dangerous page code. White-labelled setups (sold under each customer's own brand) often give each tenant its own template theme. A tenant is one customer company sharing the platform. This keeps branding out of code. Security review treats any raw or unescaped filter in a template as a finding. Otherwise a tool result with prompt injection (hidden instructions planted in content) could run script in an approver's browser.

## Step by step

1. A content block arrives, such as a finished tool_use with its result.
1. The renderer picks the template for that block type.
1. It fills each placeholder from the block's fields, escaping the values.
1. The filled-in page code is added to the transcript.

## Code sketch

```python
# tool_card.html (autoescape on)
# <div class='tool'>{{ name }}: {{ status }}
#   <pre>{{ result | truncate(400) }}</pre>
# </div>

tpl = templates.get('tool_card.html')
# the engine escapes every placeholder
html = tpl.render(name=block.name,
                  status=result.status,
                  result=result.text)
```

## Be careful

Templates that call services or follow business rules become hidden code. Keep them to placeholders and simple loops. Put formatting in helpers.

## Diagram

![Fig. 10.11: The layout lives in the template. Each block only supplies values for its gaps.](/diagrams/template-view.svg)
