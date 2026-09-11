#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Chapter Forge — SessionStart: load a compact SDLC context at the start of the session.
# SessionStart stdout is appended to Claude's context — keep it SHORT to save tokens.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

cat <<'EOF'
[Chapter Forge active]
- Process: 8 phases · Gates G0–G3 · principles of SoD / Four-eyes / AI-is-a-Maker-not-a-Checker.
- Quick commands: /chapter-forge:sdlc-status (where you are) · :sdlc-gate (check gate criteria).
- Guardrails enabled: block reading/writing secret·PII and destructive/prod-touching commands.
- Project context: use the chapter-context MCP (search_project, list_services, search_knowledge_base...).
EOF

# If a state file for the current feature exists, print the running phase.
state_file=".chapter-forge/sdlc-state.json"
if [ -f "$state_file" ] && command -v jq >/dev/null 2>&1; then
  phase="$(jq -r '.current_phase // empty' "$state_file" 2>/dev/null)"
  gate="$(jq -r '.pending_gate // empty' "$state_file" 2>/dev/null)"
  [ -n "$phase" ] && echo "- Current feature: phase '$phase'${gate:+, waiting on gate $gate}."
fi

exit 0
