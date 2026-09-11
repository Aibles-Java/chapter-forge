---
name: gate-criteria
description: Detailed exit criteria for the SDLC gates (G0/G1/CI/G2/G3/GO_LIVE) and who approves each. Use when you need the conditions to pass a gate or to prepare evidence.
---

# Gate Criteria — the chapter SDLC

Machine-readable source of truth: `${CLAUDE_PLUGIN_ROOT}/graph/sdlc-graph.yaml` (the `gates` section). Every gate is approved by a **human**; AI only prepares the evidence.

## G0 — Intake / Risk Gate — *approver: Product Owner + Risk/Compliance*
- Business case approved · Risks ranked
- Compliance scope (SBV/PCI/ISO) identified
- Data classified (any card data/PII?) · No legal blockers

## G1 — Design / Security Gate — *approver: Architect + Security*
- Threat model (STRIDE) complete · Architecture review passed
- SoD design & encryption at-rest/in-transit met · ADR approved

## CI — Code / Build Gate (automated) — *approver: CI + human reviewer*
- PR approved by someone else (reviewer ≠ author/AI) · CI green
- Coverage ≥ 80% · 0 SAST/SCA findings at Critical/High · 0 leaked secrets

## G2 — Quality / Security Gate — *approver: QA + Security + PO*
- All Critical/High defects closed · **UAT signed off by the business**
- Pentest: no remaining Critical/High vulnerabilities · NFRs (perf/security) met
- Test data masked (no real data)

## G3 — Change Approval Gate — *approver: CAB + Release Manager + Risk/Compliance*
- CAB approves the Change Request · Rollback plan tested
- SoD enforced (deployer ≠ developer) · Release notes & runbook ready

## GO_LIVE — Go-Live Verification — *approver: DevOps/SRE + Release Manager*
- Smoke test passed · Health checks green · Rollback within reach · Monitoring/alerting enabled

Use `/sdlc-gate <G>` to cross-check automatically and see the gaps to address.
