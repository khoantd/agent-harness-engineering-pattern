---
id: special-case
number: "2.21"
title: Special Case
chapter: tool-system
fit: direct
figure_number: Fig. 2.21
figure_caption: An empty search returns a real object that can explain itself
diagram: special-case.svg
analogy_title: The no-receipt returns policy
---
## Gist

For expected odd outcomes, like no matches or file not found, return a special result object that knows how to behave.

## Everyday comparison

### The no-receipt returns policy

At a department store returns desk, a customer with no receipt is not turned away or treated as a mistake. The till has a set no-receipt path: store credit at the lowest recent price, with a note on the account. The clerk presses the same Refund button. The special case already knows what a refund means for it.

## Classic meaning

A subclass gives special behaviour for one particular case, such as an unknown customer. Callers then need no extra checks for that case.

## In the agent system

Search and lookup tools hit dead ends you can predict. grep finds nothing, a path does not exist, or a ticket ID is unknown. The tool does not return None or raise an error (throw an exception). Instead it returns a special case object such as NoMatches or MissingFile. That object has the same ToolResult interface as any other result. Its to_block() method makes a useful tool_result (the message that gives the model the tool's answer). For example: 'No matches for retry_cfg in 412 files. Try a broader pattern.' It keeps is_error false, because an empty search is a valid answer. It costs only a few tokens. The executor, the transcript and the renderer treat it like any other result.

## In a large company

On a company platform, special case results also cover access outcomes. Take a search over a document store that is filtered by what the user is allowed to see. It may return a NoAccessibleResults object. This tells the model that nothing was visible to this user. It does not reveal that restricted matches exist. Keeping is_error false for valid empty answers keeps error-rate SLO dashboards and alerts honest. (An SLO is a reliability target.) Real failures then stay easy to tell apart. Special case messages should be fixed templates, not copies of the raw input. That way they cannot leak data across tenants (customer companies sharing the platform). Nor can they carry injected text into the context.

## Step by step

1. A lookup tool runs and finds nothing, or hits another expected odd case.
1. Instead of None or an exception, it returns a special case result object.
1. The executor calls to_block() on it, just as it would for real results.
1. The model gets a short message with a suggested next step.

## Code sketch

```python
class NoMatches(SearchResult):
    def __init__(self, pat, n):
        self.pat, self.n = pat, n
    def to_block(self):
        return text(
            f'No matches for {self.pat} in '
            f'{self.n} files. Try a broader '
            'pattern or check the spelling.')

hits = index.search(q)
return Hits(hits) if hits else NoMatches(q, n)
```

## Be careful

Use special cases only for expected situations. A disk error or a permission failure is a real error. Show it as one. Do not dress it up as 'no results'.

## Diagram

![Fig. 2.21: An empty search returns a real object that can explain itself](/diagrams/special-case.svg)
