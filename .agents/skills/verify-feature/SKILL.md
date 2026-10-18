---
name: verify-feature
description: "Execute the deterministic 3-Layer Production Level Verification Protocol via scripts/verify-feature-gate.mjs (mypy --strict/tsc, ruff/eslint, pytest/vitest, mutmut/stryker >= 85%, Clean Architecture audit) and cross-model pro adversarial review. Triggered by /verify-feature."
---

# `/verify-feature` — Deterministic 3-Layer Verification & Mechanical Receipt Protocol

An AI must NEVER grade its own work or hand-type a fake `"verdict": "PASS"` JSON receipt. Execute all three layers deterministically for `$ARGUMENTS`:

## Layer 1: Deterministic Mechanical Gate (`scripts/verify-feature-gate.mjs`)
1. Ensure mutation testing is configured and executed:
   - **Python:** Run `mypy --strict .`, `ruff check .`, `pytest`, and `mutmut run` (requiring **$\ge 85\%$ killed mutants** and $\ge 95\%$ coverage).
   - **TypeScript / Node:** Run `tsc --noEmit`, `eslint .`, `vitest run` / `jest`, and `npx stryker run` ($\ge 85\%$ killed mutants).
   - **No Loopholes:** Recording `"mutation_score": null` is strictly forbidden and fails the Stop gate.
2. Execute the deterministic receipt generator via `run_command`:
   ```bash
   node scripts/verify-feature-gate.mjs $ARGUMENTS
   ```
   This script mechanically audits file lengths ($< 150$ lines), bans `# type: ignore` / `@ts-ignore`, verifies Clean Architecture layering (zero HTTP DTO or `fastapi`/`starlette` imports in `service.py` / `domain.py`), verifies compiler/linter/test/mutation exit codes, and writes a SHA-256 signed receipt to `project-memory/08-verification-report.md`.

## Layer 2: Specification & Threat Matrix Traceability
1. Run `12-completeness-checker` to verify 100% of scenarios in `docs/specs/$ARGUMENTS/gherkin.feature` (including SSRF, Host header poisoning, numeric boolean coercion, and concurrency boundaries) map to passing automated tests.

## Layer 3: Cross-Model Adversarial Review (`Model: "pro"`)
1. Invoke `13-adversarial-reviewer` and `15-security-auditor` via `invoke_subagent` with `Model: "pro"` (never `Model: "inherit"` from a Flash builder).
2. If executed in single-model fallback mode, record explicitly: *"Adversarial audit was executed in single-model fallback mode."*
