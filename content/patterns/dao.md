---
id: dao
number: "4.02"
title: DAOData Access Object
chapter: memory
fit: direct
aka: Data Access Object
figure_number: Fig. 4.02
figure_caption: "Callers see four simple actions, and SQL, pooling and encoding stay inside the DAO"
diagram: dao.svg
analogy_title: The pharmacy counter
---
## Gist

Wrap one storage system's raw API in a small object with plain append, load and delete calls for one record type.

## Everyday comparison

### The pharmacy counter

You hand a prescription across the counter. Later you collect a paper bag with your name on it. Behind the counter are drawers, a fridge and a filing system you never see. The pharmacist offers a few fixed actions: fill, collect and return. The back room can be reorganised overnight, and the counter stays the same.

## Classic meaning

A DAO is an object that gives you simple data actions for one database or storage system. It hides how the storage actually works.

## In the agent system

A TranscriptDAO gives the harness a few calls: append(session_id, message), load(session_id), list_sessions(user_id) and delete(session_id). A transcript is the saved record of a conversation. Inside the DAO sit the SQL, the connection pool (a set of open database connections it reuses) and the JSON encoding of content blocks. It also handles paging through long transcripts. The session service and the memory repository call the DAO, not the database driver. So moving transcripts from a database file on a laptop to a managed SQL server in production changes only one class.

## In a large company

Enterprise platforms usually put one DAO per record type in front of a managed database. The DAO is where encryption, tenant columns and retention rules (how long data is kept) live, so callers cannot skip them. A tenant is one customer company on the platform. A TranscriptDAO usually writes tenant_id on every row. On every read it relies on row-level security (database rules that limit which rows a user sees) or a tenant filter. It encrypts message bodies with a key per tenant from a KMS (key management service). Its delete() must truly wipe the data. That includes replicas (copies of the database) and backups, on a written schedule. A GDPR erasure request (a legal request to delete personal data) depends on that call in the end.

## Step by step

1. The session service calls dao.append(sid, message) after each turn.
1. The DAO turns the content blocks into JSON and runs an INSERT using its pool.
1. When a session resumes, dao.load(sid) reads the rows in order.
1. The DAO turns each row back into a Message and returns the list.

## Code sketch

```python
class TranscriptDAO:
    def __init__(self, db): self.db = db
    def append(self, sid, msg):
        self.db.execute(
          'INSERT INTO turns VALUES (?,?,?)',
          (sid, msg.seq, msg.to_json()))
    def load(self, sid):
        rows = self.db.query(
          'SELECT body FROM turns WHERE sid=?'
          ' ORDER BY seq', (sid,))
        return [Message.from_json(r)
                for r in rows]
```

## Be careful

A DAO that just copies SQL one-to-one adds little. Name its methods in harness terms, such as append a turn or load a session. Give each record type its own DAO.

## Diagram

![Fig. 4.02: Callers see four simple actions, and SQL, pooling and encoding stay inside the DAO](/diagrams/dao.svg)
