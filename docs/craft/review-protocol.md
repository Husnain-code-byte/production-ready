# Phase 5E Craft Review Protocol

This protocol governs the dual-phase review conducted by `14-refactoring-auditor` and cross-model auditors before any feature is committed.

---

## 1. Dual-Track Review Architecture

A pull request or feature implementation must pass two distinct evaluation tracks:

```text
┌────────────────────────────────────────────────────────┐
│                   PHASE 5E QUALITY GATE                │
├──────────────────────────┬─────────────────────────────┤
│  Track 1: Mechanical     │  Track 2: Craft & Elegance  │
│  - Exit 0 linters        │  - The 5 Craft Tests        │
│  - Mypy/TSC strict exit 0│  - Anti-Bloat (Law 2)       │
│  - Mutation >= 85%       │  - Clean Architecture       │
│  - Cyclomatic CC < 10    │  - Living Documentation     │
│  - Lines per file <= 150 │  - Radical Honesty          │
└──────────────────────────┴─────────────────────────────┘
```

---

## 2. Track 1: Mechanical Presubmit Invariants
Before reviewing structure or elegance, the automated test harness runs:
1. `mypy --strict .` (Python) or `tsc --noEmit` (TypeScript) must exit with code 0.
2. `ruff check .` or `eslint .` must exit with code 0.
3. Automated unit/integration tests must achieve 100% pass rate.
4. Mutation kill rate must be $\ge 85\%$ via `mutmut`, `stryker`, or `cargo-mutants`.

---

## 3. Track 2: Craft & Elegance Audit Criteria

The auditor evaluates the git diff (`git diff main..HEAD`) against the following four dimensions:

### A. Architectural & Layering Purity
- **Check:** Does any service or domain file import web frameworks (`fastapi`, `express`) or HTTP DTO schemas?
- **Check:** Are route handlers thin adapters ( $\le 5$ lines) delegating to services, with errors handled centrally via `@app.exception_handler`?

### B. Mathematical Parsimony & Anti-Bloat (Law 2)
- **Check:** Did the author introduce unrequested methods (`reset()`, `prune()`, `to_dict()`, `clear()`) not required by the Gherkin spec?
- **Action:** Reject with `NEEDS_REFACTORING` if unrequested surface area is detected.

### C. Cohesion & De-Brutalization (Anti-Gaming)
- **Check:** Was complexity $< 10$ achieved by genuinely cohesive abstraction, or by artificial slicing (`step1`, `step2`) that scatters state?
- **Check:** Are there any empty `except:` / `catch {}` blocks that swallow errors silently?

### D. Documentation & Living Links
- **Check:** Do any markdown links in `docs/` point to non-existent files?
- **Check:** Does documentation contain unsubstantiated vanity claims ("world-class", "seamless") instead of factual metrics?

---

## 4. Evidence-Based Output Format

Auditors must output structured JSON. Vague advice without line numbers is strictly forbidden:

```json
{
  "verdict": "PASS | NEEDS_REFACTORING",
  "mechanical_gate": {
    "typecheck": "PASS",
    "lint": "PASS",
    "tests": "PASS",
    "mutation_score": 88.5
  },
  "craft_findings": [
    {
      "dimension": "PARSIMONY | CLEAN_ARCHITECTURE | COHESION | DOCUMENTATION",
      "severity": "ERROR | ADVICE",
      "file": "src/services/order_service.py",
      "line": 42,
      "rule": "unrequested-convenience-method",
      "description": "Method 'prune_stale_orders' is not specified in docs/specs/orders/gherkin.feature. Violates Law 2 (Restraint).",
      "remediation": "Remove prune_stale_orders until an explicit feature specification requires it."
    }
  ],
  "summary": {
    "errors": 0,
    "advice": 1
  }
}
```
