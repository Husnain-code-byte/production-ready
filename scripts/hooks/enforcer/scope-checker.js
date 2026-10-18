import path from "node:path";
import { AGENT_SCOPES } from "./agent-scopes.js";
import { AGENT_ALIASES, DEFAULT_AGENT, SAFE_ENV_TEMPLATES, UNIVERSAL_DENY_PATHS } from "./constants.js";

export function normalizeAgentName(name) {
  if (!name || typeof name !== "string") return DEFAULT_AGENT;
  let n = name.replace(/^\d+-/, "").toLowerCase().trim();
  if (AGENT_ALIASES[n]) n = AGENT_ALIASES[n];
  return AGENT_SCOPES[n] ? n : DEFAULT_AGENT;
}

export function pathMatches(filePath, pattern, isDeny = false) {
  if (!filePath || !pattern) return false;
  if (pattern === "*") return true;
  const raw = String(filePath).replace(/\\/g, "/");
  let normalized = path.posix.normalize(raw).replace(/^(\.\/)+/, "").replace(/^\/+/, "");
  if (normalized.startsWith("..") || normalized.split("/").includes("..")) return false;

  let pat = pattern.replace(/\\/g, "/").replace(/^(\.\/)+/, "").replace(/^\/+/, "");
  if (isDeny) {
    normalized = normalized.toLowerCase();
    pat = pat.toLowerCase();
  }

  if (pat.endsWith("/")) {
    const dirPrefix = pat.slice(0, -1);
    if (isDeny) {
      return normalized === dirPrefix || normalized.startsWith(pat) || normalized.includes("/" + pat);
    }
    return normalized === dirPrefix || normalized.startsWith(pat);
  }
  if (pat.includes("*")) {
    const regexStr = "^" + pat.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
    const baseName = normalized.split("/").pop();
    return new RegExp(regexStr).test(normalized) || new RegExp(regexStr).test(baseName);
  }
  if (isDeny) {
    return normalized === pat || normalized.startsWith(pat + "/") || normalized.includes("/" + pat + "/") || normalized.endsWith("/" + pat);
  }
  return normalized === pat || normalized.startsWith(pat + "/");
}

export function checkScope(agentName, op, filePath, projectRoot = "") {
  if (!filePath) return { allowed: true };

  let rawChanged = String(filePath).trim();
  try {
    rawChanged = decodeURIComponent(rawChanged);
  } catch {}
  rawChanged = rawChanged.replace(/\\/g, "/");

  // 1. Path traversal & home expansion block
  if (rawChanged.split("/").includes("..") || rawChanged.startsWith("~") || rawChanged.includes("%2e%2e")) {
    return { allowed: false, reason: `[SCOPE VIOLATION] Path traversal or home expansion ("${filePath}") is strictly forbidden.` };
  }

  let normalized = path.posix.normalize(rawChanged);
  if (projectRoot) {
    const rootNorm = path.posix.normalize(String(projectRoot).replace(/\\/g, "/")).replace(/\/$/, "");
    if (rawChanged.startsWith("/") || /^[a-zA-Z]:\//.test(rawChanged)) {
      if (normalized !== rootNorm && !normalized.startsWith(rootNorm + "/")) {
        return { allowed: false, reason: `[SCOPE VIOLATION] Out-of-workspace path ("${filePath}") is outside project root ("${projectRoot}").` };
      }
    }
    if (normalized.startsWith(rootNorm + "/")) normalized = normalized.slice(rootNorm.length + 1);
    else if (normalized === rootNorm) normalized = "";
  } else if (rawChanged.startsWith("/") || /^[a-zA-Z]:\//.test(rawChanged)) {
    return { allowed: false, reason: `[SCOPE VIOLATION] Absolute path ("${filePath}") is forbidden without a verified workspace root.` };
  }
  normalized = normalized.replace(/^\/+/, "");

  // 2. Universal governance self-protection & sensitive secret file protection
  const baseName = normalized.split("/").pop();
  const isSecretDir = normalized.toLowerCase().startsWith("secrets/") || normalized.toLowerCase().includes("/secrets/");
  if (isSecretDir || !SAFE_ENV_TEMPLATES.has(baseName.toLowerCase())) {
    for (const denyPat of UNIVERSAL_DENY_PATHS) {
      if (pathMatches(normalized, denyPat, true) || (normalized.includes("*") && pathMatches(denyPat, normalized, true))) {
        return { allowed: false, reason: `[SCOPE VIOLATION] Protected credential/secret/governance path "${normalized}" is universally denied.` };
      }
    }
  }

  // 3. Agent Lookup
  const normalizedAgent = normalizeAgentName(agentName);
  const agent = AGENT_SCOPES[normalizedAgent];
  if (!agent) {
    return { allowed: false, reason: `[SCOPE VIOLATION] Unknown agent identity "${agentName}". Access denied by zero-trust policy.` };
  }

  const scope = agent[op];
  if (!scope) return { allowed: true };

  // 4. Explicit denies
  if (scope.deny && scope.deny.length > 0) {
    for (const pattern of scope.deny) {
      if (pattern !== "*" && pathMatches(normalized, pattern, true)) {
        if (!isSecretDir && SAFE_ENV_TEMPLATES.has(baseName.toLowerCase()) && (pattern === ".env" || pattern === ".env.*" || pattern.startsWith(".env"))) {
          continue;
        }
        return { allowed: false, reason: `Production Level Rule: ${normalizedAgent} is explicitly denied access to ${filePath}` };
      }
    }
  }

  // 5. Explicit allows
  if (scope.allow && scope.allow.length > 0) {
    for (const pattern of scope.allow) {
      if (pathMatches(normalized, pattern, false)) return { allowed: true };
    }
    return { allowed: false, reason: `Production Level Scope Boundary: ${normalizedAgent} can only edit these paths: ${scope.allow.join(", ")}` };
  }

  // 6. Catch-all deny
  if (scope.deny && scope.deny.includes("*")) {
    return { allowed: false, reason: `Production Level Scope Boundary: ${normalizedAgent} is read-only (edits denied)` };
  }

  return { allowed: true };
}
