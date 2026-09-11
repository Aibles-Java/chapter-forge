/**
 * Security layer: decides which files/directories MAY be read and enforces size limits.
 * This is a read-only server, so the only risk is accidentally returning sensitive content.
 */

/** Directories always skipped when walking / searching. */
export const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "target",
  ".next",
]);

/**
 * Sensitive file-name patterns — NEVER return their content.
 * Covers: environment variables, keys/certificates, keystores, credentials, secrets.
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /(^|\/)\.env($|\.|\b)/i, // .env, .env.local, .env.production ...
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.jks$/i,
  /\.keystore$/i,
  /\.pfx$/i,
  /(^|\/)id_rsa($|\.)/i,
  /credentials/i,
  /secret/i,
];

/** Per-result content limit (20KB) to avoid bloating the context. */
export const MAX_CONTENT_BYTES = 20 * 1024;

/** true if the directory name is in the exclusion list. */
export function isExcludedDir(name: string): boolean {
  return EXCLUDED_DIRS.has(name);
}

/**
 * true if the path / file name is considered sensitive and must be blocked.
 * Accepts both a file name and a path (used for testing patterns that contain "/").
 */
export function isSensitiveFile(pathOrName: string): boolean {
  const normalized = pathOrName.replace(/\\/g, "/");
  return SENSITIVE_PATTERNS.some((re) => re.test(normalized));
}

/**
 * Truncate content to at most MAX_CONTENT_BYTES, adding a note if truncated.
 * Truncates by byte (UTF-8) to respect the real limit.
 */
export function truncate(text: string, max = MAX_CONTENT_BYTES): string {
  const buf = Buffer.from(text, "utf8");
  if (buf.length <= max) return text;
  const sliced = buf.subarray(0, max).toString("utf8");
  return `${sliced}\n\n… [truncated: content longer than ${max} bytes]`;
}
