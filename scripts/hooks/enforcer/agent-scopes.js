import { CORE_SCOPES } from "./core-scopes.js";

/**
 * Agent Scopes Registry - Maps each agent to authorized edit paths and bash commands.
 */
export const AGENT_SCOPES = {
  ...CORE_SCOPES,
  "completeness-checker": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm test*", "pnpm test*", "bun test*", "pytest*", "cargo test*", "go test*"],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  "adversarial-reviewer": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm test*", "pnpm test*", "bun test*", "pytest*", "cargo test*", "go test*"],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  "refactoring-auditor": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: [
        "git status*", "git diff*", "git log*",
        "npm run lint*", "pnpm lint*", "bun run lint*", "npm test*", "pnpm test*", "bun test*",
        "pytest*", "ruff*", "flake8*", "cargo clippy*", "cargo test*", "go test*", "go vet*", "golangci-lint*"
      ],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  "security-auditor": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm audit*", "pnpm audit*", "bun audit*", "cargo audit*", "pip-audit*", "bandit*", "govulncheck*", "snyk test*"],
      deny: ["rm *", "git commit*", "git push*", "*|*"],
    },
  },
  "ux-auditor": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm test*", "pnpm test*", "bun test*", "npx playwright*", "pnpm playwright*", "cargo test*", "pytest*"],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  "performance-auditor": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm run test:perf*", "pnpm test:perf*", "k6*", "artillery*", "cargo bench*", "pytest*"],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  debugger: {
    edit: { allow: ["src/", "tests/", "__tests__/", "services/", "api/", "components/"], deny: [] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm *", "pnpm *", "bun *", "yarn *", "node *", "pytest*", "cargo *"],
      deny: ["rm *", "git push*", "git commit*"]
    },
  },
  "documentation-writer": {
    edit: { allow: ["docs/", "README.md", "CONTRIBUTING.md", "CHANGELOG.md"], deny: ["src/"] },
    bash: { allow: ["git status*", "git log*", "git diff*"], deny: ["*"] },
  },
  "research-agent": {
    edit: { allow: ["docs/research/"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "release-manager": {
    edit: { allow: ["project-memory/", "CHANGELOG.md", "package.json", "docs/releases/"], deny: [] },
    bash: {
      allow: ["git status*", "git log*", "git diff*", "git tag*", "npm *", "pnpm *", "cargo *"],
      deny: ["rm *", "git push --force*", "git commit*"]
    },
  },
  "feature-registry-manager": {
    edit: { allow: ["project-memory/05-feature-registry.md", "project-memory/06-session-log.md"], deny: ["src/"] },
    bash: { allow: ["git status*", "git log*", "git diff*"], deny: ["*"] },
  },
  "tech-debt-tracker": {
    edit: { allow: ["project-memory/"], deny: ["src/"] },
    bash: {
      allow: [
        "git status*", "git log*", "git diff*",
        "npm audit*", "pnpm audit*", "bun audit*", "cargo audit*",
        "pip-audit*", "bandit*", "ruff*", "cargo clippy*", "eslint*", "npm run lint*"
      ],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  "apex-arbitrator": {
    edit: { allow: [], deny: ["*"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "npm test*", "pnpm test*", "bun test*", "pytest*", "cargo test*", "go test*"],
      deny: ["rm *", "git commit*", "git push*"],
    },
  },
  build: {
    edit: { allow: ["*"], deny: [".env", ".env.*", "secrets/", "credentials.*"] },
    bash: {
      allow: [
        "git status*", "git diff*", "git log*", "git branch*", "git show*", "git add*",
        "git checkout*", "git stash push*", "git stash list*", "git stash pop*",
        "git revert --no-commit*", "git reset --soft*", "npm *", "pnpm *", "bun *", "yarn *",
        "npx vitest*", "npx playwright*", "npx tsc*", "npx prisma*", "cargo *", "go *",
        "python*", "python3*", "pytest*", "make *", "tsc *", "node *", "vite *", "next *", "ruff *", "mutmut*"
      ],
      deny: ["rm *", "git push*", "git commit*", "git reset --hard*", "git branch -D*", "npm publish*"]
    },
  },
  plan: {
    edit: { allow: [], deny: ["*"] },
    bash: { allow: ["git status*", "git log*", "git diff*", "git branch*", "ls*", "pwd*"], deny: ["*"] },
  },
};
