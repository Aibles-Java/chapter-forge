---
description: P5 Testing & QA → prepare Gate G2. Test-gen, synthetic data, regression, pentest support.
argument-hint: "<feature to test>"
---

Run phase **P5 — Testing & QA** for: **$ARGUMENTS**

1. Delegate to `test-engineer`: generate test cases from the acceptance criteria, build **synthetic/masked data** (no real PII/card), run regression, support performance testing.
2. Delegate to `security-reviewer`: triage DAST/pentest, confirm no Critical/High vulnerabilities remain.
3. Consolidate: test results, defect list, perf report, pentest status.
4. Update state (current_phase: test, pending_gate: G2).
5. Run the Gate G2 check and present the checklist.

**Stop:** **UAT is signed off by the business (humans)**; Gate G2 is approved by QA + Security + PO.
