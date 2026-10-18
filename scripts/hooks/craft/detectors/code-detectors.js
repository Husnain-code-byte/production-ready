import path from "node:path";

function checkSwallowedPy(line, nextLine, num) {
  const t = line.trim();
  if (/^except\s*:/.test(t)) {
    return { rule: "swallowed-error", severity: "error", line: num, description: "Bare 'except:' swallows all exceptions. Catch a specific domain exception." };
  }
  if (/^except\s+[A-Za-z0-9_.]+\s*(?:as\s+[A-Za-z0-9_]+)?\s*:/.test(t) && (nextLine || "").trim() === "pass") {
    return { rule: "swallowed-error", severity: "error", line: num, description: "Exception block silently ignored with 'pass'. Handle or re-raise." };
  }
  return null;
}

function checkSwallowedJs(line, num) {
  if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(line.trim())) {
    return { rule: "swallowed-error", severity: "error", line: num, description: "Empty catch block silently swallows errors." };
  }
  return null;
}

function checkDebugOutput(line, isPy, num) {
  const t = line.trim();
  if (t.startsWith("//") || t.startsWith("#")) return null;
  const hasDebug = isPy ? /\bprint\s*\(/.test(t) : /\bconsole\.(?:log|debug|info)\s*\(/.test(t);
  if (hasDebug) {
    return { rule: "debug-output", severity: "error", line: num, description: "Raw debug output in production code. Use a structured logger instead." };
  }
  return null;
}

function checkAssertFree(content, isPy, relPath) {
  const testRe = isPy ? /def\s+test_[A-Za-z0-9_]+\s*\(/ : /\b(?:it|test)\s*\(/;
  const assertRe = isPy ? /\bassert\b|\.assert[A-Za-z]+\(/ : /\bexpect\s*\(|\.assert[A-Za-z]*\(/;
  if (testRe.test(content) && !assertRe.test(content)) {
    return { rule: "assertion-free-test", severity: "error", line: 1, description: `Test file ${relPath} defines tests but has zero assertions.` };
  }
  return null;
}

function checkParams(line, isPy, num) {
  const re = isPy ? /^\s*(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/ : /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/;
  const m = line.match(re);
  if (!m) return null;
  const p = m[2].split(",").map((x) => x.trim()).filter((x) => x && x !== "self" && x !== "cls");
  if (p.length > 5) {
    return { rule: "long-parameter-list", severity: "advice", line: num, description: `Function '${m[1]}' takes ${p.length} params (limit: <= 5). Group into a parameter object.` };
  }
  return null;
}

export function auditCodeCraft(relPath, content) {
  const res = [];
  const norm = relPath.replace(/\\/g, "/");
  const ext = (norm.split(".").pop() || "").toLowerCase();
  const isPy = ext === "py";
  const isJs = ["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(ext);
  if (!isPy && !isJs) return res;

  const lines = content.split(/\r\n|\r|\n/);
  const isTest = /test|spec/i.test(norm);
  const isProd = !isTest && !/(?:cli|main|__main__|bin\/)/i.test(norm) && (norm.startsWith("src/") || norm.startsWith("app/"));

  for (let i = 0; i < lines.length; i++) {
    const sw = isPy ? checkSwallowedPy(lines[i], lines[i + 1], i + 1) : checkSwallowedJs(lines[i], i + 1);
    if (sw) res.push(sw);
    if (isProd) {
      const dbg = checkDebugOutput(lines[i], isPy, i + 1);
      if (dbg) res.push(dbg);
    }
    const pm = checkParams(lines[i], isPy, i + 1);
    if (pm) res.push(pm);
  }

  if (isTest) {
    const af = checkAssertFree(content, isPy, norm);
    if (af) res.push(af);
  }
  return res;
}
