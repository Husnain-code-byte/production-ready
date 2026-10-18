import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { SOURCE_EXTENSIONS } from "./enforcer/constants.js";
import { isArtifactPopulated } from "./gate/phase-gates.js";
import { findProjectRoot, isMainModule, readStdinJson, resolvePayloadRoot, writeStdoutJson } from "./runtime-io.js";

export function evaluateStopGate(projectRoot, sessionId = "default", explicitFiles = null) {
  const telemetryDir = path.join(projectRoot, "project-memory", ".telemetry");
  const sessionFilesPath = path.join(telemetryDir, "active-session-files.json");
  const violationsPath = path.join(telemetryDir, "quality-violations.json");

  let gitStatus = "";
  let gitModified = [];
  try {
    gitStatus = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    gitModified = gitStatus.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
  } catch {}

  let trackedFiles = [];
  if (Array.isArray(explicitFiles)) {
    trackedFiles = explicitFiles;
  } else if (fs.existsSync(sessionFilesPath)) {
    try { trackedFiles = JSON.parse(fs.readFileSync(sessionFilesPath, "utf8")) || []; } catch {}
  }

  const allModified = Array.from(new Set([...trackedFiles, ...gitModified]));

  const unresolvedViolations = [];
  if (fs.existsSync(violationsPath)) {
    try {
      const vMap = JSON.parse(fs.readFileSync(violationsPath, "utf8")) || {};
      for (const msgs of Object.values(vMap)) {
        if (Array.isArray(msgs)) unresolvedViolations.push(...msgs);
      }
    } catch {}
  }

  const isSource = (f) => {
    const norm = String(f).replace(/\\/g, "/");
    const ext = (norm.split(".").pop() || "").toLowerCase();
    if (norm.startsWith("docs/") || norm.startsWith("project-memory/") || norm.startsWith(".agents/") || norm.startsWith("scripts/") || norm.startsWith("templates/")) {
      return false;
    }
    return SOURCE_EXTENSIONS.has(ext);
  };

  const sourceModified = allModified.filter(isSource);
  const warnings = [...unresolvedViolations];

  if (sourceModified.length > 0) {
    const reportPath = path.join(projectRoot, "project-memory", "08-verification-report.md");
    if (!isArtifactPopulated(reportPath)) {
      warnings.push(`Source files modified (${sourceModified.join(", ")}) without a verified PASS receipt in project-memory/08-verification-report.md. Run 'node scripts/verify-feature-gate.mjs <feature>' before finishing.`);
    } else {
      const content = fs.readFileSync(reportPath, "utf8");
      if (/"mutation_score"\s*:\s*null/i.test(content) || /"verdict"\s*:\s*"FAIL"/i.test(content)) {
        warnings.push("Verification report contains 'mutation_score: null' or 'verdict: FAIL'. Run 'node scripts/verify-feature-gate.mjs <feature>' and ensure >= 85% mutation score.");
      }
    }
  }

  const record = {
    timestamp: new Date().toISOString(),
    sessionID: sessionId,
    filesModifiedCount: allModified.length,
    filesModified: allModified,
    gitStatus: gitStatus ? "uncommitted changes" : "clean",
    warnings,
  };
  try {
    fs.mkdirSync(telemetryDir, { recursive: true });
    fs.appendFileSync(path.join(telemetryDir, "sessions.jsonl"), JSON.stringify(record) + "\n", "utf8");
  } catch {}

  return { allowed: warnings.length === 0, warnings, record };
}

export default async function productionLevelSessionEnd(input) {
  const sessionEditedFiles = new Map();
  const projectRoot = findProjectRoot(input?.directory || process.cwd());

  return {
    "tool.execute.after": async (toolInput) => {
      const sessId = toolInput?.sessionID || "default";
      if (!sessionEditedFiles.has(sessId)) sessionEditedFiles.set(sessId, new Set());
      const args = toolInput?.args || {};
      const file = args.TargetFile || args.filePath || args.path || args.file;
      if (file) sessionEditedFiles.get(sessId).add(String(file));
    },
    "command.execute.before": async (cmdInput, cmdOutput) => {
      const cmdName = cmdInput?.command;
      if (cmdName === "end-session" || cmdName === "cool-down") {
        const sessId = cmdInput?.sessionID || "default";
        const edited = Array.from(sessionEditedFiles.get(sessId) || []);
        const res = evaluateStopGate(projectRoot, sessId, edited);
        if (!res.allowed && cmdOutput && Array.isArray(cmdOutput.parts)) {
          cmdOutput.parts.push({ type: "text", text: `\n> [!WARNING]\n> ${res.warnings.join("\n> ")}\n` });
        }
        sessionEditedFiles.delete(sessId);
      }
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = resolvePayloadRoot(payload);
  const termReason = payload?.terminationReason || "AGENT_COMPLETE";
  if (termReason !== "AGENT_COMPLETE") {
    writeStdoutJson({ decision: "allow" });
    process.exit(0);
  }
  const res = evaluateStopGate(root, payload?.sessionId || payload?.trajectoryId || "antigravity-session");
  if (!res.allowed) {
    const reason = `[Production Level Stop Gate Blocked] ${res.warnings.join(" | ")}`;
    writeStdoutJson({ decision: "continue", reason });
  } else {
    writeStdoutJson({ decision: "allow" });
  }
}
