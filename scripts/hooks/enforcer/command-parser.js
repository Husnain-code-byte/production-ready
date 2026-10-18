import { isEscaped, splitShellCommands, splitTopLevelChains } from "./subshell-parser.js";

export { isEscaped, splitShellCommands, splitTopLevelChains };

export function normalizeCommand(rawCmd) {
  if (!rawCmd) return "";
  let s = String(rawCmd).trim();

  // Strip line continuations and shell variable IFS
  s = s.replace(/\\\n/g, "").replace(/\$IFS\b/g, " ");

  // Strip outer subshell parentheses and POSIX brace groups: ( git commit ) or { git commit; }
  s = s.replace(/^[\s({\s;]+/, "").replace(/[\s)}\s;]+$/, "").trim();

  // Peel leading env assignments and wrappers with args
  let prev;
  do {
    prev = s;
    s = s.replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s]+)\s+)+/, "").trim();
    s = s.replace(/^(?:(?:\/usr\/(?:local\/)?bin\/|\/bin\/)?(?:env|command|nohup|nice|time|sudo|timeout|stdbuf|builtin)\s+(?:-(?:u|n|g|s|k|i|o|e|S)\s+\S+\s+|-[a-zA-Z0-9-]+=\S+\s+|-[a-zA-Z0-9-]+\s+)*)/i, "").trim();
    if (/^timeout\s+\d+[smhd]?\s+/i.test(s)) s = s.replace(/^timeout\s+\d+[smhd]?\s+/i, "").trim();
    if (/^\d+[smhd]?\s+/.test(s)) s = s.replace(/^\d+[smhd]?\s+/, "").trim();
  } while (s !== prev);

  // Strip binary path prefix (/usr/bin/git -> git)
  s = s.replace(/^(?:\/[a-zA-Z0-9_.-]+)+\/([a-zA-Z0-9_.-]+)/, "$1");

  // Unquote/unescape the first few command tokens
  const rawTokens = s.split(/\s+/);
  for (let i = 0; i < Math.min(rawTokens.length, 3); i++) {
    if (!rawTokens[i].startsWith("-") || rawTokens[i].startsWith('"-') || rawTokens[i].startsWith("'-")) {
      rawTokens[i] = rawTokens[i].replace(/^["'](.*)["']$/, "$1").replace(/"([^"]*)"/g, "$1").replace(/'([^']*)'/g, "$1").replace(/\\(.)/g, "$1");
    }
  }
  s = rawTokens.join(" ");

  // Normalize git global flags: git -C <dir> commit -> git commit
  if (/^git\s+/i.test(s)) {
    const parts = s.replace(/^git\s+/i, "").split(/\s+/);
    let idx = 0;
    while (idx < parts.length) {
      const p = parts[idx];
      if (p.startsWith("-")) {
        if (["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"].includes(p)) idx += 2;
        else idx += 1;
      } else break;
    }
    if (idx < parts.length) s = "git " + parts.slice(idx).join(" ");
  }

  return s.replace(/\s+/g, " ").trim();
}

export function commandMatches(rawCmd, pattern) {
  if (!rawCmd || !pattern) return false;
  if (pattern === "*") return true;
  const c = normalizeCommand(rawCmd).toLowerCase();
  const pat = pattern.trim().toLowerCase();

  if (pat.includes("*")) {
    const escaped = pat.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    const regex = new RegExp(`^${escaped}$`, "i");
    if (regex.test(c) || regex.test(String(rawCmd).toLowerCase())) return true;
    if (pat.endsWith("*")) {
      const prefix = pat.slice(0, -1).trim();
      return c === prefix || c.startsWith(prefix + " ") || c.startsWith(prefix + "-") || c.startsWith(prefix + "/") || c.startsWith(prefix + ":");
    }
    return false;
  }

  return c === pat || c.startsWith(pat + " ");
}

export function hasInterpreterEval(cmd) {
  const norm = normalizeCommand(cmd);
  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const bin = words[0].toLowerCase();
  const isInterp = /^(?:node|nodejs|bun|deno|python|python3|python3\.\d+|perl|ruby|php)$/i.test(bin);
  if (!isInterp) return false;

  const flagPattern = /^(?:-[a-zA-Z]*[epcPr]|--eval|--print|--require|--import|--input-type|eval)$/i;
  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    if (flagPattern.test(w)) return true;
    if (bin === "deno" && w === "eval") return true;
  }
  return false;
}
