---
description: P6 Release & Change Management → prepare Gate G3. Change Request, Release Notes, Rollback Plan.
argument-hint: "<release/feature that is ready>"
---

Run phase **P6 — Release & Change Management** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that Gate G2 has been approved (state). If not, warn and stop.

### Group 2 — Release package
2. Delegate to `release-manager`: draft the **Change Request**, **Release Notes** (from diff/commits), **Rollback Plan** (and confirm the rollback has been tested).

### Group 3 — Compliance cross-check (run against Group 2's output)
3. Delegate to `compliance-checker`: cross-check the changes against compliance obligations, verify SoD (deployer ≠ developer).

### Group 4 — Convergence loop
4. **Loop:** any compliance gap or SoD violation found in Group 3 sends `release-manager` back to Group 2 to revise the Change Request/Rollback Plan. Repeat until `compliance-checker` confirms no open gaps.
5. Update state (current_phase: release, pending_gate: G3).
6. Run the Gate G3 check and present the dossier to the CAB.

**Stop:** Gate G3 is approved by **CAB + Release Manager + Risk/Compliance**. AI does not approve the CAB on its own.
