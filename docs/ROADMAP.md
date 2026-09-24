# Chapter Forge — Roadmap

Living plan for the plugin itself (not a service using it). Updated as milestones land — see git history for exact dates. Ordered by dependency, not just priority: later items assume earlier ones are done.

## Status snapshot (2026-09-17)

- 9 SDLC phases (P1–P8 + gate/status utilities) implemented as commands, backed by `graph/sdlc-graph.yaml` as source of truth.
- 11 RACI agents, guardrail hooks (PII/secret + destructive-command blocking), `chapter-context` MCP for polyrepo context.
- Episodic/semantic/procedural project memory system implemented (`.chapter-forge/memory/`, `/sdlc-remember`, `get_project_memory`/`search_project_memory`) — see [12-memory.md](./12-memory.md). Merged to `master`, not yet dogfooded on a real service.

## Near-term — close the loop on what just shipped

1. **Dogfood the memory system on a real service.** Run the full pipeline (`sdlc-discover` → `sdlc-design` → gate → `sdlc-remember`) on one actual repo (e.g. `onward-onboarding-service`) and confirm agents actually write `gate-log.jsonl` entries and `sdlc-remember` produces sane playbooks/decisions. Prompt-based instructions are easy for an agent to skip — this needs a real run, not just a code read.
2. **Automated tests for guardrail hooks.** Today `hooks/*.sh` are only checked via manual one-liners in `CLAUDE.md` ("quick tests"). Add a `bats` (or plain bash) test suite covering: PII/secret file read/write blocking, destructive-command blocking, and the pass-through case for safe commands.
3. **CI for the plugin repo.** GitHub Actions workflow that: builds the MCP (`npm install && npm run build` in `mcp/chapter-context`), validates `graph/sdlc-graph.yaml` (`python3 -c "import yaml; yaml.safe_load(open('graph/sdlc-graph.yaml'))"`), and runs the hook test suite from (2). Currently all of this is manual.

## Mid-term — extend memory into a real feedback loop

4. **Playbook promotion workflow.** `sdlc-remember` marks `promote_candidate: true` at `seen_count ≥ 3` but there's no command that turns that into a reviewable diff against `Onward-playbook`. Without this, SoD holds in theory (AI never writes to the shared playbook) but promotion never actually happens in practice. Design a `sdlc-promote-playbook` (or similar) that generates a PR/diff for a human to apply.
5. **Cross-repo memory rollup.** `search_project_memory` and `get_project_memory` work per-repo. With 5 services in `graph/sdlc-graph.yaml`, add a portfolio view — pass/fail rates per gate, most recent incidents, open accepted-risk items — so an EM/architect can see the whole polyrepo at a glance, not repo-by-repo.
6. **Plugin versioning + CHANGELOG.** Adopt semver in `.claude-plugin/plugin.json` and start a `CHANGELOG.md`, bumped on every feature/fix PR. Needed before rollout to teams outside the current pilot.

## Long-term — scale beyond the pilot

7. **Per-agent dry-run coverage.** Verify every one of the 11 agents has actually been exercised end-to-end at least once (not just read for plausibility) — particularly the less-frequently-invoked ones like `rca-agent` and `doc-agent`.
8. **Internal marketplace publishing.** Move from "add marketplace by git URL" to a properly published internal marketplace entry, so other chapters/teams can install without knowing the repo location.

## Explicitly out of scope for now

- Auto-approving gates or auto-deploying to prod — violates the core "AI is a Maker, not a Checker" principle; not up for reconsideration.
- Writing directly to `Onward-playbook` or `banking-knowledge-base` from any agent — these stay human-curated; only reads are automated.
