# 11 — Use Cases by Role

Every role below maps to gate approvals defined in `graph/sdlc-graph.yaml`. "Commands you run" are the ones you'd actually type; "Agents working for you" are the ones a command delegates to on your behalf — you don't invoke agents directly.

---

## Product Owner

**You approve:** Gate G0 (with Risk/Compliance) · Gate G2 (with QA, Security)

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-discover`, `/chapter-forge:sdlc-gate G0`, `/chapter-forge:sdlc-gate G2`, `/chapter-forge:sdlc-status` |
| Agents working for you | `requirements-analyst` (P1), `compliance-checker` (evidence, all gates) |
| Phase docs | [02-phase-discover.md](./02-phase-discover.md), [06-phase-test.md](./06-phase-test.md) |

**Typical flow:** kick off `/chapter-forge:sdlc-discover "<idea>"` → review the BRD/PRD, stories, and risk register it produces → once Risk/Compliance also agrees, approve G0 (the plugin never auto-approves this for you). Later, review UAT results at G2 and sign off from the business side.

---

## Solution Architect

**You approve:** Gate G1 (with Security)

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-design`, `/chapter-forge:sdlc-gate G1` |
| Agents working for you | `solution-architect`, `threat-modeler`, `security-reviewer` |
| Phase docs | [03-phase-design.md](./03-phase-design.md) |

**Typical flow:** run `/chapter-forge:sdlc-design "<feature>"` once G0 is approved. Review the system context diagram, NFR targets, HLD/LLD, ERD, class diagram, and ADRs the agents produce. When `threat-modeler`/`security-reviewer` raise findings, expect the design to be **revised**, not just annotated — the convergence loop in P2 is built for this. Read the design walkthrough note before signing G1; it should show every finding resolved or explicitly accepted with rationale.

---

## Security Engineer / AppSec

**You approve:** Gate G1 (with Architect) · contributes evidence to Gate G2, CI

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-design`, `/chapter-forge:sdlc-develop`, `/chapter-forge:sdlc-test`, `/chapter-forge:sdlc-gate <any>` |
| Agents working for you | `threat-modeler` (P2), `security-reviewer` (P2, P4, P5, P8) |
| Phase docs | [03-phase-design.md](./03-phase-design.md), [05-phase-develop.md](./05-phase-develop.md), [06-phase-test.md](./06-phase-test.md) |

**Typical flow:** in P2, review the STRIDE threat model and sequence diagrams; in P4, `security-reviewer` blocks CRITICAL/HIGH findings from passing CI independently of the code author; in P5, triage DAST/pentest results before G2. You're the one gate approver who shows up at nearly every phase — this is the Shift-Left principle (P2) in practice.

---

## Developer

**You approve:** nothing (by design — SoD). Your PR always needs an independent reviewer.

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-develop` |
| Agents working for you | `dev-executor` (implements), `code-reviewer` + `security-reviewer` (review your work — not you) |
| Phase docs | [05-phase-develop.md](./05-phase-develop.md) |

**Typical flow:** run `/chapter-forge:sdlc-develop "<story>"`. `dev-executor` writes tests first, implements, and loops (dev → test → fix) autonomously inside a sandbox. It stops at the PR — you never see it self-merge or self-approve. `code-reviewer`/`security-reviewer` review independently; fix every CRITICAL/HIGH before the CI gate is checked. The guardrails ([10-guardrails.md](./10-guardrails.md)) will block you (or the agent) from committing secrets, running destructive commands, or force-pushing to protected branches — this applies even if you're driving the session yourself.

---

## QA / Test Engineer

