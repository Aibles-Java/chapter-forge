# Chapter Forge

A Claude Code harness that turns the **standard SDLC of the banking product** into a tool you can run every day: role-based agents, commands for the 8 phases, reference skills, **guardrail hooks** (blocking PII/secrets & dangerous commands), a **graph** describing the pipeline, and an **`chapter-context` MCP** that taps into context across the whole polyrepo.

> Goal: a member only needs to `install` one plugin to get the full process + guardrails + context, used consistently across every service.

**Full usage guide (by phase and by role): [docs/README.md](./docs/README.md).**

---

## 1. Requirements

- **Claude Code** (the **Team/Enterprise** edition is recommended for a banking environment — admin, audit, no-training-by-default on data).
- **`jq`** — for the guardrail hooks (`brew install jq`).
- **Node.js ≥ 22.18** — for the `chapter-context` MCP (runs TypeScript directly via native type stripping).
- **ripgrep (`rg`)** — optional, speeds up `search_project` (there is a fallback if missing).

## 2. Installation (marketplace → plugin)

```bash
# 1) Add the internal marketplace (pointing at this repo)
/plugin marketplace add <git-url-of-this-repo>

# 2) Install the plugin
/plugin install chapter-forge@chapter-tools
```

The `chapter-context` MCP needs no build step: Claude Code installs its runtime dependencies from the plugin-root `package-lock.json` during install/update, and Node runs the TypeScript source directly. Each Claude Code session starts its own MCP process. If Node is too old or the dependencies are missing, the SessionStart hook prints a warning.

**Workspace (`CHAPTER_WORKSPACE`)** — the parent directory containing the service repos. It is optional and is read when `claude` starts, so set it *before* launching:

| Where | Scope |
|---|---|
| Not set | The MCP walks up from the directory where you started `claude` to find the workspace (start inside any service repo) |
| `CHAPTER_WORKSPACE=/path claude` | That session only |
| `export CHAPTER_WORKSPACE=/path` in `~/.zshrc` | Every session |

## 3. Daily use

Start a feature and follow the pipeline:

| Command | Phase | What it does |
|---|---|---|
| `/chapter-forge:sdlc-status` | — | Where you are in the pipeline, which gate is pending |
| `/chapter-forge:sdlc-discover` | 1 → G0 | Requirements, data classification, risk register |
| `/chapter-forge:sdlc-design` | 2 → G1 | HLD/LLD, threat model + sequence diagram, ADR, API spec, ERD, class diagram |
| `/chapter-forge:sdlc-plan` | 3 | Refine backlog, test plan, release sketch, loop to DoR |
| `/chapter-forge:sdlc-develop` | 4 → CI | TDD + independent review, stops at the PR |
| `/chapter-forge:sdlc-test` | 5 → G2 | Test-gen, synthetic data, regression |
| `/chapter-forge:sdlc-release` | 6 → G3 | Change Request, Release Notes, Rollback |
| `/chapter-forge:sdlc-deploy` | 7 → GO_LIVE | Smoke test, health check |
| `/chapter-forge:sdlc-operate` | 8 | Observability, RCA, PIR |
| `/chapter-forge:sdlc-gate G2` | gate | Check the exit criteria of a gate |
| `/chapter-forge:sdlc-remember` | — | Distill episodic memory into semantic decisions/facts and procedural playbooks |

Get project context quickly (via the `chapter-context` MCP): `list_services`, `get_service`, `search_project`, `search_knowledge_base`, `get_playbook`, `get_sdlc_graph`, `get_sdlc_state`, `get_project_memory`, `search_project_memory`.

For the full per-phase workflow (agents, guardrails, artifacts, exit criteria) and per-role use cases ("I'm a Product Owner/Architect/Developer/QA/..., what do I run?"), see [docs/README.md](./docs/README.md).

## 4. Guardrails (enabled automatically when the plugin is installed)

- **PreToolUse** — block reading/writing secret·PII files (`.env`, `*.pem`, keys, certificates; scans for PAN/CVV/PRIVATE KEY on read) and **destructive/prod-touching commands** (`rm -rf /`, `git push --force main`, `kubectl … prod`, `terraform apply/destroy`, `DROP/TRUNCATE`, disabling audit…).
- **PostToolUse** — remind to format & test after editing JVM/TS/SQL code.
- **SessionStart** — load a compact SDLC context + the current feature's state.

> The guardrails map directly to the **4 boundaries** of the SDLC: AI is a Maker, not a Checker · no real PII/card data into the AI · SoD for AI output · audit every action.

## 5. Design principles

- **Gates belong to humans.** The AI (agents/commands) only *prepares the evidence*; approving G0–G3 and deploying to prod is done by a human.
- **Autonomy inversely proportional to risk.** L3 (automated) only in a sandbox with test coverage; on-prem core stays at L1.
- **SoD/Four-eyes.** The review agent is independent from the code-writing agent.
- **Review findings loop back, they don't get logged and forgotten.** In P2 (design), a CRITICAL/HIGH finding from `threat-modeler`/`security-reviewer` sends `solution-architect` back to revise the artifact — see the Group 4 convergence loop in `commands/sdlc-design.md`.

## 6. Structure

```
.claude-plugin/   plugin.json + marketplace.json
agents/           11 agents by RACI role
commands/         10 commands by phase + gate + status
skills/           reference skills (overview, compliance, gate-criteria, threat-modeling, secure-coding, synthetic-data)
hooks/            hooks.json + guardrail scripts
graph/            sdlc-graph.yaml — the pipeline source of truth
mcp/chapter-context/  TypeScript MCP tapping into polyrepo context
docs/             full usage guide — overview, per-phase workflow, guardrail reference, per-role use cases, project memory reference
```

## 7. Maintenance

- Change the process/gates → update `graph/sdlc-graph.yaml` (commands & MCP read from here).
- Change guardrails → `hooks/*.sh` (test by piping a sample JSON into the script, expect `exit 2` when it blocks).
- Update the MCP → edit `mcp/chapter-context/src`, then `npm run typecheck` in `mcp/chapter-context` (no build; see its README). Runtime deps go in the root `package.json`, dev tooling in `mcp/chapter-context/package.json`.
