# SDLC Memory System — Design

**Date:** 2026-09-16
**Status:** Approved
**Author:** Chapter Forge development (via Claude Code)

## 1. Problem

`.chapter-forge/sdlc-state.json` only stores `current_phase` and `pending_gate` — a pointer, not a memory. Nothing persists across sessions about *why* a decision was made, what a convergence loop actually found and how it was resolved, or what has already been learned in one feature/repo that would help the next one. Gate evidence has to be re-gathered from scratch each time `/sdlc-status` or `/sdlc-gate` runs, and there is no cross-repo (polyrepo) learning even though the `chapter-context` MCP already supports cross-repo search for code and the shared knowledge base.

Two of the three cognitive-memory types already exist in the system, but only as static, human-curated, workspace-level stores:

| Type | Definition | Existing home | Gap |
|---|---|---|---|
| Semantic (general facts) | `banking-knowledge-base` via `search_knowledge_base` | Workspace-level only, no per-repo layer for facts specific to *this* service (PII fields, NFR targets) |
| Procedural (how-to) | `Onward-playbook` via `get_playbook` | Workspace-level only, no feedback loop from actual repeated fixes into new playbooks |
| Episodic (dated events) | — | **Does not exist.** Every gate decision, loop iteration, and incident disappears once the session ends or `sdlc-state.json` is overwritten. |

## 2. Goal

Add a per-repo, git-versioned memory layer that:
1. Captures episodic events cheaply and continuously during SDLC phases (audit trail, P3 traceability).
2. Periodically distills episodic events into semantic facts and procedural playbooks (continuity, cross-feature learning).
3. Keeps SoD intact: agents *propose* promotion of procedural memory to the shared, human-curated `Onward-playbook`; they never write to it directly.
4. Stays cheap at SessionStart: only a short semantic index is loaded, never the raw episodic log.

## 3. Directory layout (per repo)

```
<repo>/.chapter-forge/
  sdlc-state.json                # unchanged — current phase/gate pointer
  memory/
    episodic/
      gate-log.jsonl             # append-only, one JSON object per line, never edited/deleted
    semantic/
      MEMORY.md                  # short index (~30 lines max), loaded at SessionStart
      decisions/NNNN-slug.md     # one ADR-style decision per file
      domain-facts.md            # standing facts about this repo (PII fields, NFR targets, compliance scope)
    procedural/
      playbooks/*.md             # locally-distilled runbooks, candidates for promotion to Onward-playbook
```

### `episodic/gate-log.jsonl` schema

One JSON object per line:

```json
{"ts":"2026-09-16T08:12:00Z","phase":"design","event":"loop_iteration","gate":"G1","agent":"threat-modeler","severity":"HIGH","summary":"...","resolution":null,"artifact_refs":["docs/design/hld.md#section-4"]}
```

- `event` ∈ `gate_pass | gate_fail | loop_iteration | incident`
- `resolution` ∈ `fixed | accepted_risk | null` (null = still open)
- Append-only. No entry is ever rewritten — a fix is a *new* line referencing the same `summary`/`agent`, not an edit of the original.

### `semantic/domain-facts.md`

Freeform markdown, one bullet per fact, each with a `Source:` pointer to the artifact/decision that established it.

### `semantic/decisions/NNNN-slug.md`

Frontmatter: `id`, `phase`, `gate`, `status`. Body: Context → Decision → Consequences (short ADR format, consistent with existing ADR usage in `sdlc-design.md`).

### `procedural/playbooks/*.md`

Frontmatter: `title`, `seen_count`, `promote_candidate` (bool). Body: numbered steps. `seen_count` increments each time `/chapter-forge:sdlc-remember` finds a matching resolved finding.

## 4. Write path (episodic)

Each `commands/sdlc-*.md` that has a convergence loop or a gate gets one added instruction: append a line to `episodic/gate-log.jsonl` for each loop iteration (finding raised + finding resolved) and one line when its gate is checked (pass/fail). This applies to: `sdlc-discover` (G0), `sdlc-design` (G1), `sdlc-plan` (DoR, no gate id), `sdlc-develop` (CI), `sdlc-test` (G2), `sdlc-release` (G3), `sdlc-deploy` (GO_LIVE), `sdlc-operate` (incident/PIR), and `sdlc-gate` itself (gate_pass/gate_fail after `compliance-checker` evaluates).

## 5. Distillation path — new command `/chapter-forge:sdlc-remember`

1. Read episodic entries since `sdlc-state.json.last_distilled_ts`.
2. Findings with `resolution: fixed`, matched by similar `summary`+`agent` across ≥2 occurrences → bump/create a `procedural/playbooks/*.md`, set `promote_candidate: true` once `seen_count ≥ 3`.
3. Decisions with real trade-offs → `semantic/decisions/NNNN-*.md`; long-lived facts → append to `domain-facts.md`.
4. Regenerate `semantic/MEMORY.md` index (one line per decision/fact/playbook, not full content).
5. Update `last_distilled_ts`. Print a note if any playbook is now a promotion candidate — promotion itself is a human action (copy into `Onward-playbook`).

Can be run manually or suggested at the end of any `sdlc-*.md` after a gate passes.

## 6. MCP `chapter-context` additions

Two new read-only tools, following the existing `search_knowledge_base`/`get_playbook` pattern and reusing `workspace.ts` helpers (`walkFiles`, `safeReadFile`, `isSensitiveFile`):

- `get_project_memory(repo?, type?: "episodic"|"semantic"|"procedural")` — defaults to `semantic` (cheapest); lists/reads the relevant files.
- `search_project_memory(query, repo?)` — greps `memory/semantic` + `memory/procedural` across every repo in the workspace by default; only searches `episodic` if `type: "episodic"` is explicitly requested.

## 7. SessionStart hook

`hooks/sessionstart-context.sh` gets one small addition: if `.chapter-forge/memory/semantic/MEMORY.md` exists, print its first ~5 lines, right after the existing `sdlc-state.json` phase/gate line. Keeps the "short output" invariant.

## 8. Guardrails

No new guardrail needed. `hooks/pretooluse-pii-secret-guard.sh` already blocks reads/writes containing secret/PII patterns regardless of path, so writes under `.chapter-forge/memory/**` are covered by the existing hook.

## 9. Testing

- Validate every `gate-log.jsonl` line parses as JSON and has the required fields (`ts`, `phase`, `event`, `agent`, `summary`).
- MCP: add test coverage for `get_project_memory` / `search_project_memory` alongside existing `get_sdlc_state` tests; `npm run build` must stay clean.
- Guardrail: confirm the PII/secret hook still blocks a PAN-like value written into `domain-facts.md`.

## 10. Out of scope (future)

- Automatic promotion of playbooks into `Onward-playbook` (kept manual for SoD).
- Cross-workspace (multi-team) memory sharing.
- Memory retention/pruning policy (episodic log growth over years) — revisit once real volume is observed.
