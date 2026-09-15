# 07 — P6: Release & Change Management

**Command:** `/chapter-forge:sdlc-release "<release/feature that is ready>"`
**Exit gate:** G3 · **AI autonomy:** L2 (supervised)

## Purpose

Package everything the CAB needs to approve a change, and prove SoD holds between whoever built it and whoever will deploy it.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `release-manager` | sonnet | Drafts the Change Request, Release Notes (from diff/commits), and Rollback Plan; confirms rollback has been tested. |
| `compliance-checker` | opus, READ-ONLY | Cross-checks changes against compliance obligations; verifies SoD (deployer ≠ developer). |

## Workflow

1. Check Gate G2 is approved; stop with a warning if not.
2. `release-manager` drafts the Change Request, Release Notes, and Rollback Plan.
3. `compliance-checker` cross-checks compliance obligations and verifies SoD, against the Group 2 output.
4. **Convergence loop:** any compliance gap or SoD violation sends `release-manager` back to revise the Change Request/Rollback Plan; repeat until confirmed clean.
5. Update state (`current_phase: release`, `pending_gate: G3`).
6. Run the Gate G3 check and present the dossier to the CAB.

## Guardrails active in this phase

Standard hooks apply (see [10-guardrails.md](./10-guardrails.md)). No release-specific guardrail — the SoD check here is done by `compliance-checker` as an evidence check, not enforced by a hook.

## Artifacts produced

Change Request · Release Notes · Rollback Plan · CAB Approval package

## Gate G3 — Change Approval Gate

**Approver:** CAB, Release Manager, Risk/Compliance

- CAB approves the Change Request
- Rollback plan tested
- SoD enforced (deployer ≠ developer)
- Release notes & runbook ready

**Stop:** the AI does not approve the CAB on its own — `release-manager` only prepares the dossier.

## Next

Once G3 is approved → [08-phase-deploy.md](./08-phase-deploy.md).
