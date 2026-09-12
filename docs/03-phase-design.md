# 03 — P2: Design & Architecture

**Command:** `/chapter-forge:sdlc-design "<feature that passed G0>"`
**Exit gate:** G1 · **AI autonomy:** L2 (supervised)

## Purpose

Produce a design that is testable, observable, and secure-by-design before a single line of code is written — and prove it with diagrams, not prose alone.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `solution-architect` | opus | System context diagram, NFR targets, HLD/LLD, OpenAPI spec, ERD, class diagram, ADRs, encryption/SoD design. |
| `threat-modeler` | opus, READ-ONLY | STRIDE threat model with a sequence diagram per sensitive flow. |
| `security-reviewer` | opus, READ-ONLY | Reviews the design artifacts against OWASP Top 10 and PCI concerns. |

## Workflow (4 groups)

### Group 1 — Intake & scoping
1. Check Gate G0 is approved; stop with a warning if not.
2. Pull G0 artifacts (BRD/PRD, Data Classification, Risk Register, Compliance Scope) via the `chapter-context` MCP; determine which services are in scope vs. dependency-only.
3. `solution-architect` drafts a **system context diagram** and sets **NFR targets** (latency, throughput, availability/SLA) before any detailed design.

### Group 2 — Layered design
4. `solution-architect` produces HLD/LLD, OpenAPI spec, **ERD** (Mermaid `erDiagram`), **class diagram** (Mermaid `classDiagram`) for the core domain, and the encryption/SoD design.
5. Record ADRs for decisions with real trade-offs (context → decision → consequences).

### Group 3 — Cross-cutting review (parallel, not sequential)
6. `threat-modeler` builds the STRIDE threat model with a **sequence diagram** (Mermaid `sequenceDiagram`) per sensitive flow, based on the Group 2 artifacts.
7. `security-reviewer` reviews the same artifacts against OWASP/PCI.

### Group 4 — Convergence & sign-off prep
8. **Loop:** any CRITICAL/HIGH finding from step 6 or 7 sends `solution-architect` back to revise the affected artifact — not just logged as a to-do. Repeat Groups 2–3 until nothing CRITICAL/HIGH remains open.
9. **Design walkthrough:** `solution-architect` writes a short note listing every finding raised and its resolution (fixed, or accepted-with-rationale) — the self-check before asking a human to sign off.
10. Consolidate artifacts, update state (`current_phase: design`, `pending_gate: G1`).
11. Run the Gate G1 check and present the checklist.

## Diagrams required

| Diagram | Format | Owner | When |
|---|---|---|---|
| System context | Mermaid `flowchart`/`C4Context` | `solution-architect` | Before detailed design (Group 1) |
| ERD | Mermaid `erDiagram` | `solution-architect` | Whenever the feature adds/changes persisted data |
| Class diagram | Mermaid `classDiagram` | `solution-architect` | For the core domain model |
| Sequence diagram | Mermaid `sequenceDiagram` | `threat-modeler` | One per sensitive flow (auth, payment, PII access) |

Use case, activity diagrams are intentionally **not** required here — use cases are already captured as user stories in P1, and activity flow overlaps with the sequence diagrams above.

## Guardrails active in this phase

Standard hooks apply (see [10-guardrails.md](./10-guardrails.md)). Nothing design-specific — no code is written yet, so the format/test reminder hook stays silent.

## Artifacts produced

System Context Diagram · NFR Targets · HLD/LLD · ERD · Class Diagram · Threat Model · Sequence Diagram(s) · ADRs · API Spec · Design Walkthrough Notes · Security Sign-off

## Gate G1 — Design / Security Gate

**Approver:** Architect, Security

- NFR targets defined (latency, throughput, availability)
- Threat model (STRIDE) complete
- Sequence diagram(s) cover every sensitive flow
- ERD complete, PII/card-data fields flagged
- Architecture review passed
- SoD design & encryption at-rest/in-transit met
- ADR approved
- Design walkthrough notes show all findings resolved or accepted with rationale

**Stop:** only Architect + Security sign off G1. Run `/chapter-forge:sdlc-gate G1` to re-check evidence.

## Next

Once G1 is approved → [04-phase-plan.md](./04-phase-plan.md).
