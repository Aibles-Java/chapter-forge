---
description: P7 Deployment → Go-Live. Runbook, smoke test, health check. Digital=L2, core on-prem=L1.
argument-hint: "<service + environment>"
---

Run phase **P7 — Deployment** for: **$ARGUMENTS**

1. Check that Gate G3 has been approved (state). If not, warn and stop.
2. Delegate to `release-manager`: generate/check the **Deployment Runbook**, prepare smoke test & health check.
3. Distinguish the infrastructure:
   - **Digital services (cloud)** — level L2: describe canary/blue-green, verify each step.
   - **Core banking (on-prem)** — level **L1**: only assist with preparation; **humans execute** during the window, via PAM.
4. After go-live: run the smoke test, check health, confirm rollback is within reach, and that monitoring is enabled.
5. Update state (current_phase: deploy, pending_gate: GO_LIVE).

**Guardrail:** deploy commands that touch prod (kubectl/helm/terraform prod) are blocked — they must be run by a human. AI does not deploy on its own.
