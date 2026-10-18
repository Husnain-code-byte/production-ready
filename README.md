# Production Level — Enterprise AI Software Engineering Harness for Google Antigravity

**Production Level** is a complete, zero-trust, 9-phase AI software delivery lifecycle harness engineered natively for **Google Antigravity** (App, IDE, and CLI `agy`).

It equips any workspace with **26 specialized agents** (led by the **Aegis** meta-orchestrator and its **Adaptive Clutch**), **17 native slash-command skills**, **10 modular rule files**, **6 lifecycle enforcement hooks**, **automatic multi-model quota failover with dynamic effort recalibration**, a **standalone bundled Antigravity plugin**, and a persistent **Project Memory** single source of truth.

---

## 1. One-Line Bootstrap Quickstart (For Any Project)

Create a new project folder (or `cd` into any existing project anywhere on your machine), run one terminal command to install the entire harness from GitHub, and open Google Antigravity:

```bash
mkdir my-project && cd my-project
curl -fsSL https://raw.githubusercontent.com/Husnain-code-byte/production-ready/main/scripts/install.sh | bash
agy .
```

Or install directly from a local clone of this repository:

```bash
mkdir my-project && cd my-project
bash "/path/to/Production Ready/scripts/install.sh"
agy .
```

### What `install.sh` Does Automatically:
1. Installs `.agents/` (**26 agents**, **17 skills**, **10 rule files**, **`hooks.json`**, and the **`production-level` plugin**).
2. Installs `scripts/hooks/` (all 6 lifecycle hooks + quota failover & scope enforcement engines) and `templates/`.
3. Initializes `project-memory/` (`00` through `09`, `aegis/`, `checkpoints/`) and `docs/` without overwriting any existing project files.
4. Auto-detects your project stack (`package.json`, `pnpm-lock.yaml`, `bun.lock`, `yarn.lock`, `Cargo.toml`, `pyproject.toml`, `go.mod`) and writes the exact build/test/lint/typecheck commands into `AGENTS.md`.
5. Initializes Git (`git init -b main`) if the folder is not yet a repository.

---

## 2. Complete User Guide: How to Work in Google Antigravity

### Step 1: Talk Directly to **Aegis** (Default Main Agent)
When you open the folder in Google Antigravity (`agy .`), **Aegis** (`.agents/agents/aegis.md`) is pre-configured with `mainAgent: true`:
- **Default Model:** `google/gemini-3.8-flash`
- **Default Effort Tier:** `MEDIUM` (`thinkingBudget: 4,096` tokens, `temperature: 0.2`)
- **Session Boot (`SessionStart` hook):** Automatically injects `project-memory/00-project-constitution.md`, `05-feature-registry.md`, and `06-session-log.md` into context so Aegis immediately knows your project's state.

You do **not** need to manually switch agents for every step — simply describe what you want to build or fix to **Aegis**.

### Step 2: Automatic Scope Sizing via the **Adaptive Clutch**
Every time you send a request, **Aegis** sizes the scope into one of 4 tiers and selects the right execution strategy:

| Clutch Tier | When Used | What Aegis Does |
| :--- | :--- | :--- |
| **Micro** | $\le 1$ file, $< 30$ lines (typo, config tweak, small patch) | Aegis executes the change directly and runs local lint/tests. |
| **Small** | 1–2 files, $< 100$ lines (isolated bug fix or minor enhancement) | Aegis dispatches `18-debugger`, `10-frontend-engineer`, or `11-backend-engineer` via `invoke_subagent`, then runs `14-refactoring-auditor`. |
| **Medium** | Standard atomic feature (new API endpoint, UI view, domain service) | Aegis orchestrates the full **Phase 5A–5F Atomic Loop** (`04-spec-writer` $\rightarrow$ `05-spec-reviewer` $\rightarrow$ Red Tests $\rightarrow$ Green Code $\rightarrow$ `12-completeness-checker` + `13-adversarial-reviewer` $\rightarrow$ `14-refactoring-auditor` $\rightarrow$ `22-feature-registry-manager`). |
| **Large** | New product, new microservice, or major database/architecture overhaul | Aegis walks through **Phases 0–4** (`01-vision-analyst` $\rightarrow$ `02-decomposition-guide` $\rightarrow$ `03-reference-collector` $\rightarrow$ `06-system-architect` + `07-database-designer` $\rightarrow$ `08-figma-analyzer` + `09-design-system-builder`) before implementing features one by one in Phase 5. |

### Step 3: Using the 17 Native `/slash-command` Skills
Type any of these commands directly in the Antigravity chat input:

