import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const VALID_TOOLS = new Set([
  "view_file", "list_dir", "grep_search", "find_by_name", "search_web",
  "read_url_content", "send_message", "schedule", "invoke_subagent",
  "manage_subagents", "write_to_file", "replace_file_content", "run_command", "ask_question",
]);

const EXPECTED_AGENTS = [
  "aegis.md", "00-orchestrator.md", "01-vision-analyst.md", "02-decomposition-guide.md",
  "03-reference-collector.md", "04-spec-writer.md", "05-spec-reviewer.md", "06-system-architect.md",
  "07-database-designer.md", "08-figma-analyzer.md", "09-design-system-builder.md", "10-frontend-engineer.md",
  "11-backend-engineer.md", "12-completeness-checker.md", "13-adversarial-reviewer.md", "14-refactoring-auditor.md",
  "15-security-auditor.md", "16-ux-auditor.md", "17-performance-auditor.md", "18-debugger.md",
  "19-documentation-writer.md", "20-research-agent.md", "21-release-manager.md", "22-feature-registry-manager.md",
  "23-tech-debt-tracker.md", "24-apex-arbitrator.md",
];

const EXPECTED_SKILLS = [
  "start-session", "end-session", "phase-check", "scope-check", "spec-write", "verify-feature",
  "refactor-gate", "adr-write", "commit-format", "session-log", "context-update", "abort-feature",
  "parallel-discover", "rollback-feature", "cool-down", "checkpoint", "restore",
];

const EXPECTED_RULES = [
  "ansdlc-rules.md", "red-flags.md", "backend.md", "frontend.md", "database.md",
  "code-style.md", "specs.md", "testing.md", "effort-strategy.md", "model-strategy.md",
];

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) passed++;
  else { failed++; console.error(`  [FAIL] ${msg}`); }
}

console.log("=== Production Level — Google Antigravity Harness Self-Audit ===");

// 1. Validate JSON configs & Antigravity Grouped Hook Schema (PreToolUse/PostToolUse must have nested 'hooks' array)
for (const rel of ["package.json", "scripts/package.json", ".agents/hooks.json", ".agents/plugins/production-level/plugin.json", ".agents/plugins/production-level/hooks.json"]) {
  const p = path.join(ROOT, rel);
  assert(fs.existsSync(p), `Exists: ${rel}`);
  const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
  assert(true, `Valid JSON: ${rel}`);
  if (rel.endsWith("hooks.json")) {
    const h = parsed["production-level-harness"];
    assert(Array.isArray(h?.PreToolUse?.[0]?.hooks) && Array.isArray(h?.PostToolUse?.[0]?.hooks), `Grouped hooks array in ${rel}`);
  }
}

// 2. Validate 10 Rules (< 24,000 bytes each, < 20,000 tokens total)
let totalRuleBytes = 0;
for (const rf of EXPECTED_RULES) {
  const p = path.join(ROOT, ".agents", "rules", rf);
  const size = fs.statSync(p).size;
  totalRuleBytes += size;
  assert(size < 24000, `Rule < 24KB: ${rf} (${size} bytes)`);
}
const pluginRuleSize = fs.statSync(path.join(ROOT, ".agents/plugins/production-level/rules/AGENTS.md")).size;
assert(pluginRuleSize < 24000, `Plugin AGENTS.md < 24KB (${pluginRuleSize} bytes)`);
assert(Math.ceil(totalRuleBytes / 4) < 20000, "Total rules token budget < 20,000");

// 3. Validate 26 Agents, Fallback Models, <= 150 lines, & 5 Pillars of Engineering Maturity
for (const af of EXPECTED_AGENTS) {
  const content = fs.readFileSync(path.join(ROOT, ".agents", "agents", af), "utf8");
  const lines = content.split("\n").length;
  assert(lines <= 150, `Agent <= 150 lines: ${af} (${lines})`);
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert(Boolean(fmMatch), `Valid frontmatter in ${af}`);
  const fm = fmMatch[1];
  assert(af === "aegis.md" ? /mainAgent:\s*true/.test(fm) : /mainAgent:\s*false/.test(fm), `mainAgent in ${af}`);
  assert(/subagent:\s*true/.test(fm) && /fallbackModels:/.test(fm), `subagent & fallbackModels in ${af}`);
  const tools = [...fm.matchAll(/^\s*-\s*([a-z_]+)\s*$/gm)].map((m) => m[1]);
  assert(tools.length === 14 && tools.every((t) => VALID_TOOLS.has(t)), `All 14 valid Antigravity tools in ${af}`);
}
for (const threatAgent of ["04-spec-writer.md", "05-spec-reviewer.md", "13-adversarial-reviewer.md", "15-security-auditor.md"]) {
  const c = fs.readFileSync(path.join(ROOT, ".agents", "agents", threatAgent), "utf8");
  assert(c.includes("169.254.169.254") && c.includes("follow_redirects=False") && c.includes("compare_digest"), `5 Pillars Threat Matrix in ${threatAgent}`);
}

