import fs from "node:fs";
import path from "node:path";
import { findProjectRoot, isMainModule, readStdinJson, writeStdoutJson } from "./runtime-io.js";

/**
 * Production Level PostInvocation & Stop Metrics Recorder for Google Antigravity
 */
export function appendInvocationMetric(projectRoot, payload = {}) {
  const telemetryDir = path.join(projectRoot, "project-memory", ".telemetry");
  const entry = {
    timestamp: new Date().toISOString(),
    sessionId: payload?.sessionId || payload?.sessionID || "default",
    trajectoryId: payload?.trajectoryId || null,
    stepIndex: payload?.stepIndex ?? null,
  };
  try {
    fs.mkdirSync(telemetryDir, { recursive: true });
    fs.appendFileSync(path.join(telemetryDir, "metrics.jsonl"), JSON.stringify(entry) + "\n", "utf8");
  } catch {}
  return entry;
}

export default async function productionLevelMetrics(input) {
  const sessionMetrics = new Map();
  const projectRoot = findProjectRoot(input?.directory || process.cwd());

  function getMetrics(sessId) {
    if (!sessionMetrics.has(sessId)) {
      sessionMetrics.set(sessId, { sessionStart: Date.now(), edits: 0, bashCalls: 0, filesChanged: new Set() });
    }
    return sessionMetrics.get(sessId);
  }

  return {
    "tool.execute.after": async (toolInput) => {
      const m = getMetrics(toolInput.sessionID || "default");
      const tool = toolInput.tool;
      const args = toolInput.args || {};
      if (["edit", "write", "patch", "apply_patch", "multiedit", "write_to_file", "replace_file_content"].includes(tool)) {
        m.edits++;
        const f = args.TargetFile || args.filePath || args.path || args.file;
        if (f) m.filesChanged.add(f);
      }
      if (tool === "bash" || tool === "run_command") m.bashCalls++;
    },
    "command.execute.before": async (cmdInput) => {
      if (cmdInput.command === "end-session" || cmdInput.command === "cool-down") {
        const sessId = cmdInput.sessionID || "default";
        appendInvocationMetric(projectRoot, { sessionID: sessId });
        sessionMetrics.delete(sessId);
      }
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = findProjectRoot(payload?.cwd || process.cwd());
  appendInvocationMetric(root, payload);
  writeStdoutJson({});
}
