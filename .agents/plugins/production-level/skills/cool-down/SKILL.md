---
name: cool-down
description: "Compress session context, archive older session log entries, and write a compact handoff snapshot to `project-memory/06-session-log.md`. Triggered by /cool-down."
---

# `/cool-down` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/cool-down`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`, `23-tech-debt-tracker`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/06-session-log.md`, `project-memory/aegis/session-history.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Cool Down

Consolidate the current session state into a compact summary for future sessions.

## Auto-Triggers
Cool-down runs automatically when:
- **Context usage > 80%** — auto-compress and archive
- **Session duration > 2 hours** — checkpoint and cool down
- **Project memory > 5MB** — archive old session entries

You can also trigger manually with `/cool-down` for immediate effect.

## Process
1. **Read current state:**
   - `project-memory/06-session-log.md` — what happened this session
   - `project-memory/05-feature-registry.md` — active features
   - ``git status --short` — uncommitted changes
   - ``git log --oneline -5` — recent commits
2. **Compress into session snapshot:**
   ```
   ## Snapshot: YYYY-MM-DD HH:MM
   - Phase: [0-8]
   - Active Feature: [name] — [status]
   - Uncommitted: [N files]
   - Context Used: [~N tokens estimated]
   - Next Action: [one concrete step]
   ```
3. **Write snapshot to:** `project-memory/06-session-log.md` as a block entry
4. **Archive any large context** — summarize sessions older than 7 days into 500-word entries; truncate raw session logs
5. **State blockers** — any unresolved issues for next session
6. **Confirm** — show human the snapshot and ask: "Ready to cool down?"

## Rules
- Do NOT commit changes — cool-down is a note-taking operation
- Do NOT modify feature status — only log the snapshot
- If context is < 50% full and session < 1 hour, cool-down is optional
