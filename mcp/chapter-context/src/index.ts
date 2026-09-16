#!/usr/bin/env node
/**
 * chapter-context — MCP server (stdio) providing project-wide context for the
 * banking polyrepo. Fully read-only: no write/delete tools.
 *
 * Run: node dist/index.js  (workspace root via env CHAPTER_WORKSPACE or auto-detected).
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  KNOWLEDGE_DIRS,
  KNOWN_DIRS,
  relPath,
  resolveWorkspace,
  safeReadDir,
  safeReadFile,
  walkFiles,
} from "./workspace.js";
import { searchText } from "./search.js";
import { parseYaml } from "./yaml-lite.js";

const WORKSPACE = resolveWorkspace();

/** Helper returning a standard text result for an MCP tool. */
function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

/** Guess a repo's language/stack from its build file. */
function detectLanguage(dir: string): string {
  const entries = new Set(safeReadDir(dir).map((e) => e.name));
  if (entries.has("pom.xml")) return "JVM (Maven)";
  if (entries.has("build.gradle") || entries.has("build.gradle.kts"))
    return "JVM (Gradle)";
  if (entries.has("package.json")) return "TypeScript/JavaScript";
  if (entries.has("go.mod")) return "Go";
  if (entries.has("Cargo.toml")) return "Rust";
  if (entries.has("requirements.txt") || entries.has("pyproject.toml"))
    return "Python";
  return "unknown";
}

