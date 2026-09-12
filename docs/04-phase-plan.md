# 04 — P3: Planning & Backlog

**Command:** `/chapter-forge:sdlc-plan "<feature that passed G1>"`
**Exit gate:** none — a **Definition of Ready (DoR)** check instead of a hard gate · **AI autonomy:** L2 (supervised)

## Purpose

Turn an approved design into sprint-ready stories with a matching test strategy, so nothing enters a sprint half-defined.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `requirements-analyst` | sonnet | Breaks down and refines stories from the design; detects cross-story dependencies. |
| `test-engineer` | sonnet | Drafts the test strategy (unit/SIT/UAT/perf/security) and the test data plan (masked/synthetic). |

## Workflow

1. `requirements-analyst` refines the backlog and flags cross dependencies.
2. `test-engineer` drafts the test strategy and test data plan.
3. Check the **Definition of Ready** for each story: clear requirements, data classified, security impact assessed, estimated, deterministic test approach.
4. Update state (`current_phase: plan`).

## Guardrails active in this phase

Standard hooks apply (see [10-guardrails.md](./10-guardrails.md)).

## Artifacts produced

Refined Backlog · Test Plan · Release Plan

## Exit condition

No hard gate — but only stories meeting the DoR checklist above should enter a sprint. There is no human sign-off step comparable to G0/G1; the discipline here is self-enforced by the team using the DoR checklist as the bar.

## Next

→ [05-phase-develop.md](./05-phase-develop.md).
