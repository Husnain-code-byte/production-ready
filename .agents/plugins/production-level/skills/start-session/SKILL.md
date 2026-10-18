---
name: start-session
description: "Start a new Production Level engineering session. Loads project-memory context, inspects git status, determines the Adaptive Clutch tier (Micro, Small, Medium, Large), and confirms session scope boundaries. Triggered by /start-session."
---

# `/start-session` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/start-session`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`, `00-orchestrator`
- **Project Memory Inputs (`view_file`):** `project-memory/00-project-constitution.md`, `project-memory/05-feature-registry.md`, `project-memory/06-session-log.md`, `project-memory/aegis/project-context.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/aegis/session-history.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Production Level Session Start & Scope Sizing

Begin every Production Level development session with this command.

## 1. Load Current State
1. Read the session log: `project-memory/06-session-log.md`
2. Read the feature registry: `project-memory/05-feature-registry.md`
3. Inspect Git status: ``git status --short`
4. Inspect Git branch: ``git branch --show-current`

## 2. Select Adaptive Clutch Tier
Select the appropriate execution loop based on task complexity:
- **🏎️ Micro-Loop (Patch / Hotfix / Typo):** $\le 1$ file, $< 30$ lines. Skip PR/FAQ and C4 ceremonies. Fast test-and-commit.
- **🚙 Standard Loop (Atomic Feature):** Full 5A–5F cycle (Spec $\rightarrow$ Red $\rightarrow$ Green $\rightarrow$ Adversarial Verify $\rightarrow$ Refactor Gate $\rightarrow$ Commit).
- **🚚 Macro-Loop (New Subsystem / Epic):** Full Phases 0 to 8 with C4 architecture diagrams and ADRs.

## 3. Declare Boundaries to Human Architect
State clearly:
- **Execution Tier:** Micro | Small | Medium | Large
- **Current Phase:** [0-8]
- **Target Feature:** [Name / ID]
- **In-Scope Files:** Exact paths that WILL be modified
- **Out-of-Scope Files:** Paths that MUST NOT be touched
- **Anti-Goals:** What we are explicitly NOT doing this session

Wait for human architect confirmation before dispatching implementation agents.