/** List of repos (service + knowledge) that actually exist in the workspace. */
function listRepos(): { name: string; abs: string; kind: string }[] {
  const repos: { name: string; abs: string; kind: string }[] = [];
  for (const entry of safeReadDir(WORKSPACE)) {
    if (!entry.isDir) continue;
    if (entry.name.startsWith(".")) continue;
    const abs = join(WORKSPACE, entry.name);
    // Treat as a service repo only if it is in the known list OR has a build file/README.
    const isKnown = KNOWN_DIRS.includes(entry.name);
    const names = new Set(safeReadDir(abs).map((e) => e.name));
    const looksLikeRepo =
      names.has("README.md") ||
      names.has("package.json") ||
      names.has("pom.xml") ||
      names.has("build.gradle") ||
      names.has(".git");
    if (!isKnown && !looksLikeRepo) continue;
    const kind = KNOWLEDGE_DIRS.includes(entry.name) ? "knowledge" : "service";
    repos.push({ name: entry.name, abs, kind });
  }
  return repos.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Find the SDLC graph:
 * 1. env CLAUDE_PLUGIN_ROOT + /graph/sdlc-graph.yaml
 * 2. walk up relatively from the dist file location to the plugin root (which contains graph/).
 */
function findSdlcGraph(): string | null {
  const envRoot = process.env.CLAUDE_PLUGIN_ROOT?.trim();
  if (envRoot) {
    const p = join(envRoot, "graph", "sdlc-graph.yaml");
    if (existsSync(p)) return p;
  }
  // __dirname = <plugin>/mcp/chapter-context/dist → 3 levels up = plugin root.
  const here = dirname(fileURLToPath(import.meta.url));
  let current = here;
  for (let i = 0; i < 6; i++) {
    const p = join(current, "graph", "sdlc-graph.yaml");
    if (existsSync(p)) return p;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

/** Find the .chapter-forge/sdlc-state.json file for a repo (or scan the whole workspace). */
function findSdlcStateFiles(repo?: string): string[] {
  const results: string[] = [];
  const candidates = repo
    ? [join(WORKSPACE, repo)]
    : safeReadDir(WORKSPACE)
        .filter((e) => e.isDir && !e.name.startsWith("."))
        .map((e) => join(WORKSPACE, e.name));
  for (const dir of candidates) {
    const p = join(dir, ".chapter-forge", "sdlc-state.json");
    if (existsSync(p)) results.push(p);
  }
  return results;
}

/** Find repos (abs path + name) that have a .chapter-forge/memory directory. */
function findMemoryRepos(repo?: string): { name: string; abs: string; memoryDir: string }[] {
  const candidates = repo
    ? [{ name: repo, abs: join(WORKSPACE, repo) }]
    : safeReadDir(WORKSPACE)
        .filter((e) => e.isDir && !e.name.startsWith("."))
        .map((e) => ({ name: e.name, abs: join(WORKSPACE, e.name) }));
  return candidates
    .map((c) => ({ ...c, memoryDir: join(c.abs, ".chapter-forge", "memory") }))
    .filter((c) => existsSync(c.memoryDir));
}

/** Last N non-empty lines of a text file (used for the episodic log, which can grow large). */
function lastLines(content: string, n: number): string[] {
  return content.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(-n);
}

// ── Helpers to format the parsed SDLC graph ─────────────────────────────────────
function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}
function str(v: unknown): string {
  return v == null ? "" : String(v);
}
function strList(v: unknown): string {
  return asArr(v).map(String).join(", ");
}

/** Render the parsed SDLC graph as readable text: phases + gates + criteria. */
function formatGraph(g: Record<string, unknown>): string {
  const out: string[] = [];
  out.push(`version: ${str(g.version) || "(unknown)"}`);

  const phases = asArr(g.phases);
  out.push("", `## Phases (${phases.length})`);
  for (const p of phases) {
    const r = asObj(p);
    const gate = r.exit_gate == null ? "no gate" : `gate ${str(r.exit_gate)}`;
    out.push(`- [${str(r.id)}] ${str(r.key)} — ${str(r.name)} (${gate})`);
    if (r.command) out.push(`    command: ${str(r.command)}`);
    if (asArr(r.agents).length) out.push(`    agents: ${strList(r.agents)}`);
    if (asArr(r.artifacts).length) out.push(`    artifacts: ${strList(r.artifacts)}`);
    if (r.ai_autonomy) out.push(`    ai_autonomy: ${str(r.ai_autonomy)}`);
  }

  const gates = asObj(g.gates);
  const gateKeys = Object.keys(gates);
  out.push("", `## Gates (${gateKeys.length})`);
  for (const k of gateKeys) {
    const gg = asObj(gates[k]);
    out.push(`- ${k}: ${str(gg.name)}`);
    if (asArr(gg.approver).length) out.push(`    approver: ${strList(gg.approver)}`);
    for (const c of asArr(gg.criteria)) out.push(`    • ${String(c)}`);
  }

  if (asArr(g.services).length) out.push("", `## Services: ${strList(g.services)}`);
  if (asArr(g.knowledge).length) out.push(`## Knowledge: ${strList(g.knowledge)}`);
  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Server initialization
// ─────────────────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "chapter-context",
  version: "0.1.0",
});

// 1. list_services ────────────────────────────────────────────────────────────
server.registerTool(
  "list_services",
  {
    title: "List service/knowledge repos",
    description:
      "List the service and knowledge repos in the workspace: name, relative path, whether a README exists, and the language guessed from the build file (pom.xml/build.gradle→JVM, package.json→TS/JS).",
    inputSchema: {},
  },
  async () => {
    const repos = listRepos();
    if (repos.length === 0) {
      return textResult(
        `No repos found in workspace: ${WORKSPACE}\n` +
          "Check the CHAPTER_WORKSPACE variable or run the MCP from within the workspace.",
      );
    }
    const lines = repos.map((r) => {
      const names = new Set(safeReadDir(r.abs).map((e) => e.name));
      const readme = names.has("README.md") ? "has README" : "no README";
      const lang = detectLanguage(r.abs);
      return `- ${r.name} [${r.kind}] (${relPath(WORKSPACE, r.abs)}) — ${lang}, ${readme}`;
    });
    return textResult(
      `Workspace: ${WORKSPACE}\n\nRepos (${repos.length}):\n${lines.join("\n")}`,
    );
  },
);

// 2. get_service ────────────────────────────────────────────────────────────────
server.registerTool(
  "get_service",
  {
    title: "Service details",
    description:
      "Return the README, top-level structure, and main build/manifest file of a service (by repo directory name).",
    inputSchema: {
      name: z.string().describe("Repo directory name, e.g.: onward-accounts-service"),
    },
  },
  async ({ name }) => {
    const abs = join(WORKSPACE, name);
    if (!existsSync(abs)) {
      const available = listRepos()
        .map((r) => r.name)
        .join(", ");
      return textResult(
        `Service "${name}" not found.\nAvailable repos: ${available || "(none)"}`,
      );
    }

    const entries = safeReadDir(abs);
    const structure = entries
      .filter((e) => !e.name.startsWith(".git"))
      .map((e) => (e.isDir ? `${e.name}/` : e.name))
      .sort()
      .join("\n  ");

    const readme = safeReadFile(join(abs, "README.md"));
    const lang = detectLanguage(abs);

    // Main build/manifest file.
    const manifests = [
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
      "package.json",
      "go.mod",
      "Cargo.toml",
      "pyproject.toml",
    ];
    const foundManifest = manifests.find((m) => existsSync(join(abs, m)));
    const manifestContent = foundManifest
      ? safeReadFile(join(abs, foundManifest))
      : null;

    const parts = [
      `# Service: ${name}`,
      `Path: ${relPath(WORKSPACE, abs)}`,
      `Guessed language: ${lang}`,
      "",
      "## Top-level structure",
      `  ${structure}`,
      "",
      "## README.md",
      readme ?? "(no README.md)",
    ];
    if (manifestContent) {
      parts.push("", `## ${foundManifest}`, manifestContent);
    }
    return textResult(parts.join("\n"));
  },
);

// 3. search_project ─────────────────────────────────────────────────────────────
server.registerTool(
  "search_project",
  {
    title: "Search text across the workspace",
    description:
      "Search for a text string across the entire workspace (excluding node_modules/.git/dist/build/target/.next and sensitive files). Returns path:line with a short snippet.",
    inputSchema: {
      query: z.string().describe("String to search for (fixed-string, case-insensitive)"),
      maxResults: z
        .number()
        .int()
        .positive()
        .max(200)
        .optional()
        .describe("Maximum number of results (default 30)"),
    },
  },
  async ({ query, maxResults }) => {
    const limit = maxResults ?? 30;
    const { hits, engine } = searchText(WORKSPACE, [WORKSPACE], query, limit);
    if (hits.length === 0) {
      return textResult(`"${query}" not found in the workspace. (engine: ${engine})`);
    }
    const lines = hits.map((h) => `${h.file}:${h.line}: ${h.text}`);
    return textResult(
      `Search "${query}" — ${hits.length} results (engine: ${engine}):\n${lines.join("\n")}`,
    );
  },
);

// 4. search_knowledge_base ──────────────────────────────────────────────────────
server.registerTool(
  "search_knowledge_base",
  {
    title: "Search the knowledge base",
    description:
      "Search text in banking-knowledge-base and Onward-playbook/content. Returns snippets with their source (path:line).",
    inputSchema: {
      query: z.string().describe("String to search for in the docs"),
    },
  },
  async ({ query }) => {
    const roots = [
      join(WORKSPACE, "banking-knowledge-base"),
      join(WORKSPACE, "Onward-playbook", "content"),
    ].filter((p) => existsSync(p));

    if (roots.length === 0) {
      return textResult(
        "No knowledge base directory (banking-knowledge-base / Onward-playbook/content) found in the workspace.",
      );
    }

    const { hits, engine } = searchText(WORKSPACE, roots, query, 30);
    if (hits.length === 0) {
      return textResult(`"${query}" not found in the knowledge base. (engine: ${engine})`);
    }
    const lines = hits.map((h) => `- [${h.file}:${h.line}] ${h.text}`);
    return textResult(
      `Knowledge base results for "${query}" (${hits.length}):\n${lines.join("\n")}`,
    );
  },
);

// 5. get_playbook ───────────────────────────────────────────────────────────────
server.registerTool(
  "get_playbook",
  {
    title: "Read/list the playbook",
    description:
      "List documents (.md/.mdx) in the chapter-playbook/content. Pass a topic to read the best-matching doc's content; leave empty to list all.",
    inputSchema: {
      topic: z
        .string()
        .optional()
        .describe("Keyword for the doc name/path to read; leave empty to list"),
    },
  },
  async ({ topic }) => {
    const contentDir = join(WORKSPACE, "Onward-playbook", "content");
    if (!existsSync(contentDir)) {
      return textResult("Onward-playbook/content not found in the workspace.");
    }
    const docs: string[] = [];
    walkFiles(contentDir, (abs) => {
      const ext = extname(abs).toLowerCase();
      if (ext === ".md" || ext === ".mdx") docs.push(relPath(WORKSPACE, abs));
      return true;
    });
    docs.sort();

    if (!topic) {
      return textResult(
        `Playbook — ${docs.length} documents in ${relPath(WORKSPACE, contentDir)}:\n` +
          docs.map((d) => `- ${d}`).join("\n"),
      );
    }
    const hit = docs.find((d) => d.toLowerCase().includes(topic.toLowerCase()));
    if (!hit) {
      return textResult(
        `No doc matches "${topic}".\nList:\n` +
          docs.map((d) => `- ${d}`).join("\n"),
      );
    }
    const content = safeReadFile(join(WORKSPACE, hit));
    return textResult(`# ${hit}\n\n${content ?? "(could not read)"}`);
  },
);

// 6. get_sdlc_graph ─────────────────────────────────────────────────────────────
server.registerTool(
  "get_sdlc_graph",
  {
    title: "Get the SDLC graph (parsed)",
    description:
      "Return the parsed graph/sdlc-graph.yaml: phases and gates with their criteria — the source of truth for the the chapter SDLC pipeline.",
    inputSchema: {},
  },
  async () => {
    const graphPath = findSdlcGraph();
    if (!graphPath) {
      return textResult(
        "graph/sdlc-graph.yaml not found.\n" +
          "Hint: set the CLAUDE_PLUGIN_ROOT environment variable to point at the plugin root (which contains the graph/ directory), " +
          "or make sure the MCP is installed inside the chapter-forge plugin.",
      );
    }
    const content = safeReadFile(graphPath);
    if (content === null) {
      return textResult(`Could not read graph file: ${graphPath}`);
    }
    try {
      const parsed = parseYaml(content);
      const summary = formatGraph(asObj(parsed));
      return textResult(
        `# SDLC Graph (parsed) — ${relPath(WORKSPACE, graphPath)}\n\n${summary}`,
      );
    } catch {
      // Parse error → return the raw content so no information is lost.
      return textResult(`# ${graphPath} (raw, parse error)\n\n${content}`);
    }
  },
);

// 7. get_sdlc_state ─────────────────────────────────────────────────────────────
server.registerTool(
  "get_sdlc_state",
  {
    title: "Get the feature's SDLC state",
    description:
      "Read .chapter-forge/sdlc-state.json (for the specified repo, or scan the whole workspace) and return the current phase/gate.",
    inputSchema: {
      repo: z
        .string()
        .optional()
        .describe("Repo name to read state from; leave empty to scan the whole workspace"),
    },
  },
  async ({ repo }) => {
    const files = findSdlcStateFiles(repo);
    if (files.length === 0) {
      return textResult(
        repo
          ? `.chapter-forge/sdlc-state.json not found in repo "${repo}".`
          : ".chapter-forge/sdlc-state.json not found in the workspace.",
      );
    }
    const blocks: string[] = [];
    for (const file of files) {
      const raw = safeReadFile(file);
      if (raw === null) {
        blocks.push(`## ${relPath(WORKSPACE, file)}\n(could not read)`);
        continue;
      }
      let summary = raw;
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const phase = parsed.phase ?? parsed.stage ?? "(unknown)";
        const gate = parsed.gate ?? parsed.currentGate ?? "(unknown)";
        const feature = parsed.feature ?? parsed.featureId ?? parsed.name ?? "";
        summary =
          `feature: ${String(feature)}\nphase/stage: ${String(phase)}\ngate: ${String(gate)}\n\n` +
          `--- full JSON ---\n${raw}`;
      } catch {
        summary = `(invalid JSON, returning raw content)\n${raw}`;
      }
      blocks.push(`## ${relPath(WORKSPACE, file)}\n${summary}`);
    }
    return textResult(blocks.join("\n\n"));
  },
);

