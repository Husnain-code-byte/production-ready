import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { findProjectRoot, isMainModule, readStdinJson, writeStdoutJson } from "./runtime-io.js";

/**
 * Production Level SessionStart Hook Handler for Google Antigravity
 * Loads project-memory context at session start and injects it into the agent system prompt.
 */
export function buildSessionContext(projectRoot) {
  const constitutionPath = path.join(projectRoot, "project-memory", "00-project-constitution.md");
  const registryPath = path.join(projectRoot, "project-memory", "05-feature-registry.md");
  const sessionLogPath = path.join(projectRoot, "project-memory", "06-session-log.md");

  let summary = "[Production Level Session Context]\n";
  if (fs.existsSync(constitutionPath)) {
    try {
      const cContent = fs.readFileSync(constitutionPath, "utf8");
      summary += `Constitution Principles:\n${cContent.split("\n").slice(0, 25).join("\n")}\n\n`;
    } catch {}
  }
  if (fs.existsSync(registryPath)) {
    try {
      const content = fs.readFileSync(registryPath, "utf8");
      const tableIdx = content.indexOf("## Feature Table");
      const lines = tableIdx !== -1 ? content.slice(tableIdx, tableIdx + 2000) : content.split("\n").slice(0, 40).join("\n");
      summary += `Feature Registry Snapshot:\n${lines}\n`;
    } catch {}
  }
  if (fs.existsSync(sessionLogPath)) {
    try {
      const content = fs.readFileSync(sessionLogPath, "utf8");
      const records = content.split(/## (?:Session|Snapshot):/);
      if (records.length > 1) {
        summary += `Last Session Record:\n## Record:${records[records.length - 1].slice(0, 800)}\n`;
      }
    } catch {}
  }
    const charterPath = path.join(projectRoot, "docs", "craft", "charter.md");
  if (fs.existsSync(charterPath)) {
    try { summary += "\n" + fs.readFileSync(charterPath, "utf8") + "\n"; } catch {}
  }
  return summary;
}

export default async function productionLevelSessionStart(input) {
  const initializedSessions = new Set();
  const projectRoot = findProjectRoot(input?.directory || process.cwd());

  return {
    "chat.message": async (msgInput, msgOutput) => {
      if (msgInput?.parentSessionID || msgInput?.subagent) return;
      const sessId = msgInput?.sessionID || "default";
      if (initializedSessions.has(sessId)) return;
      if (initializedSessions.size >= 500) initializedSessions.delete(initializedSessions.values().next().value);
      initializedSessions.add(sessId);

      const contextSummary = "\n\n" + buildSessionContext(projectRoot);
      if (msgOutput && Array.isArray(msgOutput.parts)) {
        msgOutput.parts.push({
          id: crypto.randomUUID(),
          sessionID: sessId,
          messageID: msgInput?.messageID || `msg-${Date.now()}`,
          type: "text",
          text: contextSummary,
        });
      }
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = findProjectRoot(payload?.cwd || process.cwd());
  const text = buildSessionContext(root);
  writeStdoutJson({
    injectSteps: [{ systemMessage: { systemMessage: text } }],
  });
}
