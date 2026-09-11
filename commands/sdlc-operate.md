---
description: P8 Operations & Monitoring. Observability, incident RCA, PIR, documentation updates.
argument-hint: "[incident | service]"
---

Run phase **P8 — Operations & Monitoring** for: **$ARGUMENTS**

1. If this is an incident investigation: delegate to `rca-agent` — read logs/metrics/traces (via the `chapter-context` MCP), build a timeline, propose root causes + confidence, draft the PIR.
2. Delegate to `security-reviewer` when the incident is security-related; `doc-agent` to update the runbook/ADR.
3. Consolidate: timeline, hypotheses, proposed actions, PIR draft.
4. Capture lessons learned → feed back to the backlog (feedback loop to P1).

**Stop:** **on-call (a human) decides the actions**; the PIR is approved by a human. AI does not run remediation commands that touch prod on its own.
