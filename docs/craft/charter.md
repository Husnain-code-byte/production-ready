# The Craft Charter — Engineering Elegance Invariants

Every agent and model in this workspace must uphold the 6 Principles of Engineering Elegance:

1. **Elegance is Parsimony:** Solve the problem with the minimal necessary concepts. Never invent speculative layers, convenience methods, or unrequested abstractions (Law 2).
2. **Intentional Form Over Brute Force:** Structure code to fit the mathematical contours of the domain. Do not shred functions into fragmented, meaningless chunks merely to game a cyclomatic complexity metric.
3. **Purity of Boundaries:** Keep services and domains completely decoupled from transport schemas, HTTP frameworks, and database drivers (Clean Architecture).
4. **Radical Intellectual Honesty:** No vanity ratings, no self-congratulation, no hand-written receipts. State limitations, trade-offs, and single-model fallback modes with unvarnished clarity (Pillar 5).
5. **Living, Grounded Documentation:** All documentation must be synchronized with code, verified against runnable examples, free of broken links, and structured using the Diataxis framework.
6. **Proportional Method:** Scale ceremony to scope via the Adaptive Clutch:
   - **Micro:** Direct execution, surgical fix, local test verification.
   - **Small:** Red-green test pair, single specialist, refactoring check.
   - **Medium / Large:** Execute the Craft Method (`Frame → Model → Choose → Build → Prove → Explain`) with an explicit Design Note before implementation.
