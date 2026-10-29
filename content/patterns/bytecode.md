---
id: bytecode
number: "2.25"
title: Bytecode
chapter: tool-system
fit: adapted
review_id: rev-bytecode
figure_number: Fig. 2.25
figure_caption: "The model writes data, and only the VM's fixed opcodes ever touch the world"
diagram: bytecode.svg
analogy_title: The player piano roll
---
## Gist

The model writes a short program in a limited action language. A small harness VM checks it, then runs it step by step.

## Everyday comparison

### The player piano roll

A player piano reads a paper roll with holes punched in it. Each hole can mean only one thing: press this key, or hold this pedal. Anyone can punch a new roll and the piano will play it. But no roll, however strange, can make the piano do anything except play notes.

## Classic meaning

You write behaviour as instructions for a small virtual machine (a program that runs other programs). Behaviour can then be stored as data and run safely within fixed limits.

## In the agent system

The harness does not give the model a general shell. Instead it defines a tiny action language for browsing: OPEN url, FIND selector, CLICK ref, TYPE ref text, EXTRACT field. Each of these commands is an opcode. The model writes a short program as a JSON list of instructions inside one tool_use (its request to run a tool). A harness VM (a small virtual machine) checks the program before it runs. It allows only known opcodes and correct argument types. It allows at most 50 steps and only approved domains (websites). Then it runs the program with a program counter (which tracks the current step) and a step budget. The instruction set has no opcode for running any code or touching files. The VM also checks the website again at every page change. So a program can do only what those opcodes allow, and only on approved sites. That still includes submitting forms. So CLICK and TYPE on pages with side effects need an approval step or a read-only session. The program is fixed before any page is read. So text hidden in a page (a prompt injection) cannot add steps. And putting ten steps into one program saves nine round trips to the model.

## In a large company

Company platforms use limited action languages for browser and RPA automation (robotic process automation: software that clicks through apps like a person). Each opcode maps to an approved, audited capability. The checker runs as policy as code (rules written as code) before anything runs. The list of approved domains must be enforced while the program runs, not only on the program text. This is done through an egress proxy (a gateway for all outgoing traffic) or a browser network policy. Login credentials for the session should cover only this task. Each program and its trace go to the audit log. Opcodes with side effects on systems of record (the official business systems) need human approval under the platform's change rules.

## Step by step

1. The tool schema describes the opcodes and their arguments to the model.
1. The model returns a program: an ordered list of instructions.
1. The checker rejects unknown opcodes, bad arguments, unapproved websites, or programs over the step limit.
1. The VM runs one instruction at a time, stops at the first failure and returns a trace.

## Code sketch

```python
OPS = {'OPEN': op_open, 'CLICK': op_click,
       'TYPE': op_type, 'EXTRACT': op_extract}

def run(program, limit=50):
    verify(program, OPS, limit)   # first
    trace = []
    for pc, ins in enumerate(program):
        out = OPS[ins['op']](*ins['args'])
        trace.append((pc, ins['op'], out))
        if out.failed: break
    return trace
```

## Be careful

Every opcode you add widens what a model, or a prompt injection, can make the VM do. An EVAL or SHELL opcode turns the design back into running any code at all.

## Diagram

![Fig. 2.25: The model writes data, and only the VM's fixed opcodes ever touch the world](/diagrams/bytecode.svg)
