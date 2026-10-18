/**
 * Core Agent Scopes - Foundation and Phase 0-5 Engineering Scopes
 */

export const CORE_SCOPES = {
  aegis: {
    edit: { allow: ["*"], deny: [".env", ".env.*", "secrets/", "credentials.*"] },
    bash: {
      allow: ["git status*", "git log*", "git diff*", "git branch*", "git show*", "npm *", "pnpm *", "bun *", "yarn *", "npx vitest*", "npx playwright*", "npx tsc*", "npx prisma*", "cargo *", "go *", "python* -m unittest*", "python* -m pytest*", "pytest*", "node *"],
      deny: ["rm *", "git push*", "git commit*", "git reset*", "npm publish*"],
    },
  },
  orchestrator: {
    edit: { allow: ["project-memory/05-feature-registry.md", "project-memory/06-session-log.md"], deny: ["src/", "docs/"] },
    bash: { allow: ["git status*", "git log*", "git diff*", "git branch*"], deny: ["*"] },
  },
  "vision-analyst": {
    edit: { allow: ["docs/specs/", "project-memory/01-vision.md"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "decomposition-guide": {
    edit: { allow: ["project-memory/02-subsystem-map.md", "project-memory/05-feature-registry.md", "docs/architecture/"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "reference-collector": {
    edit: { allow: ["docs/research/"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "spec-writer": {
    edit: { allow: ["docs/specs/", "project-memory/06-session-log.md"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "spec-reviewer": {
    edit: { allow: [], deny: ["*"] },
    bash: { allow: [], deny: ["*"] },
  },
  "system-architect": {
    edit: { allow: ["docs/adr/", "docs/architecture/", "docs/api/", "project-memory/03-architecture.md", "docs/specs/"], deny: ["src/"] },
    bash: { allow: ["git status*", "git log*", "git diff*", "git branch*"], deny: ["*"] },
  },
  "database-designer": {
    edit: { allow: ["docs/schema/", "docs/api/", "docs/architecture/", "prisma/", "migrations/", "project-memory/03-architecture.md"], deny: [] },
    bash: {
      allow: [
        "git status*", "git log*", "git diff*",
        "npm run migrate*", "pnpm migrate*", "npx prisma*", "cargo run -- migrate*",
        "alembic*", "sqlx migrate*", "goose*", "python* -m alembic*"
      ],
      deny: ["rm *", "git commit*", "git push*", "*reset*", "*--force*", "*--accept-data-loss*", "*db execute*"],
    },
  },
  "figma-analyzer": {
    edit: { allow: ["project-memory/04-design-system.md", "docs/design/"], deny: ["src/"] },
    bash: { allow: [], deny: ["*"] },
  },
  "design-system-builder": {
    edit: { allow: ["src/styles/", "src/theme/", "src/components/ui/", "project-memory/04-design-system.md", "docs/design/"], deny: [] },
    bash: { allow: ["git status*", "git diff*", "npm run build*", "pnpm build*", "bun run build*", "npm test*", "pnpm test*", "bun test*"], deny: ["rm *", "git commit*", "git push*"] },
  },
  "frontend-engineer": {
    edit: { allow: ["src/", "app/", "components/", "pages/", "tests/", "__tests__/", "public/"], deny: ["api/", "server/"] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "git branch*", "npm *", "pnpm *", "bun *", "yarn *", "npx vitest*", "npx playwright*", "npx tsc*", "npx eslint*", "npx prettier*", "npx tailwindcss*", "vite *", "next *", "vitest *", "jest *", "playwright *", "node *"],
      deny: ["rm *", "git push*", "git commit*", "git reset*", "git clean*", "git checkout*", "git stash*", "npm publish*", "python*", "perl*", "ruby*", "sh*", "bash*"]
    },
  },
  "backend-engineer": {
    edit: { allow: ["src/", "api/", "routes/", "controllers/", "models/", "services/", "tests/", "__tests__/", ".env.template", ".env.example"], deny: [] },
    bash: {
      allow: ["git status*", "git diff*", "git log*", "git branch*", "npm *", "pnpm *", "bun *", "yarn *", "npx prisma*", "npx tsc*", "npx vitest*", "node *", "python*", "python3*", "pytest*", "cargo *", "go *", "alembic*", "prisma*", "docker *"],
      deny: ["rm *", "git push*", "git commit*", "git reset*", "npm publish*"]
    },
  },
};
