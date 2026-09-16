---
description: P4 Development → CI gate. TDD, loop dev→test→review→fix, stop at PR.
argument-hint: "<story/feature to implement>"
---

Run phase **P4 — Development** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that the story meets **DoR** (state / P3 `dor_criteria`). If not, warn and stop.
2. Pull the relevant P3 artifacts (Refined Backlog, Test Plan) and P2 artifacts (HLD/LLD, ADRs, API Spec) via the `chapter-context` MCP so `dev-executor` implements against the actual spec, not a re-derived one.

### Group 2 — TDD implementation loop
3. Delegate to `dev-executor`: implement per spec/ADR with **TDD** — write the test first (RED) → code (GREEN) → refactor. Follow `secure-coding-banking` (input validation at every boundary, parameterized queries, no hardcoded secrets) and use the `synthetic-test-data` skill instead of real PII/card data in tests.
4. **Loop** (autonomy level L3 in sandbox): run tests → if red, fix → repeat until tests are green, lint is clean, and coverage ≥ 80%. You may use `/oh-my-claudecode:ralph` or `ultrawork` for an automated loop.

### Group 3 — Independent review & convergence
5. When the code is ready, delegate **independently**: `code-reviewer` and `security-reviewer` (reviewer ≠ author — keep SoD).
6. **Loop:** any CRITICAL/HIGH finding sends `dev-executor` back to Group 2 to fix — do not just log it as a to-do. Repeat Groups 2–3 until no unresolved CRITICAL/HIGH remains. Append a `loop_iteration` line to `.chapter-forge/memory/episodic/gate-log.jsonl` for each finding raised and each fix that resolves it (schema: `docs/12-memory.md`).
7. `dev-executor` writes a short **review summary** (finding → fix, with file:line) for the audit trail — every finding must map to a code change, not a verbal "will fix later."

### Group 4 — CI gate prep
8. Run the **CI gate** checklist: PR approved by someone else (reviewer ≠ author/AI), CI green, coverage ≥ 80%, 0 SAST/SCA findings at Critical/High, 0 leaked secrets. Append a `gate_pass`/`gate_fail` line for `CI` to `gate-log.jsonl`.
9. Update state (current_phase: develop, pending_gate: CI).

**Stop at the PR.** Do not self-merge, do not deploy. The guardrail will block commands that touch prod.