// 8. get_project_memory ─────────────────────────────────────────────────────────
server.registerTool(
  "get_project_memory",
  {
    title: "Get a repo's project memory (episodic/semantic/procedural)",
    description:
      "Read .chapter-forge/memory for a repo (or all repos if omitted). Defaults to 'semantic' " +
      "(MEMORY.md index + domain-facts.md + decision titles) — the cheapest to read. " +
      "'procedural' lists playbooks with their seen_count/promote_candidate. " +
      "'episodic' returns the last lines of gate-log.jsonl (raw event log — noisier, use sparingly). " +
      "See docs/12-memory.md for the schema.",
    inputSchema: {
      repo: z
        .string()
        .optional()
        .describe("Repo name; leave empty to scan every repo with a memory/ dir"),
      type: z
        .enum(["episodic", "semantic", "procedural"])
        .optional()
        .describe("Defaults to 'semantic'"),
    },
  },
  async ({ repo, type }) => {
    const kind = type ?? "semantic";
    const repos = findMemoryRepos(repo);
    if (repos.length === 0) {
      return textResult(
        repo
          ? `No .chapter-forge/memory found in repo "${repo}".`
          : "No .chapter-forge/memory found in any repo in the workspace.",
      );
    }

    const blocks: string[] = [];
    for (const r of repos) {
      if (kind === "episodic") {
        const logPath = join(r.memoryDir, "episodic", "gate-log.jsonl");
        const raw = safeReadFile(logPath);
        if (raw === null) {
          blocks.push(`## ${r.name}\n(no episodic/gate-log.jsonl)`);
          continue;
        }
        const tail = lastLines(raw, 50);
        blocks.push(
          `## ${r.name} — last ${tail.length} episodic entries\n${tail.join("\n")}`,
        );
      } else if (kind === "procedural") {
        const dir = join(r.memoryDir, "procedural", "playbooks");
        const files = safeReadDir(dir).filter((e) => !e.isDir && e.name.endsWith(".md"));
        if (files.length === 0) {
          blocks.push(`## ${r.name}\n(no procedural playbooks)`);
          continue;
        }
        const lines = files.map((f) => `- ${relPath(WORKSPACE, join(dir, f.name))}`);
        blocks.push(`## ${r.name} — playbooks (${files.length})\n${lines.join("\n")}`);
      } else {
        const semDir = join(r.memoryDir, "semantic");
        const index = safeReadFile(join(semDir, "MEMORY.md"));
        const facts = safeReadFile(join(semDir, "domain-facts.md"));
        const decisionsDir = join(semDir, "decisions");
        const decisions = safeReadDir(decisionsDir).filter(
          (e) => !e.isDir && e.name.endsWith(".md"),
        );
        const parts = [
          index ? `### MEMORY.md\n${index}` : "### MEMORY.md\n(none)",
          facts ? `### domain-facts.md\n${facts}` : "### domain-facts.md\n(none)",
          decisions.length
            ? `### decisions (${decisions.length})\n` +
              decisions.map((d) => `- ${relPath(WORKSPACE, join(decisionsDir, d.name))}`).join("\n")
            : "### decisions\n(none)",
        ];
        blocks.push(`## ${r.name}\n${parts.join("\n\n")}`);
      }
    }
    return textResult(blocks.join("\n\n---\n\n"));
  },
);

