# 12 — Project Memory Reference

Chapter Forge keeps three kinds of memory per repo, all versioned inside the service repo itself (not a separate store) so they travel with the code and stay auditable. This is a **read/write layer for agents**, not the human-facing docs in `docs/*.md`.

| Type | Question it answers | Where | Written by |
|---|---|---|---|
| Episodic | "What happened, and when?" | `.chapter-forge/memory/episodic/gate-log.jsonl` | Every `sdlc-*` command with a gate or convergence loop |
| Semantic | "What do we know to be true about this repo?" | `.chapter-forge/memory/semantic/` | `/chapter-forge:sdlc-remember` (distilled from episodic) |
| Procedural | "How do we usually fix this?" | `.chapter-forge/memory/procedural/playbooks/` | `/chapter-forge:sdlc-remember` (distilled from episodic) |

This mirrors — at the repo level — the two memory stores that already exist at the **workspace** level: `banking-knowledge-base` (semantic, human-curated) and `Onward-playbook` (procedural, human-curated), both reachable via `search_knowledge_base` / `get_playbook`. The per-repo layer is the missing episodic tier plus a repo-local semantic/procedural cache that feeds those shared stores by human promotion — it never writes to them directly (SoD).

## 1. Directory layout

```
<repo>/.chapter-forge/
  sdlc-state.json                # unchanged — current phase/gate pointer
  memory/
    episodic/
      gate-log.jsonl             # append-only, one JSON object per line
    semantic/
      MEMORY.md                  # short index, loaded at SessionStart
      decisions/NNNN-slug.md     # one ADR-style decision per file
      domain-facts.md            # standing facts (PII fields, NFR targets, compliance scope)
    procedural/
      playbooks/*.md             # locally-distilled runbooks, candidates for promotion
```

## 2. `episodic/gate-log.jsonl`

Append-only. Never edit or delete a line — a fix is a **new** line, not a rewrite of the old one.

```json
{"ts":"2026-09-16T08:12:00Z","phase":"design","event":"loop_iteration","gate":"G1","agent":"threat-modeler","severity":"HIGH","summary":"Missing encryption-at-rest for PAN field","resolution":null,"artifact_refs":["docs/design/hld.md#section-4"]}
```

| Field | Values / notes |
|---|---|
| `ts` | ISO-8601 UTC timestamp |
| `phase` | matches `graph/sdlc-graph.yaml` phase `key` (`discover`, `design`, `plan`, `develop`, `test`, `release`, `deploy`, `operate`) |
| `event` | `gate_pass` \| `gate_fail` \| `loop_iteration` \| `incident` |
| `gate` | `G0`\|`G1`\|`CI`\|`G2`\|`G3`\|`GO_LIVE`, omit for ungated phases (e.g. `plan`'s DoR loop) |
| `agent` | which agent produced this entry |
| `severity` | optional, `CRITICAL`\|`HIGH`\|`MEDIUM`\|`LOW` |
| `resolution` | `fixed` \| `accepted_risk` \| `null` (still open) |
| `artifact_refs` | paths/anchors to the artifact this entry concerns |

Never write real PII/PAN values into `summary` or any field — the existing `pretooluse-pii-secret-guard.sh` hook blocks content that looks like card/PII data on write, same as any other file.

## 3. `semantic/`

- **`MEMORY.md`** — an index, not the content. One line per decision/fact/playbook, each linking to its file. Kept short (≈30 lines) because it is loaded at every `SessionStart`.
- **`decisions/NNNN-slug.md`** — ADR-style: frontmatter (`id`, `phase`, `gate`, `status`) + Context → Decision → Consequences.
- **`domain-facts.md`** — standing facts about *this* repo (e.g. "`pan` field is PCI scope, AES-256 at-rest"), each with a `Source:` pointer.

## 4. `procedural/playbooks/*.md`

Frontmatter: `title`, `seen_count`, `promote_candidate`. Body: numbered steps. `seen_count` increments each time `/chapter-forge:sdlc-remember` matches a new resolved finding against this playbook's pattern. Once `seen_count ≥ 3`, `promote_candidate: true` — a human then decides whether to copy it into the shared `Onward-playbook` repo. Agents never write to `Onward-playbook` directly.

## 5. How it gets written and read

- **Write (episodic):** every `sdlc-*` command appends a line to `gate-log.jsonl` at each convergence-loop iteration and at its gate check — see the command file for the exact step.
- **Distill (episodic → semantic/procedural):** run `/chapter-forge:sdlc-remember` after a gate passes (or anytime). It reads entries since the last run, creates/updates decisions, domain facts, and playbooks, and regenerates `MEMORY.md`.
- **Read:** `chapter-context` MCP tools `get_project_memory(repo?, type?)` and `search_project_memory(query, repo?)` — the latter searches semantic + procedural memory across every repo in the workspace by default (episodic only if `type: "episodic"` is explicit, since raw event data is noisy for search).
- **SessionStart:** `hooks/sessionstart-context.sh` prints the first lines of `semantic/MEMORY.md` if present, right after the current phase/gate line.

## 6. Design rationale

See `docs/superpowers/specs/2026-09-16-sdlc-memory-system-design.md` for the full design discussion and trade-offs considered.
