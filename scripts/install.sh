#!/usr/bin/env bash
# ==============================================================================
# Production Level — Universal One-Line Bootstrap Installer for Google Antigravity
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Husnain-code-byte/production-ready/main/scripts/install.sh | bash
#   OR locally:
#   bash /path/to/Production\ Ready/scripts/install.sh [target-dir]
# ==============================================================================
set -euo pipefail

TARGET_DIR="${1:-$(pwd)}"
mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

SCRIPT_SOURCE=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  CANDIDATE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  if [ -d "$CANDIDATE_ROOT/.agents" ] && [ -d "$CANDIDATE_ROOT/project-memory" ]; then
    SCRIPT_SOURCE="$CANDIDATE_ROOT"
  fi
fi

if [ -z "$SCRIPT_SOURCE" ] && [ -n "${PRODUCTION_LEVEL_SRC:-}" ] && [ -d "$PRODUCTION_LEVEL_SRC/.agents" ]; then
  SCRIPT_SOURCE="$(cd "$PRODUCTION_LEVEL_SRC" && pwd)"
fi

CLEANUP_TMP=""
if [ -z "$SCRIPT_SOURCE" ]; then
  REPO_URL="${PRODUCTION_LEVEL_REPO:-https://github.com/Husnain-code-byte/production-ready.git}"
  BRANCH="${PRODUCTION_LEVEL_BRANCH:-main}"
  CLEANUP_TMP="$(mktemp -d)"
  echo "[Production Level] Fetching harness from $REPO_URL ($BRANCH)..."
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$CLEANUP_TMP" >/dev/null 2>&1
  SCRIPT_SOURCE="$CLEANUP_TMP"
fi

cleanup() {
  if [ -n "$CLEANUP_TMP" ] && [ -d "$CLEANUP_TMP" ]; then
    rm -rf "$CLEANUP_TMP"
  fi
}
trap cleanup EXIT

echo "[Production Level] Bootstrapping Google Antigravity harness into: $TARGET_DIR"

# 1. Copy .agents/, scripts/, and templates/
if [ "$SCRIPT_SOURCE" != "$TARGET_DIR" ]; then
  rm -rf "$TARGET_DIR/.agents"
  cp -a "$SCRIPT_SOURCE/.agents" "$TARGET_DIR/.agents"
  mkdir -p "$TARGET_DIR/scripts"
  cp -a "$SCRIPT_SOURCE/scripts/." "$TARGET_DIR/scripts/"
  mkdir -p "$TARGET_DIR/templates"
  cp -a "$SCRIPT_SOURCE/templates/." "$TARGET_DIR/templates/"

  # 2. Copy project-memory/ and docs/ without overwriting existing populated files
  mkdir -p "$TARGET_DIR/project-memory" "$TARGET_DIR/docs"
  cp -rn "$SCRIPT_SOURCE/project-memory/." "$TARGET_DIR/project-memory/" 2>/dev/null || cp -a "$SCRIPT_SOURCE/project-memory/." "$TARGET_DIR/project-memory/"
  cp -rn "$SCRIPT_SOURCE/docs/." "$TARGET_DIR/docs/" 2>/dev/null || cp -a "$SCRIPT_SOURCE/docs/." "$TARGET_DIR/docs/"

  # 3. Copy root constitution files if missing or forced
  for root_file in AGENTS.md GEMINI.md README.md .gitignore; do
    if [ ! -f "$TARGET_DIR/$root_file" ] || [ "${PRODUCTION_LEVEL_FORCE:-0}" = "1" ]; then
      cp -f "$SCRIPT_SOURCE/$root_file" "$TARGET_DIR/$root_file"
    fi
  done

  if [ ! -f "$TARGET_DIR/package.json" ]; then
    cp -f "$SCRIPT_SOURCE/package.json" "$TARGET_DIR/package.json"
  fi
fi

# Ensure executable permissions and git initialization in target project
chmod +x "$TARGET_DIR/scripts/install.sh"
if [ ! -d "$TARGET_DIR/.git" ] && command -v git >/dev/null 2>&1; then
  git -C "$TARGET_DIR" init -b main >/dev/null 2>&1 || git -C "$TARGET_DIR" init >/dev/null 2>&1 || true
fi

# 4. Auto-detect application stack in target directory (prioritizing Python/Rust/Go over harness package.json)
DETECTED_BUILD="[auto-detect on first build]"
DETECTED_DEV="[auto-detect on first run]"
DETECTED_TEST="pytest"
DETECTED_LINT="ruff check ."
DETECTED_TYPECHECK="mypy --strict ."

