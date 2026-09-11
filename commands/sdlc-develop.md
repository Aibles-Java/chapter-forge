---
description: P4 Development → CI gate. TDD, loop dev→test→review→fix, stop at PR.
argument-hint: "<story/feature to implement>"
---

Run phase **P4 — Development** for: **$ARGUMENTS**

1. Delegate to `dev-executor`: implement per spec with **TDD** (test first → code → refactor), secure coding, coverage ≥ 80%.
2. **Loop** (autonomy level L3 in sandbox): dev → run tests → if red, fix → repeat until tests are green & lint is clean. You may use `/oh-my-claudecode:ralph` or `ultrawork` for an automated loop.
3. When the code is ready, delegate **independently**: `code-reviewer` and `security-reviewer` (reviewer ≠ author — keep SoD). Fix every CRITICAL/HIGH.
4. Run the **CI gate** check: PR approved by someone else, CI green, coverage met, 0 SAST/SCA Critical/High, 0 leaked secrets.
5. Update state (current_phase: develop, pending_gate: CI).

**Stop at the PR.** Do not self-merge, do not deploy. The guardrail will block commands that touch prod.
