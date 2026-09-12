# 08 — P7: Deployment

**Command:** `/chapter-forge:sdlc-deploy "<service + environment>"`
**Exit gate:** GO_LIVE · **AI autonomy:** L2 for digital/cloud services, **L1 for core on-prem** (assist only, no automation)

## Purpose

Get the release live — with the autonomy level matched to the blast radius of the target system.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `release-manager` | sonnet | Generates/checks the Deployment Runbook; prepares smoke test & health check; runs the go-live verification. |

## Workflow

1. Check Gate G3 is approved; stop with a warning if not.
2. `release-manager` generates/checks the Deployment Runbook, prepares the smoke test and health check.
3. Distinguish infrastructure:
   - **Digital services (cloud)** — L2: AI can describe and verify canary/blue-green steps.
   - **Core banking (on-prem)** — **L1 only**: AI assists with preparation; a **human executes** during the deployment window, via PAM.
4. After go-live: run the smoke test, check health, confirm rollback is within reach, confirm monitoring is enabled.
5. Update state (`current_phase: deploy`, `pending_gate: GO_LIVE`).

## Guardrails active in this phase

This is the phase where the **dangerous-command guard** matters most: it blocks `kubectl`/`helm` targeting prod/production, `terraform apply/destroy`, and `git push --force` to main/master/release/prod. AI does not deploy to prod on its own under any circumstance — see [10-guardrails.md](./10-guardrails.md).

## Artifacts produced

Deployment Runbook · Deploy Logs · Artifact Signature · Smoke Test results

## Gate GO_LIVE — Go-Live Verification

**Approver:** DevOps/SRE, Release Manager

- Smoke test passed
- Health checks green
- Rollback within reach
- Monitoring/alerting enabled

## Next

→ [09-phase-operate.md](./09-phase-operate.md).
