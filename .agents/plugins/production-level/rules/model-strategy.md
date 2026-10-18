---
description: "Cross-model routing via Antigravity pro/flash tiers, quota failover, and Law 6 Radical Intellectual Honesty."
---

# Production Level — Multi-Model Routing & Cross-Model Verification

## 1. True Cross-Model Separation in Antigravity (`invoke_subagent`)
Never force `Model: "inherit"` across both builders and reviewers—doing so runs the auditor on the exact same model as the builder, sharing identical blind spots.
When dispatching subagents via Antigravity's native `invoke_subagent` tool:
- **Workhorse Builders (`Model: "flash"` -> `google/gemini-3.8-flash`):**
  `03-reference-collector`, `04-spec-writer`, `08-figma-analyzer`, `09-design-system-builder`, `10-frontend-engineer`, `11-backend-engineer`, `12-completeness-checker`, `18-debugger`, `19-documentation-writer`, `20-research-agent`, `21-release-manager`, `22-feature-registry-manager`, `23-tech-debt-tracker`.
- **Architecture, Security, & Adversarial Auditors (`Model: "pro"` -> `google/gemini-4-argon` / `anthropic/claude-sonnet-5.5` / `anthropic/claude-opus-5.5`):**
  `00-orchestrator`, `01-vision-analyst`, `02-decomposition-guide`, `05-spec-reviewer`, `06-system-architect`, `07-database-designer`, `13-adversarial-reviewer`, `14-refactoring-auditor`, `15-security-auditor`, `16-ux-auditor`, `17-performance-auditor`, `24-apex-arbitrator`.

## 2. Quota Failover & Law 6 (Radical Intellectual Honesty)
- If a primary `pro` model hits its rate limit, `scripts/hooks/effort-governor.js` automatically routes to the next healthy fallback model at `HIGH` (`16,384` thinking tokens) or `APEX` (`32,768` thinking tokens) with deterministic checklist guardrails.
- **Transparency Mandate:** If an adversarial review is ever executed in single-model fallback mode, you MUST state explicitly in the report: *"Adversarial audit was executed in single-model fallback mode."*
- **Zero Self-Congratulation:** Phrases like *"Proceeding with confidence..."* or self-assigned scores (*"9.5/10"*) are strictly banned.
