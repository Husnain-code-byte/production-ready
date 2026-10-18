import fs from "node:fs";
import path from "node:path";

/**
 * Production Level — Zero-Downtime Multi-Model Quota Failover & Effort Recalibration Engine
 * Guarantees that if any model (e.g. google/gemini-4-argon, anthropic/claude-sonnet-5.5,
 * anthropic/claude-opus-5.5, or google/gemini-3.8-flash) hits quota or rate limits,
 * agents using that model NEVER become unavailable. Instead, execution seamlessly fails over
 * to the next healthy model with recalibrated thinking budgets, temperatures, and safety guards.
 */

export const AGENT_PRIMARY_MODEL = {
  aegis: "google/gemini-3.8-flash",
  orchestrator: "google/gemini-4-argon",
  "vision-analyst": "google/gemini-4-argon",
  "decomposition-guide": "google/gemini-4-argon",
  "reference-collector": "google/gemini-3.8-flash",
  "spec-writer": "google/gemini-3.8-flash",
  "spec-reviewer": "anthropic/claude-sonnet-5.5",
  "system-architect": "google/gemini-4-argon",
  "database-designer": "google/gemini-4-argon",
  "figma-analyzer": "google/gemini-3.8-flash",
  "design-system-builder": "google/gemini-3.8-flash",
  "frontend-engineer": "google/gemini-3.8-flash",
  "backend-engineer": "google/gemini-3.8-flash",
  "completeness-checker": "google/gemini-3.8-flash",
  "adversarial-reviewer": "anthropic/claude-sonnet-5.5",
  "refactoring-auditor": "anthropic/claude-sonnet-5.5",
  "security-auditor": "anthropic/claude-sonnet-5.5",
  "ux-auditor": "anthropic/claude-sonnet-5.5",
  "performance-auditor": "anthropic/claude-sonnet-5.5",
  debugger: "google/gemini-3.8-flash",
  "documentation-writer": "google/gemini-3.8-flash",
  "research-agent": "google/gemini-3.8-flash",
  "release-manager": "google/gemini-3.8-flash",
  "feature-registry-manager": "google/gemini-3.8-flash",
  "tech-debt-tracker": "google/gemini-3.8-flash",
  "apex-arbitrator": "anthropic/claude-opus-5.5",
};

export const MODEL_FAILOVER_MATRIX = {
  "google/gemini-4-argon": [
    {
      model: "anthropic/claude-sonnet-5.5",
      nativeTier: "inherit",
      tierOverride: "HIGH",
      budgetFloor: 16384,
      reasoningEffort: "high",
      tempOverride: 0.2,
      guardrail: "Argon-4 quota failover active -> Claude Sonnet 5.5 (HIGH 16,384 thinking budget). Enforce strict C4 boundary & schema invariant checks.",
    },
    {
      model: "google/gemini-3.8-flash",
      nativeTier: "inherit",
      tierOverride: "HIGH",
      budgetFloor: 16384,
      reasoningEffort: "high",
      tempOverride: 0.15,
      guardrail: "Argon-4 & Sonnet quota failover active -> Gemini 3.8 Flash boosted to HIGH (16,384 thinking tokens) + mandatory 2-pass self-consistency verification.",
    },
  ],
  "anthropic/claude-sonnet-5.5": [
    {
      model: "google/gemini-4-argon",
      nativeTier: "inherit",
      tierOverride: "HIGH",
      budgetFloor: 16384,
      reasoningEffort: "high",
      tempOverride: 0.2,
      guardrail: "Claude Sonnet 5.5 quota failover active -> Gemini 4 Argon (HIGH 16,384 thinking budget). Preserves cross-model independence from Gemini 3.8 Flash builder.",
    },
    {
      model: "google/gemini-3.8-flash",
      nativeTier: "inherit",
      tierOverride: "HIGH",
      budgetFloor: 16384,
      reasoningEffort: "high",
      tempOverride: 0.1,
      guardrail: "Claude Sonnet 5.5 & Argon-4 quota failover active -> Gemini 3.8 Flash in deterministic zero-trust audit mode (temp 0.1, 16,384 thinking tokens, line-by-line diff checklist).",
    },
  ],
  "anthropic/claude-opus-5.5": [
    {
      model: "google/gemini-4-argon",
      nativeTier: "inherit",
      tierOverride: "APEX",
      budgetFloor: 32768,
      reasoningEffort: "high",
      tempOverride: 0.1,
      guardrail: "Claude Opus 5.5 quota failover active -> Gemini 4 Argon at APEX budget (32,768 tokens, temp 0.1) with formal invariant proof.",
    },
    {
      model: "anthropic/claude-sonnet-5.5",
      nativeTier: "inherit",
      tierOverride: "APEX",
      budgetFloor: 32768,
      reasoningEffort: "high",
      tempOverride: 0.1,
      guardrail: "Claude Opus 5.5 quota failover active -> Claude Sonnet 5.5 at APEX budget (32,768 tokens) + mandatory Human Architect sign-off.",
    },
    {
      model: "google/gemini-3.8-flash",
      nativeTier: "inherit",
      tierOverride: "APEX",
      budgetFloor: 32768,
      reasoningEffort: "high",
      tempOverride: 0.1,
      guardrail: "All upper-tier models rate-limited -> Gemini 3.8 Flash at maximum 32,768 thinking budget + mandatory Human Architect escalation via ask_question.",
    },
  ],
  "google/gemini-3.8-flash": [
    {
      model: "anthropic/claude-sonnet-5.5",
      nativeTier: "inherit",
      tierOverride: null,
      budgetFloor: 4096,
      reasoningEffort: "medium",
      tempOverride: 0.15,
      guardrail: "Gemini 3.8 Flash quota failover active -> Claude Sonnet 5.5 with strict diff-only context scoping to conserve quota.",
    },
    {
      model: "google/gemini-4-argon",
      nativeTier: "inherit",
      tierOverride: null,
      budgetFloor: 4096,
      reasoningEffort: "medium",
      tempOverride: 0.2,
      guardrail: "Gemini 3.8 Flash quota failover active -> Gemini 4 Argon with atomic file scoping.",
    },
  ],
};
