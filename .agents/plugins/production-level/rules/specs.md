---
description: "Gherkin BDD authoring, Mandatory Domain Threat & Boundary Matrix, and Apple Defensive Resource Bounding rules."
globs:
  - "docs/specs/**"
  - "**/*.feature"
---

# Production Level — Executable Specification & Threat Matrix Rules

## 1. Mandatory Domain Threat & Boundary Matrix in Every Spec
Do NOT rely on generic imagination when writing `docs/specs/<feature>/gherkin.feature`. Every specification must systematically evaluate and include concrete `Scenario:` or `Scenario Outline:` blocks for every applicable threat vector:

1. **Network / URL Inputs (SSRF, Redirects, & Host Poisoning):**
   - Loopback (`http://127.0.0.1`, `http://localhost`, `http://[::1]`), RFC 1918 private IPs (`10.0.0.5`, `172.16.0.1`, `192.168.1.1`), Cloud Metadata (`http://169.254.169.254/latest/meta-data/`), unspecified (`http://0.0.0.0`), and obfuscated IP encodings (`http://2130706433`, `http://0x7f.0.0.1`, `http://0177.0.0.1`).
   - Disallowed schemes (`javascript:alert(1)`, `file:///etc/passwd`, `ftp://`, `gopher://`, `data:`).
   - Redirect policy (`follow_redirects=False` or per-hop IP re-validation) and TLS verification (`verify=True`, SNI preserved).
   - URLs $> 2048$ characters, embedded credentials (`http://user:pass@example.com`), and CRLF/null bytes.
   - Untrusted `Host` and `X-Forwarded-Host` headers attempting to poison generated URLs.
   - Reserved framework route shadowing (`docs`, `redoc`, `openapi.json`, or existing API paths via dynamic `app.routes` introspection).
2. **Numeric / Rate / Cost / TTL Inputs:**
   - Boolean-as-integer coercion traps (`ttl_seconds=True`, `cost=False`).
   - Zero and negative values (`cost=0`, `cost=-1`, `ttl=0`, `ttl=-60`).
   - `NaN`, `Infinity`, and extreme TTL values ($> 10\text{ years}$) causing timestamp overflow.
3. **Defensive Resource Bounds vs. Unrequested Convenience Extras (Apple Safety Invariant):**
   - **Mandatory Safety Bounds:** Specify explicit capacity ceilings (`max_entries`), connect/read timeouts ($le 3\text{s}$ / $le 10\text{s}$), payload byte caps, and atomic `threading.Lock` collision retry.
   - **Banned Convenience Bloat:** Forbid unrequested helper methods (`reset()`, `prune()`, `get_tokens()`, `__repr__()`) not in the problem statement.
4. **Cryptographic & Secret Comparisons:**
   - Mandate constant-time comparison (`hmac.compare_digest` / `crypto.timingSafeEqual`) for tokens, signatures, and secrets.
