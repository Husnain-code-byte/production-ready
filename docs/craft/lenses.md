# The 4 Craft Lenses — Multi-Dimensional Engineering Excellence

Engineering maturity is not confined to the syntax of code files. It must permeate every output produced by an AI model or engineer: written code, architectural blueprints, technical documentation, and interactive conversational responses.

---

## Lens 1: The Code Craft Lens

When writing, refactoring, or auditing source code:

1. **Typing as Proof:** Types are not passive documentation; they are static proofs of invariant correctness. Never use untyped `any`, `Object`, `# type: ignore`, or `@ts-ignore`. Model impossible states as unrepresentable types.
2. **Deterministic Idempotence:** Operations that modify state must be safe to repeat or explicitly fail fast. Concurrency races must be neutralized using atomic compare-and-swap or synchronized locks, never speculative sleep delays.
3. **Pure Core, Imperative Shell:** Structure systems so that business decisions happen in pure, side-effect-free functions that accept immutable data and return new data. Keep network I/O, file systems, and time access strictly at the outer boundary.
4. **Error Taxonomy with Context:** Reject generic `throw new Error("failed")` or bare `except:`. Every error must be a structured domain class with actionable attributes (e.g., `InvalidUrlError(raw_url, reason)`).

---

## Lens 2: The Architecture & System Lens

When making architectural choices or designing subsystems:

1. **Decoupled Clean Architecture:** 
   - `domain.py` / `entities.ts` contains frozen data structures and business invariants. Zero dependencies on HTTP, SQL, or external frameworks.
   - `service.py` / `services/` contains domain use-cases. Zero imports of HTTP transport DTOs (`*Request`, `*Response`, `BaseModel`) or web frameworks (`fastapi`, `express`).
   - `routes.py` / `controllers/` contains thin transport adapters that delegate to services and map domain exceptions via centralized handlers.
2. **Reversibility by Default (Two-Way Doors):** Distinguish between reversible decisions (can be rolled back easily) and irreversible decisions (one-way doors, e.g., data migrations, public API contracts). For one-way doors, provide formal trade-off analyses, migration runbooks, and rollback procedures in an ADR.
3. **Threat-First Defense:** Model boundaries against the OWASP Top 10 and Domain Threat Matrix. Sanitize URLs, block private/metadata SSRF targets, prevent parameter coercion traps, and guard against route collisions dynamically.

---

## Lens 3: The Documentation & Decision Lens

When writing specifications, ADRs, runbooks, or API references:

1. **Diataxis Framework Adherence:**
   - **Tutorials:** Learning-oriented step-by-step guides.
   - **How-To Guides:** Goal-oriented operational recipes.
   - **Reference:** Accurate technical descriptions synchronized with contracts.
   - **Explanation:** High-level architectural context and rationale.
2. **Living Synchronization:** Documentation must match implementation reality. If an API contract changes, `docs/api/openapi.yaml`, READMEs, and test fixtures must update in the same atomic commit. Broken relative links are treated as compiler errors.
3. **Anti-Vanity Prose:** Eliminate empty marketing buzzwords ("cutting-edge", "seamless integration", "world-class performance", "effortless"). Replace them with concrete figures, benchmark percentiles, and technical specifications.

---

## Lens 4: The Response & Communication Lens

When interacting with human engineers in chat or pull requests:

1. **Radical Intellectual Honesty:** Never pretend to have verified something you did not run. State exact command outputs, test counts, and mutation percentages. If a test failed or was skipped, highlight it prominently.
2. **Zero Sycophancy & Flattery:** Never begin replies with empty affirmations ("Great idea!", "You're absolutely right!", "I would be thrilled to help!"). Begin immediately with technical substance, scope assessment, or execution results.
3. **Structured Trade-Off Articulation:** When proposing a solution, always provide the trade-offs: what becomes easier, what becomes harder, and what was intentionally rejected.
4. **Conciseness with Substance:** Deliver information densely. Prefer bulleted invariant checklists, code snippets with minimal noise, and clear actionable decision trees over meandering prose.
