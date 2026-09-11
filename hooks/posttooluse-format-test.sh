#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Chapter Forge — PostToolUse: remind to format & test after editing code
# Deliberately does NOT block (always exit 0). Only auto-formats if a fast formatter is available,
# and reminds to run tests — keeping the Shift-Left (P2) loop lightweight.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0

path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // ""')"
[ -z "$path" ] && exit 0
[ -f "$path" ] || exit 0

case "$path" in
  *.java|*.kt|*.kts)
    echo "[chapter-forge] JVM file edited. Reminder: run './gradlew spotlessApply' + tests for the relevant module before opening a PR (CI Gate: coverage ≥ 80%, 0 SAST/SCA Critical/High)." >&2
    ;;
  *.ts|*.tsx|*.js|*.jsx)
    # try prettier if available, otherwise skip
    if command -v npx >/dev/null 2>&1 && [ -f "$(dirname "$path")/../package.json" -o -f "package.json" ]; then
      npx --no-install prettier --write "$path" >/dev/null 2>&1 && \
        echo "[chapter-forge] prettier formatted $path." >&2
    fi
    ;;
  *.sql)
    echo "[chapter-forge] SQL file edited. Reminder: use parameterized queries (SQL injection prevention) — security boundary." >&2
    ;;
esac

exit 0
