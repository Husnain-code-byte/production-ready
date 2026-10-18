# Catalog of Engineering Smells vs. Elegant Counterparts

This catalog identifies common anti-patterns exhibited by AI models and junior developers ("workslop") alongside the mature, elegant engineering patterns required in this repository.

---

### 1. The Teenager Brute-Forcer
* **Smell:** Stacking random `try/catch` wrappers around flaky code, using arbitrary `time.sleep(2)` to "wait for race conditions to settle", or repeatedly retrying failed operations without backoff or root-cause understanding.
* **Elegant Counterpart:** Identify the deterministic synchronization primitive or contract invariant. Use an explicit mutex lock, an `asyncio.Event`, or an idempotency key with deterministic retry logic.

---

### 2. The Metric Gamer (Arbitrary Function Shredder)
* **Smell:** Breaking a 40-line complex function into `step1()`, `step2()`, `step3()`, where each function takes 8 parameters passed from the previous function, solely to force cyclomatic complexity $< 10$.
* **Elegant Counterpart:** Identify the cohesive domain concept. Extract a domain value object that encapsulates validation, or replace a nested branching ladder with a strategy dispatch table. Each extracted unit must have an independent, single-responsibility identity.

---

### 3. The Speculative Astronaut
* **Smell:** Adding generic plugins, speculative factory patterns, unrequested convenience methods (`reset()`, `prune()`, `clear()`, `export_all()`), and deep inheritance hierarchies "just in case we need them in the future".
* **Elegant Counterpart:** Strict parsimony (Law 2). Implement only what the Gherkin specification demands. Add extension seams only when an immediate second implementation or test isolation requirement exists.

---

### 4. The Silent Swallower
* **Smell:** Empty `except:` blocks, `except Exception: pass`, or returning `None` / `""` / `false` on unexpected system failures to suppress runtime crashes.
* **Elegant Counterpart:** Let unexpected exceptions bubble up to the global error boundary. Catch only explicit, recoverable domain exceptions and translate them into structured, actionable domain error types.

---

### 5. The Cargo-Cult Typist
* **Smell:** Using `any`, `Record<string, any>`, `# type: ignore`, `@ts-ignore`, or unvalidated casting (`as unknown as TargetType`) to appease the compiler without ensuring runtime type safety.
* **Elegant Counterpart:** Model exact shapes using strict types (`StrictInt`, Discriminated Unions, Pydantic schemas, TypeScript interfaces). Validate external inputs at system boundaries using runtime schema validators.

---

### 6. The Vanity Narrator
* **Smell:** Prepending chat responses with sycophantic praise ("Certainly! I would be delighted to help with this world-class implementation"), scoring own work ("Quality Score: 9.9/10"), or asserting confidence without verification.
* **Elegant Counterpart:** Radical intellectual honesty. Zero fluff. Provide factual execution logs, verified test counts, and explicitly disclose all unverified paths or fallback modes.

---

### 7. The Phantom Tester
* **Smell:** Writing automated tests that contain zero assertions, tests that assert trivialities (`expect(true).toBe(true)`), or tests that catch all exceptions and silently pass.
* **Elegant Counterpart:** Strict property and boundary assertions. Every test must verify the post-state or side-effect. Mutation testing kill rate must exceed $\ge 85\%$.

---

### 8. The Flaky Sleep Looper
* **Smell:** Adding `sleep(100)` or polling in tight CPU loops to wait for async operations to finish.
* **Elegant Counterpart:** Event-driven synchronization using condition variables, promises, callbacks, or persistent queue listeners with bounded timeouts.

---

### 9. The Route Duplicator
* **Smell:** Copy-pasting repetitive `try ... except DomainError as e: raise HTTPException(...)` blocks inside every API route handler.
* **Elegant Counterpart:** Register a single centralized `@app.exception_handler(DomainError)` on the web application instance. Keep route handlers to 3-line pure delegation adapters.

---

### 10. The Documentation Pretender
* **Smell:** Writing vague, high-level summaries that contradict the actual codebase, copying outdated README templates, leaving broken relative links, or omitting negative error scenarios.
* **Elegant Counterpart:** Living Diataxis documentation synchronized with code. Every code snippet in docs must be syntactically valid and runnable. Every relative link is verified against the filesystem.

---

### 11. The Mock Castle
* **Smell:** Unit tests that mock out 95% of the application so that the test is testing nothing more than the mock configuration itself.
* **Elegant Counterpart:** Test domain logic with real in-memory data structures and pure functions. Reserve mocks strictly for external third-party I/O boundaries (payment gateways, external HTTP APIs).

---

### 12. The Leaky Transport Leaker
* **Smell:** Importing FastAPI's `Request`, `Response`, or Pydantic DTO models inside `service.py` or `domain.py`.
* **Elegant Counterpart:** Service functions accept primitive types or frozen `@dataclass(frozen=True)` domain entities. Transport DTOs are mapped to domain models strictly inside the route boundary.
