---
name: sdlc-overview
description: Overview of how to use the Chapter Forge — the 8 phases, which command does what, which agents, guardrails, and how to start a feature. Use when a member is getting started or needs to know which command to run next.
---

# Chapter Forge — Overview

The harness packages the chapter's banking SDLC into Claude Code tooling. Core principle: **AI is a Maker, not a Checker** — AI accelerates the making; every risk-decision Gate is approved by a **human**.

## 8 phases ↔ command ↔ agents ↔ gate

| P | Phase | Command | Primary agents | Exit gate |
|---|-------|---------|----------------|-----------|
| 1 | Discovery & Requirements | `/sdlc-discover` | requirements-analyst, compliance-checker | G0 |
| 2 | Design & Architecture | `/sdlc-design` | solution-architect, threat-modeler, security-reviewer | G1 |
| 3 | Planning | `/sdlc-plan` | requirements-analyst, test-engineer | (DoR) |
| 4 | Development | `/sdlc-develop` | dev-executor, code-reviewer, security-reviewer | CI |
| 5 | Testing & QA | `/sdlc-test` | test-engineer, security-reviewer | G2 |
| 6 | Release | `/sdlc-release` | release-manager, compliance-checker | G3 |
| 7 | Deployment | `/sdlc-deploy` | release-manager | GO_LIVE |
| 8 | Operations | `/sdlc-operate` | rca-agent, doc-agent | (feedback) |

Utilities: `/sdlc-status` (where you are) · `/sdlc-gate <G>` (check gate criteria) · `/sdlc-remember` (distill episodic memory into semantic/procedural — see `docs/12-memory.md`).
(Full namespace once installed as a plugin: `/chapter-forge:<command>`.)

## Starting a feature
1. `/sdlc-discover "<feature description>"` → prepare G0 → a **human** approves G0.
2. `/sdlc-design` → G1 → human approves. 3. `/sdlc-plan`. 4. `/sdlc-develop` (loop, stop at the PR).
5. `/sdlc-test` → G2. 6. `/sdlc-release` → G3 (CAB). 7. `/sdlc-deploy`. 8. `/sdlc-operate`.

Each feature keeps its state in `<repo>/.chapter-forge/sdlc-state.json`.

## AI autonomy levels (L1/L2/L3)
- **L1** assistive (core on-prem deploy). **L2** the agent runs but stops before any side effect (most phases).
- **L3** runs autonomously in a sandbox with test coverage (P4 develop, P5 test) — but **stops at the PR**.

## Guardrails (auto-enabled when the plugin is installed)
Block reading/writing secret·PII, block destructive/prod-touching commands. See the `compliance-checklist` and `gate-criteria` skills.

## Project-wide context
Ask naturally → Claude uses the `chapter-context` MCP: `search_project`, `list_services`, `get_service`, `search_knowledge_base`, `get_playbook`, `get_sdlc_state`, `get_project_memory`, `search_project_memory`.