// 4. Validate 17 Skills & Mutation Loophole Closure
for (const sk of EXPECTED_SKILLS) {
  const c = fs.readFileSync(path.join(ROOT, ".agents", "skills", sk, "SKILL.md"), "utf8");
  assert(c.includes(`name: ${sk}`) && c.includes("description:"), `Valid skill frontmatter in ${sk}`);
}
const vfSkill = fs.readFileSync(path.join(ROOT, ".agents/skills/verify-feature/SKILL.md"), "utf8");
assert(vfSkill.includes("verify-feature-gate.mjs") && vfSkill.includes("85%"), "verify-feature mandates verify-feature-gate.mjs and >=85% mutation");

// 5. Validate 6 Lifecycle Hooks across Repo Root, .agents/, and Plugin CWDs + <= 150 lines
const HOOKS = ["session-start.js", "session-end.js", "scope-enforcer.js", "effort-governor.js", "quality-gate.js", "metrics.js"];
for (const hf of HOOKS) {
  const p = path.join(ROOT, "scripts", "hooks", hf);
  assert(fs.readFileSync(p, "utf8").split("\n").length <= 150, `Hook <= 150 lines: ${hf}`);
  for (const cwdDir of [ROOT, path.join(ROOT, ".agents"), path.join(ROOT, ".agents/plugins/production-level")]) {
    const out = execFileSync("node", [path.join(ROOT, "scripts/hooks", hf)], {
      cwd: cwdDir,
      input: JSON.stringify({ workspacePaths: [ROOT], agent: "aegis", toolCall: { name: "view_file", args: { AbsolutePath: "README.md" } } }),
      encoding: "utf8",
    });
    assert(typeof JSON.parse(out.trim()) === "object", `Hook ${hf} runs cleanly from ${path.basename(cwdDir)}`);
  }
}

// 6. Validate Antigravity PreToolUse Gates (decision === "block" on # type: ignore, Clean Architecture leak, and Cyclomatic Complexity >= 10)
function runPreTool(agent, targetFile, codeContent) {
  return JSON.parse(
    execFileSync("node", ["./scripts/hooks/scope-enforcer.js"], {
      cwd: ROOT,
      input: JSON.stringify({ workspacePaths: [ROOT], agent, toolCall: { name: "write_to_file", args: { TargetFile: targetFile, CodeContent: codeContent } } }),
      encoding: "utf8",
    }).trim()
  );
}
assert(runPreTool("11-backend-engineer", "src/service.py", "x: int = 1  # type: ignore\n").decision === "block", "Blocks Python # type: ignore");
assert(runPreTool("11-backend-engineer", "src/service.py", "from fastapi import HTTPException\n").decision === "block", "Blocks fastapi import in service.py");
assert(runPreTool("11-backend-engineer", "src/service.py", "from app.schemas import CreateRequest\n").decision === "block", "Blocks Request DTO import in service.py");
const complexPy = "def too_complex(x):\n" + Array.from({ length: 10 }, (_, i) => `    if x == ${i}: return ${i}`).join("\n") + "\n";
assert(runPreTool("11-backend-engineer", "src/service.py", complexPy).decision === "block", "Blocks cyclomatic complexity >= 10");

// 7. Validate Automatic Model Quota Failover & Pro/Flash Subagent Tier Mapping
const argonFailover = JSON.parse(
  execFileSync("node", ["./scripts/hooks/effort-governor.js"], {
    cwd: ROOT,
    env: { ...process.env, PRODUCTION_LEVEL_EXHAUSTED_MODELS: "google/gemini-4-argon" },
    input: JSON.stringify({ workspacePaths: [ROOT], agent: "06-system-architect", prompt: "Design C4 architecture" }),
    encoding: "utf8",
  }).trim()
);
const msg = argonFailover.injectSteps?.[0]?.ephemeralMessage || "";
assert(msg.includes("FAILOVER ACTIVE: google/gemini-4-argon -> anthropic/claude-sonnet-5.5") && msg.includes("subagentTier: pro"), "Argon-4 failover & pro subagentTier");

console.log(`=== Audit Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