if [ -f "$TARGET_DIR/pyproject.toml" ] || [ -f "$TARGET_DIR/requirements.txt" ] || compgen -G "$TARGET_DIR/*.py" >/dev/null; then
  DETECTED_BUILD="python3 -m py_compile"; DETECTED_DEV="uvicorn app.main:app"; DETECTED_TEST="pytest"; DETECTED_LINT="ruff check ."; DETECTED_TYPECHECK="mypy --strict ."
elif [ -f "$TARGET_DIR/Cargo.toml" ]; then
  DETECTED_BUILD="cargo build"; DETECTED_DEV="cargo run"; DETECTED_TEST="cargo test"; DETECTED_LINT="cargo clippy"; DETECTED_TYPECHECK="cargo check"
elif [ -f "$TARGET_DIR/go.mod" ]; then
  DETECTED_BUILD="go build ./..."; DETECTED_DEV="go run ."; DETECTED_TEST="go test ./..."; DETECTED_LINT="golangci-lint run"; DETECTED_TYPECHECK="go vet ./..."
elif [ -f "$TARGET_DIR/pnpm-lock.yaml" ]; then
  DETECTED_BUILD="pnpm build"; DETECTED_DEV="pnpm dev"; DETECTED_TEST="pnpm test"; DETECTED_LINT="pnpm lint"; DETECTED_TYPECHECK="pnpm typecheck"
elif [ -f "$TARGET_DIR/bun.lock" ] || [ -f "$TARGET_DIR/bun.lockb" ]; then
  DETECTED_BUILD="bun run build"; DETECTED_DEV="bun run dev"; DETECTED_TEST="bun test"; DETECTED_LINT="bun run lint"; DETECTED_TYPECHECK="bun run typecheck"
elif [ -f "$TARGET_DIR/tsconfig.json" ]; then
  DETECTED_BUILD="npm run build"; DETECTED_DEV="npm run dev"; DETECTED_TEST="npm test"; DETECTED_LINT="npm run lint"; DETECTED_TYPECHECK="npx tsc --noEmit"
fi

if command -v node >/dev/null 2>&1 && [ -f "$TARGET_DIR/AGENTS.md" ]; then
  node -e '
    const fs = require("node:fs");
    const p = process.argv[1];
    let c = fs.readFileSync(p, "utf8");
    c = c.replace("- Build: `[auto-detected-by-stack]`", "- Build: `" + process.argv[2] + "`")
         .replace("- Dev server: `[auto-detected-by-stack]`", "- Dev server: `" + process.argv[3] + "`")
         .replace("- Test (all): `[auto-detected-by-stack]`", "- Test (all): `" + process.argv[4] + "`")
         .replace("- Lint: `[auto-detected-by-stack]`", "- Lint: `" + process.argv[5] + "`")
         .replace("- Type check: `[auto-detected-by-stack]`", "- Type check: `" + process.argv[6] + "`");
    fs.writeFileSync(p, c, "utf8");
  ' "$TARGET_DIR/AGENTS.md" "$DETECTED_BUILD" "$DETECTED_DEV" "$DETECTED_TEST" "$DETECTED_LINT" "$DETECTED_TYPECHECK"
fi

echo ""
echo "=============================================================================="
echo "  Production Level — Google Antigravity Harness Installed Successfully!"
echo "=============================================================================="
echo "  • 26 Specialized Agents   : .agents/agents/*.md (Default: Aegis)"
echo "  • 17 Native Skills        : .agents/skills/<name>/SKILL.md"
echo "  • 10 Modular Rule Files   : .agents/rules/*.md"
echo "  • 6 Lifecycle Hooks       : .agents/hooks.json -> scripts/hooks/*.js"
echo "  • Craft Doctrine Suite    : docs/craft/ (Charter, Anti-Smells, Weaker-Model Prompt)"
echo "  • Mechanical Craft Gates  : scripts/hooks/craft/ (PostToolUse quality interceptor)"
echo "  • Bundled Plugin          : .agents/plugins/production-level/"
echo "  • Project Memory          : project-memory/00..09"
echo ""
echo "  Next Steps:"
echo "    1. Open this folder in Google Antigravity IDE or run: agy "$TARGET_DIR""
echo "    2. Run /start-session in chat to initialize your first session."
echo "=============================================================================="
