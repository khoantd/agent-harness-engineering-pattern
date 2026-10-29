---
id: monolithic-architecture
number: "8.05"
title: Monolithic Architecture
chapter: architecture
fit: direct
review_id: rev-monolithic-architecture
figure_number: Fig. 8.05
figure_caption: Everything shares one process. The only network trip is the call to the model.
diagram: monolithic-architecture.svg
analogy_title: The one-person food truck
---
## Gist

Run the UI server, agent loop, tool runner, scheduler and storage in one process, shipped and scaled as one unit.

## Everyday comparison

### The one-person food truck

One van holds the grill, the fridge, the till and the cook. Orders, cooking and payment all happen within arm's reach. Nothing gets lost between departments. The whole business moves to a new street corner with one turn of a key. But if the generator dies, the till, the grill and the lights all go out together.

## Classic meaning

One application that you ship as a single piece. All its modules share one process, one codebase and usually one database.

## In the agent system

Most harnesses start as one process (one running program). It holds an HTTP or command-line front end, the agent loop and a tool runner that runs shell commands. It also holds a scheduler thread for timed tasks and a SQLite file (a small database in one file) for transcripts. The parts call each other with plain function calls. So a tool result reaches the loop without being converted to text first. You can debug a whole session from one stack trace (the list of function calls at a moment). The only network trip is the call to the model API. To scale, you run more copies of the same process behind a load balancer (a router that spreads requests). That forces two changes. The SQLite file must become a shared database. The scheduler needs a lease or leader election (a way to pick one copy in charge). Then each timed task runs once, not once per copy.

## In a large company

Many large agent platforms run well as a modular monolith for a long time. They ship as one container image, with several replicas (copies) on Kubernetes behind a load balancer. Kubernetes is a system that runs and manages containers. The company controls are about isolation inside that one unit. Tool runs move to separate sandboxes, such as gVisor or Firecracker microVMs (small, tightly sealed virtual machines). Secrets come from Vault (a secret store) or workload identity, not from files. Tenant scoping is enforced in the data layer, so each tenant (customer company) sees only its own data. HA (high availability: staying up when parts fail) needs at least two replicas in different zones. It also needs a managed database and a distributed lock for schedulers. The risk is one noisy tenant using up shared CPU or database connections. So you need per-tenant limits on parallel work, even in a monolith.

## Step by step

1. One program starts the web server, the scheduler thread and the tool runner.
1. A request enters the handler, which calls the agent loop directly.
1. The loop calls the model over HTTPS and runs tools in the same process.
1. The transcript is written to a local database file as the reply streams back.

## Code sketch

```python
def main():
    db = sqlite3.connect('harness.db')
    tools = ToolRunner(workdir='/srv/work')
    loop = AgentLoop(SdkModel(), tools, db)
    start_thread(Scheduler(loop).run)
    serve(WebApp(loop), port=8080)

if __name__ == '__main__':
    main()
```

## Be careful

A tool that runs untrusted code in the same process as the session store can read every user's transcript. So run tools in a sandbox (a sealed-off space), even inside a monolith.

## Diagram

![Fig. 8.05: Everything shares one process. The only network trip is the call to the model.](/diagrams/monolithic-architecture.svg)
