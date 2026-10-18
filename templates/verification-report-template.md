# Verification Report Template — Production Level

> **Rule:** Never hand-write a passing JSON receipt. Run `node scripts/verify-feature-gate.mjs <feature-name>` to append a mechanically verified SHA-256 receipt.

## Summary Checklist
- [ ] Compiler / Strict Types (`mypy --strict` / `tsc --noEmit`) exited with code `0`
- [ ] Linter (`ruff check` / `eslint`) exited with code `0`
- [ ] Automated Tests passed with $\ge 95\%$ coverage
- [ ] Mutation Testing (`mutmut` / `stryker`) achieved $\ge 85\%$ killed mutants (never `null`)
- [ ] Clean Architecture Audit passed (zero `fastapi`/`starlette`/`*Request`/`*Response` imports in `service.py`/`domain.py`, single global `@app.exception_handler`)
- [ ] Cross-Model Adversarial & Security Audit (`Model: "pro"`) returned `CLEAN`
