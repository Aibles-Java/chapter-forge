# 02 — P1: Discovery & Requirements

**Command:** `/chapter-forge:sdlc-discover "<feature/idea description>"`
**Exit gate:** G0 · **AI autonomy:** L2 (supervised)

## Purpose

Turn a raw idea into a scoped, classified, risk-aware feature definition before any design or code work starts.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `requirements-analyst` | sonnet | Drafts BRD/PRD, user stories + acceptance criteria; detects conflicts/gaps in requirements; proposes data classification (PII/card) and compliance scope; notes preliminary risks & dependencies. |
| `compliance-checker` | opus | Confirms the data classification; states the relevant SBV/PCI/ISO obligations for this feature (read-only, evidence-only). |

## Workflow

1. `requirements-analyst` drafts the BRD/PRD, user stories with acceptance criteria, detects contradictions/gaps, and proposes a preliminary data classification + compliance scope.
2. `compliance-checker` confirms the classification and lists the applicable SBV/PCI/ISO obligations, flagging any under/over-classification.
3. **Convergence loop:** any disagreement sends `requirements-analyst` back to revise the PRD/classification; repeat until compliance confirms it.
4. Consolidate artifacts: PRD, Data Classification, preliminary Risk Register.
5. Write/update `.chapter-forge/sdlc-state.json` (`current_phase: discover`, `pending_gate: G0`).
6. Run the Gate G0 check and present the checklist.

## Guardrails active in this phase

The two always-on hooks apply here as everywhere: the **PII/secret file guard** blocks reading/writing `.env`, keys, certs, or files whose content looks like card data — relevant if requirements docs accidentally reference real customer data. See [10-guardrails.md](./10-guardrails.md) for the full list.

## Artifacts produced

BRD/PRD · User stories + acceptance criteria · Data Classification table · Preliminary Risk Register · Compliance Scope

## Gate G0 — Intake / Risk Gate

**Approver:** Product Owner, Risk/Compliance

- Business case approved
- Risks ranked
- Compliance scope (SBV/PCI/ISO) identified
- Data classified (any card data/PII?)
- No legal blockers

**Stop:** the AI never marks G0 as passed itself — only the Product Owner and Risk/Compliance can approve it. Run `/chapter-forge:sdlc-gate G0` any time to re-check evidence against this checklist.

## Next

Once G0 is approved → [03-phase-design.md](./03-phase-design.md).
