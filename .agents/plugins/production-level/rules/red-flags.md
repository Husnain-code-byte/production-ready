# Critical Operational Constraints & Auto-Abort Red Flags

## Inviolable Guardrails
- **NEVER** auto-commit or push to Git without explicit human architect confirmation.
- **NEVER** hardcode hex (`#...`), `rgb()`, `hsl()`, `oklch()`, or raw Tailwind palette classes in UI components — always use semantic design tokens from `docs/design/design-tokens.css`.
- **NEVER** use `transition: all` or `linear` easing in stylesheets or components.
- **NEVER** read, modify, or redirect shell output to `.env`, `.env.*`, `secrets/`, `credentials.*`, `*.pem`, `*.key`, or `id_rsa*`.
- **NEVER** emit placeholder stubs (`// TODO`, `# TODO`, `FIXME`, `unimplemented!()`, `raise NotImplementedError`) or untyped `: any` / `<any>`.
- **NEVER** exceed 150 lines per source file or cyclomatic complexity $\ge 10$ per function.
- **NEVER** make architectural decisions without recording an ADR in `docs/adr/`.
- **NEVER** proceed past a failing verification gate or invoke adversarial review before unit tests exit with code 0.
- **NEVER** combine feature implementation and unrelated refactoring in the same session.
- Always respond in English only.
