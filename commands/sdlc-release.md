---
description: P6 Release & Change Management → prepare Gate G3. Change Request, Release Notes, Rollback Plan.
argument-hint: "<release/feature that is ready>"
---

Run phase **P6 — Release & Change Management** for: **$ARGUMENTS**

1. Check that Gate G2 has been approved (state). If not, warn and stop.
2. Delegate to `release-manager`: draft the **Change Request**, **Release Notes** (from diff/commits), **Rollback Plan** (and confirm the rollback has been tested).
3. Delegate to `compliance-checker`: cross-check the changes against compliance obligations, verify SoD (deployer ≠ developer).
4. Update state (current_phase: release, pending_gate: G3).
5. Run the Gate G3 check and present the dossier to the CAB.

**Stop:** Gate G3 is approved by **CAB + Release Manager + Risk/Compliance**. AI does not approve the CAB on its own.
