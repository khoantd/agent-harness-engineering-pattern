---
id: double-buffer
number: "6.17"
title: Double Buffer
chapter: async
fit: adapted
figure_number: Fig. 6.17
figure_caption: "Writers fill the back buffer, readers see only the front, and a swap exchanges them."
diagram: double-buffer.svg
analogy_title: "The lecture hall's sliding boards"
---
## Gist

Keep two buffers: the UI shows the finished one while the stream fills the other, then they swap in one step.

## Everyday comparison

### The lecture hall's sliding boards

A lecture hall has two chalkboards on rails. The lecturer writes the next proof on the back board. Meanwhile students copy the finished one at the front. When the proof is complete, the boards slide past each other in one motion. Students never see half-written lines. The lecturer never waits for slow copiers.

## Classic meaning

Readers see a current buffer while writers fill a next buffer. The two swap atomically, in one step, so readers never see a half-done state.

## In the agent system

The model streams its reply as token deltas (small pieces of new text). Pushing each one straight into the chat DOM causes flicker and broken markdown. The DOM is the page structure the browser draws. You might see half a code fence, or a table missing its last row. So a harness frontend keeps two buffers. The back buffer collects deltas and re-reads the markdown. The front buffer is the one the renderer paints. On each animation frame, the code checks the back buffer. If it sits at a safe boundary, such as the end of a block, the two references swap. The same idea works on the server for artifacts. Write the new version to a temp file. Then atomically rename it over the live one.

## In a large company

Enterprise chat clients can use the safe-boundary buffer as a checkpoint. There, streamed output passes DLP and secret scanning before it is painted. DLP (data loss prevention) is tooling that stops sensitive data from leaking. This matters because text already on screen cannot be taken back. The same swap-a-reference idea appears on the server when new versions are published. This covers policy bundles, prompt configs and artifact versions. Build and check the new version completely. Switch the active pointer in one step. Keep the old one for rollback. Record which version each session used, so an audit can rebuild what a user saw.

## Step by step

1. Token deltas are added to the back buffer.
1. The renderer paints only the front buffer.
1. At a frame tick, if the back buffer is at a safe boundary, the references swap.
1. The new back buffer is brought up to date and keeps filling for the next round.

## Code sketch

```python
front, back = Doc(), Doc()

def on_delta(text):
    back.append(text)          # writer side

def on_frame():
    global front, back
    if back.at_safe_boundary():
        front, back = back, front
        back.sync_from(front)
    render(front)              # reader side
```

## Be careful

Swapping only at safe boundaries can fall behind a fast stream. Cap the delay, so a long code block still shows progress.

## Diagram

![Fig. 6.17: Writers fill the back buffer, readers see only the front, and a swap exchanges them.](/diagrams/double-buffer.svg)
