---
description: "Dynamic 4-tier effort governance, thinking token budgets, Adaptive Clutch sizing, and fallback effort escalation."
---

# Production Level — Dynamic 4-Tier Effort Strategy

## 1. The 4 Effort Tiers (`scripts/hooks/effort-governor.js`)

| Effort Tier | Thinking Budget | Temperature | Reasoning Effort | Assigned Agents |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: `LOW`** | `1,024` tokens | `0.1` | `low` | `03-reference-collector`, `08-figma-analyzer`, `09-design-system-builder`, `12-completeness-checker`, `14-refactoring-auditor`, `16-ux-auditor`, `19-documentation-writer`, `20-research-agent`, `21-release-manager`, `22-feature-registry-manager`, `23-tech-debt-tracker` |
| **Tier 2: `MEDIUM`** | `4,096` tokens | `0.2` | `medium` | `aegis`, `00-orchestrator`, `01-vision-analyst`, `02-decomposition-guide`, `04-spec-writer`, `10-frontend-engineer`, `11-backend-engineer`, `17-performance-auditor`, `18-debugger` |
| **Tier 3: `HIGH`** | `16,384` tokens | `0.3` | `high` | `05-spec-reviewer`, `06-system-architect`, `07-database-designer`, `13-adversarial-reviewer`, `15-security-auditor` |
| **Tier 4: `APEX`** | `32,768` tokens | `0.2` | `high` | `24-apex-arbitrator` |

---

## 2. Automatic Effort Recalibration During Model Quota Failover

Whenever a primary model hits its rate or quota limit, `scripts/hooks/effort-governor.js` automatically recalibrates the substitute model's effort parameters so quality never degrades:
1. **Architecture Failover (`google/gemini-4-argon` Exhausted):**
   - Even if an Argon agent normally runs at `MEDIUM` (`4,096` tokens, e.g., `00-orchestrator`, `01-vision-analyst`, `02-decomposition-guide`), its fallback execution on `anthropic/claude-sonnet-5.5` or `google/gemini-3.8-flash` is **automatically boosted to `HIGH` (`16,384` thinking tokens, `temp: 0.15–0.2`)** to ensure deep architectural reasoning.
2. **Adversarial Audit Failover (`anthropic/claude-sonnet-5.5` Exhausted):**
   - Failover to `google/gemini-4-argon` or `google/gemini-3.8-flash` forces `HIGH` effort (`16,384` thinking tokens) and drops temperature to `0.1` for deterministic, zero-hallucination defect detection.
3. **Apex Arbitration Failover (`anthropic/claude-opus-5.5` Exhausted):**
   - Locks thinking budget at the `APEX` ceiling (`32,768` tokens, `temp: 0.1`) on the highest available fallback model and requires explicit Human Architect sign-off.
