---
name: commit-format
description: "Generate a structured conventional commit message (`type(scope): description`) with test counts, mutation score, and verification receipt reference. Triggered by /commit-format."
---

# `/commit-format` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/commit-format`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `aegis`
- **Project Memory Inputs (`view_file`):** `project-memory/08-verification-report.md`, `project-memory/05-feature-registry.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** None (Generates Commit Message Proposal)
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Production Level Commit Message Format

## Format
```
type(scope): concise description [AI-assisted]

- What was implemented and why
- What tests were added
- Verification results: tests passed, mutation score, review status
- Any known limitations or follow-up items

Co-Authored-By: Production Level Antigravity <noreply@antigravity.google>
```

## Types
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or updating tests
- `chore` — build process, dependencies, tooling

## Rules
- One commit per verified feature — never bulk-commit
- Commit only after ALL verification gates pass
- Never auto-commit — always get explicit human confirmation
- Push to remote only upon explicit human approval

## Show Current
Current branch: ``git branch --show-current`
Staged changes: ``git diff --cached --stat`
