/**
 * Agent Effort Registry - Maps each agent to reasoning effort and thinking budgets.
 */

export const AGENT_EFFORT_MAP = {
  // Tier 1: LOW (0 - 1,024 thinking tokens, temperature: 0.1)
  "reference-collector": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "figma-analyzer": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "design-system-builder": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "completeness-checker": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "refactoring-auditor": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "ux-auditor": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "documentation-writer": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "research-agent": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "release-manager": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "feature-registry-manager": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
  "tech-debt-tracker": { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },

  // Tier 2: MEDIUM (1,024 - 4,096 thinking tokens, temperature: 0.2)
  aegis: { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  orchestrator: { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "vision-analyst": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "decomposition-guide": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "spec-writer": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "frontend-engineer": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "backend-engineer": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  "performance-auditor": { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  debugger: { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },

  // Tier 3: HIGH (4,096 - 16,384 thinking tokens, temperature: 0.3)
  "spec-reviewer": { tier: "HIGH", budget: 16384, reasoning_effort: "high", temp: 0.3 },
  "system-architect": { tier: "HIGH", budget: 16384, reasoning_effort: "high", temp: 0.3 },
  "database-designer": { tier: "HIGH", budget: 16384, reasoning_effort: "high", temp: 0.3 },
  "adversarial-reviewer": { tier: "HIGH", budget: 16384, reasoning_effort: "high", temp: 0.3 },
  "security-auditor": { tier: "HIGH", budget: 16384, reasoning_effort: "high", temp: 0.3 },

  // Tier 4: APEX (Maximum reasoning budget 32,768 tokens, Claude Opus 5.5 ONLY)
  "apex-arbitrator": { tier: "APEX", budget: 32768, reasoning_effort: "high", temp: 0.2 },

  // OpenCode built-in execution modes
  build: { tier: "MEDIUM", budget: 4096, reasoning_effort: "medium", temp: 0.2 },
  plan: { tier: "LOW", budget: 1024, reasoning_effort: "low", temp: 0.1 },
};

// Alias numeric-prefixed Antigravity agent filenames
for (const [k, v] of Object.entries({ ...AGENT_EFFORT_MAP })) {
  AGENT_EFFORT_MAP[`00-${k}`] = v;
}
