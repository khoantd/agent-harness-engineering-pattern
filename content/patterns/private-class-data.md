---
id: private-class-data
number: "7.10"
title: Private Class Data
chapter: safety
fit: adapted
review_id: rev-private-class-data
figure_number: Fig. 7.10
figure_caption: Each outer ring can use the secret only through the narrow door of the ring inside it.
diagram: private-class-data.svg
analogy_title: "The embassy's official seal"
---
## Gist

Seal credentials in an inner object that tool code can use through one method but never read, print or pass to the model.

## Everyday comparison

### The embassy's official seal

A consular clerk stamps visas with the embassy seal all day. The seal lives in a locked drawer under the counter. The clerk can press it onto a page. But the clerk cannot hand it to an applicant, copy it or take it home. Applicants leave with a stamped visa and never see the seal itself.

## Classic meaning

A class's sensitive fields move into a separate data class. It has no getters or setters (methods that read or change fields), which limits who can read or change them.

## In the agent system

An HTTP tool needs an API token. But the model, the transcript and the tool's own plugin code should never see it. So the harness puts the secret in a private credential holder, built from the vault. A vault is a secure store for secrets. The holder has no getter and no setter. Its __repr__, the text Python prints for an object, hides the secret. The holder offers one operation, sign(request). It adds the auth header just before the request leaves. The token is short-lived and scoped to the session's user. It is not a long-lived key loaded once at startup. Every tool result is scrubbed (cleaned) for the secret's exact value. It is also scrubbed for anything that looks like a credential. This covers headers and body alike. An endpoint that echoes its request can put the token anywhere in the reply.

## In a large company

Enterprise platforms keep secrets out of the harness process wherever they can. An egress proxy (a gate for outgoing traffic) or a credential broker sits outside the sandbox. It adds short-lived tokens from Vault or a workload identity, an identity given to the running software. So neither the model nor tool code ever holds them. Tokens are scoped to the user and tenant (customer company) the agent acts for. This is often done through OAuth token exchange, which swaps one token for a narrower one. Every use is logged against that principal, the user or service acting. Scanning for known secret values and credential patterns runs on every tool_result and log line. It is a backstop, with an alert on any hit.

## Step by step

1. Fetch a short-lived, scoped token from the vault into a private holder.
1. Offer only an operation such as sign(request), never the raw value.
1. Tool code builds requests and asks the holder to sign them.
1. Results sent to the model are scrubbed for the secret's value and credential patterns anywhere in the reply.

## Code sketch

```python
class _Creds:                   # private data
    __slots__ = ('_tok',)
    def __init__(self, tok): self._tok = tok
    def __repr__(self): return '<creds ***>'
    def sign(self, req):
        req.headers['Authorization'] = \
            f'Bearer {self._tok}'
        return req

tool = HttpTool(signer=_Creds(vault.get()))
```

## Be careful

Python cannot truly hide attributes, so treat this as defence in depth, one layer among several. The hard boundary is a proxy outside the sandbox that adds the secret.

## Diagram

![Fig. 7.10: Each outer ring can use the secret only through the narrow door of the ring inside it.](/diagrams/private-class-data.svg)
