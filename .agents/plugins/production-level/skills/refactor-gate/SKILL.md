---
name: refactor-gate
description: "Execute the Phase 5E Refactoring Gate audit to enforce cyclomatic complexity (<10 per function), file length (<=150 lines), Clean Architecture layering, Apple Safety Invariant (no convenience bloat), and zero duplication before committing. Triggered by /refactor-gate."
---

# `/refactor-gate` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/refactor-gate`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `14-refactoring-auditor` (`Model: "pro"` -> `anthropic/claude-sonnet-5.5`)
- **Project Memory Inputs (`view_file`):** All modified files in `git diff main..HEAD`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `project-memory/08-verification-report.md`

---

## Mandatory Phase 5E Checks
1. **Cyclomatic Complexity:** $< 10$ per function (enforced mechanically by `pre-write-gates.js` & `quality-gate.js`).
2. **File Size:** $\le 150$ lines per source file.
3. **Clean Architecture Purity:** Zero HTTP DTO (`*Request`, `*Response`, `BaseModel`, `schemas`) or HTTP framework (`fastapi`, `starlette`) imports in `service.py` / `domain.py`; single global `@app.exception_handler` in `routes.py`.
4. **Apple Safety Invariant (No Convenience Bloat):** Flag any unrequested convenience method (`reset()`, `prune()`, `get_tokens()`, `__repr__()`) not in the spec as a `NEEDS_REFACTORING` violation.
5. **Zero Type Suppressions & Duplication:** Zero `# type: ignore`, `@ts-ignore`, or $>3$ duplicated lines.
