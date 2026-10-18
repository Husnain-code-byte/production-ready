# Design Note: [Feature Name]

* Feature ID: `FEAT-XXXX`
* Author / Model: [e.g., System Architect (Argon) / Aegis]
* Date: [YYYY-MM-DD]
* Adaptive Clutch Tier: [Medium | Large]
* Spec Path: `docs/specs/<feature>/gherkin.feature`

---

## 1. Frame (Boundary & Appetite)
- **Problem Statement:** [What user or system problem is being solved?]
- **Appetite:** [Small / Medium / Large scope boundary]
- **In-Scope:** [Explicit list of capabilities and interfaces]
- **Non-Goals & Anti-Goals:** [What we are explicitly NOT building (Law 2 Anti-Bloat)]

---

## 2. Model (Domain & Invariants)
- **Domain Entities:** [List frozen domain records / dataclasses]
- **Core Invariants:** [What conditions must hold true across every state mutation?]
- **Error Taxonomy:** [Domain-specific error classes and error conditions]

---

## 3. Choose (Evaluated Alternatives)
- **Selected Option:** [Name and concise rationale]
- **Rejected Option 1:** [Why was this simpler or alternative approach rejected?]
- **Rejected Option 2:** [Why was this more complex approach rejected?]
- **Trade-Offs & Sacrifices:** [Explicitly state what became harder or was given up]
- **Associated ADR:** `docs/adr/NNNN-[title].md`

---

## 4. Build (Seams & Dependencies)
- **Modified / Created Files:** [Exact list of files]
- **Architectural Seams:** [How is the pure domain separated from transport and persistence?]
- **Test Strategy:** [Red-Green unit tests, boundary tests, concurrency tests]

---

## 5. Prove (Verification Criteria)
- **Deterministic Gates:**
  - `mypy --strict` / `tsc --noEmit` exit 0
  - `ruff check` / `eslint` exit 0
  - Unit test pass rate = 100%
  - Mutation kill rate $\ge 85\%$ via `mutmut` / `stryker` / `cargo-mutants`
- **Craft Checks:**
  - Zero `# type: ignore` / `@ts-ignore`
  - Zero unrequested convenience methods
  - Cyclomatic complexity $< 10$ and file length $\le 150$ lines

---

## 6. Explain (Documentation & Runbook)
- **API Reference Updates:** `docs/api/openapi.yaml`
- **Living Documentation:** `docs/<module>/...`
- **Registry & Session Log:** `project-memory/05-feature-registry.md` & `06-session-log.md`
