import fs from "node:fs";
import path from "node:path";
import { AGENT_EFFORT_MAP } from "./governor/agent-effort-map.js";
import { AGENT_PRIMARY_MODEL, MODEL_FAILOVER_MATRIX } from "./governor/model-failover.js";
import { resolveModelAndEffort } from "./governor/quota-tracker.js";
import { findProjectRoot, isMainModule, readStdinJson, resolvePayloadRoot, writeStdoutJson } from "./runtime-io.js";

const PRO_TIER_AGENTS = new Set([
  "orchestrator", "vision-analyst", "decomposition-guide", "spec-reviewer",
  "system-architect", "database-designer", "adversarial-reviewer", "refactoring-auditor",
  "security-auditor", "ux-auditor", "performance-auditor", "apex-arbitrator",
]);

export function resolveEffortConfig(agentName = "aegis", promptText = "", projectRoot = process.cwd()) {
  const normalized = String(agentName).replace(/^\d+-/, "").toLowerCase();
  const base = AGENT_EFFORT_MAP[normalized] || AGENT_EFFORT_MAP.aegis;
  const text = String(promptText).toLowerCase();

  let clutch = "Medium";
  if (text.includes("micro") || text.includes("typo") || text.includes("one-line")) clutch = "Micro";
  else if (text.includes("small") || text.includes("minor fix")) clutch = "Small";
  else if (text.includes("large") || text.includes("subsystem") || text.includes("architecture")) clutch = "Large";

  const resolved = resolveModelAndEffort(normalized, base, projectRoot, promptText);
  const antigravitySubagentModel = PRO_TIER_AGENTS.has(normalized) ? "pro" : "flash";

  return {
    ...resolved,
    agent: normalized,
    adaptiveClutch: clutch,
    antigravitySubagentModel,
  };
}

export default async function productionLevelEffortGovernor(input) {
  const projectRoot = findProjectRoot(input?.directory || process.cwd());
  return {
    "chat.params": async (paramsInput, paramsOutput) => {
      const rawAgent = paramsInput?.agent || "aegis";
      const promptText = paramsInput?.message || "";
      const cfg = resolveEffortConfig(rawAgent, promptText, projectRoot);
      if (paramsOutput) {
        paramsOutput.temperature = cfg.temp;
        if (!paramsOutput.options) paramsOutput.options = {};
        paramsOutput.options.model = cfg.activeModel;
        paramsOutput.options.subagentModel = cfg.antigravitySubagentModel;
        paramsOutput.options.fallbackModels = cfg.fallbackChain;
        paramsOutput.options.reasoningEffort = cfg.reasoning_effort;
        paramsOutput.options.thinkingBudget = cfg.budget;
        paramsOutput.options.thinkingConfig = { thinkingBudget: cfg.budget };
        paramsOutput.options.google = { thinkingConfig: { thinkingBudget: cfg.budget } };
        paramsOutput.options.openai = { reasoningEffort: cfg.reasoning_effort };
      }
    },
  };
}

if (isMainModule(import.meta.url)) {
  const payload = await readStdinJson();
  const root = resolvePayloadRoot(payload);
  const agent = payload?.agent || process.env.ANTIGRAVITY_AGENT || "aegis";
  const prompt = payload?.prompt || payload?.message || "";
  const cfg = resolveEffortConfig(agent, prompt, root);
  const injectSteps = [];

  if (cfg.failoverActive) {
    injectSteps.push({
      ephemeralMessage: `[Effort Governor Quota Failover] FAILOVER ACTIVE: ${cfg.primaryModel} -> ${cfg.activeModel} (thinkingBudget: ${cfg.budget}, temp: ${cfg.temp}, subagentTier: ${cfg.antigravitySubagentModel}). ${cfg.failoverGuardrail}`,
    });
  }

  const violationsPath = path.join(root, "project-memory", ".telemetry", "quality-violations.json");
  if (fs.existsSync(violationsPath)) {
    try {
      const vMap = JSON.parse(fs.readFileSync(violationsPath, "utf8")) || {};
      const msgs = Object.values(vMap).flat();
      if (msgs.length > 0) {
        injectSteps.push({
          ephemeralMessage: `[Production Level Quality Gate Remediation Required] Fix these violations immediately before proceeding: ${msgs.join(" | ")}`,
        });
      }
    } catch {}
  }

  writeStdoutJson({ injectSteps });
}

export { AGENT_EFFORT_MAP, AGENT_PRIMARY_MODEL, MODEL_FAILOVER_MATRIX };
