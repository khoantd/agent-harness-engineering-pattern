---
id: money
number: "3.18"
title: Money
chapter: llm-layer
fit: direct
review_id: rev-money
figure_number: Fig. 3.18
figure_caption: "Counts become typed tokens, then typed money, before anything is added up."
diagram: money.svg
analogy_title: The bureau de change counter
---
## Gist

Store tokens and cost as typed amounts with a unit or currency, so sums, budgets and reports cannot mix numbers that do not match.

## Everyday comparison

### The bureau de change counter

At a currency exchange desk, nobody writes down just '100'. It is always 100 euros or 100 yen. The clerk will not add the two without looking up today's rate first. Rounding happens once, at the end, to the smallest coin of the currency being paid out.

## Classic meaning

The Money pattern models an amount of money as a value object (a small object defined only by its values). It combines a quantity and a currency. Its arithmetic enforces currency rules and correct rounding.

## In the agent system

Each response has a usage block with four counts. input_tokens is only the uncached part of the prompt. cache_creation_input_tokens counts tokens written to the prompt cache. cache_read_input_tokens counts tokens read from it. output_tokens counts what the model wrote. Each kind has its own price for each model, and cache writes are priced by TTL (how long the cache entry lives). Cached tokens are billed separately, so the cost ledger must include all four counts. As bare integers, these counts invite bugs. Code might treat input_tokens as the whole prompt, or add output tokens to input tokens. It might add a large model's tokens to a small model's as if they cost the same. So the harness uses value objects: Tokens(n, kind, model) and Money(pico, 'USD'). It converts between them through an explicit, versioned price table. It does arithmetic in whole-number units small enough to price one cached token exactly. These are pico-dollars (millionths of a millionth of a dollar). With streaming, it takes usage from the final message_delta. Those counts are cumulative (running totals), so it does not add up every event. Budgets for a session, a subagent tree or a tenant (customer company) are Money too. So a check like spent + estimate > budget is type-safe (the types stop mistakes).

## In a large company

In an enterprise platform, the Money value object supports per-tenant budgets, chargeback to cost centres (billing costs back to each team) and invoices. So the price table is versioned and has effective dates. Every ledger entry records the model, the usage fields, the price version and the tenant. A daily job reconciles (compares and matches) the ledger against the provider's usage and cost reports. The gateway enforces budget alerts and hard stops before a call, not only in reports after it. Currency conversion, where needed, happens once at billing with a recorded rate. It never happens inside per-call arithmetic.

## Step by step

1. Read the usage block from each model response.
1. Wrap each count as Tokens with its kind and model.
1. Convert to Money using the price table for that model and kind.
1. Add it to the session ledger and compare against the Money budget.

## Code sketch

```python
@dataclass(frozen=True)
class Money:
    pico: int; cur: str = 'USD'  # 1e-12
    def __add__(s, o):
        assert o.cur == s.cur
        return Money(s.pico + o.pico, s.cur)
def cost(u, model):
    p = PRICES[model]   # pico-USD per token
    n = (u.input_tokens * p.inp
       + u.cache_creation_input_tokens * p.wr
       + u.cache_read_input_tokens * p.rd
       + u.output_tokens * p.out)
    return Money(n)     # exact, round later
```

## Be careful

Floating-point dollars (decimals that computers store inexactly) drift after millions of tiny per-call charges. Store whole-number units smaller than a millionth of a dollar, and round only when displaying or invoicing.

## Diagram

![Fig. 3.18: Counts become typed tokens, then typed money, before anything is added up.](/diagrams/money.svg)
