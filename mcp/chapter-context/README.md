# chapter-context (MCP server)

MCP server (stdio) providing **project-wide context** for the banking polyrepo.
It helps team members quickly get: the list of services, each repo's README/structure,
full-workspace text search, knowledge base lookups, the SDLC graph, and per-feature SDLC state.

**Fully read-only** — no write/delete tools whatsoever.

## Installation

```bash
cd mcp/chapter-context
npm install
npm run build      # compile TypeScript into dist/
```

Run the server:

```bash
node dist/index.js
```

## Workspace configuration (`CHAPTER_WORKSPACE`)

`CHAPTER_WORKSPACE` is the **parent directory** that contains the service repos
(onward-accounts-service, onward-onboarding-service, transfer-payments-service,
banking-knowledge-base, Onward-playbook, feature_flag, …).

Order for determining the workspace root:

1. If the `CHAPTER_WORKSPACE` env is set and exists → use it directly.
2. Otherwise walk **up** from `process.cwd()` until a directory containing ≥2 known repos is found.
3. Fallback: `process.cwd()`.

`CLAUDE_PLUGIN_ROOT` (optional) points at the plugin root directory (containing `graph/`) so the
`get_sdlc_graph` tool can find the graph file faster.

Example configuration in an MCP client:

```json
{
  "mcpServers": {
    "chapter-context": {
      "command": "node",
      "args": ["/path/to/mcp/chapter-context/dist/index.js"],
      "env": {
        "CHAPTER_WORKSPACE": "/Users/you/Workspace/chapter-java"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_services` | List service/knowledge repos: name, path, whether a README exists, language guessed from the build file. |
| `get_service(name)` | README + top-level structure + main build/manifest file of a service. |
| `search_project(query, maxResults?)` | Search text across the whole workspace (path:line + snippet). Prefers `rg`, falls back to an fs walk. |
| `search_knowledge_base(query)` | Search in banking-knowledge-base + Onward-playbook/content. |
| `get_sdlc_graph` | Return the content of `graph/sdlc-graph.yaml`. |
| `get_sdlc_state(repo?)` | Read `.chapter-forge/sdlc-state.json` (for a given repo or across the whole workspace) → phase/gate. |

## Security

The server **never** returns the content of sensitive files:
`.env*`, `*.pem`, `*.key`, `*.p12`, `*.jks`, `*.keystore`, `*.pfx`, `id_rsa*`,
`*credentials*`, `*secret*`. It also skips `node_modules`, `.git`, `dist`, `build`,
`target`, `.next`. Each result's content is truncated to ≤ 20KB to avoid bloating the context.