// 9. search_project_memory ──────────────────────────────────────────────────────
server.registerTool(
  "search_project_memory",
  {
    title: "Search project memory across repos",
    description:
      "Search text in every repo's .chapter-forge/memory/semantic + memory/procedural (default) — " +
      "distilled, curated memory, safe to search broadly across the polyrepo. " +
      "Pass type='episodic' to search the raw gate-log.jsonl instead (noisier, use only when you need the event history).",
    inputSchema: {
      query: z.string().describe("String to search for"),
      repo: z.string().optional().describe("Limit the search to one repo; leave empty to search all"),
      type: z
        .enum(["episodic", "semantic-and-procedural"])
        .optional()
        .describe("Defaults to 'semantic-and-procedural'"),
    },
  },
  async ({ query, repo, type }) => {
    const repos = findMemoryRepos(repo);
    if (repos.length === 0) {
      return textResult(
        repo
          ? `No .chapter-forge/memory found in repo "${repo}".`
          : "No .chapter-forge/memory found in any repo in the workspace.",
      );
    }
    const roots =
      type === "episodic"
        ? repos.map((r) => join(r.memoryDir, "episodic"))
        : repos.flatMap((r) => [
            join(r.memoryDir, "semantic"),
            join(r.memoryDir, "procedural"),
          ]);
    const existingRoots = roots.filter((p) => existsSync(p));
    if (existingRoots.length === 0) {
      return textResult("No matching memory directories found for that repo/type.");
    }

    const { hits, engine } = searchText(WORKSPACE, existingRoots, query, 30);
    if (hits.length === 0) {
      return textResult(`"${query}" not found in project memory. (engine: ${engine})`);
    }
    const lines = hits.map((h) => `- [${h.file}:${h.line}] ${h.text}`);
    return textResult(
      `Project memory results for "${query}" (${hits.length}):\n${lines.join("\n")}`,
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Connect over stdio
// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Do not log to stdout (reserved for the MCP protocol); use stderr for debugging.
  console.error(`[chapter-context] MCP server ready. Workspace: ${WORKSPACE}`);
}

main().catch((err) => {
  console.error("[chapter-context] Startup error:", err);
  process.exit(1);
});
