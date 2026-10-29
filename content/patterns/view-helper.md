---
id: view-helper
number: "10.12"
title: View Helper
chapter: frontend
fit: direct
figure_number: Fig. 10.12
figure_caption: "Views keep only layout. Every formatting rule lives once, in a shared helper."
diagram: view-helper.svg
analogy_title: "The library's date stamp and label maker"
---
## Gist

Move markdown display, code colouring and number formatting out of views into small helpers that every view calls.

## Everyday comparison

### The library's date stamp and label maker

The librarian at the desk does not hand-write due dates or spine labels. She presses the date stamp, which always prints the date in the same style. She uses the label maker, which prints shelf numbers in the library's format. Every branch has the same two tools. So a book stamped anywhere looks the same.

## Classic meaning

Formatting logic lives in helper objects, so views stay focused on layout. Many views can reuse the same logic.

## In the agent system

Message views, tool cards and the usage meter all need the same formatting. Markdown (formatted text) must become safe HTML. Code blocks need colouring by language. 12345 tokens (small pieces of text the model reads and writes) show as 12.3k. Cost shows as $0.04. Timestamps show as 2m ago. Long file paths get shortened. All this lives in helpers such as md(), highlight(), fmt_tokens() and rel_time(). Views call them and stay as plain layout. A change to how token counts look is made once.

## In a large company

Shared helpers hold the company's display rules. They format numbers and currency for each country, for chargeback figures (billing each team for its usage). They show timestamps in the user's time zone. They also mask secrets or PII (personal data such as names and emails) in tool output. With masking in one helper, it is easy to test and audit. But masking in the browser is only cosmetic. Sensitive values should already be removed on the server. The markdown helper must sanitise HTML (strip dangerous page code). Model output and tool results can carry injected page code.

## Step by step

1. A view receives a message or usage record to show.
1. It calls a helper for each formatted piece, instead of formatting inside the view.
1. Helpers return safe strings or page pieces, ready to show.
1. The view places them into its layout.

## Code sketch

```python
def fmt_tokens(n):
    if n < 1000:
        return str(n)
    return f'{n / 1000:.1f}k'

# inside the usage meter view
label = f'{fmt_tokens(u.input)} in, '
label += f'{fmt_tokens(u.output)} out'
body = md(msg.text, highlight=highlight)
```

## Be careful

Helpers that fetch data, such as prices over the network, slow down every redraw. Pass the data in, and keep helpers pure (no side effects, same output for the same input).

## Diagram

![Fig. 10.12: Views keep only layout. Every formatting rule lives once, in a shared helper.](/diagrams/view-helper.svg)