| Slash Command | Purpose |
| :--- | :--- |
| `/start-session` | Load project memory, inspect git status, select Adaptive Clutch tier, and declare session scope boundaries. |
| `/phase-check` | Inspect `project-memory/` to determine the active lifecycle phase (0–8) and recommended next step. |
| `/scope-check` | Explicitly list files that will and will not be touched before making changes. |
| `/spec-write <feature>` | Author `pr-faq.md`, `gherkin.feature`, and `test-plan.md` under `docs/specs/<feature>/` and run `05-spec-reviewer`. |
| `/verify-feature <feature>` | Run the 3-Layer Verification Protocol (Automated Tests/Lint/Types $\rightarrow$ Spec Coverage $\rightarrow$ Cross-Model Adversarial Audit) and generate a machine receipt in `08-verification-report.md`. |
| `/refactor-gate` | Audit modified files for cyclomatic complexity ($< 10$/function), file length ($< 150$ lines), and zero duplication. |
| `/adr-write <title>` | Record a Markdown Architectural Decision Record in `docs/adr/` and update `07-decision-log.md`. |
| `/parallel-discover` | Launch 2–5 concurrent read-only discovery subagents (`20-research-agent`, `03-reference-collector`, `01-vision-analyst`). |
| `/checkpoint` | Save a named snapshot of `project-memory/` and git state in `project-memory/checkpoints/`. |
| `/restore` | Restore `project-memory/` and git state from a saved checkpoint. |
| `/cool-down` | Compress long session context and write a clean handoff snapshot. |
| `/session-log` | Append a structured progress entry to `project-memory/06-session-log.md`. |
| `/context-update` | Synchronize `05-feature-registry.md`, `06-session-log.md`, and `07-decision-log.md`. |
| `/commit-format` | Generate a structured conventional commit (`type(scope): description`) after gates pass. |
| `/abort-feature` | Safely stash uncommitted work (`git stash push -u`) and mark the feature `BLOCKED`. |
| `/rollback-feature` | Safely revert a broken feature via `git revert` and mark it `ROLLED_BACK`. |
| `/end-session` | Verify gates, update memory logs and registry, and prepare the final commit proposal for approval. |

---

## 3. Zero-Downtime Multi-Model Routing & Quota Failover

### Primary Model Assignments & Automatic Failover Matrix
If any model (such as `google/gemini-4-argon` or `anthropic/claude-sonnet-5.5`) hits its quota or rate limit, **no agent ever becomes unavailable**. The `PreInvocation` hook (`scripts/hooks/effort-governor.js`) automatically detects exhaustion and switches to the next healthy model while boosting thinking budgets and enforcing compensating guardrails:

| Primary Model | Assigned Agents | Failover 1 (Recalibrated Effort) | Failover 2 (Recalibrated Effort) | Compensating Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| **`google/gemini-4-argon`** *(Architecture & Data)* | `00-orchestrator`, `01-vision-analyst`, `02-decomposition-guide`, `06-system-architect`, `07-database-designer` | `anthropic/claude-sonnet-5.5` (`HIGH`, `16,384` thinking tokens, `temp: 0.2`) | `google/gemini-3.8-flash` (`HIGH`, `16,384` thinking tokens, `temp: 0.15`) | Enforces C4 boundary validation, normalized ER schema checks, and 2-pass self-consistency review. |
| **`anthropic/claude-sonnet-5.5`** *(Adversarial Audit)* | `05-spec-reviewer`, `13-adversarial-reviewer`, `14-refactoring-auditor`, `15-security-auditor`, `16-ux-auditor`, `17-performance-auditor` | `google/gemini-4-argon` (`HIGH`, `16,384` thinking tokens, `temp: 0.2`) | `google/gemini-3.8-flash` (`HIGH`, `16,384` thinking tokens, `temp: 0.1`) | Stage 1 preserves cross-model independence; Stage 2 forces deterministic (`temp: 0.1`) line-by-line diff audit. |
| **`anthropic/claude-opus-5.5`** *(Apex Arbitrator)* | `24-apex-arbitrator` | `google/gemini-4-argon` (`APEX`, `32,768` thinking tokens, `temp: 0.1`) | `anthropic/claude-sonnet-5.5` or `google/gemini-3.8-flash` (`APEX`, `32,768` tokens, `temp: 0.1`) | Requires formal invariant proof + mandatory Human Architect confirmation via `ask_question`. |
| **`google/gemini-3.8-flash`** *(Workhorse)* | `aegis`, `03`, `04`, `08`–`12`, `18`–`23` | `anthropic/claude-sonnet-5.5` (`MEDIUM`, `4,096` thinking tokens, `temp: 0.15`) | `google/gemini-4-argon` (`MEDIUM`, `4,096` thinking tokens, `temp: 0.2`) | Restricts context injection strictly to target files and git diff to conserve secondary model quota. |

- **How Failover Triggers:** Automatically when you mention a limit in chat (e.g., `"argon 4 hit the limit"`), when a `429` / `ResourceExhausted` message occurs, or via `export PRODUCTION_LEVEL_EXHAUSTED_MODELS="google/gemini-4-argon"`.
- **Automatic Recovery:** Quota cooldowns are stored in `project-memory/.telemetry/model-quota-state.json` and automatically reset after 60 minutes (or immediately when you say `"reset quota"`).

