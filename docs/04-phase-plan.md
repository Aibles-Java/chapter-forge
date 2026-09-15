# 04 — P3: Planning & Backlog

**Command:** `/chapter-forge:sdlc-plan "<feature that passed G1>"`
**Exit gate:** none — a **Definition of Ready (DoR)** check instead of a hard gate · **AI autonomy:** L2 (supervised)

## Purpose

Turn an approved design into sprint-ready stories with a matching test strategy and a release sketch, so nothing enters a sprint half-defined — and loop back on anything that isn't ready instead of logging it and moving on.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `requirements-analyst` | sonnet | Primarily P1's owner; reused here to break down and refine stories from the design and detect cross-story dependencies. |
| `test-engineer` | sonnet | Primarily P5's owner; reused here to draft the test strategy (unit/SIT/UAT/perf/security) and the test data plan (masked/synthetic) per story. |
| `release-manager` | sonnet | Primarily P6/P7's owner; reused here for a lightweight release plan sketch (target train, rollback sketch) — not the full Change Request. |

## Workflow

### Group 1 — Intake & scoping
1. Check that Gate G1 has been approved. If not, warn and stop.
2. Pull G1 artifacts (HLD/LLD, ADRs, API Spec) via the `chapter-context` MCP; determine which epics/stories are in scope.

### Group 2 — Backlog refinement
3. `requirements-analyst` breaks epics into stories with measurable acceptance criteria and flags cross dependencies.

### Group 3 — Test & data strategy (parallel to Group 2)
4. `test-engineer` drafts the test strategy and test data plan per story.

### Group 4 — Release framing
5. `release-manager` sketches a lightweight release plan for the feature.

### Group 5 — Convergence loop
6. Check every story against the **Definition of Ready** (see `dor_criteria` for phase 3 in `graph/sdlc-graph.yaml`): clear requirements, data classified, security impact assessed, estimated, deterministic test approach.
7. **Loop:** any story failing DoR routes back to Group 2 (requirements gap) or Group 3 (test-approach gap) for revision. Repeat until every story is ready or explicitly deferred out of the sprint with a stated reason.
8. Update state (`current_phase: plan`), recording which stories are sprint-ready vs. deferred.

## Guardrails active in this phase

Standard hooks apply (see [10-guardrails.md](./10-guardrails.md)).

## Artifacts produced

Refined Backlog · Test Plan · Release Plan Sketch

## Exit condition

No hard gate — but only stories meeting the DoR checklist should enter a sprint. There is no human sign-off step comparable to G0/G1; the discipline here is self-enforced via the Group 5 convergence loop rather than a one-time check.

## Next

→ [05-phase-develop.md](./05-phase-develop.md).
