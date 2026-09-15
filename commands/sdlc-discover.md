---
description: P1 Discovery & Requirements → prepare Gate G0. Draft PRD/story, data classification, risk register.
argument-hint: "<feature/idea description>"
---

Run phase **P1 — Discovery & Requirements** for: **$ARGUMENTS**

### Group 1 — Problem framing
1. Delegate to `requirements-analyst`: draft BRD/PRD, user story + acceptance criteria; proactively ask clarifying questions before finalizing anything ambiguous.
2. Detect contradictions/gaps in the requirements; propose a preliminary data classification (PII/card) and compliance scope, and note preliminary risks/dependencies.

### Group 2 — Compliance cross-check (run against Group 1's output, not from scratch)
3. Delegate to `compliance-checker`: confirm the data classification, state the relevant SBV/PCI/ISO obligations, flag anything Group 1 under- or over-classified.

### Group 3 — Convergence loop
4. **Loop:** if `compliance-checker` disagrees with the classification or flags a missing obligation, send `requirements-analyst` back to Group 1 to revise the PRD/classification. Repeat until compliance confirms the classification and scope.
5. Consolidate artifacts: PRD, Data Classification, preliminary Risk Register, Compliance Scope.
6. Write/update `.chapter-forge/sdlc-state.json` (current_phase: discover, pending_gate: G0).
7. Run the Gate G0 check (read the criteria from the graph) and present the pass/not-yet checklist.

**Stop:** Gate G0 is approved by **Product Owner + Risk/Compliance**. Do not mark the gate as passed on your own.
