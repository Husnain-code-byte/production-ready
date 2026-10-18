---
name: scope-check
description: "Verify and declare strict file, directory, and architectural boundary constraints before modifying code. Lists in-scope files, out-of-scope files, and anti-goals. Triggered by /scope-check."
---

# `/scope-check` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/scope-check`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`
- **Project Memory Inputs (`view_file`):** `project-memory/05-feature-registry.md`, `project-memory/02-subsystem-map.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** None (Pre-flight Boundary Declaration)
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Scope Check

Before making any changes, declare scope boundaries.

## Declare
1. **Files I will modify:** [list specific file paths]
2. **Files I will create:** [list specific file paths]
3. **Files I will read but NOT modify:** [list]
4. **Files I will NOT touch under any circumstances:** [list]
5. **Constraints:** what I will NOT do (no refactoring, no new dependencies, no architectural changes)
6. **Anti-goals:** what I am explicitly avoiding

Ask user: "This is my scope. Is this correct? Should I proceed?"
Do not make ANY changes until scope is confirmed.
