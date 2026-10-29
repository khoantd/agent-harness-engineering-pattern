---
id: naked-objects
number: "10.15"
title: Naked Objects
chapter: frontend
fit: adapted
review_id: rev-naked-objects
figure_number: Fig. 10.15
figure_caption: The schema the model already uses becomes the form the user approves.
diagram: naked-objects.svg
analogy_title: The ballot printed from the register
---
## Gist

Build approval cards and input forms straight from each tool's JSON schema, so a new tool gets a working screen with no new screen code.

## Everyday comparison

### The ballot printed from the register

The election office does not design a new ballot for every race. Candidates go into the register with a name, party and area. The printing system lays out every ballot from those records, with the same boxes and rules. Add a candidate to the register, and they appear on the next print run, in the right place.

## Classic meaning

The screen is built automatically from the structure and behaviour of the business objects. So users act directly on those objects.

## In the agent system

Each tool already has an input_schema, written in JSON Schema (a standard way to describe the shape of data). It is there for the model, and the screen code reuses it. A string becomes a text field, an enum (fixed list of choices) becomes a dropdown, and a boolean (yes or no) becomes a checkbox. Required properties get a marker, and descriptions become help text. Some tool_use requests (the model's requests to run a tool) need approval. For those, the card is built from the schema and filled in with the model's input. So the user can read, edit and approve the exact arguments. Edited values are checked against the same schema before the tool runs. A tool newly listed by an MCP server gets an approval card at once. MCP is a standard way to connect tools to an AI model.

## In a large company

With approval cards built from schemas, a company can add new MCP tools without releasing new screen code. This matters when hundreds of internal tools are on the allowlist (the list of approved tools). Titles and descriptions in a third-party schema are untrusted text. So the card escapes them. Next to them it shows risk labels set by the platform's policy engine (the system that decides what is allowed). When a user edits arguments, the audit record keeps both the model's proposal and the approved input. The tool_result (the tool's answer) tells the model what actually ran.

## Step by step

1. The app fetches the tool list, with each tool's input_schema.
1. A tool_use that needs approval arrives with the model's input.
1. The generator builds one form field per schema property, filled in with the input.
1. The user edits or approves, the values are checked against the schema, and the tool runs.

## Code sketch

```python
WIDGETS = {'string': TextField,
           'integer': NumberField,
           'boolean': Checkbox}

def approval_card(tool, call):
    fields = []
    for k, spec in tool.input_schema[
            'properties'].items():
        w = Select if 'enum' in spec \
            else WIDGETS[spec['type']]
        fields.append(w(k, call.input.get(k)))
    return Card(tool.name, fields, ['Allow'])
```

## Be careful

Schema text from a third-party MCP server is untrusted. So escape it (make special characters harmless), and take risk labels from your own policy. When the user edits arguments, record both versions. Tell the model what actually ran.

## Diagram

![Fig. 10.15: The schema the model already uses becomes the form the user approves.](/diagrams/naked-objects.svg)
