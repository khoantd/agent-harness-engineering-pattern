---
id: arrange-act-assert
number: "12.01"
title: Arrange/Act/Assert
chapter: testing
fit: direct
review_id: rev-arrange-act-assert
figure_number: Fig. 12.01
figure_caption: "Setup, one run, then checks: each phase stays in its own box."
diagram: arrange-act-assert.svg
analogy_title: The car crash test
---
## Gist

Build each eval case in three steps: set up a sample conversation and fakes, run the agent, then check the transcript.

## Everyday comparison

### The car crash test

Engineers seat a dummy, strap it in, fit the sensors and set the speed. Then one thing happens: the car hits the barrier. Afterwards, they compare the sensor readings and the high-speed film with fixed limits. Nobody adjusts the dummy halfway through the crash. Each run tests one kind of impact.

## Classic meaning

Each test has three parts. Arrange sets up the starting state. Act does one thing to exercise the behaviour. Assert checks the outcome.

## In the agent system

An eval case is one test of how the agent behaves. Its arrange step sets up a starting conversation: a system prompt (standing instructions), earlier turns and a user request. It also sets up a sandbox (a walled-off workspace) with files already in it, and stubbed or recorded tools (fake tools with set answers). The act is one call: run the agent until end_turn or a turn cap (a maximum number of turns). The asserts then inspect the transcript and side effects (changes to the outside world). Fixed checks come first. Was edit_file called on the right path? Did any tool run without approval? Do the tests pass now? Then a model-graded rubric score (an AI judge scoring against a checklist) must reach a threshold. Runs vary from one to the next. So the suite repeats each case several times. It gates on the pass rate compared with the last release. Each trial still has a single act, so failures are easy to trace.

## In a large company

Enterprise eval suites keep their test cases in a versioned golden dataset (an official, tracked set of examples). Fixed cases run against recorded tool answers on every pull request (proposed code change). Cases that use the live model run several trials each. They run on a schedule and before any change of model or prompt. Regression gates in CI (automatic checks that block a change that makes things worse) compare pass rates and rubric scores with the last released baseline. A significant drop blocks the merge. Model-graded checks use a pinned judge model (a fixed version that does not change). Its rubric is calibrated against human labels. So a change of judge cannot quietly move the gate.

## Step by step

1. Arrange: load the sample conversation, fill the sandbox and register the fake tools.
1. Act: run the agent once, until it stops or hits the turn cap.
1. Assert: check tool calls, file changes and the final text in the transcript.
1. Record pass or fail, with the transcript attached for review.

## Code sketch

```python
def test_fixes_failing_test():
    # arrange
    convo = fixtures.load('bug_report.json')
    box = Sandbox(files='repo_snapshot/')
    # act
    t = agent.run(convo, box, max_turns=20)
    # assert: deterministic checks first
    assert t.called('edit_file', 'calc.py')
    assert box.run('pytest').ok
    # then a model-graded rubric score
    assert judge(t, 'explains the fix') >= 4
```

## Be careful

Checking for exact wording makes evals flaky (they pass and fail at random), because model output varies. Check tool calls, side effects and rubric scores instead.

## Diagram

![Fig. 12.01: Setup, one run, then checks: each phase stays in its own box.](/diagrams/arrange-act-assert.svg)
