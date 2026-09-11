#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Chapter Forge — PreToolUse guard: block dangerous / prod-touching Bash commands
# Protects SoD & irreversibility: the agent must NOT run destructive commands or deploy to prod on its own.
#
# Applies to: Bash
# Hook contract: read JSON from stdin; exit 2 = block (stderr is returned to Claude).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

input="$(cat)"

if ! command -v jq >/dev/null 2>&1; then
  echo "[chapter-forge] ⚠ jq not found — command guard skipped. Install jq (brew install jq)." >&2
  exit 0
fi

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"
[ -z "$cmd" ] && exit 0

block() {
  echo "[chapter-forge] ❌ BLOCKED: $1" >&2
  echo "[chapter-forge] Command: $cmd" >&2
  echo "[chapter-forge] This is a destructive / production-touching action — it must be performed by a HUMAN through the proper process (SoD, Gate G3, PAM). The agent must not run it itself." >&2
  exit 2
}

# 1) Wide-scale destructive deletion
printf '%s' "$cmd" | grep -Eq '\brm\s+(-[a-zA-Z]*\s+)*-?[a-zA-Z]*[rf][a-zA-Z]*\s+(/|~|\$HOME|\*|\.\s|\.$)' && \
  block "recursive/-force rm at a dangerous path (/, ~, *)."

# 2) Reading/copying secret files via the shell (bypassing the file guard)
printf '%s' "$cmd" | grep -iEq '\b(cat|less|more|head|tail|bat|cp|scp|rsync|xxd|strings)\b[^|;&]*\.(env|pem|key|p12|jks|keystore|pfx)\b' && \
  block "reading/copying secret/key files via the shell (guard bypass)."
printf '%s' "$cmd" | grep -iEq '\b(cat|less|more|head|tail)\b[^|;&]*(^|/)\.env(\s|$|\.)' && \
  block "reading a .env file via the shell."

# 3) Download and execute directly (supply-chain risk)
printf '%s' "$cmd" | grep -iEq '\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(bash|sh|zsh|python[0-9.]*)\b' && \
  block "downloading a script from the network and executing it directly (curl|wget | sh)."

# 4) Git operations that rewrite history / force onto main branches
printf '%s' "$cmd" | grep -Eq '\bgit\s+push\b[^&|;]*(--force|-f)\b[^&|;]*(main|master|release|prod)' && \
  block "git push --force to a main/master/release/prod branch."
printf '%s' "$cmd" | grep -Eq '\bgit\s+push\b[^&|;]*(main|master|release|prod)[^&|;]*(--force|-f)\b' && \
  block "git push --force to a main/master/release/prod branch."

# 5) Deployment / infrastructure touching PRODUCTION
printf '%s' "$cmd" | grep -iEq '\b(kubectl|helm)\b[^&|;]*(prod|production)' && \
  block "kubectl/helm operation targeting a prod/production environment."
printf '%s' "$cmd" | grep -iEq '\bterraform\s+(apply|destroy)\b' && \
  block "terraform apply/destroy — infrastructure changes must go through CAB/Gate G3."

# 6) Destructive database operations
printf '%s' "$cmd" | grep -iEq '\b(DROP\s+(DATABASE|TABLE|SCHEMA)|TRUNCATE\s+TABLE|DELETE\s+FROM\s+[a-zA-Z_.]+\s*;?\s*$)\b' && \
  block "destructive SQL statement (DROP/TRUNCATE/unconditional DELETE)."

# 7) Disabling/tampering with audit & security
printf '%s' "$cmd" | grep -iEq '\b(auditd|auditctl)\b[^&|;]*\b(stop|disable|--delete-all)\b|\bsetenforce\s+0\b|\bsystemctl\s+(stop|disable)\s+auditd\b' && \
  block "disabling audit logging or SELinux."

exit 0
