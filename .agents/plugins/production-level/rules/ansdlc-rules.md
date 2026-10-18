---
description: "Core 9-phase methodology & The 6 Laws of Engineering Maturity."
---

# Production Level — Core Methodology & The 6 Laws of Engineering Maturity

## The 6 Laws of Engineering Maturity (Mandatory Invariants)

### Law 1: Threat-First Modeling & Mandatory Domain Threat Matrix
Whenever a specification or implementation touches external input, URLs/networks, numeric rates/TTLs/costs, or state, you MUST enforce the **Mandatory Domain Threat & Boundary Matrix**:

1. **When Handling URLs / Network Targets (OWASP A10:2021 SSRF & Poisoning Defense):**
   - Parse host and resolve/validate via standard library (`urllib.parse` + `ipaddress` in Python; `new URL()` + IP parser in Node/TS):
     - **Reject Loopback:** `127.0.0.0/8`, `::1`, `localhost`.
     - **Reject RFC 1918 Private Ranges:** `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
     - **Reject Link-Local / Cloud Metadata:** `169.254.0.0/16` (AWS/GCP/Azure metadata `169.254.169.254`), `fe80::/10`.
     - **Reject Unspecified, Multicast, Broadcast, & Reserved:** `0.0.0.0/8`, `224.0.0.0/4`, `240.0.0.0/4`, `ff00::/8`.
     - **Reject Obfuscated IP Encodings:** Decimal integers (e.g., `2130706433`), hexadecimal (`0x7f.0.0.1`), octal (`0177.0.0.1`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1`).
   - **Scheme Allowlist:** Permit strictly `http` and `https`; reject `javascript:`, `data:`, `file:`, `ftp:`, `gopher:`, `ws:`.
   - **Payload & Authority Hygiene:** Reject URLs $> 2048$ characters, reject URLs containing embedded authority credentials (`user:pass@host`), and reject control/CRLF/null characters (`\r`, `\n`, `\x00`).
   - **Untrusted Header Ban:** NEVER construct public URLs from untrusted `Host` or `X-Forwarded-Host` request headers; require an explicit configured `base_url` parameter (defaulting safely to a constant).
   - **Dynamic Route Shadowing Protection:** Introspect the web framework's registered routes dynamically (`app.routes`) rather than relying on fragile hardcoded reserved route lists, ensuring custom slugs/IDs never shadow `/docs`, `/redoc`, `/openapi.json`, or application endpoints.

2. **When Handling Numeric / Rate / Cost / TTL Inputs (Coercion & Overflow Defense):**
   - **Boolean Trap Defense:** Explicitly guard against Python's `isinstance(True, int) == True` trap (reject `isinstance(val, bool)` before `int`/`float` checks, or use Pydantic `StrictInt`/`StrictFloat`).
   - **Boundary & Sign Enforcement:** Reject $\le 0$ for costs, capacities, rates, and TTLs (explicitly reject `cost=0` unless zero-cost probing is an explicit requirement).
   - **Non-Finite & Overflow Defense:** Reject `NaN`, `Infinity`, `-Infinity`, and enforce explicit upper bounds on TTLs/timestamps (e.g., $\le 10\text{ years} = 315,360,000\text{ seconds}$) to prevent `datetime`/`timedelta` `OverflowError`.

3. **When Handling In-Memory Storage / Concurrency:**
   - Enforce atomic check-and-insert under a single lock (`threading.Lock`) with collision retry *inside* the storage boundary so concurrency collisions never leak as 500 errors.
   - Respect **Law 2 (The Restraint Principle)**: only add capacity eviction (`max_entries`) when specified or required by the bounded state contract.

### Law 2: The Restraint Principle (Anti-Bloat & Minimal Attack Surface)
- Implement the exact specification with mathematical minimalism. Never invent unrequested endpoints, speculative eviction engines, or unused helper methods.
- Every unrequested line of code is an untested attack surface and a mutant haven.

### Law 3: Structural & Boundary Purity (True Clean Architecture)
- **Zero Transport Leakage:** The service and domain layers (`service.py`, `services/`, `domain.py`, `entities.py`) must NEVER import HTTP transport DTOs (`*Request`, `*Response`, `BaseModel`) or HTTP frameworks (`fastapi`, `starlette`, `flask`). Services accept primitive arguments or frozen domain `@dataclass(frozen=True)` objects.
- **Domain Isolation:** Domain entities live in `domain.py` / `entities.py`, strictly separated from transport schemas (`schemas.py`).
- **Single Global Exception Handler:** Route handlers must NEVER duplicate repetitive `try ... except DomainError` blocks. Register centralized exception handlers on the app instance (`@app.exception_handler`) so route handlers remain 3-line pure delegation functions.

### Law 4: Concurrency & Resource Exhaustion Defense
- Check-and-insert mutations and generated-key collision retries must execute atomically inside the storage lock boundary.

### Law 5: Deterministic Mechanical Verification (No Self-Graded Exams)
- An AI must NEVER grade its own work or hand-type a passing JSON receipt.
- Verification receipts in `project-memory/08-verification-report.md` must be generated mechanically by running `node scripts/verify-feature-gate.mjs <feature>`.
- Mandatory gates: `mypy --strict` / `tsc --noEmit` (exit 0), `ruff check` / `eslint` (exit 0), test coverage $\ge 95\%$, and automated mutation score $\ge 85\%$ (`mutmut` / `stryker` / `cargo-mutants` — `"mutation_score": null` is strictly forbidden).

### Law 6: Radical Intellectual Honesty
- Forbid all self-congratulatory narration ("Proceeding with confidence...", "world-class implementation...") and vanity self-ratings ("9.5/10").
- If an adversarial audit is executed in single-model fallback mode, state explicitly: *"Adversarial audit was executed in single-model fallback mode."*

---

## The 9-Phase Lifecycle & Phase 5A–5F Atomic Loop
- **Phases 0–4:** Vision $\rightarrow$ Decomposition $\rightarrow$ Reference $\rightarrow$ C4 Architecture & Data $\rightarrow$ Design System.
- **Phase 5A (Spec):** Author Gherkin BDD scenarios (`docs/specs/<feature>/gherkin.feature`) incorporating the Mandatory Domain Threat & Boundary Matrix, audited by `05-spec-reviewer` (`Model: "pro"`).
- **Phase 5B (Red Tests):** Write failing automated tests covering every happy path, boundary condition, and adversarial threat scenario.
- **Phase 5C (Green Code):** Write minimal, decoupled Clean Architecture code until all tests pass.
- **Phase 5D (Verification):** Run `node scripts/verify-feature-gate.mjs <feature>` + cross-model `13-adversarial-reviewer` (`Model: "pro"`).
- **Phase 5E (Refactoring Gate):** Enforce complexity $< 10$/function, file length $< 150$ lines, zero `# type: ignore` / `@ts-ignore`.
- **Phase 5F (Registry & Commit):** Update `05-feature-registry.md` and propose conventional commit.
