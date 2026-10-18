# Project Constitution

> This is the AGENTS.md equivalent for this project. It encodes the project stack, rules, conventions, and non-negotiable constraints that ALL AI agents must follow.

## Stack (Auto-Detected — do not hardcode)
Scan the codebase on first load to populate these:
- **Language:** detect from `package.json` → TypeScript, `Cargo.toml` → Rust, `pyproject.toml` → Python, `go.mod` → Go, etc.
- **Frontend:** check `package.json` dependencies for react, vue, angular, svelte, next, nuxt, etc.
- **Backend:** check for express, fastify, django, flask, actix, axum, gin, echo, etc.
- **Database:** infer from `docker-compose.yml`, `.env.template`, Prisma schema, or dependencies (pg, mysql2, sqlite3, mongodb)
- **Package Manager:** lock file present → pnpm/npm/yarn/bun
- **Test Framework:** devDependencies → vitest/jest/mocha/pytest/rspec
- **ORM:** dependencies → prisma/drizzle/sequelize/typeorm/sqlalchemy/diesel
- **CI/CD:** check `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`
- **Runtime:** Node.js / Python / Rust / Go / Java — from config or Dockerfile

## Critical Rules
1. NEVER auto-commit without explicit human confirmation
2. NEVER hardcode hex, RGB, HSL values — always use design tokens
3. NEVER modify .env, secrets, or credential files
4. NEVER make architecture decisions without an ADR
5. NEVER proceed past a failing verification gate
6. NEVER refactor and add features in the same session
7. Specs before code — always
8. One atomic feature per session
9. Human is architect, AI is builder — never reverse

## Conventions
- **Git:** trunk-based, structured commits: `type(scope): description [AI-assisted]`
- **Testing:** BDD/Gherkin specs before code, mutation score >= 80%
  - **Mutation tool:** auto-detected — `Stryker` (JS/TS), `PITest` (Java), `mutmut` or `mutpy` (Python), `cargo-mutants` (Rust), `go-mutesting` (Go)
  - **Mutation command:** detected from project config or `[language-appropriate tool] test:mutation`
  - **Scope:** changed files only (`git diff HEAD..origin/main`)
  - **Timeout:** 15 minutes per feature run
  - **Output:** `coverage/mutation.json` or equivalent for CI parsing
  - **Gate:** Hard gate — mutation score < 80% blocks commit
- **Code style:** follow project conventions — detect from linter config (ESLint, Ruff, RuboCop, etc.)
- **API:** OpenAPI 3.1 contract as source of truth, RFC 7807 errors (if applicable)
- **Database:** Repository pattern, parameterized queries, project-naming convention
- **Components:** Design tokens only, WCAG 2.1 AA minimum, component catalog in use

## Context Budget Tracking
- **Per-agent budget:** 200,000 tokens (soft cap, warn at 80%)
- **Monthly budget:** 50,000,000 tokens (track via session log)
- **Warning threshold:** 80% — log warning to session log, notify architect
- **Archive:** Sessions older than 90 days may be archived to reduce context
- **Tracking:** Session log records token usage per session for cumulative tracking

## Banned Practices
- Raw SQL in route handlers
- Hardcoded colors or spacing values
- Console.log in production code
- Commented-out code
- TODO without ticket reference
- Circular imports
- Multi-feature commits

## Allowed Libraries
[Define project-specific allowed libraries here]

## Security Requirements
- OWASP Top 10 awareness on every change
- Secrets never in code, never in logs
- Input validation at every API boundary
- Authentication on every protected endpoint
- CORS explicitly configured — never wildcard
