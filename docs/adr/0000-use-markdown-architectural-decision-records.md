# ADR-0000: Use Markdown Architectural Decision Records (MADR)

* Status: accepted
* Deciders: Human Architect, Aegis
* Date: 2026-07-04

Technical Story: [Production Level Research](../research/Production Level-2.0-research.md)

## Context and Problem Statement

Decisions made during software design are frequently forgotten or lost when context windows close or developers transition. AI coding agents often reverse architectural decisions if the rationale is not explicitly recorded in the codebase.

## Decision Drivers

* Need a structured, machine-parsable, yet human-readable decision format.
* Decisions must be co-located with code in version control.
* AI agents must be able to read and respect past decisions before writing code.

## Considered Options

* Markdown Architectural Decision Records (MADR)
* Architecture Decision Knowledge Wiki (Confluence/Notion)
* Unstructured comments in code

## Decision Outcome

Chosen option: "Markdown Architectural Decision Records (MADR)", because it lives in Git alongside the source code, is easily parsed by AI agents, and enforces explicit pros/cons analysis for alternatives.

### Positive Consequences

* Rationale for architectural decisions is permanently preserved in Git.
* Agents can inspect `docs/adr/` before proposing changes to ensure alignment.
* Every architectural pivot is documented with explicit trade-offs.

### Negative Consequences

* Slight friction of creating an ADR before implementing architectural changes.
