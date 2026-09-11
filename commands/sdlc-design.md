---
description: P2 Design & Architecture → prepare Gate G1. HLD/LLD, threat model, ADR, API spec.
argument-hint: "<feature that passed G0>"
---

Run phase **P2 — Design & Architecture** for: **$ARGUMENTS**

1. Check that Gate G0 has been approved (state). If not, warn and stop.
2. Delegate to `solution-architect`: HLD/LLD, ADR, OpenAPI, encryption design & SoD.
3. Delegate to `threat-modeler`: STRIDE threat model for the sensitive flows.
4. Delegate to `security-reviewer`: review the design against OWASP/PCI.
5. Consolidate artifacts, update state (current_phase: design, pending_gate: G1).
6. Run the Gate G1 check and present the checklist.

**Stop:** Gate G1 is signed off by **Architect + Security**. AI only prepares evidence (threat model, ADR).
