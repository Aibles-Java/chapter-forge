---
description: P8 Operations & Monitoring. Observability, incident RCA, PIR, documentation updates.
argument-hint: "[incident | service]"
---

Run phase **P8 — Operations & Monitoring** for: **$ARGUMENTS**

### Group 1 — Investigation
1. If this is an incident investigation: delegate to `rca-agent` — read logs/metrics/traces (via the `chapter-context` MCP), build a timeline, propose root causes + confidence, draft the PIR.

### Group 2 — Cross-cutting review (run alongside Group 1)
2. Delegate to `security-reviewer` when the incident is security-related; `doc-agent` to update the runbook/ADR to reflect what was learned.

### Group 3 — Convergence loop
3. **Loop:** if `security-reviewer` disputes a root-cause hypothesis or finds evidence Group 1 missed, send `rca-agent` back to Group 1 to revise the timeline/hypotheses. Repeat until the hypotheses and evidence are consistent. Append a `loop_iteration` line to `.chapter-forge/memory/episodic/gate-log.jsonl` for each disputed hypothesis and its resolution.
4. Consolidate: timeline, hypotheses table, proposed actions, PIR draft. Append an `incident` line to `gate-log.jsonl` summarizing the PIR (schema: `docs/12-memory.md`).
5. Capture lessons learned → feed back to the backlog (feedback loop to P1 Discovery), so operational learnings become input for the next `sdlc-discover` run rather than staying stranded here. Consider running `/chapter-forge:sdlc-remember` now so the incident is distilled into semantic/procedural memory before it is forgotten.

**Stop:** **on-call (a human) decides the actions**; the PIR is approved by a human. AI does not run remediation commands that touch prod on its own.
