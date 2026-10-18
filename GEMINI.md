# Project Constitution — Production Level (Google Antigravity)

## Quick Facts
- **AI Environment:** Google Antigravity (App, IDE, & CLI `agy`)
- **Primary Workhorse Model (`flash`):** `google/gemini-3.8-flash`
- **Adversarial & Security Review Model (`pro`):** `anthropic/claude-sonnet-5.5`
- **Architecture & Data Model (`pro`):** `google/gemini-4-argon`
- **Apex Arbitrator Model (`pro`):** `anthropic/claude-opus-5.5`
- **Default Main Agent:** `aegis` (`.agents/agents/aegis.md`, `mainAgent: true`)
- **Mechanical Verification Gate:** `node scripts/verify-feature-gate.mjs <feature>`

## Stack Detection (Application-First)
Never assume Node.js because `scripts/hooks/` uses Node. Detect the application stack from the project's source files:
- **Python (`pyproject.toml`, `requirements.txt`, `*.py`):**
  - Type check: `mypy --strict .` | Lint: `ruff check .` | Test: `pytest` | Mutation (`>= 85%` mandatory): `mutmut run && mutmut results`
- **TypeScript / JavaScript (`tsconfig.json`, `src/*.ts`):**
  - Type check: `tsc --noEmit` | Lint: `eslint .` | Test: `vitest run` | Mutation (`>= 85%` mandatory): `npx stryker run`
- **Rust (`Cargo.toml`):** `cargo check`, `cargo clippy`, `cargo test`, `cargo mutants`
- **Go (`go.mod`):** `go vet ./...`, `golangci-lint run`, `go test ./...`

## Commands
- Build: `[auto-detected-by-stack]`
- Dev server: `[auto-detected-by-stack]`
- Test (all): `[auto-detected-by-stack]`
- Lint: `[auto-detected-by-stack]`
- Type check: `[auto-detected-by-stack]`
- Mutation test: `[auto-detected-by-stack]`
- Mechanical Verification Gate: `node scripts/verify-feature-gate.mjs <feature>`

## The 5 Pillars of Engineering Maturity (Constitutional Invariants)
1. **Pillar 1 — Policy as Tooling (Google Presubmit Invariant):** Every quality invariant (file length $\le 150$ lines, cyclomatic complexity $< 10$/function, zero `# type: ignore` / `@ts-ignore`, zero Clean Architecture layering leaks, mutation score $\ge 85\%$) is mechanically enforced by `PreToolUse` (`scope-enforcer.js`), `PostToolUse` (`quality-gate.js`), `PreInvocation` (`effort-governor.js`), and `Stop` (`session-end.js`).
2. **Pillar 2 — Defensive Resource Bounding vs. Scope Creep (Apple Safety Invariant):**
   - *Safety-Required Bounds (Mandatory):* Explicit capacity ceilings (`max_entries`), bounded network timeouts (connect $\le 3\text{s}$, read $\le 10\text{s}$), payload byte caps, and atomic `threading.Lock` collision retries are mandatory engineering hygiene.
   - *Convenience Extras (Strictly Banned):* Unrequested convenience methods (`reset()`, `prune()`, `get_tokens()`, `__repr__()`) not in the spec are banned as attack-surface bloat and mutant havens.
3. **Pillar 3 — Threat-First Boundary Modeling (Secure by Design):** Enforce scheme allowlists (`http`/`https`), IP normalization & SSRF blocking (loopback, RFC 1918, link-local/metadata `169.254.169.254`, decimal/hex/octal IPs), `follow_redirects=False` (or per-hop IP re-validation), TLS SNI & `verify=True`, untrusted `Host`/`X-Forwarded-Host` ban, dynamic `app.routes` collision checks, and `hmac.compare_digest` constant-time secret comparison.
4. **Pillar 4 — Structural & Layering Purity (Decoupled Clean Architecture):** `service.py` / `domain.py` must NEVER import HTTP DTOs (`*Request`, `*Response`, `BaseModel`, `schemas`) or HTTP frameworks (`fastapi`, `starlette`). Domain records are frozen `@dataclass(frozen=True)` objects in `domain.py`. Route handlers delegate errors to a single global `@app.exception_handler`.
5. **Pillar 5 — Radical Intellectual Honesty & Traceability:** Route auditors with `Model: "pro"` in `invoke_subagent`. Never hand-write a passing receipt or record `"mutation_score": null` (unrun checks are `UNVERIFIED` and block completion). Forbid self-congratulatory narration and vanity self-ratings.
