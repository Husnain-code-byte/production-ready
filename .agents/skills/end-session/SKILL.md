---
name: end-session
description: "Close the active Production Level engineering session. Runs verification gates, appends the session log, updates feature registry status, and formats a conventional commit for human approval. Triggered by /end-session."
---

# `/end-session` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/end-session`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `22-feature-registry-manager`, `14-refactoring-auditor`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/08-verification-report.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/06-session-log.md`, `project-memory/05-feature-registry.md`, `project-memory/aegis/session-history.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Production Level Session End

Close the current Production Level session properly.

## Process
1. **Summarize what was done** — what files changed, what features progressed, what was verified
2. **Update session log** — append entry to `project-memory/06-session-log.md`:
   ```
   ## Session: YYYY-MM-DD HH:MM
   - Feature: [name]
   - Phase: [number]
   - Done: [what was accomplished]
   - Not done: [what was deferred]
   - Learned: [key insight or decision]
   - Next session: [what to do next]
   ```
3. **Update feature registry** — if a feature status changed, update `project-memory/05-feature-registry.md`
4. **Verify verification gates** — run `/verify-feature` and confirm all gates pass
5. **If all gates pass:** stage changes and generate structured commit message (do NOT commit — ask human first)
6. **If any gate fails:** state which gate and what needs fixing — do NOT commit
7. **Commit message format** (for human to approve):
   ```
   feat(scope): description of change [AI-assisted]

   - What was implemented
   - What tests were added
   - Verification results

   Co-Authored-By: Production Level Antigravity <noreply@antigravity.google>
   ```

Confirm all steps complete before ending.
