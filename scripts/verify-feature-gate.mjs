#!/usr/bin/env node
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateCyclomaticComplexity, validatePythonCleanArchitecture } from "./hooks/enforcer/pre-write-gates.js";
import { findProjectRoot } from "./hooks/runtime-io.js";

const root = findProjectRoot(process.cwd());
const feature = (process.argv[2] || "active-feature").replace(/[^a-zA-Z0-9_-]/g, "");

function runCmd(cmd) {
  try {
    const out = execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, missing: false, output: out.trim() };
  } catch (err) {
    const out = (String(err.stdout || "") + "\n" + String(err.stderr || err.message || "")).trim();
    const missing = err.status === 127 || /not found|No module named/i.test(out);
    return { ok: false, missing, output: out };
  }
}

function detectStack(dir) {
  if (fs.existsSync(path.join(dir, "pyproject.toml")) || fs.existsSync(path.join(dir, "requirements.txt")) ||
      fs.readdirSync(dir).some((f) => f.endsWith(".py"))) return "python";
  if (fs.existsSync(path.join(dir, "Cargo.toml"))) return "rust";
  if (fs.existsSync(path.join(dir, "go.mod"))) return "go";
  if (fs.existsSync(path.join(dir, "tsconfig.json"))) return "typescript";
  return "node";
}

function walkSourceFiles(dir, exts, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".agents", "node_modules", ".venv", "venv", "__pycache__", "docs", "project-memory", "scripts", "templates"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSourceFiles(full, exts, list);
    else if (exts.includes(entry.name.split(".").pop())) list.push(full);
  }
  return list;
}

const stack = detectStack(root);
const failures = [];
let typecheckStatus = "UNVERIFIED";
let lintStatus = "UNVERIFIED";
let testsPassed = 0;
let testsTotal = 0;
let mutationScore = "UNVERIFIED";

const srcFiles = walkSourceFiles(root, ["py", "ts", "tsx", "js", "rs", "go"]);
for (const file of srcFiles) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r\n|\r|\n/).length;
  if (lines > 150) failures.push(`File length violation: ${rel} has ${lines} lines (limit: 150).`);
  try { validateCyclomaticComplexity(rel, text); } catch (e) { failures.push(e.message); }
  if (rel.endsWith(".py")) {
    if (/#\s*type\s*:\s*ignore\b/i.test(text)) failures.push(`Strict typing violation: '# type: ignore' in ${rel}.`);
    try { validatePythonCleanArchitecture(rel, text); } catch (e) { failures.push(e.message); }
  }
}

if (stack === "python") {
  const mypy = runCmd("mypy --strict .");
  typecheckStatus = mypy.missing ? "UNVERIFIED" : mypy.ok ? "PASS" : "FAIL";
  if (!mypy.ok) failures.push(`mypy --strict ${mypy.missing ? "UNVERIFIED (not installed)" : "failed"}: ${mypy.output.slice(0, 240)}`);

  const ruff = runCmd("ruff check .");
  lintStatus = ruff.missing ? "UNVERIFIED" : ruff.ok ? "PASS" : "FAIL";
  if (!ruff.ok) failures.push(`ruff check ${ruff.missing ? "UNVERIFIED (not installed)" : "failed"}: ${ruff.output.slice(0, 240)}`);

  const pytest = runCmd("pytest -q");
  if (!pytest.ok) failures.push(`pytest ${pytest.missing ? "UNVERIFIED (not installed)" : "failed"}: ${pytest.output.slice(0, 240)}`);
  const passMatch = pytest.output.match(/(\d+)\s+passed/);
  if (passMatch) { testsPassed = Number(passMatch[1]); testsTotal = testsPassed; }

  const mut = runCmd("mutmut results");
  if (!mut.missing && mut.ok && mut.output) {
    const killed = (mut.output.match(/Killed\s*[:=]?\s*(\d+)/i) || [])[1];
    const survived = (mut.output.match(/Survived\s*[:=]?\s*(\d+)/i) || [])[1];
    if (killed !== undefined && survived !== undefined) {
      const k = Number(killed); const s = Number(survived);
      mutationScore = k + s > 0 ? Number(((k / (k + s)) * 100).toFixed(1)) : 0;
    }
  }
  if (typeof mutationScore !== "number" || mutationScore < 85) {
    failures.push(`Mutation score (${mutationScore}) is below the mandatory 85% threshold. Configure & run 'mutmut run' and kill surviving mutants.`);
  }
}

const gitHead = runCmd("git rev-parse --short HEAD").output || "uncommitted";
const verdict = failures.length === 0 ? "PASS" : "FAIL";
const digest = crypto.createHash("sha256").update(JSON.stringify({ feature, stack, verdict, typecheckStatus, lintStatus, testsPassed, mutationScore, gitHead })).digest("hex").slice(0, 16);

const receipt = {
  receipt_id: `rcpt-${feature}-${digest}`,
  generated_by: "scripts/verify-feature-gate.mjs",
  timestamp: new Date().toISOString(),
  feature,
  stack,
  verdict,
  automated: { typecheck: typecheckStatus, lint: lintStatus, tests_total: testsTotal, tests_passed: testsPassed, mutation_score: mutationScore },
  clean_architecture_audit: failures.length === 0 ? "PASS" : "FAIL",
  failures,
  git_head: gitHead,
};

const reportPath = path.join(root, "project-memory", "08-verification-report.md");
if (fs.existsSync(reportPath)) {
  const entry = `\n## Mechanical Receipt: ${feature} (${receipt.timestamp})\n- **Verdict:** ${verdict}\n\n\`\`\`json\n${JSON.stringify(receipt, null, 2)}\n\`\`\`\n`;
  fs.appendFileSync(reportPath, entry, "utf8");
}

if (verdict === "PASS") {
  const telemetryDir = path.join(root, "project-memory", ".telemetry");
  for (const f of ["active-session-files.json", "quality-violations.json"]) {
    const p = path.join(telemetryDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

console.log(JSON.stringify(receipt, null, 2));
if (verdict !== "PASS") process.exit(1);
