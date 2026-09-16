---
description: Report which SDLC phase the current feature is in, which gate is pending, and the next step.
argument-hint: "[service? | feature?]"
---

Determine the current SDLC status and suggest the next step.

1. Read the pipeline graph: `${CLAUDE_PLUGIN_ROOT}/graph/sdlc-graph.yaml`.
2. Read the current feature state at `.chapter-forge/sdlc-state.json` (if present). If the `chapter-context` MCP is available, use `get_sdlc_state`. Argument: `$ARGUMENTS` (a specific service/feature, if any).
3. If there is no state: report "feature not initialized in SDLC" and suggest running `/chapter-forge:sdlc-discover` to begin.
4. If there is state: print concisely — **current phase**, **artifacts present/missing**, **pending gate + criteria**, **allowed AI autonomy level**, and the **next command**.
5. If `.chapter-forge/memory/semantic/MEMORY.md` exists (or via `get_project_memory`), print its short index too — it may explain *why* the feature is where it is (open findings, accepted risks). See `docs/12-memory.md`.

Reminder of the principle: gates are approved by humans; AI only prepares evidence.
