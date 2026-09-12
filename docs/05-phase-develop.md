# 05 — P4: Development

**Command:** `/chapter-forge:sdlc-develop "<story/feature to implement>"`
**Exit gate:** CI · **AI autonomy:** L3 (autonomous-sandbox — stops at the PR)

## Purpose

Implement per spec with TDD, loop until green, then hand off to independent reviewers — never self-merge.

## Agents

| Agent | Model | Role in this phase |
|---|---|---|
| `dev-executor` | sonnet | Implements per spec/ADR with TDD (test first → code → refactor). Stack: Java/Spring Boot, Kotlin, TypeScript, PostgreSQL. Coverage ≥ 80%. |
| `code-reviewer` | sonnet, READ-ONLY | Independent review: logic, security, quality, compliance impact. Severity-rated (CRITICAL/HIGH/MEDIUM/LOW). |
| `security-reviewer` | opus, READ-ONLY | OWASP/secrets/PCI/SCA review, independent from the author. |

## Workflow

1. `dev-executor` implements per spec with TDD, following the `secure-coding-banking` skill; coverage ≥ 80%, no hardcoded secrets, input validation at every boundary, parameterized queries.
2. **Loop** (L3, sandboxed): dev → run tests → if red, fix → repeat until tests are green and lint is clean. `/oh-my-claudecode:ralph` or `ultrawork` can drive this loop.
3. When code is ready, `code-reviewer` and `security-reviewer` review **independently** — reviewer ≠ author, preserving SoD. Every CRITICAL/HIGH must be fixed.
4. Run the CI gate check: PR approved by someone else, CI green, coverage met, 0 SAST/SCA Critical/High, 0 leaked secrets.
5. Update state (`current_phase: develop`, `pending_gate: CI`).

**Stop at the PR.** `dev-executor` never merges or deploys, and never approves its own PR.

## Guardrails active in this phase

This is where guardrails are most active day-to-day:

- **PII/secret guard** blocks reading/writing `.env`, keys, certs — relevant constantly while editing config/tests.
- **Dangerous-command guard** blocks destructive shell/git/SQL/infra commands even if `dev-executor` tries to "just clean things up."
- **Format & test reminder** (PostToolUse) fires automatically after every `.java/.kt/.ts/.sql` edit — reminds to run `./gradlew spotlessApply` + tests, or auto-runs `prettier` for TS/JS.

Full details: [10-guardrails.md](./10-guardrails.md).

## Artifacts produced

Code · Unit/integration tests (≥ 80% coverage) · PR with description (goal, changes, how to test) · SAST/SCA report

## CI Gate — Code / Build Gate (automated)

**Approver:** CI, Human reviewer

- PR approved by someone else (reviewer ≠ author/AI)
- CI green
- Coverage ≥ 80%
- 0 SAST/SCA findings at Critical/High
- 0 leaked secrets

## Next

Once the PR is merged past CI → [06-phase-test.md](./06-phase-test.md).
