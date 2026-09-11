---
description: P1 Discovery & Requirements → prepare Gate G0. Draft PRD/story, data classification, risk register.
argument-hint: "<feature/idea description>"
---

Run phase **P1 — Discovery & Requirements** for: **$ARGUMENTS**

1. Delegate to the `requirements-analyst` agent: draft BRD/PRD, user story + acceptance criteria, detect contradictions/gaps, propose data classification (PII/card) and compliance scope.
2. Delegate to the `compliance-checker` agent: confirm the data classification, state the relevant SBV/PCI/ISO obligations.
3. Consolidate artifacts: PRD, Data Classification, preliminary Risk Register.
4. Write/update `.chapter-forge/sdlc-state.json` (current_phase: discover, pending_gate: G0).
5. Run the Gate G0 check (read the criteria from the graph) and present the pass/not-yet checklist.

**Stop:** Gate G0 is approved by **Product Owner + Risk/Compliance**. Do not mark the gate as passed on your own.