**You approve:** Gate G2 (with Security, PO) — specifically, you own the "no un-mocked real data" and defect-closure criteria.

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-plan`, `/chapter-forge:sdlc-test`, `/chapter-forge:sdlc-gate G2` |
| Agents working for you | `test-engineer` (P3, P5) |
| Phase docs | [04-phase-plan.md](./04-phase-plan.md), [06-phase-test.md](./06-phase-test.md) |

**Typical flow:** in P3, `test-engineer` drafts the test strategy and Definition-of-Ready check. In P5, it generates test cases from acceptance criteria and builds **synthetic/masked data only** — real card data/PII must never enter a test fixture (PCI requirement, enforced partly by the PII guard on Read). If a test correctly fails, `test-engineer` reports a defect rather than loosening the test.

---

## Release Manager

**You approve:** Gate G3 (with CAB, Risk/Compliance) · Gate GO_LIVE (with DevOps/SRE)

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-release`, `/chapter-forge:sdlc-deploy`, `/chapter-forge:sdlc-gate G3`, `/chapter-forge:sdlc-gate GO_LIVE` |
| Agents working for you | `release-manager` (P6, P7), `compliance-checker` (SoD check at P6) |
| Phase docs | [07-phase-release.md](./07-phase-release.md), [08-phase-deploy.md](./08-phase-deploy.md) |

**Typical flow:** after G2, run `/chapter-forge:sdlc-release` to get the Change Request, Release Notes, and a tested Rollback Plan ready for CAB. After G3, run `/chapter-forge:sdlc-deploy "<service+env>"` — remember **core on-prem systems stay at autonomy L1**: the agent only assists with the runbook, a human executes the actual deployment via PAM. Digital/cloud services can go to L2 (agent verifies canary/blue-green steps).

---

## Risk & Compliance Officer

**You approve:** Gate G0 (with PO) · contributes to Gate G3 (with CAB, Release Manager)

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-gate <any>` (spot-check any gate at any time) |
| Agents working for you | `compliance-checker` — cross-cutting, works at every gate |
| Phase docs | any — `compliance-checker` is referenced across all phase docs |

**Typical flow:** you're not tied to one phase. Use `/chapter-forge:sdlc-gate <G0\|G1\|CI\|G2\|G3\|GO_LIVE>` at any point to get `compliance-checker`'s evidence table (item · status · evidence · required approver) for that gate, mapped against SBV TT09/2020, PCI-DSS v4.0, and ISO/IEC 27001 (see the `compliance-checklist` skill). Remember: `compliance-checker` **prepares evidence, it never approves** — clause mappings are a reference, reconcile against your organization's official version before treating anything as "compliant."

---

## DevOps / SRE

**You approve:** Gate GO_LIVE (with Release Manager)

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-deploy`, `/chapter-forge:sdlc-operate` |
| Agents working for you | `release-manager` (P7), `rca-agent` + `doc-agent` (P8) |
| Phase docs | [08-phase-deploy.md](./08-phase-deploy.md), [09-phase-operate.md](./09-phase-operate.md) |

**Typical flow:** verify the smoke test, health checks, rollback readiness, and monitoring/alerting after go-live. In P8, you're the primary consumer of `rca-agent`'s incident timelines and root-cause hypotheses for your on-call rotation.

---

## On-call / Incident Responder

**You approve:** the PIR and any remediation action (never automated).

| | |
|---|---|
| Commands you run | `/chapter-forge:sdlc-operate "<incident>"` |
| Agents working for you | `rca-agent`, `security-reviewer` (if security-related), `doc-agent` (runbook updates) |
| Phase docs | [09-phase-operate.md](./09-phase-operate.md) |

**Typical flow:** `rca-agent` reads logs/metrics/traces via the `chapter-context` MCP, builds a timeline, and proposes root-cause hypotheses with a confidence level and supporting/contradicting evidence. **You decide the actions** — the agent proposes, it never executes remediation that touches prod (blocked by the dangerous-command guard regardless). You approve the final PIR draft.

---

## Anyone, any role

| | |
|---|---|
| `doc-agent` (haiku) | Cross-cutting: keeps ADRs/API specs/runbooks/README in sync with code, flags doc rot. Invoke it whenever docs feel stale — it never touches code logic. |
| `/chapter-forge:sdlc-status` | Works from any role — tells you the current phase, missing artifacts, pending gate, and the next command to run. |
| `chapter-context` MCP tools | `list_services`, `get_service`, `search_project`, `search_knowledge_base`, `get_playbook` are useful regardless of role for polyrepo context. |
