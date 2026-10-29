---
id: mute-idiom
number: "13.02"
title: Mute Idiom
chapter: idioms
fit: direct
figure_number: Fig. 13.02
figure_caption: "One named, harmless error is ignored. Everything else still shows up."
diagram: mute-idiom.svg
analogy_title: Packing up the campsite
---
## Gist

Catch and ignore one specific, expected, harmless error, such as a failed best-effort cleanup, and explain why in the code.

## Everyday comparison

### Packing up the campsite

On the last morning, you walk around your pitch collecting tent pegs. If one is missing because a friend already pulled it, you shrug and keep packing. Nobody files a report. You do not shrug if the stove is still burning. You ignore exactly one kind of surprise, and only because you know it does not matter.

## Classic meaning

The mute idiom deliberately ignores one known, unimportant exception (an error the program raises) in a small block of code. The code also notes why it is safe to ignore.

## In the agent system

At the end of a run, the harness deletes a temporary sandbox folder or scratch file. A tool may already have removed it, so FileNotFoundError is expected there. Some other actions are best-effort (nice to have, but not required). One is sending a final 'done' event to a chat client that has already disconnected. Another is writing an optional usage metric. The harness wraps just that call in a narrow handler for the one exception type. It adds a comment explaining why, and it may log the error at debug level. Every other error still propagates (passes up to the caller). Examples are a permission error or a failed transcript write.

## In a large company

In an enterprise platform, muted exceptions are still counted, usually as a debug log line plus a metric. So if a cleanup failure becomes frequent, someone notices. They catch it before it fills disks or leaves orphaned sandboxes (sandboxes that nobody owns). Writes that feed the audit trail, billing ledger, or retention and deletion jobs are never muted. A silent failure there becomes a compliance gap (a break in legal or policy rules). Static analysis rules (automatic code checks) that flag bare except blocks are a common part of the code-review gate.

## Step by step

1. Find a call whose failure does not change the outcome of the run.
1. Name the exact exception type that is expected there.
1. Catch only that type around only that call, with a comment.
1. Let every other exception pass up as normal.

## Code sketch

```python
from contextlib import suppress

def cleanup(run):
    # the bash tool may have removed it
    with suppress(FileNotFoundError):
        shutil.rmtree(run.scratch_dir)
    # the client may already be gone
    with suppress(ConnectionClosed):
        run.ui.send({'type': 'done'})
    run.transcript.flush()   # never muted
```

## Be careful

A bare except: pass (code that catches every error and does nothing) around a tool run hides real failures from the model and the user. Mute one named exception around one line, never a whole block.

## Diagram

![Fig. 13.02: One named, harmless error is ignored. Everything else still shows up.](/diagrams/mute-idiom.svg)
