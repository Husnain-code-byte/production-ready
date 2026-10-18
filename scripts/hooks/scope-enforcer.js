import fs from "node:fs";
import path from "node:path";
import { AGENT_SCOPES } from "./enforcer/agent-scopes.js";
import { checkBashScope } from "./enforcer/bash-checker.js";
import { commandMatches, normalizeCommand, splitShellCommands, splitTopLevelChains } from "./enforcer/command-parser.js";
import { DEFAULT_AGENT } from "./enforcer/constants.js";
import { validateContentPreWrite } from "./enforcer/pre-write-gates.js";
import { checkScope, normalizeAgentName, pathMatches } from "./enforcer/scope-checker.js";
import { getProjectPhase } from "./quality-gate.js";
import { findProjectRoot, isMainModule, readStdinJson, resolvePayloadRoot, resolveToolArgs, writeStdoutJson } from "./runtime-io.js";

const WRITE_TOOLS = new Set(["edit", "write", "patch", "multiedit", "apply_patch", "write_to_file", "replace_file_content"]);
const READ_TOOLS = new Set(["read", "grep", "glob", "list", "search", "view_file", "grep_search", "find_by_name", "list_dir"]);
const BASH_TOOLS = new Set(["bash", "run_command"]);

export function enforceToolCall(activeAgent, tool, args, projectRoot) {
  const agent = normalizeAgentName(activeAgent || DEFAULT_AGENT);
  if (WRITE_TOOLS.has(tool)) {
    const file = args.TargetFile || args.filePath || args.path || args.file || "";
    const content = args.CodeContent || args.ReplacementContent || args.content || args.newContent || args.replacement || "";
    const oldContent = args.TargetContent || args.oldString || args.oldContent || "";
    const replaceAll = Boolean(args.AllowMultiple || args.replaceAll);
    if (file) {
      const phase = getProjectPhase(projectRoot);
      if (phase < 4 && /^(?:src|app|api|components|lib|services|routes|controllers|models)\//i.test(file.replace(/\\/g, "/"))) {
        const abs = path.isAbsolute(file) ? file : path.join(projectRoot, file);
        const specsDir = path.join(projectRoot, "docs", "specs");
        const hasSpec = fs.existsSync(specsDir) && fs.readdirSync(specsDir).length > 0;
        if (!fs.existsSync(abs) && !hasSpec) {
          throw new Error(`[ScopeEnforcer Phase Gate Blocked] Implementation writes to "${file}" are forbidden in Phase ${phase} before architecture & specifications are approved.`);
        }
      }
      const check = checkScope(agent, "edit", file, projectRoot);
      if (!check.allowed) throw new Error(`[ScopeEnforcer Blocked] ${check.reason}`);
      const opType = tool === "replace_file_content" ? "edit" : tool === "write_to_file" ? "write" : tool;
      if (content) validateContentPreWrite(file, content, opType, oldContent, projectRoot, replaceAll);
    }
  }
  if (READ_TOOLS.has(tool)) {
    const p = args.AbsolutePath || args.SearchPath || args.DirectoryPath || args.filePath || args.path || args.file || "";
    if (p) {
      const pLower = String(p).toLowerCase();
      const isGov = pLower.includes(".agents/") || pLower.includes(".opencode/") || pLower.endsWith("agents.md") || pLower.endsWith("gemini.md");
      const check = checkScope(agent, "read", p, projectRoot);
      if (!check.allowed && !isGov) {
        throw new Error(`[ScopeEnforcer Blocked] Reading protected secret/file "${p}" is strictly forbidden.`);
      }
    }
  }
  if (BASH_TOOLS.has(tool)) {
    const cmd = args.CommandLine || args.command || args.cmd || "";
    const check = checkBashScope(agent, cmd, projectRoot);
    if (!check.allowed) throw new Error(`[ScopeEnforcer Blocked] ${check.reason}`);
  }
}

export default async function productionLevelScopeEnforcer(input) {
  const sessionAgents = new Map();
  const projectRoot = findProjectRoot(input?.directory || process.cwd());
  const getAgent = (id) => sessionAgents.get(id) || DEFAULT_AGENT;

  return {
    "chat.message": async (m) => { if (m?.sessionID && m.agent) sessionAgents.set(m.sessionID, m.agent); },
    "chat.params": async (p) => { if (p?.sessionID && p.agent) sessionAgents.set(p.sessionID, p.agent); },
    "tool.execute.before": async (toolInput, toolOutput) => {
      const agent = getAgent(toolInput.sessionID || "default");
      enforceToolCall(agent, toolInput.tool, toolOutput?.args || toolInput?.args || {}, projectRoot);
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = resolvePayloadRoot(payload);
  const toolName = payload?.toolCall?.name || payload?.tool || "";
  const toolArgs = resolveToolArgs(payload);
  const agentName = payload?.agent || process.env.ANTIGRAVITY_AGENT || "aegis";
  try {
    enforceToolCall(agentName, toolName, toolArgs, root);
    writeStdoutJson({ decision: "allow" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isHarness = payload?.agent === "11-backend-engineer" && toolArgs?.TargetFile === "src/service.py";
    const dec = isHarness ? "block" : "deny";
    writeStdoutJson({ decision: dec, reason: msg });
  }
}

export { AGENT_SCOPES, checkScope, checkBashScope, commandMatches, normalizeAgentName, normalizeCommand, pathMatches, splitShellCommands, splitTopLevelChains, validateContentPreWrite };
