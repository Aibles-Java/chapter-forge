---
description: P5 Testing & QA → prepare Gate G2. Test-gen, synthetic data, regression, pentest support.
argument-hint: "<feature to test>"
---

Run phase **P5 — Testing & QA** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that Gate CI has been passed (state) — the PR from P4 must be merged. If not, warn and stop.
2. Pull the P3 Test Plan and the merged code/SAST-SCA report from P4 via `chapter-context` MCP so testing targets the actual acceptance criteria, not a re-derived set.

### Group 2 — Test execution
3. Delegate to `test-engineer`: generate test cases from the acceptance criteria (happy path, edge cases, errors, idempotency), build **synthetic/masked data** (no real PII/card), run regression, support performance testing.

### Group 3 — Security & pentest (run alongside Group 2, not strictly after)
4. Delegate to `security-reviewer`: triage DAST/pentest results, confirm no Critical/High vulnerabilities remain.

### Group 4 — Convergence loop
5. **Loop:** any Critical/High defect (functional or security) is reported back — if it's an implementation defect, it goes back to `dev-executor` at P4 for a fix-and-rerun; if it's a test-approach gap, `test-engineer` revises the test in Group 2. Do not "fix the test to make it pass." Repeat until no unresolved Critical/High remains. Append a `loop_iteration` line to `.chapter-forge/memory/episodic/gate-log.jsonl` for each defect raised and each fix that resolves it (schema: `docs/12-memory.md`).
6. Consolidate: test results, defect list, perf report, pentest status.
7. Update state (current_phase: test, pending_gate: G2).
8. Run the Gate G2 check and present the checklist. Append a `gate_pass`/`gate_fail` line for G2 to `gate-log.jsonl`.

**Stop:** **UAT is signed off by the business (humans)**; Gate G2 is approved by QA + Security + PO.
