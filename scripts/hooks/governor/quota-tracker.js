import fs from "node:fs";
import path from "node:path";
import { AGENT_PRIMARY_MODEL, MODEL_FAILOVER_MATRIX } from "./model-failover.js";

const DEFAULT_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes

const MODEL_PATTERNS = [
  { id: "google/gemini-4-argon", regex: /\b(?:gemini-4-argon|argon[\s_-]*4|argon)\b/i },
  { id: "anthropic/claude-sonnet-5.5", regex: /\b(?:claude-sonnet-5\.5|sonnet[\s_-]*5\.5|sonnet)\b/i },
  { id: "anthropic/claude-opus-5.5", regex: /\b(?:claude-opus-5\.5|opus[\s_-]*5\.5|opus)\b/i },
  { id: "google/gemini-3.8-flash", regex: /\b(?:gemini-3\.8-flash|flash[\s_-]*3\.8)\b/i },
];

const LIMIT_TRIGGER_REGEX = /\b(?:429|rate[\s_-]*limit(?:ed)?|quota[\s_-]*(?:exceeded|exhausted|hit|limit)|hit[\s_-]*(?:the[\s_-]*)?limit|resource[\s_-]*exhausted|model[\s_-]*unavailable|overloaded|too[\s_-]*many[\s_-]*requests)\b/i;
const CLEAR_TRIGGER_REGEX = /\b(?:reset[\s_-]*quota|clear[\s_-]*quota|quota[\s_-]*restored)\b/i;

export function getQuotaStateFile(projectRoot) {
  return path.join(projectRoot, "project-memory", ".telemetry", "model-quota-state.json");
}

export function loadExhaustedModels(projectRoot, promptText = "") {
  const exhausted = new Set();

  // 1. Environment variable override (e.g. PRODUCTION_LEVEL_EXHAUSTED_MODELS="google/gemini-4-argon")
  const envList = process.env.PRODUCTION_LEVEL_EXHAUSTED_MODELS || "";
  for (const item of envList.split(",").map((s) => s.trim()).filter(Boolean)) {
    exhausted.add(item);
    for (const mp of MODEL_PATTERNS) {
      if (mp.regex.test(item)) exhausted.add(mp.id);
    }
  }

  // 2. Persistent state file with TTL auto-recovery
  const stateFile = getQuotaStateFile(projectRoot);
  let stateObj = { exhaustedModels: {} };
  if (fs.existsSync(stateFile)) {
    try {
      stateObj = JSON.parse(fs.readFileSync(stateFile, "utf8")) || { exhaustedModels: {} };
    } catch {}
  }

  const now = Date.now();
  let mutated = false;

  if (promptText && CLEAR_TRIGGER_REGEX.test(promptText)) {
    stateObj.exhaustedModels = {};
    mutated = true;
  } else if (promptText && LIMIT_TRIGGER_REGEX.test(promptText)) {
    for (const mp of MODEL_PATTERNS) {
      if (mp.regex.test(promptText)) {
        stateObj.exhaustedModels[mp.id] = { exhaustedAt: new Date(now).toISOString(), expiresAt: now + DEFAULT_COOLDOWN_MS };
        mutated = true;
      }
    }
  }

  for (const [modelId, info] of Object.entries(stateObj.exhaustedModels || {})) {
    if (info && info.expiresAt && info.expiresAt > now) {
      exhausted.add(modelId);
    } else {
      delete stateObj.exhaustedModels[modelId];
      mutated = true;
    }
  }

  if (mutated) {
    try {
      fs.mkdirSync(path.dirname(stateFile), { recursive: true });
      fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2) + "\n", "utf8");
    } catch {}
  }

  return exhausted;
}

export function resolveModelAndEffort(normalizedAgent, baseEffort, projectRoot = process.cwd(), promptText = "") {
  const primaryModel = AGENT_PRIMARY_MODEL[normalizedAgent] || "google/gemini-3.8-flash";
  const exhausted = loadExhaustedModels(projectRoot, promptText);
  const chain = MODEL_FAILOVER_MATRIX[primaryModel] || [];

  if (!exhausted.has(primaryModel)) {
    return {
      ...baseEffort,
      primaryModel,
      activeModel: primaryModel,
      nativeSubagentModel: "inherit",
      failoverActive: false,
      failoverGuardrail: null,
      fallbackChain: chain.map((c) => c.model),
    };
  }

  // Find first non-exhausted fallback model in the chain
  const selected = chain.find((candidate) => !exhausted.has(candidate.model)) || chain[chain.length - 1];
  const recalibratedTier = selected.tierOverride || baseEffort.tier;
  const recalibratedBudget = Math.max(baseEffort.budget, selected.budgetFloor || baseEffort.budget);
  const recalibratedEffort = selected.reasoningEffort || baseEffort.reasoning_effort;
  const recalibratedTemp = selected.tempOverride ?? baseEffort.temp;

  return {
    tier: recalibratedTier,
    budget: recalibratedBudget,
    reasoning_effort: recalibratedEffort,
    temp: recalibratedTemp,
    primaryModel,
    activeModel: selected.model,
    nativeSubagentModel: selected.nativeTier || "inherit",
    failoverActive: true,
    failoverGuardrail: selected.guardrail,
    fallbackChain: chain.map((c) => c.model),
  };
}
