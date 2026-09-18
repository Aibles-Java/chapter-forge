/**
 * Determines the workspace root (the parent directory containing the service repos) and the
 * safe file-reading utilities shared by every tool. This server is READ-ONLY.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { isExcludedDir, isSensitiveFile, truncate } from "./security.ts";

// Re-export so other modules (search.ts) share a single source.
export { isSensitiveFile } from "./security.ts";

/** "Known" directories used to identify the workspace root. */
export const KNOWN_DIRS = [
  "onward-accounts-service",
  "onward-onboarding-service",
  "transfer-payments-service",
  "banking-knowledge-base",
  "Onward-playbook",
  "feature_flag",
];

/** Repos that are service code (not knowledge base). */
export const KNOWN_SERVICES = [
  "onward-accounts-service",
  "onward-onboarding-service",
  "transfer-payments-service",
  "feature_flag",
  "feature_flag_ui",
];

/** Repos treated as knowledge base (docs) rather than service code. */
export const KNOWLEDGE_DIRS = ["banking-knowledge-base", "Onward-playbook"];

/** File extensions treated as text (safe to grep/read content). */
const TEXT_EXTENSIONS = new Set([
  ".md", ".mdx", ".txt", ".java", ".kt", ".kts", ".ts", ".tsx", ".js", ".jsx",
  ".json", ".yaml", ".yml", ".xml", ".gradle", ".properties", ".sql", ".sh",
  ".html", ".css", ".scss", ".vue", ".go", ".py", ".rb", ".toml", ".ini",
  ".cfg", ".conf", ".env.example", ".gitignore", ".dockerignore",
]);

/** Marker → guessed tech stack. */
const STACK_MARKERS: { file: string; stack: string }[] = [
  { file: "pom.xml", stack: "Java/Maven" },
  { file: "build.gradle", stack: "Java/Gradle" },
  { file: "build.gradle.kts", stack: "Kotlin/Gradle" },
  { file: "settings.gradle.kts", stack: "Kotlin/Gradle" },
  { file: "package.json", stack: "TypeScript/Node" },
  { file: "go.mod", stack: "Go" },
  { file: "requirements.txt", stack: "Python" },
  { file: "pyproject.toml", stack: "Python" },
  { file: "Cargo.toml", stack: "Rust" },
  { file: "Dockerfile", stack: "Docker" },
];

/** Count how many "known" directories exist directly under `dir`. */
function countKnownDirs(dir: string): number {
  let count = 0;
  for (const known of KNOWN_DIRS) {
    try {
      if (statSync(join(dir, known)).isDirectory()) count++;
    } catch {
      /* skip if it does not exist */
    }
  }
  return count;
}

/**
 * Return the workspace root:
 * 1. If env CHAPTER_WORKSPACE has a value and exists → use it.
 * 2. Otherwise walk UP from process.cwd(), stopping when a dir contains ≥2 known dirs.
 * 3. Fallback: process.cwd().
 */
export function resolveWorkspace(): string {
  const envRoot = process.env.CHAPTER_WORKSPACE?.trim();
  if (envRoot && existsSync(envRoot)) {
    return resolve(envRoot);
  }

  let current = process.cwd();
  while (true) {
    if (countKnownDirs(current) >= 2) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return process.cwd();
}

/** List the top-level entries of a directory, error-safe. */
export function safeReadDir(dir: string): { name: string; isDir: boolean }[] {
  try {
    return readdirSync(dir, { withFileTypes: true }).map((d) => ({
      name: d.name,
      isDir: d.isDirectory(),
    }));
  } catch {
    return [];
  }
}

/** true if the path looks like a text file (by extension). */
export function isTextFile(filePath: string): boolean {
  const name = basename(filePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(name)) return true;
  const ext = extname(name);
  return ext !== "" && TEXT_EXTENSIONS.has(ext);
}

/**
 * Read a text file safely:
 * - Block sensitive files (return null).
 * - Block overly large files (>5MB) — only read the beginning.
 * - Truncate content per the limit in security.truncate.
 */
export function safeReadFile(filePath: string): string | null {
  if (isSensitiveFile(filePath)) return null;
  try {
    const st = statSync(filePath);
    if (!st.isFile()) return null;
    if (st.size > 5 * 1024 * 1024) {
      return truncate(readFileSync(filePath, "utf8").slice(0, 100_000));
    }
    return truncate(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

/** Read a repo's README.md (if present), limited to a number of lines. */
export function readReadme(dir: string, maxLines = 120): string | null {
  for (const candidate of ["README.md", "readme.md", "README.MD", "Readme.md"]) {
    const p = join(dir, candidate);
    if (existsSync(p)) {
      const content = safeReadFile(p);
      if (content === null) return null;
      return content.split(/\r?\n/).slice(0, maxLines).join("\n");
    }
  }
  return null;
}

/** Guess a repo's tech stack based on marker files. */
export function detectStack(dir: string): string[] {
  const found = new Set<string>();
  for (const { file, stack } of STACK_MARKERS) {
    if (existsSync(join(dir, file))) found.add(stack);
  }
  return [...found];
}

/** Read the git 'origin' remote from .git/config if present (URL only, no secrets). */
export function readGitRemote(dir: string): string | null {
  const cfg = join(dir, ".git", "config");
  if (!existsSync(cfg)) return null;
  try {
    const content = readFileSync(cfg, "utf8");
    const lines = content.split(/\r?\n/);
    let inOrigin = false;
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith("[remote")) inOrigin = /"origin"/.test(t);
      else if (inOrigin && t.startsWith("url")) {
        const eq = t.indexOf("=");
        if (eq !== -1) return t.slice(eq + 1).trim();
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Path relative to the workspace root (for compact display). */
export function relPath(workspace: string, absPath: string): string {
  return relative(workspace, absPath) || ".";
}

/**
 * Recursively walk the fs, calling `visit` for each file that is NOT sensitive & NOT in an excluded dir.
 * Stops early when visit returns false (used to limit results).
 */
export function walkFiles(
  root: string,
  visit: (absPath: string) => boolean,
  maxDepth = 12,
): void {
  const stack: { dir: string; depth: number }[] = [{ dir: root, depth: 0 }];
  while (stack.length > 0) {
    const { dir, depth } = stack.pop()!;
    if (depth > maxDepth) continue;
    for (const entry of safeReadDir(dir)) {
      if (entry.isDir) {
        if (isExcludedDir(entry.name)) continue;
        stack.push({ dir: join(dir, entry.name), depth: depth + 1 });
      } else {
        if (isSensitiveFile(entry.name)) continue;
        const cont = visit(join(dir, entry.name));
        if (cont === false) return;
      }
    }
  }
}
