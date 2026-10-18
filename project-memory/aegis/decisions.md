# Architecture Decisions

## ADR-000: Aegis as Meta-Orchestrator
- **Date:** 2026-07-05
- **Context:** User needed a single companion that understands everything about Production Level, Google Antigravity, agents, and commands
- **Decision:** Aegis is a primary agent that sits above the orchestrator. Analyzes intent and decides: guide, prompt, invoke, or hybrid.
- **Consequences:** Aegis has full tool access and the `task` tool for delegation. Orchestrator remains as a fallback routing agent.

---
