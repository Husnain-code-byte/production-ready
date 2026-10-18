# The Craft Doctrine — Engineering Elegance, Completeness, & Maturity

> "Elegance is not a cosmetic luxury or aesthetic preference. It is the mathematical parsimony of a solution: the minimum state, the clearest boundary, the absence of brute force, and the total fidelity between domain concept, written code, and executable verification."

---

## 1. Directory Structure

This suite provides the foundational definition, evaluation criteria, mechanical tooling, and review protocols for world-class engineering maturity across all models and agents:

- **[charter.md](charter.md)** — The 6 concise engineering elegance invariants injected into context at session start.
- **[doctrine.md](doctrine.md)** — Core engineering philosophy: parsimony, structure, proof, and anti-slop.
- **[lenses.md](lenses.md)** — The 4 Craft Lenses (Code, Architecture & Design, Documentation & Decisions, Response & Dialogue).
- **[smells.md](smells.md)** — Catalog of 12 Engineering Smells (e.g., Teenager Brute-Forcer, Speculative Astronaut, Silent Swallower, Phantom Tester) vs. Elegant Counterparts.
- **[examples.md](examples.md)** — Concrete Before & After paired examples across Python, TypeScript, Rust, Go, Architecture, and Documentation.
- **[review-protocol.md](review-protocol.md)** — Phase 5E Craft Review protocol for `14-refactoring-auditor` and adversarial audit.
- **[rollout/](rollout/README.md)** — Staged governance updates for human execution via `scripts/craft-rollout.mjs`.

---

## 2. The 5 Craft Tests

Before committing any feature, component, or system design, evaluate the work against these five objective tests:

1. **The Deletion Test:** If this line, parameter, or abstraction were deleted, does a real requirement fail? If not, delete it immediately.
2. **The Sentence Test:** Can the function or component's single responsibility be articulated in a single sentence without using the word "and"?
3. **The Seam Test:** Can the persistence layer, transport layer, or external client be swapped without altering domain logic?
4. **The Adversary Test:** Does the code survive maliciously crafted inputs (SSRF, link-local metadata, unicode traps, integer overflow, concurrency races) without unhandled exceptions?
5. **The Junior Test:** Can an unfamiliar engineer read the code from top to bottom without jumping across five speculative layers of abstraction to find where the actual work happens?

---

## 3. The 6-Step Craft Method (Phase 5 Proportional Execution)

For all Medium and Large features, agents execute this sequence documented in a Design Note (`templates/design-note-template.md`):

```text
1. Frame   ──> Clarify problem boundary, appetite, and non-goals.
2. Model   ──> Draft domain invariants and frozen data structures.
3. Choose  ──> Evaluate 2+ concrete alternatives with trade-offs (ADR).
4. Build   ──> Implement with TDD (Red tests ──> minimal Green code).
5. Prove   ──> Run mechanical gates, mutation testing (>=85%), and adversarial audit.
6. Explain ──> Document in Diataxis format, update registry and decision log.
```
