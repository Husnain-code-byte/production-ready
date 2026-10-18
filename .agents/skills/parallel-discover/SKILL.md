---
name: parallel-discover
description: "Launch 2-5 independent read-only research and discovery subagents concurrently using `invoke_subagent` (`20-research-agent`, `03-reference-collector`, `01-vision-analyst`) and synthesize their findings. Triggered by /parallel-discover."
---

# `/parallel-discover` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/parallel-discover`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `20-research-agent`, `03-reference-collector`, `01-vision-analyst`
- **Project Memory Inputs (`view_file`):** `project-memory/01-vision.md`, `project-memory/02-subsystem-map.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/06-session-log.md`, `project-memory/aegis/knowledge-base.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Parallel Discovery

Dispatch independent research/exploration agents concurrently via the `invoke_subagent` tool to save time.

## When to Use
- Research multiple technical approaches simultaneously
- Scout multiple codebase areas in parallel
- Collect references from independent sources
- Any task where agents have no dependency on each other

## Process
1. **Identify independent tasks** — list 2-5 tasks that have zero dependency on each other
2. **Verify independence** — confirm no task reads output of another task
3. **Dispatch in parallel** — use the `invoke_subagent` tool to launch each as a separate sub-agent
4. **Collect results** — gather all outputs
5. **Merge findings** — write combined results to `project-memory/` or `docs/research/`
6. **Check for conflicts** — if parallel findings contradict, flag for human resolution

## Serial Execution Guarantee
`/parallel-discover` does NOT violate the serial execution guarantee because:
1. Only discovery agents run in parallel (`research-agent`, `reference-collector`, `vision-analyst`)
2. Each agent writes to its own isolated file under `docs/research/` or returns findings directly in context
3. They do NOT write to shared registry state (`project-memory/05-feature-registry.md`) or code (`src/`)
4. Results are synthesized and merged sequentially after all parallel subagents complete
5. Scope enforcer plugin maintains strict per-session boundary enforcement

## Safety Rules
- NEVER dispatch parallel implementation agents — research/scout/collect only
- MAX 5 parallel agents — context limits apply
- Each parallel agent must have a focused, atomic prompt
- If one agent fails, do NOT auto-retry — collect others' results first, then retry solo
- After collection, always update session log with parallel execution summary
- If parallel research conflicts with shared state, STOP and revert to serial mode

## Example
```
/parallel-discover
Tasks:
1. research-agent → "Research WebSocket vs SSE for real-time updates"
2. reference-collector → "Find existing auth patterns in the codebase"
3. vision-analyst → "Analyze competitor approach to offline mode"
All independent. Dispatching...
```
