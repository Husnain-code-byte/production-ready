# ADR-0001: Adopt a Craft Doctrine with proportional method, advisory gates, and evidence-based review

* Status: proposed (awaiting Human Architect acceptance)
* Deciders: Human Architect, Aegis
* Date: 2026-10-18

Technical Story: [docs/specs/craft-gates/gherkin.feature](../specs/craft-gates/gherkin.feature)

## Context and Problem Statement

The harness enforces *correctness floors* well: file size, cyclomatic complexity, layering, type suppressions, mutation score. It does not define *elegance*, and nothing asks a model to design before it builds. The numeric floors are also gameable: a model can satisfy "under 150 lines, complexity under 10" by shredding a function into fragments that share no nameable concept, and every gate still passes.

Observed in this repository (2026-10-18):

1. The only quality definitions are numeric. There is no design step between spec and code, and no craft criteria for documentation, decisions, or replies.
2. `14-refactoring-auditor` states "three similar lines of code IS a DRY violation", which contradicts Law 2 (no speculative abstraction). The two rules push a model in opposite directions.
3. Domain-specific obligations are written as universal. `rules/testing.md` requires SSRF assertions in "every test suite".
4. The "5 Pillars" block is copied verbatim into 26 agent files and again into the plugin mirror.
5. Two numbering systems (6 Laws, 5 Pillars) describe overlapping invariants.
6. `README.md` claims a 222-check self-audit; `node scripts/verify-harness.mjs` reports 205 checks.
7. `scope-enforcer.js` emits `{"decision": "block"}`. The host accepts `allow`/`deny` and replied `unsupported hook decision: block`, so the block reason never reaches the model.
8. `templates/adr-template.md` has no reversibility or revisit-trigger section, so a "decision" can be recorded without saying how costly it is to undo.

## Decision Drivers

* Elegance must be *operational*: a reviewer can cite evidence for or against it.
* Law 2 (Restraint) stays inviolable; craft must never license unrequested surface.
* Pillar 1 (Policy as Tooling): whatever can be checked mechanically should be.
* Pillar 5 (Honesty): no self-scores, no hand-written receipts.
* Always-on context is expensive; the binding text must be small.
* The harness protects `.agents/`, `AGENTS.md`, `GEMINI.md`; agents must not edit their own governance.

## Considered Options

* **Option A:** Add more numeric gates (nesting depth, parameter count, naming length) as blocking rules.
* **Option B:** A prose-only doctrine added to the rule files.
* **Option C:** A Craft Doctrine (definition, method, tests, smell catalog) bound into the constitution, plus advisory mechanical gates for the high-precision signals, plus evidence-based Craft Review inside Phase 5E.
* **Option D:** A new dedicated "elegance-reviewer" agent.

## Decision Outcome

Chosen option: **Option C**, because it is the only option that defines elegance, makes the checkable part automatic, and keeps judgment where judgment belongs (a cross-model reviewer citing evidence), without adding a new agent, rule file, or skill.

Concretely:

1. **Doctrine** in `docs/craft/`: a ≤40-line `charter.md` (injected at session start), with `doctrine.md`, `smells.md`, `lenses.md`, `examples.md`, `review-protocol.md`.
2. **Method** `Frame → Model → Choose → Build → Prove → Explain`, scaled by the Adaptive Clutch tier. Artifact: a Design Note (`templates/design-note-template.md`).
3. **Gates** in `scripts/hooks/craft/`: *error* tier for high-precision defects (swallowed errors, debug output in production paths, assertion-free tests, broken relative links); *advice* tier for heuristics (nesting, parameter count, commented-out code, duplicated blocks, vanity words, unlabeled fences, skipped headings). Only the error tier persists into the Stop gate.
4. **Review**: Craft Review as part 2 of Phase 5E, owned by `14-refactoring-auditor`; findings only, no scores.
5. **Rollout**: edits to protected governance files are staged in `docs/craft/rollout/` and applied only by a human through `scripts/craft-rollout.mjs` (TTY-gated, backed up, reversible).

### Positive Consequences

* One written definition of elegance, testable by five named tests.
* The contradictions in findings 2 and 3 are resolved in the governing text.
* No new agent, rule file, or skill: no new surface, no count drift in `verify-harness.mjs`.
* Craft signals reach the model on the same channel as existing quality warnings.

### Negative Consequences and Trade-Offs (What We Gave Up)

* Regex-level detectors are heuristics. They miss things and will misfire; that is why only four are error tier.
* Craft Review adds reviewer tokens to Phase 5E for Medium/Large work.
* The governance edits are not self-applying: a human must run the rollout, so the doctrine is partly inactive until then. Session-start injection and the gates work immediately.
* Mutation testing is not configured for harness scripts; the craft modules are covered by unit tests only (see Verification in the session log).

### Reversibility and Revisit Trigger

* **Reversibility:** two-way door. Track A is additive (delete `docs/craft/`, `scripts/hooks/craft/`, the two hook call sites). Track B has a `restore` command.
* **Revisit if:** error-tier false positives exceed one per 20 audited files over a month, or Craft Review findings are overruled by the arbitrator more than half the time.

## Pros and Cons of the Options

### Option A: More numeric gates
* **Good**, because it is mechanical and uniform.
* **Bad**, because it deepens the gaming problem: more metrics to satisfy by fragmentation, still no definition of elegance.

### Option B: Prose only
* **Good**, because it is cheap and reversible.
* **Bad**, because nothing checks it, which violates Pillar 1; weaker models drift from prose quickly.

### Option C: Doctrine + gates + review (chosen)
* **Good**, because definition, automation, and judgment each sit at the layer that suits them.
* **Bad**, because it touches more places than A or B.

### Option D: New agent
* **Good**, because it isolates concerns.
* **Bad**, because it adds an agent to a 26-agent roster whose Phase 5E auditor already owns this gate; violates Law 2.

## Links and References

* Doctrine: `docs/craft/README.md`
* Rollout runbook: `docs/craft/rollout/README.md`
* ADR Index: `docs/adr/README.md`
