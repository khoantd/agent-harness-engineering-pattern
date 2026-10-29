---
id: crtp
number: "13.03"
title: CRTPCuriously Recurring Template Pattern
chapter: idioms
fit: adapted
aka: Curiously Recurring Template Pattern
review_id: rev-crtp
figure_number: Fig. 13.03
figure_caption: "The base is told its subclass, so shared methods hand back the specific type."
diagram: crtp.svg
analogy_title: The self-addressed return envelope
---
## Gist

Give SDK base classes the concrete subclass as a type parameter, so shared chained methods return the specific builder or client type.

## Everyday comparison

### The self-addressed return envelope

A national charity mails the same appeal leaflet to every local branch. Each branch adds a return envelope printed with its own address. A donor fills in the general form and posts it back. The reply lands at that branch, ready for the branch's own follow-up.

## Classic meaning

In CRTP, a class inherits from a generic base (a template that takes a type as input), and passes itself as that type. The base can then share behaviour that returns or calls the child type. It does this without virtual dispatch (choosing the method at run time).

## In the agent system

An agent SDK has a base RequestBuilder with shared fluent methods. Fluent methods return the object, so you can chain calls one after another. Examples are with_system, with_tools and with_max_tokens. Subclasses such as ChatRequestBuilder or BatchRequestBuilder add their own methods. Suppose with_tools says it returns the base type. Then chaining .with_custom_id() after it fails type checking. The fix is to make the base generic over its subclass, written Builder[T]. This is the same shape as C++ CRTP or Java's Builder<T extends Builder<T>>. Then every shared method returns the concrete builder. Agent code can chain freely, and the type checker catches misuse. Some languages have a self type, such as typing.Self in Python or Self in Rust traits. A self type gives the same result without the type parameter.

## In a large company

In an enterprise platform, this mostly shows up in internal SDKs and request builders that many teams share. Fluent APIs with accurate types reduce misuse of request fields such as tenant ids, budgets or data-classification tags. A tenant is one customer company. Strict type checking in CI (the automatic build and test system) is the control that makes the pattern pay off. Examples are mypy or pyright for Python, and the compiler for Java or TypeScript. Keep the class tree shallow, so platform upgrades do not break other teams' builders.

## Step by step

1. Make the base builder generic in its own subclass type.
1. Shared fluent methods update state and return self, typed as that subclass.
1. Subclasses add methods for their own kind of request.
1. Callers chain base and subclass methods in any order, with full type checking.

## Code sketch

```python
T = TypeVar('T', bound='Builder')
class Builder(Generic[T]):    # CRTP base
    def with_tools(self, tools) -> T:
        self.req['tools'] = tools
        return cast(T, self)

class BatchBuilder(Builder['BatchBuilder']):
    def with_custom_id(self, cid):
        self.req['custom_id'] = cid
        return self

b = (BatchBuilder()
     .with_tools(TOOLS)       # BatchBuilder
     .with_custom_id('run-7'))  # type-checks
```

## Be careful

In Python this helps only static type checkers (tools that check types before the code runs). So prefer typing.Self where you can. Do not build deep generic class trees for one or two methods.

## Diagram

![Fig. 13.03: The base is told its subclass, so shared methods hand back the specific type.](/diagrams/crtp.svg)
