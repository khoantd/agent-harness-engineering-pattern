---
id: parameter-object
number: "2.28"
title: Parameter Object
chapter: tool-system
fit: direct
review_id: rev-parameter-object
figure_number: Fig. 2.28
figure_caption: Loose JSON is parsed once into a typed request that travels whole
diagram: parameter-object.svg
analogy_title: The photo lab order envelope
---
## Gist

Bundle a tool's many arguments into one typed request object. Check it once and pass it along whole.

## Everyday comparison

### The photo lab order envelope

At a photo lab you do not shout instructions across the counter. You fill in one envelope with print size, gloss or matte, number of copies, crop, and your name and phone. You drop the film inside. The envelope travels with the job from counter to machine to pickup shelf. Everyone who handles it reads the same fields.

## Classic meaning

Some parameters always travel together. You replace them with one object that gives the group a name, checks and default values.

## In the agent system

A run_command tool can take a command, a working folder, environment variables, a timeout, stdin (input fed to the command), a sandbox profile and an output limit. Passing seven loose arguments through the permission gate, the sandbox and the executor invites mix-ups. So the harness parses the tool_use input once into a typed ShellRequest. This is a dataclass or Pydantic model (a Python class that checks data types), built from the same JSON schema the model sees. Checks and defaults happen in one place. The gate checks req.command and req.cwd. The transcript stores the request whole. Adding a field later changes the request class, not every function along the way.

## In a large company

In a company harness, the policy engine checks the typed request, and the audit trail stores it. So it needs a stable, versioned schema shared by the gate, the sandbox and the log pipeline. Some fields the model can set change how secure the call is, such as env, cwd and timeout. These must have limits or an allowlist (a list of approved values). A PATH or LD_PRELOAD value from the model can break out of a sandbox. (These environment variables control which programs and libraries load.) Secrets never appear in the request. The executor adds them from a secrets manager after the gate has approved the call.

## Step by step

1. The model sends tool_use input as a JSON object.
1. The harness parses it into a typed request, fills in defaults and rejects bad fields.
1. The gate, sandbox and executor each get the one request object.
1. The harness logs the same object with the result, so the call can be replayed exactly.

## Code sketch

```python
class ShellRequest(BaseModel):
    model_config = ConfigDict(
        frozen=True, extra='forbid')
    command: str
    cwd: Path = Path('.')
    timeout_s: int = Field(60, le=600)
    env: dict[str, str] = {}
    max_output: int = 30_000

req = ShellRequest.model_validate(block.input)
gate.check(req)    # command, cwd, env keys
result = sandbox.run(req)
```

## Be careful

Do not let one request class turn into a grab bag shared by unrelated tools. One request type per tool keeps the schema the model sees honest.

## Diagram

![Fig. 2.28: Loose JSON is parsed once into a typed request that travels whole](/diagrams/parameter-object.svg)
