export const SOURCE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs", "py", "rs", "go", "java", "c", "cpp", "h", "hpp", "rb", "php",
  "kt", "swift", "cs", "dart", "vue", "svelte", "mdx"
]);

export const SAFE_ENV_TEMPLATES = new Set([
  ".env.template", ".env.example", ".env.sample", ".env.defaults"
]);

export const UNIVERSAL_DENY_PATHS = [
  ".env", ".env.*", "secrets/", "credentials.*", "*.pem", "*.key", "id_rsa*",
  ".agents/", ".opencode/", ".git/", "scripts/verify-harness.mjs", "AGENTS.md", "GEMINI.md", "opencode.json"
];

export const DEFAULT_AGENT = "plan";

export const AGENT_ALIASES = {
  frontend: "frontend-engineer",
  backend: "backend-engineer",
  architect: "system-architect",
  db: "database-designer",
  database: "database-designer",
  specs: "spec-writer",
  spec: "spec-writer",
  reviewer: "adversarial-reviewer",
  security: "security-auditor",
  arbitrator: "apex-arbitrator",
  registry: "feature-registry-manager",
  orchestrator: "orchestrator",
  debt: "tech-debt-tracker",
};
