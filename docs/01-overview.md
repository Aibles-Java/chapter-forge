# 01 — SDLC Overview

Chapter Forge packages the banking product's standard SDLC into a Claude Code plugin: role-based **agents**, phase **commands**, reference **skills**, guardrail **hooks**, a pipeline **graph** (source of truth), and a **chapter-context MCP** for polyrepo context.

## The pipeline

```
P1 Discover ──G0──▶ P2 Design ──G1──▶ P3 Plan ──▶ P4 Develop ──CI──▶ P5 Test ──G2──▶ P6 Release ──G3──▶ P7 Deploy ──GO_LIVE──▶ P8 Operate
                                                                                                                                      │
                                                                                                                          feedback loop back to P1
```

| # | Phase | Command | Exit gate |
|---|---|---|---|
| 1 | Discovery & Requirements | `/chapter-forge:sdlc-discover` | G0 |
| 2 | Design & Architecture | `/chapter-forge:sdlc-design` | G1 |
| 3 | Planning & Backlog | `/chapter-forge:sdlc-plan` | none (Definition of Ready check) |
| 4 | Development | `/chapter-forge:sdlc-develop` | CI |
| 5 | Testing & QA | `/chapter-forge:sdlc-test` | G2 |
| 6 | Release & Change Management | `/chapter-forge:sdlc-release` | G3 |
| 7 | Deployment | `/chapter-forge:sdlc-deploy` | GO_LIVE |
| 8 | Operations & Monitoring | `/chapter-forge:sdlc-operate` | none (feeds back to P1) |

Cross-cutting, usable at any point:
- `/chapter-forge:sdlc-status` — where a feature currently is, what's missing, next command.
- `/chapter-forge:sdlc-gate <G0\|G1\|CI\|G2\|G3\|GO_LIVE>` — check a gate's exit criteria against current evidence.

The graph (`graph/sdlc-graph.yaml`) is the **single source of truth** for phases, agents, artifacts, and gate criteria. Commands and the MCP's `get_sdlc_graph` tool both read from it — if you want to change the process, edit the graph first.

## Core principles

| ID | Principle | What it means in practice |
|---|---|---|
| P1 | Security & Compliance by Design | Security/compliance requirements are a design input, not a patch added later. |
| P2 | Shift-Left | Catch issues (security, quality, compliance) as early as Discovery/Design, not at release. |
| P3 | End-to-end Traceability | Requirement → design → code → test → release must be linkable. |
| P4 | Segregation of Duties (SoD) | The person/agent who writes something is never the one who approves or deploys it. |
| P5 | Four-eyes / Maker–Checker | Every gate has an independent reviewer distinct from the author. |
| P6 | Automate the repetitive, gate the risky | Routine work (tests, formatting, docs) is automated; irreversible/high-risk actions always stop for a human. |

**The one rule that shapes every agent and command in this plugin:**

> **AI is a Maker, not a Checker.** Agents prepare evidence (documents, diagrams, test results, checklists). Humans approve every gate (G0–G3, GO_LIVE) and every production action. No command or agent in this plugin self-approves a gate or self-deploys to prod — guardrail hooks enforce this at the tool-call level, not just as a convention.

## AI autonomy levels

Each phase in the graph has an `ai_autonomy` level — how much the AI can do without stopping for a human:

- **L1 — Assistive**: AI drafts, a human does the actual work. Used for core on-prem deployment (P7).
- **L2 — Supervised**: AI produces artifacts and can run read-only checks, but every irreversible/gate action needs human sign-off. Default for most phases.
- **L3 — Autonomous-sandbox**: AI can loop (write → test → fix) inside a sandbox without asking each time, but must still **stop at the PR** or before touching anything shared. Used in P4 (Development) and parts of P5 (Testing).

## Gates at a glance

| Gate | Name | Approver(s) |
|---|---|---|
| G0 | Intake / Risk Gate | Product Owner, Risk/Compliance |
| G1 | Design / Security Gate | Architect, Security |
| CI | Code / Build Gate (automated) | CI, Human reviewer |
| G2 | Quality / Security Gate | QA, Security, Product Owner |
| G3 | Change Approval Gate | CAB, Release Manager, Risk/Compliance |
| GO_LIVE | Go-Live Verification | DevOps/SRE, Release Manager |

Full exit criteria per gate: [11-roles.md](./11-roles.md) (by role) or run `/chapter-forge:sdlc-gate <name>` (evidence-checked against your current state).

## Quick start for a new feature

```bash
/chapter-forge:sdlc-discover "<idea or feature description>"   # → prepares G0
# ... Product Owner + Risk/Compliance approve G0 ...
/chapter-forge:sdlc-design "<feature that passed G0>"           # → prepares G1
# ... Architect + Security approve G1 ...
/chapter-forge:sdlc-plan "<feature that passed G1>"
/chapter-forge:sdlc-develop "<story to implement>"               # → stops at PR, CI gate
/chapter-forge:sdlc-test "<feature to test>"                      # → prepares G2
/chapter-forge:sdlc-release "<release that is ready>"             # → prepares G3
/chapter-forge:sdlc-deploy "<service + environment>"              # → GO_LIVE
/chapter-forge:sdlc-operate "<service>"                           # ongoing
```

At any point: `/chapter-forge:sdlc-status` tells you where you are and what to run next.

## Project context (chapter-context MCP)

The plugin ships an MCP server for polyrepo-wide context (see `mcp/chapter-context/`):

| Tool | Purpose |
|---|---|
| `list_services` | List all services in the workspace |
| `get_service` | Details of one service |
| `search_project` | Full-text search across the polyrepo |
| `search_knowledge_base` | Search `banking-knowledge-base` / `Onward-playbook` |
| `get_playbook` | Fetch a specific playbook document |
| `get_sdlc_graph` | Return the parsed `sdlc-graph.yaml` — phases, agents, artifacts, gates |
| `get_sdlc_state` | Read a feature's `.chapter-forge/sdlc-state.json` |

Set `CHAPTER_WORKSPACE` to the parent directory containing all service repos (see main `README.md` §2).

## Next

Pick your role in [11-roles.md](./11-roles.md), or read the phase you're currently in.
