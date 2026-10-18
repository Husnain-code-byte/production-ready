import fs from "node:fs";
import path from "node:path";
import { SOURCE_EXTENSIONS } from "./constants.js";

export function getAddedLinesOnly(patchText) {
  const added = [];
  for (const line of String(patchText).split(/\r\n|\r|\n/)) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) added.push(line.slice(1));
  }
  return added.length > 0 ? added.join("\n") : patchText;
}

export function validateCyclomaticComplexity(normalizedPath, fullText) {
  if (!/\.(py|ts|tsx|js|jsx)$/.test(normalizedPath) || normalizedPath.includes("test")) return;
  const lines = fullText.split(/\r\n|\r|\n/);
  const isPy = normalizedPath.endsWith(".py");
  const fnHeader = isPy ? /^(\s*)(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(/ : /^(\s*)(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/;
  const branchRe = isPy
    ? /\b(?:if|elif|for|while|except|and|or)\b/g
    : /\b(?:if|for|while|catch|case)\b|&&|\|\|/g;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(fnHeader);
    if (!m) continue;
    const baseIndent = m[1].length;
    const fnName = m[2];
    let complexity = 1;
    for (let j = i + 1; j < Math.min(lines.length, i + 80); j++) {
      const line = lines[j];
      if (!line.trim() || line.trim().startsWith("#") || line.trim().startsWith("//")) continue;
      const indent = (line.match(/^(\s*)/) || ["", ""])[1].length;
      if (isPy && indent <= baseIndent && /^(?:def|class|@|\S)/.test(line.trim())) break;
      if (!isPy && indent <= baseIndent && line.trim().startsWith("}")) break;
      const matches = line.match(branchRe);
      if (matches) complexity += matches.length;
    }
    if (complexity >= 10) {
      throw new Error(`[ScopeEnforcer Complexity Blocked] Function '${fnName}' in ${normalizedPath} has cyclomatic complexity ${complexity} (limit: < 10). Decompose into smaller helper functions.`);
    }
  }
}

export function validatePythonCleanArchitecture(normalizedPath, fullText) {
  const isServiceOrDomain = /(?:^|\/)(?:service|services|domain|entities|use_cases)(?:\/|\.py$)/i.test(normalizedPath);
  if (isServiceOrDomain) {
    if (/^\s*(?:from|import)\s+(?:fastapi|starlette|flask|django\.http)\b/m.test(fullText)) {
      throw new Error(`[ScopeEnforcer Clean-Architecture Blocked] Transport framework import (fastapi/starlette/flask) is forbidden in service/domain layer (${normalizedPath}). Services must remain pure domain logic.`);
    }
    if (/^\s*from\s+[^\n]*schemas[^\n]*import\b/m.test(fullText) || /^\s*import\s+[^\n]*schemas\b/m.test(fullText) ||
        /^\s*from\s+pydantic\s+import\s+[^\n]*BaseModel\b/m.test(fullText)) {
      throw new Error(`[ScopeEnforcer Clean-Architecture Blocked] HTTP DTO / BaseModel / schemas import is forbidden in service/domain layer (${normalizedPath}). Pass primitives or frozen @dataclass domain objects.`);
    }
  }
  const isRouteLayer = /(?:^|\/)(?:routes|router|routers|api|controllers|endpoints)(?:\/|\.py$)/i.test(normalizedPath);
  if (isRouteLayer) {
    const tryBlocks = (fullText.match(/^\s*try\s*:/gm) || []).length;
    if (tryBlocks > 1 && /HTTPException/.test(fullText)) {
      throw new Error(`[ScopeEnforcer Clean-Architecture Blocked] Duplicate try/except HTTPException blocks in route layer (${normalizedPath}). Register a centralized @app.exception_handler instead.`);
    }
  }
}

export function validateContentPreWrite(filePath, content, op = "write", oldContent = "", projectRoot = process.cwd(), isReplaceAll = false) {
  if (!filePath || !content) return;
  const normalized = filePath.replace(/\\/g, "/");
  const ext = (normalized.split(".").pop() || "").toLowerCase();
  const isExcluded = normalized.startsWith("docs/") || normalized.startsWith("project-memory/") ||
    normalized.startsWith(".agents/") || normalized.startsWith("scripts/") || normalized.startsWith("templates/");
  const isSourceCode = SOURCE_EXTENSIONS.has(ext) && !isExcluded;
  const checkText = (op === "patch" || op === "apply_patch") ? getAddedLinesOnly(content) : content;

  if (isSourceCode) {
    let fullText = content;
    if (op === "edit") {
      const absPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
      if (fs.existsSync(absPath)) {
        try {
          const diskText = fs.readFileSync(absPath, "utf8");
          fullText = (isReplaceAll || (oldContent && diskText.split(oldContent).length > 2))
            ? diskText.split(oldContent).join(content)
            : diskText.replace(oldContent, content);
        } catch {}
      }
    }
    const lineCount = fullText.split(/\r\n|\r|\n/).length;
    if (lineCount > 150) throw new Error(`[ScopeEnforcer File-Size Blocked] ${filePath} exceeds the 150-line limit (${lineCount} lines). Decompose large files.`);
    if (fullText.length > 18000) throw new Error(`[ScopeEnforcer File-Size Blocked] ${filePath} exceeds 18,000 characters.`);
    for (const l of fullText.split(/\r\n|\r|\n/)) {
      if (l.length > 500 && !l.includes("data:image/") && !l.includes("<svg") && !l.includes("<path")) {
        throw new Error(`[ScopeEnforcer Code-Style Blocked] Line in ${filePath} exceeds 500 characters (${l.length} chars).`);
      }
    }

    const noStrings = checkText.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'(?:[^'\\]|\\.)*'/g, "''").replace(/`[^`$]*`/g, "``");
    if (/(?:\/\/|\/\*)\s*(?:TODO|FIXME|XXX|HACK)\b/i.test(noStrings) || /#\s*(?:TODO|FIXME|XXX|placeholder)\b/i.test(noStrings) ||
        /\b(?:todo|unimplemented)!\s*\(/i.test(noStrings) || /\braise\s+NotImplementedError\b/i.test(noStrings)) {
      throw new Error(`[ScopeEnforcer Zero-Workslop Blocked] TODO/FIXME/NotImplementedError placeholder detected in ${filePath}.`);
    }

    validateCyclomaticComplexity(normalized, fullText);

    if (/\.py$/.test(normalized)) {
      const pyText = op === "edit" ? fullText : checkText;
      if (/#\s*type\s*:\s*ignore\b/i.test(pyText)) {
        throw new Error(`[ScopeEnforcer Python Strict-Type Blocked] '# type: ignore' is forbidden in ${filePath}. Fix type annotations so mypy --strict passes.`);
      }
      if (/\b(?:eval|exec)\s*\(/.test(noStrings) || /subprocess\.[a-z_]+\([^)]*shell\s*=\s*True/s.test(pyText) ||
          (!normalized.includes("test") && /\bverify\s*=\s*False\b/.test(pyText))) {
        throw new Error(`[ScopeEnforcer Python Security Blocked] Dangerous eval/exec/shell=True/verify=False detected in ${filePath}.`);
      }
      validatePythonCleanArchitecture(normalized, pyText);
    }

    if (/\.(ts|tsx)$/.test(normalized)) {
      const typeText = op === "edit" ? fullText : checkText;
      if (/@ts-nocheck\b|@ts-ignore\b/.test(typeText)) throw new Error(`[ScopeEnforcer Strict-Type Blocked] '@ts-ignore' / '@ts-nocheck' is forbidden in ${filePath}.`);
      if (/\btype\s+[A-Za-z0-9_]+\s*=\s*any\b|:\s*Function\b|\bas\s+unknown\s+as\b|\bsatisfies\s+any\b/.test(typeText)) {
        throw new Error(`[ScopeEnforcer Strict-Type Blocked] Untyped 'any', ': Function', or 'as unknown as' detected in ${filePath}.`);
      }
    }
  }
}
