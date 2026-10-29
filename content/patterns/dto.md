---
id: dto
number: "4.05"
title: DTOData Transfer Object
chapter: memory
fit: direct
aka: Data Transfer Object
review_id: rev-dto
figure_number: Fig. 4.05
figure_caption: "Only flat, versioned data crosses the process boundary"
diagram: dto.svg
analogy_title: The shipping container
---
## Gist

Send flat, versioned data objects with no behaviour between separate processes, such as the tool runner and the chat client.

## Everyday comparison

### The shipping container

A steel box of standard size moves from ship to crane to train to lorry. None of them needs to know whether it holds sofas or bananas. They only need the right shape and a list of contents on the door. Nothing inside the box does anything during the journey.

## Classic meaning

A DTO carries data between processes (separate running programs). It bundles many values into one payload that can be turned into text or bytes, so a remote call needs fewer round trips. It has no business logic of its own.

## In the agent system

Sometimes the agent loop talks to a tool runner in another process, inside a sandbox (a locked-down space for running tools). Sometimes the server streams events to the chat client. In both cases it sends DTOs: ToolRequest {call_id, name, input}, ToolResult {call_id, content, is_error} and StreamEvent {type, delta}. They are frozen dataclasses, which means they cannot change after they are made. They turn into JSON and carry a schema version number. Live objects such as a Session or a ToolCommand hold open files and methods. Those never cross the wire. At the boundary, the harness copies only the needed fields into a DTO.

## In a large company

In an enterprise harness, DTOs sit exactly at trust boundaries (points where data moves between parts that trust each other differently). So that is where checks run before data reaches the tool sandbox, the model provider or the browser. These checks are schema validation, size limits and DLP or PII redaction. DLP is data loss prevention. PII redaction removes personal data such as names and emails. Define DTOs in a shared schema such as JSON Schema or Protobuf, with explicit versions. Check them for compatibility in CI (the automated build and test pipeline), because the runner and the loop are deployed separately. Credentials and access tokens must never be DTO fields that could be copied into the model's context. The runner should get them itself through workload identity (the platform proving which service is asking).

## Step by step

1. The loop copies the fields of a tool_use block (the model's request to run a tool) into a ToolRequest.
1. The loop turns the request into JSON and sends it to the tool runner.
1. The runner rebuilds the DTO, runs the tool and replies with a ToolResult.
1. The loop turns the ToolResult into a tool_result content block for the model.

## Code sketch

```python
@dataclass(frozen=True)
class ToolRequest:
    v: int          # schema version
    call_id: str
    name: str
    input: dict

req = ToolRequest(1, b.id, b.name, b.input)
r = http.post(RUNNER, json=asdict(req))
res = ToolResult(**r.json())
```

## Be careful

Do not let DTOs grow methods or hold live handles such as open files or clients. Give them version numbers, because the two sides of the wire are updated at different times.

## Diagram

![Fig. 4.05: Only flat, versioned data crosses the process boundary](/diagrams/dto.svg)
