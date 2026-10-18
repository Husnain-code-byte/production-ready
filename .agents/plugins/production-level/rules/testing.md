---
description: "Deterministic TDD, >=85% mandatory mutation testing, and mechanical verification receipt rules."
globs:
  - "**/*test*"
  - "**/*spec*"
  - "tests/**"
---

# Production Level — Deterministic Testing & Mutation Verification Rules

## 1. Mandatory Mutation Testing (Zero Loopholes)
- **No Skipping:** Recording `"mutation_score": null` is strictly forbidden and automatically fails `scripts/hooks/session-end.js` and `scripts/verify-feature-gate.mjs`.
- **Mandatory Thresholds:**
  - **Line / Branch Coverage:** $\ge 95\%$
  - **Mutation Kill Rate:** $\ge 85\%$ killed mutants via `mutmut` (Python), `stryker` (TS/JS), or `cargo-mutants` (Rust).
- **Tool Configuration:** Ensure `mutmut` (or the stack's mutation runner) is configured in `pyproject.toml` / `package.json` during Phase 5B so `node scripts/verify-feature-gate.mjs <feature>` can execute it deterministically.

## 2. Adversarial Boundary Test Coverage
Every test suite must include explicit assertions for:
- SSRF & IP encoding rejection (`127.0.0.1`, `::1`, `10.x`, `169.254.169.254`, `0.0.0.0`, `0x7f.0.0.1`, `2130706433`, `user:pass@`, $>2048$ chars) when URLs are handled.
- Host / `X-Forwarded-Host` header poisoning resistance.
- Dynamic route-table collision rejection (`app.routes`).
- Python boolean coercion rejection (`True`/`False` passed to numeric fields), zero/negative rejection, and TTL upper-bound overflow protection.
- Thread-safe atomic concurrency under `threading.Lock`.
