---
name: checkpoint
description: "Create a named recoverable snapshot of `project-memory/` and git state under `project-memory/checkpoints/<name>-*` and index it in `project-memory/checkpoints/INDEX.md` before risky changes. Triggered by /checkpoint."
---

# `/checkpoint` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/checkpoint`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/07-decision-log.md`, `project-memory/checkpoints/INDEX.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/checkpoints/INDEX.md`, `project-memory/checkpoints/<name>-*`, `project-memory/06-session-log.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Checkpoint

Create a recoverable session checkpoint — a lightweight named save point.

## Process
1. **Name the checkpoint** — use a descriptive slug (e.g., `pre-refactor-auth`)
2. **Save state files:**
   - Copy `project-memory/06-session-log.md` → `project-memory/checkpoints/<name>-session.md`
   - Copy `project-memory/05-feature-registry.md` → `project-memory/checkpoints/<name>-registry.md`
   - Copy `project-memory/07-decision-log.md` → `project-memory/checkpoints/<name>-decisions.md`
3. **Record git state:**
   - ``git stash push -m "checkpoint-<name>"` (if uncommitted changes)
   - Create `project-memory/checkpoints/<name>-git.txt` with ``git log --oneline -10`
4. **Log checkpoint:**
   ```
   ## Checkpoint: <name> (YYYY-MM-DD HH:MM)
   - Branch: [current]
   - Git HEAD: [hash]
   - Uncommitted: [yes/no + files]
   - Purpose: [why this checkpoint was made]
   ```
   Append to `project-memory/checkpoints/INDEX.md`
5. **Link to session log** — append to `project-memory/06-session-log.md`:
   ```
   - Checkpoint: <name> (HH:MM) — <reason>
   - Context usage at checkpoint: <estimated tokens>
   ```

## Auto-Create Triggers
Checkpoints are auto-created when:
- Context usage reaches 75%
- A feature phase completes (spec → implementation → verification → refactoring)
- Before risky refactoring or experimental changes

## Rules
- Always create the `project-memory/checkpoints/` directory if missing
- Checkpoints are local — do NOT commit them to git
- Retain last 5 checkpoints; auto-delete older than 30 days
- Max 10 checkpoints — if more exist, warn and ask which to prune
- Checkpoints should be short-lived (delete within 7 days)
