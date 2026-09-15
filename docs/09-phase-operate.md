# 09 — P8: Operations & Monitoring

**Command:** `/chapter-forge:sdlc-operate "[incident | service]"`
**Exit gate:** none — feeds back into P1 · **AI autonomy:** L2 (supervised)

## Purpose

Turn production signal (logs, metrics, incidents) into root causes, a Post-Incident Review, and improvements that loop back into the next Discovery cycle.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `rca-agent` | sonnet | Reads logs/metrics/traces, builds an incident timeline, proposes root-cause hypotheses with confidence levels, drafts the PIR. |
| `security-reviewer` | opus, READ-ONLY | Engaged when the incident is security-related. |
| `doc-agent` | haiku | Updates runbooks/ADRs to reflect what was learned. |

## Workflow

1. If investigating an incident: `rca-agent` reads logs/metrics/traces (via the `chapter-context` MCP or observability tools), builds a timeline, proposes root-cause hypotheses with evidence for/against and a confidence level, drafts the PIR.
2. `security-reviewer` is engaged when the incident is security-related; `doc-agent` updates the runbook/ADR — in parallel with step 1, not strictly after.
3. **Convergence loop:** if `security-reviewer` disputes a hypothesis or surfaces evidence Group 1 missed, `rca-agent` revises the timeline/hypotheses; repeat until consistent.
4. Consolidate: timeline, hypotheses table, proposed actions, PIR draft.
5. Capture lessons learned → feed back to the backlog (loop to P1 Discovery).

## Guardrails active in this phase

The **dangerous-command guard** matters here too: `rca-agent` proposes remediation but never runs commands that touch prod — a human executes them via the standard process. Reading logs is also subject to the **PII/secret guard**: be careful not to quote sensitive data verbatim when logs contain it. See [10-guardrails.md](./10-guardrails.md).

## Artifacts produced

Runbooks · Incident timeline / PIR · Audit Logs · SLO Dashboard

## Exit condition

No hard gate. **On-call (a human) decides the actions; the PIR is approved by a human.** AI does not run remediation commands that touch prod on its own.

## Feedback loop

Lessons learned here feed directly back into [02-phase-discover.md](./02-phase-discover.md) — this is what closes the SDLC loop rather than leaving operational learnings stranded.
