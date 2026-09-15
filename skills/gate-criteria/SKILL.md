---
name: gate-criteria
description: Detailed exit criteria for the SDLC gates (G0/G1/CI/G2/G3/GO_LIVE) plus the P3 Definition of Ready, and who approves each. Use when you need the conditions to pass a gate or to prepare evidence.
---

# Gate Criteria — the chapter SDLC

Machine-readable source of truth: `${CLAUDE_PLUGIN_ROOT}/graph/sdlc-graph.yaml` (the `gates` section for hard gates, `dor_criteria` under phase 3 for the DoR). Every hard gate is approved by a **human**; AI only prepares the evidence.

## G0 — Intake / Risk Gate — *approver: Product Owner + Risk/Compliance*
- Business case approved · Risks ranked
- Compliance scope (SBV/PCI/ISO) identified
- Data classified (any card data/PII?) · No legal blockers

## G1 — Design / Security Gate — *approver: Architect + Security*
- Threat model (STRIDE) complete · Architecture review passed
- SoD design & encryption at-rest/in-transit met · ADR approved

## DoR — Definition of Ready (P3) — *self-enforced by the team, not a human sign-off gate*
- Requirements are clear and testable · Data touched is classified (PII/card or not)
- Security impact assessed (flagged for `security-reviewer` if relevant)
- Story is estimated · Test approach is deterministic (covered by the P3 test strategy)
- Not checked by `/sdlc-gate` (that command covers G0/G1/CI/G2/G3/GO_LIVE only) — enforced by the Group 5 convergence loop in `/chapter-forge:sdlc-plan`: a story failing DoR routes back to backlog refinement or test-strategy drafting until it passes or is explicitly deferred.

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
