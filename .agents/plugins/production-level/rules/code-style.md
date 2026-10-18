# Polyglot Engineering Standards & Code Style Conventions

> Universal engineering invariants enforced across all languages, with stack-specific idioms auto-applied based on file extension.

---

## 1. Universal Engineering Invariants (All Languages)

1. **Complexity Threshold:** Keep functions under 30 lines and cyclomatic complexity $< 10$. If logic requires nesting $> 3$ levels, extract pure helper functions.
2. **Single Responsibility:** One function = one clear transformation or operation (describable without conjunctions like "and").
3. **Boundary Validation:** Validate inputs strictly at system boundaries (HTTP request handlers, CLI arguments, database queries, file reads). Trust internal domain code once validated.
4. **Structured Error Taxonomy:**
   - Never swallow errors silently or return blank fallbacks on unexpected failures.
   - Never throw raw strings or generic error classes without context.
   - Error messages must be actionable: describe what failed, why it failed, and what the operator/caller should do to resolve it.
5. **Zero-Workslop Hygiene:**
   - Delete commented-out code; Git history preserves revisions.
   - No placeholder comments (`// TODO`, `# TODO`, `/* FIXME */`) in committed code.
   - No raw debug output (`console.log`, `print()`, `println!`, `fmt.Println`) in production paths; use structured loggers.

---

## 2. Stack-Specific Idioms

### TypeScript & JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Strict type checking enabled (`strict: true`). No untyped `any` or `as any`.
- Prefer `const` over `let`. Immutability by default.
- Explicit return types on all exported module functions.
- Order of imports: External packages $\rightarrow$ Internal workspace modules $\rightarrow$ Types $\rightarrow$ Styles.
- Prefer named exports over default exports (except framework-mandated routes like Next.js page routers).

### Python (`.py`)
- Complete type annotations on all function signatures (`typing.Optional`, `typing.Union`, `collections.abc.Callable`).
- Format with Ruff / Black formatting guidelines (PEP 8 compliance).
- Model domain data with Pydantic schemas or immutable `@dataclass(frozen=True)`.
- Custom domain exceptions inheriting from base application exception class (`class AppError(Exception)`). Never bare `except:`.

### Rust (`.rs`)
- Zero compiler warnings and clean `cargo clippy --all-targets` execution.
- Exhaustive pattern matching; avoid unchecked `.unwrap()` or `.expect()` in non-test paths.
- Error modeling using `thiserror` for library boundaries or `anyhow` for top-level binaries.
- Idiomatic borrowing over unnecessary cloning (`&str` / `&Path` in parameters).

### Go (`.go`)
- Explicit error handling on every return: `if err != nil { return fmt.Errorf("context: %w", err) }`.
- Context propagation: Pass `ctx context.Context` as the first argument in I/O and network operations.
- Table-driven unit tests with `t.Run()`.
- Avoid naked returns in named return functions.

---

*Enforced by: 10-frontend-engineer, 11-backend-engineer, and 14-refactoring-auditor.*