---

---

## 4. The Craft Doctrine: Engineering Maturity & Parsimony

Beyond correctness, **Production Level** enforces the **Craft Doctrine** — elevating AI software engineering from brute-force token generation to parsimonious, elegant principal-engineer design across code, documentation, dialogue, and architectural seams.

### The 5 Craft Invariants
1. **The Deletion Test:** Every line of code, comment, or abstraction that can be deleted without altering correctness or clarity MUST be deleted.
2. **The Sentence Test:** Every function, module, and commit MUST express its core invariant in a single crisp sentence.
3. **The Seam Test:** Boundaries between modules MUST expose narrow interfaces with zero leaking of transport, persistence, or framework details into the domain layer.
4. **The Adversary Test:** Code MUST be designed anticipating malicious or degenerated inputs (SSRF, unbounded memory, prototype pollution, collision attacks).
5. **The Junior Test:** An unfamiliar developer reading the code MUST understand its flow in under 5 minutes without mental gymnastics.

### Mechanical Craft Gates (`scripts/hooks/quality-gate.js`)
Craft is not an aspirational guideline — it is mechanically checked in `PostToolUse` on every file write:
- **`swallowed-error`**: Catches empty `catch {}` blocks or ignored error parameters.
- **`debug-output`**: Catches stray `console.log`, `print()`, or `println!` statements.
- **`zero-assert-test`**: Catches tests lacking assertions (`expect`, `assert`, `self.assert`).
- **`broken-markdown-link`**: Catches broken relative links across workspace documentation.
- **`vanity-metric`**: Blocks self-praise and marketing fluff (`"world-class"`, `"flawless"`, `"battle-tested"`) in commits and reports.

### The Weaker-Model Master Prompt
For lightweight models (`gemini-flash`, `claude-haiku`, `gpt-4o-mini`), [docs/craft/WEAKER_MODEL_MASTER_PROMPT.md](docs/craft/WEAKER_MODEL_MASTER_PROMPT.md) provides a zero-leakage, step-by-step cognitive scaffolding protocol (Frame $\rightarrow$ Model $\rightarrow$ Choose $\rightarrow$ Build $\rightarrow$ Prove $\rightarrow$ Explain) guaranteeing senior-level restraint and parsimony.

---

## 5. Exhaustive Repository Topology

```text
Production Ready/
├── .agents/
│   ├── agents/                              # 26 specialized Antigravity agents (aegis + 00..24)
│   ├── skills/                              # 17 native /slash-command skill packages
│   ├── rules/                               # 10 modular rule files (<24KB each)
│   ├── hooks.json                           # Native Antigravity lifecycle hooks manifest
│   └── plugins/
│       └── production-level/                # Standalone bundled Antigravity plugin
├── docs/
│   ├── adr/                                 # Architectural Decision Records (MADR format)
│   │   ├── 0001-adopt-craft-doctrine.md     # ADR-0001 Craft Doctrine adoption
│   │   └── README.md                        # ADR catalog & index
│   ├── craft/                               # The Craft Suite
│   │   ├── charter.md                       # Core craft charter (injected into model context)
│   │   ├── doctrine.md                      # Mathematical parsimony & clean architecture
│   │   ├── lenses.md                        # Craft across Code, Architecture, Docs, Dialogue
│   │   ├── smells.md                        # 12 engineering anti-patterns vs elegant counterparts
│   │   ├── examples.md                      # Polyglot before/after code & ADR examples
│   │   ├── review-protocol.md               # Phase 5E Dual-Track Refactoring & Craft audit
│   │   └── WEAKER_MODEL_MASTER_PROMPT.md    # Universal master prompt for workhorse models
│   └── specs/                               # Executable BDD Gherkin specifications
│       └── craft-gates/
│           └── gherkin.feature              # 5 executable craft gate scenarios
├── project-memory/                          # Single source of truth (00..09, aegis/, checkpoints/)
├── scripts/
│   ├── hooks/                               # 6 lifecycle hook handlers + quota failover engine
│   │   └── craft/                           # Mechanical craft detectors & audit engine
│   ├── test-craft-gates.mjs                 # 5/5 craft gate test suite
│   ├── verify-harness.mjs                   # 205-check automated harness self-audit suite
│   └── install.sh                           # Universal 1-line bootstrap installer
├── templates/                               # Gherkin, MADR ADR, & design-note templates
├── AGENTS.md                                # Workspace constitution & stack auto-detection
├── GEMINI.md                                # Antigravity companion root instruction file
├── package.json                             # Validation scripts & ESM configuration
├── .gitignore                               # Production gitignore
└── README.md                                # Complete documentation & user guide
```

---

## 6. Verification & Self-Audit

Verify all 26 agents, 17 skills, 10 rules, 6 lifecycle hooks, multi-model quota failover, and mechanical craft gates at any time:

```bash
npm test
# runs verify-harness (205 checks) + test-craft-gates (5 checks)
```

