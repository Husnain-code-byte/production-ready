---
name: phase-check
description: "Determine the current Production Level lifecycle phase (Phases 0-8 and 5A-5F) by inspecting project-memory artifacts and recommending the exact next action and agent. Triggered by /phase-check."
---

# `/phase-check` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/phase-check`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `00-orchestrator`
- **Project Memory Inputs (`view_file`):** `project-memory/01-vision.md`, `project-memory/02-subsystem-map.md`, `project-memory/03-architecture.md`, `project-memory/04-design-system.md`, `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** None (Read-Only Diagnostic)
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Production Level Phase Check

Read the current project state and determine what phase we're in and what to do next.

## Check
1. Read `project-memory/05-feature-registry.md` — what features exist and their status
2. Read `project-memory/06-session-log.md` — what was the last thing done
3. Read `project-memory/01-vision.md` — has the vision been defined

## Production Level Phases Quick Reference
0. **Vision Crystallization** — PR/FAQ exists? If not, we're in Phase 0.
1. **Subsystem Decomposition** — C4 System Context exists? If not, Phase 1.
2. **Reference Collection** — Technical references collected? If not, Phase 2.
3. **Architecture Design** — C4 Container + ADRs exist? If not, Phase 3.
4. **Visual Design System** — Design tokens + Storybook exist? If not, Phase 4.
5. **Feature Implementation** — Active features being built. 5A→5B→5C→5D→5E→5F loop.
6. **Subsystem Integration** — All features integrated? Contract tests pass?
7. **Hardening** — Security/perf/a11y audits done?
8. **Observe & Iterate** — Production SLOs defined? Error budgets tracked?

## Output
- **Current Phase:** [0-8]
- **Phase Status:** [In Progress / Complete / Not Started]
- **Next Action:** [specific, concrete next step]
- **Blockers:** [anything preventing progress]

If unclear, ask: "What feature are we working on?" and "What was the last thing completed?"
