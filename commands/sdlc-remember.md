---
description: Distill episodic memory (gate-log.jsonl) into semantic facts/decisions and procedural playbooks. Run after a gate passes, or anytime.
argument-hint: "[service/repo, defaults to current directory]"
---

Distill project memory for: **$ARGUMENTS**

See `docs/12-memory.md` for the full schema reference.

1. Read `.chapter-forge/sdlc-state.json` for `last_distilled_ts` (absent = distill everything). Read `.chapter-forge/memory/episodic/gate-log.jsonl` and keep only entries with `ts` after `last_distilled_ts`.
2. If there are no new entries, report "nothing new to distill" and stop.
3. **Group findings that were resolved** (`resolution: "fixed"`), matching by similar `summary` + `agent`. For each group that now has ≥2 occurrences across the repo's history (not just this run):
   - If a matching file exists under `.chapter-forge/memory/procedural/playbooks/`, increment its `seen_count` and refine the steps if the new occurrence adds detail.
   - Otherwise create a new playbook file (frontmatter: `title`, `seen_count: 1`, `promote_candidate: false`) with the steps that resolved it.
   - Once a playbook's `seen_count` reaches 3, set `promote_candidate: true`.
4. **Extract standing decisions and facts**: for entries tied to a real design/architecture trade-off, write a new `.chapter-forge/memory/semantic/decisions/NNNN-slug.md` (frontmatter: `id`, `phase`, `gate`, `status`; body: Context → Decision → Consequences). For durable facts about the repo (data classification, NFR targets, compliance scope) not yet captured, append a bullet to `.chapter-forge/memory/semantic/domain-facts.md` with a `Source:` pointer.
5. **Regenerate `.chapter-forge/memory/semantic/MEMORY.md`**: one line per decision/fact/playbook (title + path), newest first, capped at ~30 lines — this is an index, never paste full content into it.
6. Update `last_distilled_ts` in `.chapter-forge/sdlc-state.json` to the latest `ts` processed.
7. Print a short summary: how many entries distilled, which playbooks are now `promote_candidate: true`. For each promotion candidate, remind that promoting it into the shared `Onward-playbook` repo is a **human** decision — the agent must not write to `Onward-playbook` directly (SoD).

**Note:** this command never rewrites or deletes lines in `gate-log.jsonl` — it only reads from it and writes new files elsewhere under `memory/semantic/` and `memory/procedural/`.
