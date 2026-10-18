---
name: abort-feature
description: "Safely abandon an in-progress feature without data loss by stashing uncommitted changes (`git stash push -u`), marking the feature BLOCKED in `05-feature-registry.md`, and logging recovery instructions. Triggered by /abort-feature."
---

# `/abort-feature` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/abort-feature`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `22-feature-registry-manager`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

## Process

1. **Identify the feature** — read `project-memory/05-feature-registry.md` to confirm the feature ID and current status
2. **Preserve and revert working tree safely** — ``git stash push -u -m "aborted-<feature-id>"` (never use destructive `git reset --hard`)
3. **Clean up branches safely** — if on a separate feature branch, return to main (``git checkout main`) and archive or preserve the branch without hard deletion
4. **Mark feature as BLOCKED** in `project-memory/05-feature-registry.md`:
   - Set status to `BLOCKED`
   - Add note: "Aborted YYYY-MM-DD: [reason]"
5. **Log the abort** in `project-memory/06-session-log.md`:
   - Feature ID, date, reason for abort
   - What was completed before abort
   - Recovery steps needed when resuming
6. **Report summary** to human architect

## Rules
- Never abort without human confirmation — ask for explicit approval first
- Always log the reason — future sessions need to know why work was stopped
- Preserve partial work — mention what was done in the session log for later resumption
- If feature has dependencies, check if downstream features are affected
