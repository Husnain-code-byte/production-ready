---
name: restore
description: "Restore workspace `project-memory/` files and optional git state from a named checkpoint listed in `project-memory/checkpoints/INDEX.md`. Triggered by /restore."
---

# `/restore` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/restore`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`
- **Project Memory Inputs (`view_file`):** `project-memory/checkpoints/INDEX.md`, `project-memory/checkpoints/<name>-*`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/07-decision-log.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Restore from Checkpoint

Restore project-memory and (optionally) git state from a named checkpoint.

## Process
1. **List checkpoints:**
   - Read `project-memory/checkpoints/INDEX.md`
   - Show human the list: name, date, purpose
2. **Select checkpoint:** human picks one
3. **Restore project-memory:**
   - Copy `project-memory/checkpoints/<name>-session.md` → `project-memory/06-session-log.md`
   - Copy `project-memory/checkpoints/<name>-registry.md` → `project-memory/05-feature-registry.md`
   - Copy `project-memory/checkpoints/<name>-decisions.md` → `project-memory/07-decision-log.md`
4. **Restore git state (if needed):**
   - Check for `git stash list | grep checkpoint-<name>`
   - If found: ``git stash pop stash@{<index>}`
   - If not found: soft reset to the recorded HEAD: ``git reset --soft <hash>`
5. **Log restoration in session log** — append to `project-memory/06-session-log.md`:
   ```
   - Restored from checkpoint: <name> (HH:MM)
   - Context restored to: <estimated tokens>
   - Resuming work on: <feature-id>
   ```

## Rules
- ALWAYS show the human what checkpoint data looks like before restoring
- Git restore is OPTIONAL — ask first
- NEVER force push or hard reset — maximum is `--soft` reset
- After restore, run `/phase-check` to confirm state
