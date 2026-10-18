---
name: rollback-feature
description: "Revert a broken or regressed feature safely to the last known good state using non-destructive `git revert`, update `05-feature-registry.md` to `ROLLED_BACK`, and verify build/test health. Triggered by /rollback-feature."
---

# `/rollback-feature` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/rollback-feature`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `22-feature-registry-manager`, `18-debugger`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Rollback Feature

Revert changes related to a specific feature, restoring the last known good state.

## Process
1. **Identify the feature** — which feature to roll back (from feature registry or git log)
2. **Find last good state** — ``git log --oneline --all` and identify last commit before feature work
3. **Check for interleaved changes** — ``git diff --name-only <last-good>..HEAD` — if other features touched the same files, warn human
4. **If no interleaving:** ``git revert --no-commit <last-good>..HEAD` then ``git reset` the feature-specific files only
5. **If interleaving detected:** ask human — do NOT auto-revert, too risky
6. **Update feature registry** — set feature status to `ROLLED_BACK` in `project-memory/05-feature-registry.md`
7. **Update session log** — `project-memory/06-session-log.md`
8. **Verify** — run tests, confirm build passes

## Rules
- NEVER force push
- NEVER revert another team member's commits without human approval
- Always verify build and tests after rollback
- If rollback affects more than 5 files, pause and show human the plan first
