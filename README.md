# Chapter Forge

A Claude Code harness that turns the **standard SDLC of the banking product** into a tool you can run every day: role-based agents, commands for the 8 phases, reference skills, **guardrail hooks** (blocking PII/secrets & dangerous commands), a **graph** describing the pipeline, and an **`chapter-context` MCP** that taps into context across the whole polyrepo.

> Goal: a member only needs to `install` one plugin to get the full process + guardrails + context, used consistently across every service.

---

## 1. Requirements

- **Claude Code** (the **Team/Enterprise** edition is recommended for a banking environment — admin, audit, no-training-by-default on data).
- **`jq`** — for the guardrail hooks (`brew install jq`).
- **Node.js ≥ 18** — for the `chapter-context` MCP.
- **ripgrep (`rg`)** — optional, speeds up `search_project` (there is a fallback if missing).

## 2. Installation (marketplace → plugin)

```bash
# 1) Add the internal marketplace (pointing at this repo)
/plugin marketplace add <git-url-of-this-repo>

# 2) Install the plugin
/plugin install chapter-forge@chapter-tools

# 3) Build the MCP server (once, and each time it is updated)
cd <plugin-path>/mcp/chapter-context && npm install && npm run build
```

Set up the workspace for the MCP (point it at the parent directory containing the service repos):

```bash
export CHAPTER_WORKSPACE=/Users/<you>/Workspace/chapter-java
```

> If not set, the MCP walks up from the current directory to find the workspace; setting the env is still the most reliable way.

## 3. Daily use

Start a feature and follow the pipeline:

| Command | Phase | What it does |
|---|---|---|
| `/chapter-forge:sdlc-status` | — | Where you are in the pipeline, which gate is pending |
| `/chapter-forge:sdlc-discover` | 1 → G0 | Requirements, data classification, risk register |
| `/chapter-forge:sdlc-design` | 2 → G1 | HLD/LLD, threat model, ADR, API spec |
| `/chapter-forge:sdlc-plan` | 3 | Refine backlog, test plan, DoR |
| `/chapter-forge:sdlc-develop` | 4 → CI | TDD + independent review, stops at the PR |
| `/chapter-forge:sdlc-test` | 5 → G2 | Test-gen, synthetic data, regression |
| `/chapter-forge:sdlc-release` | 6 → G3 | Change Request, Release Notes, Rollback |
| `/chapter-forge:sdlc-deploy` | 7 → GO_LIVE | Smoke test, health check |
| `/chapter-forge:sdlc-operate` | 8 | Observability, RCA, PIR |
| `/chapter-forge:sdlc-gate G2` | gate | Check the exit criteria of a gate |

Get project context quickly (via the `chapter-context` MCP): `list_services`, `get_service`, `search_project`, `search_knowledge_base`, `get_sdlc_graph`, `get_sdlc_state`.

## 4. Guardrails (enabled automatically when the plugin is installed)

- **PreToolUse** — block reading/writing secret·PII files (`.env`, `*.pem`, keys, certificates; scans for PAN/CVV/PRIVATE KEY on read) and **destructive/prod-touching commands** (`rm -rf /`, `git push --force main`, `kubectl … prod`, `terraform apply/destroy`, `DROP/TRUNCATE`, disabling audit…).
- **PostToolUse** — remind to format & test after editing JVM/TS/SQL code.
- **SessionStart** — load a compact SDLC context + the current feature's state.

> The guardrails map directly to the **4 boundaries** of the SDLC: AI is a Maker, not a Checker · no real PII/card data into the AI · SoD for AI output · audit every action.

## 5. Design principles

- **Gates belong to humans.** The AI (agents/commands) only *prepares the evidence*; approving G0–G3 and deploying to prod is done by a human.
- **Autonomy inversely proportional to risk.** L3 (automated) only in a sandbox with test coverage; on-prem core stays at L1.
- **SoD/Four-eyes.** The review agent is independent from the code-writing agent.

## 6. Structure

```
.claude-plugin/   plugin.json + marketplace.json
agents/           11 agents by RACI role
commands/         10 commands by phase + gate + status
skills/           reference skills (overview, compliance, gate-criteria, threat-modeling, secure-coding, synthetic-data)
hooks/            hooks.json + guardrail scripts
graph/            sdlc-graph.yaml — the pipeline source of truth
mcp/chapter-context/  TypeScript MCP tapping into polyrepo context
```

## 7. Maintenance

- Change the process/gates → update `graph/sdlc-graph.yaml` (commands & MCP read from here).
- Change guardrails → `hooks/*.sh` (test by piping a sample JSON into the script, expect `exit 2` when it blocks).
- Update the MCP → edit `mcp/chapter-context/src`, re-run `npm run build`.
