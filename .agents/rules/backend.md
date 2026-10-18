---
description: "Backend Clean Architecture, Apple Defensive Resource Bounding, SSRF/Redirect/Crypto defenses, and strict typing rules."
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.js"
  - "**/*.go"
  - "**/*.rs"
---

# Production Level — Backend Architecture & Engineering Maturity Standards

## 1. Pillar 4: Decoupled Clean Architecture (Mechanically Enforced by `pre-write-gates.js` & `quality-gate.js`)
1. **Zero Transport Leakage in Services & Domain:**
   - `service.py` / `services/` and `domain.py` / `entities.py` must NEVER import HTTP frameworks (`fastapi`, `starlette`, `flask`, `express`) or HTTP serialization DTOs (`*Request`, `*Response`, `pydantic.BaseModel`, `schemas`).
   - Services accept primitive arguments or pure domain command objects (`@dataclass(frozen=True)`) and raise pure domain exceptions (`DomainError` subclasses).
2. **Domain Isolation:**
   - Domain entities and value objects live in `domain.py` or `entities.py`, never inside `schemas.py` or `routes.py`.
3. **Centralized Exception Handling:**
   - Route handlers must NEVER duplicate `try: ... except DomainError:` blocks.
   - Register centralized exception handlers on the application instance (`@app.exception_handler(DomainError)`) so route handlers remain 3-line pure delegation functions.
4. **Dynamic Router Introspection:**
   - Protect framework and application routes against slug/ID shadowing dynamically by inspecting `app.routes` at startup or registration, never via hardcoded static sets.

## 2. Pillar 2: Defensive Resource Bounding vs. Convenience Bloat (Apple Safety Invariant)
1. **Safety-Required Bounds (MANDATORY — Always Required, Never Bloat):**
   - **In-Memory Capacity Ceilings:** Every in-memory store, cache, or rate-limiter dictionary MUST enforce an explicit capacity ceiling (`max_entries`) under a single `threading.Lock` to prevent OOM/DoS exhaustion.
   - **Bounded Network I/O:** Every outbound HTTP/socket call MUST enforce explicit connect ($le 3.0\text{s}$) and read ($le 10.0\text{s}$) timeouts, maximum response byte limits, and bounded retry with exponential backoff + jitter.
   - **Numeric & Temporal Bounds:** Reject `bool` where `int`/`float` is expected (`isinstance(True, int) is True` in Python — use `StrictInt`/`StrictFloat` or `if isinstance(x, bool): raise ...`); reject $le 0$ for costs, rates, capacities, and TTLs; reject `NaN`/`Inf`; cap TTLs at $le 10\text{ years}$ (`315_360_000`s).
2. **Unrequested Convenience Extras (STRICTLY BANNED — Scope Creep & Mutant Havens):**
   - NEVER add unrequested helper methods (`reset()`, `clear()`, `prune()`, `get_tokens()`, `stats()`, `__repr__()`, debug routes) not required by the specification.

## 3. Pillar 3: Threat-First Boundary Modeling (Secure by Design)
1. **URL, SSRF, Redirect, & TLS Defense:**
   - Resolve and validate URLs with `urllib.parse` + `ipaddress`: block loopback (`127.0.0.0/8`, `::1`, `localhost`), RFC 1918 private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local/cloud metadata (`169.254.0.0/16`, `169.254.169.254`, `fe80::/10`), `0.0.0.0`, multicast/reserved, and decimal/hex/octal IP encodings (`2130706433`, `0x7f.0.0.1`).
   - Allow strictly `http`/`https` schemes; reject `user:pass@` credentials, control/CRLF chars (`\r`, `\n`, `\0`), and URLs $> 2048$ chars.
   - **Redirect & TLS Policy:** Default outbound fetches to `follow_redirects=False` (or re-validate every redirect hop's resolved IP against the SSRF blocklist before connecting). Never set `verify=False`; preserve original hostname SNI.
   - **Host Header Defense:** Never construct public URLs from `Host` or `X-Forwarded-Host` headers; require an explicit configured `base_url`.
2. **Constant-Time Cryptographic Comparison:**
   - Always use `hmac.compare_digest(a, b)` (Python) or `crypto.timingSafeEqual` (Node/TS) when comparing tokens, API keys, webhooks, hashes, or secrets. Never use `==` on secret material.
