---
description: P3 Planning & Backlog. Refine stories, test plan, release sketch, loop to DoR.
argument-hint: "<feature that passed G1>"
---

Run phase **P3 — Planning & Backlog** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that Gate G1 has been approved (state). If not, warn and stop.
2. Pull G1 artifacts (HLD/LLD, ADRs, API Spec) via the `chapter-context` MCP; determine which epics/stories are in scope for this feature.

### Group 2 — Backlog refinement
3. Delegate to `requirements-analyst`: break down epics into stories with measurable **acceptance criteria**; detect cross-story dependencies.

### Group 3 — Test & data strategy (run alongside Group 2, not strictly after)
4. Delegate to `test-engineer`: draft the test strategy (unit/SIT/UAT/perf/security) and the test data plan (masked/synthetic) per story.

### Group 4 — Release framing
5. Delegate to `release-manager`: sketch a lightweight **Release Plan** (target release train, rollback sketch) for the feature. This is a preliminary sketch, not the Change Request — that is produced in full at P6.

### Group 5 — Convergence loop
6. Check every story against the **Definition of Ready** (`dor_criteria` in `graph/sdlc-graph.yaml`): clear requirements, data classified, security impact assessed, estimated, deterministic test approach.
7. **Loop:** any story that fails DoR sends `requirements-analyst` (if the gap is requirements-side) or `test-engineer` (if the gap is test-approach-side) back to Group 2/3 to revise. Repeat until every story meets DoR or is explicitly deferred out of the sprint with a stated reason.
8. Update state (current_phase: plan) and record which stories are sprint-ready vs. deferred.

**Stop:** there is no hard human gate at P3, but only stories that meet the DoR checklist should enter the sprint — treat the loop in Group 5 as the enforcement mechanism, not a one-time check.
