---
id: interpreter
number: "1.06"
title: Interpreter
chapter: agent-loop
fit: direct
review_id: rev-interpreter
figure_number: Fig. 1.06
figure_caption: "Text becomes a tree of nodes, and each node knows how to run itself."
diagram: interpreter.svg
analogy_title: The knitting pattern
---
## Gist

Read the model's structured output as action objects from a small grammar (a set of language rules), then run them on the workspace.

## Everyday comparison

### The knitting pattern

A knitting pattern reads like code: "k2, p2, repeat to end", then "row 3: k all". Here k means knit and p means purl. The knitter does not make things up. They read each short code, turn it into a stitch, and follow the repeats and row instructions as rules. A tiny language with a few words produces a whole jumper.

## Classic meaning

Define the rules (the grammar) of a simple language, and store each sentence as a tree of expression objects. Run the tree by calling interpret on each node.

## In the agent system

Some harnesses let the model answer in a compact action language instead of one tool call per step. Examples are an edit block format, or a plan DSL with steps like edit, run and if_fail. A DSL (domain-specific language) is a small language made for one job. The harness parses (reads and breaks down) that text into a tree of expression nodes: Seq, Edit, Run and OnFail. Each node has an interpret(ctx) method that does its part of the work on the workspace (the project files). It goes through the same permission checks and sandbox as an ordinary tool call. A sandbox is a locked-down area where code runs safely. Sometimes the program arrives inside a tool_use input (the model's request to run a tool). Then parse errors go back as an error tool_result (the tool's answer, marked as an error), so the model can fix its syntax. Other times the program arrives as plain text from the model. Then errors go back in the next user message, because a tool_result needs a matching tool_use id.

## In a large company

Enterprise platforms meet Interpreter in workflow DSLs (small languages for describing workflows) and structured edit formats. They also meet it in policy languages such as Rego and Cedar, which are themselves small interpreted languages for access rules. When the model writes the program, treat that program as untrusted input. Each node must run under the caller's identity, inside the sandbox, and through the same policy checks as a direct tool call. Grammar versions should be pinned (fixed to a known version) and covered by eval suites (sets of automated tests of model behaviour). Then a model upgrade that changes the output syntax fails a regression test gate. It does not break live production traffic.

## Step by step

1. The model returns text in the agreed action syntax.
1. A parser turns the text into a tree of expression objects.
1. The harness calls interpret(ctx) on the root node (the top of the tree).
1. Each node acts on the workspace and passes results to its child or parent nodes.

## Code sketch

```python
class Seq(Expr):
    def interpret(self, ctx):
        return [s.interpret(ctx)
                for s in self.steps]

class Edit(Expr):
    def interpret(self, ctx):
        return ctx.fs.patch(self.path,
                            self.diff)

tree = parse(model_text)  # Seq([Edit, Run])
results = tree.interpret(ctx)
```

## Be careful

Keep the grammar tiny. Once it needs variables and loops, you are building a programming language, and a real language in a sandbox is safer.

## Diagram

![Fig. 1.06: Text becomes a tree of nodes, and each node knows how to run itself.](/diagrams/interpreter.svg)
