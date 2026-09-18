# CLAUDE.md — Chapter Forge (plugin development repo)

> Notes for whoever **develops this plugin itself**. When the plugin is installed into another repo, the operating context is loaded via the SessionStart hook + the `sdlc-overview` skill, not this file.

## What this is
A Claude Code plugin that packages the banking SDLC into: agents (roles), commands (phases), skills (references), hooks (guardrails), a graph (pipeline), and an MCP (polyrepo context).

## Invariants when editing
- **Gates are approved by humans.** Do not write commands/agents that self-approve G0–G3 or self-deploy to prod. The AI only prepares evidence.
- **SoD/Four-eyes.** The review agents (`code-reviewer`, `security-reviewer`, `compliance-checker`) are READ-ONLY and independent from the code-writing agent.
- **Guardrails must not be loosened.** `hooks/*.sh` block secret/PII and destructive/prod-touching commands; do not add workarounds.
- **The graph is the source of truth.** To change the process/gates → edit `graph/sdlc-graph.yaml` first; commands & MCP read from it.

## Conventions
- Language: English; keep technical terms in English.
- Command namespace when installed: `/chapter-forge:<command>`.
- MCP variable: `CHAPTER_WORKSPACE` = the parent directory containing the service repos.

## Quick tests
- Hooks: `echo '{"tool_name":"Read","tool_input":{"file_path":"/x/.env"}}' | hooks/pretooluse-pii-secret-guard.sh` → expect `exit 2`.
- MCP: `cd mcp/chapter-context && npm install && npm run build` → clean typecheck + bundle; commit `dist/index.js`.
- JSON/YAML: validate with `jq` / `python3 -c "import yaml,..."`.

## Structure
See `README.md` section 6.
