---
id: business-delegate
number: "8.17"
title: Business Delegate
chapter: architecture
fit: direct
review_id: rev-business-delegate
figure_number: Fig. 8.17
figure_caption: "App code makes one local call. The delegate handles lookup, retries and error shapes."
diagram: business-delegate.svg
analogy_title: The wedding planner
---
## Gist

Give app code a local client that hides how the remote harness is found, called and retried, and how it fails.

## Everyday comparison

### The wedding planner

The couple says: book us a venue for June. The planner knows which venues to call. The planner redials when the line is busy and tries the second choice when the first is full. Then the planner comes back with a simple answer: booked, with a date and a deposit. The couple never learns any venue's booking system or its jargon.

## Classic meaning

An object on the client side that hides the details of finding and calling remote business services. It also handles retries and turns errors into simpler ones.

## In the agent system

App code that wants an agent to do some work calls TaskClient.run(prompt). The delegate does the rest. It picks which regional endpoint (server address) to use and attaches credentials. It opens the session. It retries 429 and 529 replies ("too many requests" and "overloaded") with backoff (waiting longer each time). It honours the Retry-After header and resends the same idempotency key. (That key makes a repeated request safe to run twice.) If the event stream drops, it resumes from the last event id. It turns network errors into a few business errors, such as TaskRejected or TaskTimedOut. The calling code stays the same when the harness moves regions or switches from REST to WebSocket.

## In a large company

Large companies ship business delegates as internal client libraries. Business apps use them to call the agent platform. The library handles SSO (single sign-on) token exchange, mTLS (both sides prove identity with certificates) and tenant headers inside. (A tenant is one customer company.) Endpoint lookup must respect data residency (keeping data in a certain region). So an EU tenant's delegate only finds EU endpoints. It never switches to another region unless a policy allows it. The delegate should pass along W3C trace context, a standard tracking header. Then the calling app and the harness appear in one OpenTelemetry trace (a record of one request across services). The risk is many client apps retrying at once and making an overload worse. So retries need jitter (random delay), a budget and respect for Retry-After.

## Step by step

1. The app calls a plain method on the delegate, such as run(prompt).
1. The delegate looks up the endpoint and logs in.
1. It makes the remote calls and retries short-lived failures with backoff.
1. It returns a business result, or raises one of a few business errors.

## Code sketch

```python
class TaskClient:
    def run(self, p):
        url = self.lookup.endpoint('agents')
        key = new_idempotency_key()
        for wait in backoff(tries=4):
            try:
                return self._post(url, p, key)
            except Overloaded as e:
                sleep(e.retry_after or wait)
        raise TaskUnavailable(p[:40])
```

## Be careful

A delegate might retry a call that is not idempotent (not safe to run twice), such as starting a session that sends email. Then the side effect can happen twice. Send an idempotency key with every retry.

## Diagram

![Fig. 8.17: App code makes one local call. The delegate handles lookup, retries and error shapes.](/diagrams/business-delegate.svg)
