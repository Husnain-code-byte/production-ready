---
name: spec-write
description: "Author executable Gherkin BDD specifications (gherkin.feature), PR/FAQ (pr-faq.md), and verification test plans (test-plan.md) in docs/specs/<feature>/ covering the Mandatory Domain Threat & Boundary Matrix before writing implementation code. Triggered by /spec-write."
---

# `/spec-write` — Production Level Native Antigravity Skill

## Antigravity Execution Runbook
- **Slash Command Trigger:** `/spec-write <feature>`
- **Primary Agents / Subagents (`invoke_subagent` / `send_message`):** `04-spec-writer` (`Model: "flash"`), followed by `05-spec-reviewer` (`Model: "pro"` -> `anthropic/claude-sonnet-5.5`)
- **Project Memory Inputs (`view_file`):** `project-memory/01-vision.md`, `project-memory/02-subsystem-map.md`, `templates/spec-template.feature`
- **Project Memory Outputs (`write_to_file` / `replace_file_content`):** `docs/specs/<feature>/pr-faq.md`, `docs/specs/<feature>/gherkin.feature`, `docs/specs/<feature>/test-plan.md`, `project-memory/05-feature-registry.md`

---

## Process for `$ARGUMENTS`
1. Read `project-memory/01-vision.md` and `project-memory/02-subsystem-map.md`.
2. Author `docs/specs/$ARGUMENTS/pr-faq.md` (Amazon Working Backwards PR/FAQ).
3. Author `docs/specs/$ARGUMENTS/gherkin.feature` covering:
   - Happy path & error path scenarios
   - **Mandatory Domain Threat & Boundary Matrix:** SSRF/loopback/RFC 1918/metadata (`169.254.169.254`)/hex/integer IPs, `follow_redirects=False`, TLS SNI, untrusted `Host`/`X-Forwarded-Host` rejection, dynamic `app.routes` collision prevention, Python `bool`-as-`int` rejection, $\le 0$ and $>10$-year TTL rejection, `hmac.compare_digest`, and `max_entries` capacity bounds under `threading.Lock`.
   - **Apple Safety Invariant:** Specify mandatory defensive bounds (`max_entries`, timeouts) while prohibiting unrequested convenience methods (`reset()`, `prune()`, `get_tokens()`, `__repr__()`).
4. Author `docs/specs/$ARGUMENTS/test-plan.md` with a mandatory **mutation score threshold $\ge 85\%$** (no `null` skip loophole).
5. Invoke `05-spec-reviewer` with `Model: "pro"` to adversarially audit the specification before Phase 5B.
