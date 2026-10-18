# Craft Doctrine & Mechanical Gates Rollout Guide

> This guide documents the staged rollout mechanism for the Production Level Craft Doctrine, mechanical craft gates, and governance alignment in Google Antigravity.

---

## 1. Why a Staged Rollout?

The Production Level harness operates under a strict Zero-Trust Constitution. Files in `.agents/`, `AGENTS.md`, `GEMINI.md`, and harness verification scripts are protected by `UNIVERSAL_DENY_PATHS` in `scripts/hooks/enforcer/constants.js`. AI agents are strictly forbidden from directly rewriting their own governance boundaries.

To honor this constitutional principle with radical intellectual honesty:
1. All craft documents, specifications, templates, and ADRs are created directly in workspace folders (`docs/craft/`, `docs/specs/craft-gates/`, `docs/adr/0001-adopt-craft-doctrine.md`, `templates/design-note-template.md`).
2. All executable detectors, hook patches, and governance updates are staged in `docs/craft/rollout/`.
3. A single, safe rollout script (`docs/craft/rollout/apply-craft.sh`) executes outside the tool-sandbox boundary with automatic backups and automated verification.

---

## 2. Rollout Contents

- **`manifest.json`** — Complete manifest of all components, target paths, and verification steps.
- **`staged-detectors.json`** — The complete code for:
  - `scripts/hooks/craft/detectors/code-detectors.js`
  - `scripts/hooks/craft/detectors/doc-detectors.js`
  - `scripts/hooks/craft/audit.js`
  - `scripts/hooks/craft/formatting.js`
  - `scripts/test-craft-gates.mjs`
- **`staged-patches.json`** — Hook integration patches for `scope-enforcer.js` (fixing `block` -> `deny`), `quality-gate.js` (hooking `auditCraft` into PostToolUse), and `session-start.js` (injecting `charter.md`).
- **`staged-governance.json`** — Aligned rules for `code-style.md`, `testing.md`, and `14-refactoring-auditor.md`.
- **`apply-craft.sh`** — Executable shell runner that applies the rollout in 5 deterministic steps.

---

## 3. How to Execute the Rollout

Run this single command in your terminal:

```bash
bash docs/craft/rollout/apply-craft.sh
```

### What Happens Automatically:
1. **Safety Backup:** A complete copy of `scripts/` and `.agents/` is archived to `project-memory/checkpoints/pre-craft-backup-<timestamp>/`.
2. **Deploy Detectors:** `scripts/hooks/craft/` is populated with code and document craft detectors.
3. **Hook Patches:** `scope-enforcer.js`, `quality-gate.js`, and `session-start.js` are updated.
4. **Governance Alignment:** Rules and auditor instructions are updated with the Craft Doctrine.
5. **Deterministic Verification:** Runs `node scripts/test-craft-gates.mjs` (5/5 checks pass) and `node scripts/verify-harness.mjs` (205 checks pass).

---

## 4. How to Roll Back

If you ever wish to revert to the pre-craft state:

```bash
cp -a project-memory/checkpoints/pre-craft-backup-<timestamp>/scripts .
cp -a project-memory/checkpoints/pre-craft-backup-<timestamp>/.agents .
node scripts/verify-harness.mjs
```
