---
id: abstract-document
number: "2.26"
title: Abstract Document
chapter: tool-system
fit: direct
review_id: rev-abstract-document
figure_number: Fig. 2.26
figure_caption: "One document collects every property, and each reader sees it through its own view"
diagram: abstract-document.svg
analogy_title: The auction lot sheet
---
## Gist

Keep a tool call's extra details in one flexible key-value document. Small typed views read only what each part needs.

## Everyday comparison

### The auction lot sheet

Every lot at an auction house gets the same kind of sheet, but the fields vary. A painting has artist and size. A ring has carat and metal. A car has mileage. The shipper reads weight and size. The insurer reads the value. The catalogue writer reads the item's history. Each reads its own fields from the one sheet.

## Classic meaning

You store an object's properties in a map (a list of key-value pairs). Small typed interfaces, called traits, read them. New properties then need no change to the schema.

## In the agent system

A tool call collects metadata (details about the call) from many places. Some comes from the model's input, and some from MCP annotations. Some comes from harness settings, such as timeout and cost class. Some comes from UI hints, such as an icon and display title. Audit fields such as approved_by and duration_ms are added along the way. The harness does not use one class with dozens of optional attributes. Instead it keeps them all in a single dict-backed document (built on a key-value dictionary) with nested child documents. The model's arguments always sit in their own input child. So they cannot shadow (hide or replace) a harness key. Small typed views, such as HasTimeout, HasApproval and HasDisplay, give each part simple ways to read the same dict. So the executor, the permission gate and the tool card renderer each read only what they understand. Only the part that owns a trust-bearing key may write it. approved_by is one such key. Unknown keys from a newer MCP server pass through to the transcript untouched.

## In a large company

Company platforms keep a call envelope like this because tool calls collect metadata from many owners. Examples are tenant and user identity from the OIDC token (a login token from the company's identity system), policy decisions and data classification labels. Others are cost tracking and audit fields. Each namespace (group of keys) in the document should have one writer. Only the harness should set identity and approval fields, from verified sources. It must never read them from the model's output. Before the document goes into the transcript, PII redaction and retention rules apply. (PII redaction removes personal data such as names and emails.) This matters because keys passed through from third-party servers may carry data the platform has not classified.

## Step by step

1. The harness builds a call document from the definition's metadata. It puts the tool_use input under its own input key.
1. Parts add properties as the call moves along, each writing only the keys it owns.
1. Each part reads through its own typed view of the document.
1. The whole document goes into the transcript, including keys that no view knows about.

## Code sketch

```python
class Document(dict):
    def child(self, k):
        return Document(self.get(k, {}))

class HasTimeout(Document):
    def timeout(self):
        return self.get('timeout_s', 30)

class HasApproval(Document):
    def approver(self):
        return self.get('approved_by')

class CallDoc(HasTimeout, HasApproval): pass
```

## Be careful

A bag with no schema lets typos such as 'timout_s' fail without any error. Give each view a table of defaults. Log any key that no view ever reads.

## Diagram

![Fig. 2.26: One document collects every property, and each reader sees it through its own view](/diagrams/abstract-document.svg)
