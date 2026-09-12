---
description: P2 Design & Architecture → prepare Gate G1. HLD/LLD, threat model, ADR, API spec, ERD/class/sequence diagrams.
argument-hint: "<feature that passed G0>"
---

Run phase **P2 — Design & Architecture** for: **$ARGUMENTS**

### Group 1 — Intake & scoping
1. Check that Gate G0 has been approved (state). If not, warn and stop.
2. Pull G0 artifacts (BRD/PRD, Data Classification, Risk Register, Compliance Scope) via `chapter-context` MCP; determine which services in the polyrepo are in scope vs. dependencies only.
3. Delegate to `solution-architect`: draft a **system context diagram** and **NFR targets** (latency, throughput, availability/SLA) before any detailed design.

### Group 2 — Layered design
4. Delegate to `solution-architect`: HLD/LLD, OpenAPI spec, ERD (Mermaid `erDiagram`), class diagram (Mermaid `classDiagram`) for the core domain, encryption design & SoD.
5. Record ADRs for decisions with real trade-offs (short format: context → decision → consequences).

### Group 3 — Cross-cutting review (run in parallel, not after Group 2 is "done")
6. Delegate to `threat-modeler`: STRIDE threat model with a sequence diagram (Mermaid `sequenceDiagram`) per sensitive flow, based on the Group 2 artifacts.
7. Delegate to `security-reviewer`: review the same artifacts against OWASP/PCI.

### Group 4 — Convergence & sign-off prep
8. **Loop:** any CRITICAL/HIGH finding from `threat-modeler` or `security-reviewer` sends `solution-architect` back to revise the affected artifact (Group 2) — do not just log it as a future to-do. Repeat Groups 2–3 until no unresolved CRITICAL/HIGH remains.
9. **Design walkthrough:** `solution-architect` produces a short walkthrough note listing every finding raised and its resolution (fixed / accepted with rationale) — this is the self-check before asking a human to sign off.
10. Consolidate artifacts, update state (current_phase: design, pending_gate: G1).
11. Run the Gate G1 check and present the checklist.

**Stop:** Gate G1 is signed off by **Architect + Security**. AI only prepares evidence (diagrams, threat model, ADR, walkthrough notes) and never marks a finding as resolved without an artifact change or an explicit accepted-risk rationale.
