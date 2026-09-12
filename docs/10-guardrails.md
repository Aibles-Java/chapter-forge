# 10 — Guardrails (Hooks) Reference

Guardrails are enabled automatically when the plugin is installed — no per-phase opt-in. They enforce the **4 boundaries** of this SDLC at the tool-call level, not just as written policy:

1. AI is a Maker, not a Checker.
2. No real PII/card data enters the AI's context.
3. SoD for AI output (review agents are independent from authoring agents).
4. Every action is auditable.

| Hook event | Matcher | Script | Blocks? |
|---|---|---|---|
| `PreToolUse` | `Read \| Edit \| Write \| MultiEdit \| NotebookEdit` | `hooks/pretooluse-pii-secret-guard.sh` | Yes (`exit 2`) |
| `PreToolUse` | `Bash` | `hooks/pretooluse-dangerous-cmd-guard.sh` | Yes (`exit 2`) |
| `PostToolUse` | `Edit \| Write \| MultiEdit` | `hooks/posttooluse-format-test.sh` | No — reminder/auto-format only |
| `SessionStart` | (always) | `hooks/sessionstart-context.sh` | N/A — loads context |

## 1. PII / secret file guard

**Applies to:** `Read`, `Edit`, `Write`, `MultiEdit`, `NotebookEdit`
**Boundary:** never bring real secrets / card data / PII into the AI's context.

Blocks in two ways:

1. **By filename** — any file matching a secret/key/certificate pattern is blocked outright, regardless of read or write: `.env*`, `*.pem/.key/.p12/.jks/.keystore/.pfx/.kdbx/.ppk`, `id_rsa*`, `*credentials*`, `secrets.(yaml|json|env|txt|properties)`.
2. **By content, on Read only** — if the file exists and contains what looks like a PAN (13–19 digit card number), a CVV/CVC label, a `PRIVATE KEY` block, or the words `pan`/`card_number`, the read is blocked even if the filename looked innocent.

If `jq` is not installed, the hook **warns and allows** rather than hard-blocking the whole team — install `jq` (`brew install jq`) to get the actual protection.

**Test it:**
```bash
echo '{"tool_name":"Read","tool_input":{"file_path":"/x/.env"}}' | hooks/pretooluse-pii-secret-guard.sh
# expect: exit 2
```

## 2. Dangerous / prod-touching command guard

**Applies to:** `Bash`
**Boundary:** protects SoD and irreversibility — the agent must never run destructive commands or deploy to prod on its own.

Blocks:

| Pattern | Example blocked |
|---|---|
| Wide-scale destructive delete | `rm -rf /`, `rm -rf ~`, `rm -rf *` |
| Reading/copying secrets via shell (guard bypass) | `cat .env`, `scp id.pem ...` |
| Download-and-execute | `curl ... \| bash` |
| Force-push to protected branches | `git push --force origin main` |
| Prod-targeting infra commands | `kubectl ... prod`, `helm ... production`, `terraform apply/destroy` |
| Destructive SQL | `DROP TABLE`, `TRUNCATE TABLE`, unconditional `DELETE FROM x;` |
| Disabling audit/security | `auditctl --delete-all`, `setenforce 0`, `systemctl stop auditd` |

Every block prints which rule fired and reminds that the action must go through the proper human process (SoD, Gate G3, PAM) — the agent should not try to work around it.

**Test it:**
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | hooks/pretooluse-dangerous-cmd-guard.sh
# expect: exit 2
```

## 3. Format & test reminder

**Applies to:** `Edit`, `Write`, `MultiEdit` — **never blocks** (always `exit 0`).

Fires after editing:
- `*.java` / `*.kt` / `*.kts` → reminds to run `./gradlew spotlessApply` + tests before opening a PR.
- `*.ts` / `*.tsx` / `*.js` / `*.jsx` → auto-runs `prettier --write` if `npx` and a nearby `package.json` are available.
- `*.sql` → reminds to use parameterized queries (SQL injection boundary).

Kept deliberately lightweight (Shift-Left, not a hard gate) so it doesn't slow the P4 dev loop down.

## 4. SessionStart context

Loads a compact reminder at the start of every session: the 8-phase process exists, quick commands (`sdlc-status`, `sdlc-gate`), that guardrails are active, and that `chapter-context` MCP is available. If `.chapter-forge/sdlc-state.json` exists for the current directory, it also prints the current phase and pending gate. Output is deliberately short to save tokens.

## Project-level overlay (optional)

`docs/settings.sample.json` is a sample you can copy to `<repo>/.claude/settings.json` to add **project-level deny/ask rules** — these complement the hooks above, they don't replace them (the hooks still run even if you skip this file).

## Loosening guardrails

Per `CLAUDE.md`: **guardrails must not be loosened.** Do not add workarounds in `hooks/*.sh` to let a specific command through. If a guardrail is blocking a legitimate action, the fix is a human running that action outside the AI session — not weakening the pattern.
