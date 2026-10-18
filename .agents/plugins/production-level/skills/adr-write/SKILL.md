---
name: adr-write
description: "Record an Architecture Decision Record (ADR) in MADR format under docs/adr/NNNN-title.md and synchronize the decision index in project-memory/07-decision-log.md. Triggered by /adr-write."
---

# `/adr-write` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/adr-write`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `06-system-architect` (`google/gemini-4-argon`)
- **Project Memory Inputs (`view_file`):** `docs/adr/README.md`, `templates/adr-template.md`, `project-memory/03-architecture.md`, `project-memory/07-decision-log.md`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `docs/adr/NNNN-title.md`, `docs/adr/README.md`, `project-memory/07-decision-log.md`
- **Shell Execution (`run_command`):** Execute git and verification commands inside the Antigravity sandbox first.

---

# Write Architecture Decision Record

Document an architectural decision in MADR format.

## Process
1. Read existing ADRs: `docs/adr/README.md` for context and numbering
2. Determine next ADR number
3. Write ADR to `docs/adr/NNNN-lowercase-title.md`

## MADR Template
```markdown
# [Short title of solved problem and solution]

* Status: proposed
* Deciders: [names]
* Date: [YYYY-MM-DD]

## Context and Problem Statement
[2-3 sentences on the situation and forces at play]

## Decision Drivers
* [driver 1]
* [driver 2]

## Considered Options
* [option 1]
* [option 2]
* [option 3]

## Decision Outcome
Chosen option: "[option X]", because [justification].

### Consequences
* Good, because [positive]
* Bad, because [negative — explicitly name what we gave up]

## Pros and Cons of the Options
### [option 1]
* Good, because [argument]
* Bad, because [argument]
```

## Rules
- One decision per ADR
- Always name what was given up
- Status must be: proposed, accepted, deprecated, or superseded
