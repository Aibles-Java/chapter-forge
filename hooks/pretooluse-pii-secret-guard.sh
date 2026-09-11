#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Chapter Forge — PreToolUse guard: block operations that touch secret/PII files
# Boundary B2: never bring real secrets / card data / PII into the AI's context.
#
# Applies to: Read | Edit | Write | MultiEdit | NotebookEdit
# Hook contract: read JSON from stdin; exit 2 = block (stderr is returned to Claude).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

input="$(cat)"

# jq is a dependency. Without jq -> warn clearly, do not hard-block so the whole team isn't stuck.
if ! command -v jq >/dev/null 2>&1; then
  echo "[chapter-forge] ⚠ jq not found — secret/PII guard skipped. Please install jq (brew install jq)." >&2
  exit 0
fi

path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // .tool_input.notebook_path // ""')"
[ -z "$path" ] && exit 0

base="$(basename "$path")"

# 1) Secret / key / certificate files by NAME — block directly.
#    (deliberately narrowed to avoid false-positives with code like SecretManager.java)
secret_name_re='(^\.env($|\.)|(^|\.)env\.(local|prod|production|secret)$|\.(pem|key|p12|jks|keystore|pfx|kdbx|ppk)$|^id_rsa|(^|[._-])credentials?([._-]|$)|(^|[._-])secrets?\.(ya?ml|json|env|txt|properties)$)'
if printf '%s' "$base" | grep -iEq "$secret_name_re"; then
  echo "[chapter-forge] ❌ BLOCKED: '$base' looks like a secret/key/certificate file." >&2
  echo "[chapter-forge] Boundary B2 — do not load secrets into the AI context. If you truly need it, handle it manually OUTSIDE the AI session, or use environment variables / a secret manager." >&2
  exit 2
fi

# 2) If this is a Read and the file exists: scan the content for clear card data / PII signs.
tool="$(printf '%s' "$input" | jq -r '.tool_name // ""')"
if [ "$tool" = "Read" ] && [ -f "$path" ]; then
  # PAN (13-19 digit card, allowing space/dash), CVV next to a label, private key block
  if LC_ALL=C grep -aEq '(^|[^0-9])([0-9][ -]?){13,19}([^0-9]|$)|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(cvv|cvc|card[_ -]?number|pan)\b' "$path" 2>/dev/null; then
    echo "[chapter-forge] ❌ BLOCKED: '$base' may contain card data / private keys / PII (PAN, CVV, PRIVATE KEY)." >&2
    echo "[chapter-forge] Boundary B2 — sensitive data must not enter the AI context. Mask it / use synthetic data first." >&2
    exit 2
  fi
fi

exit 0
