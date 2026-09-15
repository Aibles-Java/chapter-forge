---
description: P7 Deployment → Go-Live. Runbook, smoke test, health check. Digital=L2, core on-prem=L1.
argument-hint: "<service + environment>"
---

Run phase **P7 — Deployment** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that Gate G3 has been approved (state). If not, warn and stop.
2. Delegate to `release-manager`: generate/check the **Deployment Runbook**, prepare smoke test & health check.

### Group 2 — Execution (autonomy matched to blast radius)
3. Distinguish the infrastructure:
   - **Digital services (cloud)** — level L2: describe canary/blue-green, verify each step.
   - **Core banking (on-prem)** — level **L1**: only assist with preparation; **humans execute** during the window, via PAM.

### Group 3 — Go-live verification & rollback loop
4. After go-live: run the smoke test, check health, confirm rollback is within reach, and that monitoring is enabled.
5. **Loop:** if the smoke test or health check fails, do not proceed — recommend the rollback path immediately (a human executes it via PAM) and re-run the go-live verification once rolled back. Never patch prod live to force a green smoke test.
6. Update state (current_phase: deploy, pending_gate: GO_LIVE).

**Guardrail:** deploy commands that touch prod (kubectl/helm/terraform prod) are blocked — they must be run by a human. AI does not deploy on its own.
