# Chapter Forge — Documentation

Full usage guide for the plugin, organized so any team member can find "what do I run, and when" for their role.

## Contents

- [01-overview.md](./01-overview.md) — SDLC pipeline at a glance, principles, gates, quick start
- Phases:
  - [02-phase-discover.md](./02-phase-discover.md) — P1 Discovery & Requirements
  - [03-phase-design.md](./03-phase-design.md) — P2 Design & Architecture
  - [04-phase-plan.md](./04-phase-plan.md) — P3 Planning & Backlog
  - [05-phase-develop.md](./05-phase-develop.md) — P4 Development
  - [06-phase-test.md](./06-phase-test.md) — P5 Testing & QA
  - [07-phase-release.md](./07-phase-release.md) — P6 Release & Change Management
  - [08-phase-deploy.md](./08-phase-deploy.md) — P7 Deployment
  - [09-phase-operate.md](./09-phase-operate.md) — P8 Operations & Monitoring
- [10-guardrails.md](./10-guardrails.md) — every hook, what it blocks, how to test it
- [11-roles.md](./11-roles.md) — use cases by role: what each role runs, approves, and reviews
- [12-memory.md](./12-memory.md) — episodic/semantic/procedural project memory: schema, write/read path, `sdlc-remember`
- [settings.sample.json](./settings.sample.json) — optional project-level permission overlay

## Where to start

- New to the plugin → read [01-overview.md](./01-overview.md) first.
- "I have role X, what do I do?" → jump straight to [11-roles.md](./11-roles.md).
- "I'm in phase Y, what commands/agents apply?" → the matching `0N-phase-*.md` file.
- "Why did my command get blocked?" → [10-guardrails.md](./10-guardrails.md).
