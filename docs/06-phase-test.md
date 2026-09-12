# 06 — P5: Testing & QA

**Command:** `/chapter-forge:sdlc-test "<feature to test>"`
**Exit gate:** G2 · **AI autonomy:** L3 (test-gen + synthetic data + regression in sandbox)

## Purpose

Prove the feature meets its acceptance criteria and NFRs using data that is never real customer data, then get UAT signed off by the business.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `test-engineer` | sonnet | Generates test cases from acceptance criteria; builds synthetic/masked data; runs regression; supports performance testing. |
| `security-reviewer` | opus, READ-ONLY | Triages DAST/pentest results, confirms no remaining Critical/High vulnerabilities. |

## Workflow

1. `test-engineer` generates test cases from acceptance criteria (happy path, edge cases, errors, security, idempotency — especially for payment flows), and builds **synthetic/masked data only** (see the `synthetic-test-data` skill).
2. `security-reviewer` triages DAST/pentest results.
3. Consolidate: test results, defect list, perf report, pentest status.
4. Update state (`current_phase: test`, `pending_gate: G2`).
5. Run the Gate G2 check and present the checklist.

## Guardrails active in this phase

The **PII/secret guard** is especially important here: it blocks reading files that look like they contain real card data/PII, which is exactly the mistake this phase must never make (PCI requirement — real card data must never enter test fixtures or the AI's context). See [10-guardrails.md](./10-guardrails.md).

## Artifacts produced

Test Results · UAT Sign-off · Pentest Report · Perf Report

## Gate G2 — Quality / Security Gate

**Approver:** QA, Security, Product Owner

- All Critical/High defects closed
- UAT signed off by the business
- Pentest: no remaining Critical/High vulnerabilities
- NFRs (performance/security) met
- Test data masked (no real data)

**Stop:** UAT is signed off by the business (a human), and Gate G2 is approved by QA + Security + PO — never by `test-engineer` itself. If a test is correct but the code is wrong, `test-engineer` reports a defect; it does not "fix the test to make it pass."

## Next

Once G2 is approved → [07-phase-release.md](./07-phase-release.md).
