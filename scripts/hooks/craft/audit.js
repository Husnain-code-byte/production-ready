import { auditCodeCraft } from "./detectors/code-detectors.js";
import { auditDocCraft } from "./detectors/doc-detectors.js";

export function auditCraft(relPath, content, projectRoot) {
  if (!relPath || !content) return [];
  const norm = relPath.replace(/\\/g, "/");
  if (norm.startsWith("scripts/") || norm.startsWith(".agents/") || norm.startsWith("templates/") || norm.startsWith("project-memory/")) {
    return [];
  }

  if (content.length > 200000) {
    return [{ rule: "audit-skipped", severity: "advice", line: 1, description: "File exceeds 200KB craft scan ceiling. Audit skipped." }];
  }

  const codeFindings = auditCodeCraft(norm, content);
  const docFindings = auditDocCraft(norm, content, projectRoot);
  const all = [...codeFindings, ...docFindings];
  return all.slice(0, 25);
}
