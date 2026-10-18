---
name: context-update
description: "Synchronize all project-memory files (`05-feature-registry.md`, `06-session-log.md`, `07-decision-log.md`, and `aegis/project-context.md`) with the current repository state. Triggered by /context-update."
---

# `/context-update` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/context-update`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `22-feature-registry-manager`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/07-decision-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/07-decision-log.md`, `project-memory/aegis/project-context.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Update Session Context

Update the project memory files with current state.

## Updates
1. **Session log** (`project-memory/06-session-log.md`): append entry with date, feature, phase, done, not done, learned, next
2. **Feature registry** (`project-memory/05-feature-registry.md`): update status for any feature that changed
3. **Decision log** (`project-memory/07-decision-log.md`): add any new ADR references

## Session Entry Template
```markdown
## Session: YYYY-MM-DD HH:MM
- **Feature:** [name]
- **Phase:** [number]
- **Model:** [model used]
- **Done:**
  - [accomplishment 1]
  - [accomplishment 2]
- **Not done:** [what was deferred and why]
- **Learned:** [key insight]
- **Decisions:** [ADR references]
- **Verification:**
  - Tests: [pass/fail/count]
  - Mutation score: [%]
  - Review: [PASS/NEEDS_REVISION]
- **Next session:** [what to do next]
```
