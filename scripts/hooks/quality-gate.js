import { auditCraft } from "./craft/audit.js";
import { formatCraftWarnings } from "./craft/formatting.js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { SOURCE_EXTENSIONS } from "./enforcer/constants.js";
import { validateCyclomaticComplexity, validatePythonCleanArchitecture } from "./enforcer/pre-write-gates.js";
import { calculatePhase, isArtifactPopulated } from "./gate/phase-gates.js";
import { findProjectRoot, isMainModule, readStdinJson, resolvePayloadRoot, resolveToolArgs, writeStdoutJson } from "./runtime-io.js";

export const PHASE_GATES = [
  { phase: 0, label: "Vision Crystallization", check: "project-memory/01-vision.md" },
  { phase: 1, label: "Subsystem Decomposition", check: "project-memory/02-subsystem-map.md" },
  { phase: 2, label: "Reference Collection", check: "docs/research/reference-collection.md" },
  { phase: 3, label: "Architecture Design", check: "project-memory/03-architecture.md" },
  { phase: 4, label: "Visual Design System", check: "project-memory/04-design-system.md" },
  { phase: 5, label: "Feature Implementation", check: "project-memory/05-feature-registry.md" },
  { phase: 6, label: "Subsystem Integration", check: "project-memory/06-session-log.md" },
  { phase: 7, label: "Hardening", check: "project-memory/08-verification-report.md" },
  { phase: 8, label: "Observe & Iterate", check: "project-memory/09-production-feedback.md" },
];

export function getProjectPhase(projectRoot = process.cwd()) {
  return calculatePhase(PHASE_GATES, projectRoot);
}

export { isArtifactPopulated };

export function auditFileQuality(filePath, projectRoot) {
  if (!filePath) return { passed: true, warnings: [] };
  const abs = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return { passed: true, warnings: [] };
  const rel = path.relative(projectRoot, abs).replace(/\\/g, "/");
  const ext = (abs.split(".").pop() || "").toLowerCase();

  const telemetryDir = path.join(projectRoot, "project-memory", ".telemetry");
  const sessionFilesPath = path.join(telemetryDir, "active-session-files.json");
  try {
    fs.mkdirSync(telemetryDir, { recursive: true });
    const current = fs.existsSync(sessionFilesPath) ? JSON.parse(fs.readFileSync(sessionFilesPath, "utf8")) : [];
    if (!current.includes(rel)) {
      current.push(rel);
      fs.writeFileSync(sessionFilesPath, JSON.stringify(current, null, 2) + "\n", "utf8");
    }
  } catch {}

  if (!SOURCE_EXTENSIONS.has(ext) || rel.startsWith("scripts/") || rel.startsWith(".agents/")) {
    return { passed: true, warnings: [] };
  }

  const content = fs.readFileSync(abs, "utf8");
  const lines = content.split(/\r\n|\r|\n/).length;
  const warnings = [];
  try {
    const cFindings = auditCraft(rel, content, projectRoot);
    const cErrors = cFindings.filter(f => f.severity === "error");
    const cAdvice = cFindings.filter(f => f.severity === "advice");
    if (cErrors.length > 0) warnings.push(...formatCraftWarnings(cErrors));
    if (cAdvice.length > 0) process.stderr.write(formatCraftWarnings(cAdvice).join("\n") + "\n");
  } catch (err) {}


  if (lines > 150) warnings.push(`File ${rel} has ${lines} lines (exceeds 150-line Production Level ceiling).`);
  try { validateCyclomaticComplexity(rel, content); } catch (e) { warnings.push(e.message); }

  if (ext === "py") {
    if (/#\s*type\s*:\s*ignore\b/i.test(content)) warnings.push(`Forbidden '# type: ignore' in ${rel}.`);
    try { validatePythonCleanArchitecture(rel, content); } catch (e) { warnings.push(e.message); }
    try {
      execFileSync("ruff", ["check", "--quiet", abs], { cwd: projectRoot, stdio: ["ignore", "pipe", "pipe"], timeout: 4000 });
    } catch (err) {
      if (err?.status && err.status !== 127) {
        const out = String(err.stdout || err.stderr || "").trim().slice(0, 240);
        if (out) warnings.push(`ruff check failed on ${rel}: ${out}`);
      }
    }
  }
  if ((ext === "ts" || ext === "tsx") && /@ts-ignore\b|@ts-nocheck\b/.test(content)) {
    warnings.push(`Forbidden '@ts-ignore' / '@ts-nocheck' in ${rel}.`);
  }

  const violationsPath = path.join(telemetryDir, "quality-violations.json");
  try {
    const vMap = fs.existsSync(violationsPath) ? JSON.parse(fs.readFileSync(violationsPath, "utf8")) : {};
    if (warnings.length > 0) vMap[rel] = warnings;
    else delete vMap[rel];
    fs.writeFileSync(violationsPath, JSON.stringify(vMap, null, 2) + "\n", "utf8");
  } catch {}

  return { passed: warnings.length === 0, warnings };
}

export default async function productionLevelQualityGate(input) {
  const projectRoot = findProjectRoot(input?.directory || process.cwd());
  return {
    "command.execute.before": async (cmdInput) => {
      const command = (cmdInput.command || "").trim();
      const args = (cmdInput.arguments || cmdInput.args || cmdInput.argument || "").trim();
      if (command === "verify-feature") {
        if (!args) throw new Error("[QUALITY GATE BLOCKED] Cannot run /verify-feature without a <feature-name> argument.");
        const featureName = args.split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g, "");
        const specPath = path.join(projectRoot, "docs", "specs", featureName, "gherkin.feature");
        const altSpecPath = path.join(projectRoot, "docs", "specs", featureName + ".feature");
        if (!fs.existsSync(specPath) && !fs.existsSync(altSpecPath)) {
          throw new Error(`[Production Level Gate Blocked] Missing BDD specification at 'docs/specs/${featureName}/gherkin.feature'.`);
        }
      }
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = resolvePayloadRoot(payload);
  const args = resolveToolArgs(payload);
  const targetFile = args.TargetFile || args.filePath || args.path || "";
  const result = targetFile ? auditFileQuality(targetFile, root) : { passed: true, warnings: [] };
  if (!result.passed) {
    process.stderr.write(`[Production Level PostToolUse Quality Gate Violation] ${result.warnings.join(" | ")}\n`);
  }
  writeStdoutJson({});
}
