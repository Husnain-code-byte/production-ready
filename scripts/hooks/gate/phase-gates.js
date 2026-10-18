import fs from "node:fs";
import path from "node:path";

export const UNPOPULATED_MARKERS = [
  "[Product Name]", "[Company Name]", "[Insert C4 System Context", "[Feature name]",
  "| — | — | — | — | — |", "*No subsystems mapped yet.*", "*No features registered yet.*",
  "*No verification reports recorded yet.*", "*No production feedback recorded yet.*",
  "[2-3 paragraphs describing the customer problem]", "[JWT / OAuth2 / API Keys]",
  "[RBAC / ABAC / custom]", "| — | No decisions recorded yet |", "*Last updated: [Date].",
  "[Short title of solved problem and solution]",
];

export const UNPOPULATED_PATTERNS = [
  /\[(?:Product Name|Company Name|Insert C4|Feature name|Date|Short title)[^\]]*\]/i,
  /\|\s*—\s*\|\s*—\s*\|\s*—\s*\|/,
  /\*No (?:subsystems|features|verification reports|production feedback) (?:mapped|registered|recorded) yet\.\*/i,
];

export function isArtifactPopulated(targetPath) {
  if (!fs.existsSync(targetPath)) return false;
  try {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(targetPath).filter((f) => !f.startsWith("."));
      return files.length > 0;
    }
    const content = fs.readFileSync(targetPath, "utf8");
    if (content.trim().length < 80) return false;

    for (const marker of UNPOPULATED_MARKERS) {
      if (content.includes(marker)) return false;
    }
    for (const pat of UNPOPULATED_PATTERNS) {
      if (pat.test(content)) return false;
    }

    const normPath = targetPath.replace(/\\/g, "/");

    // Phase 5 gate: column 4 of Feature Table must be VERIFIED, COMMITTED, or RELEASED
    if (normPath.endsWith("05-feature-registry.md")) {
      const tableMatch = content.match(/## Feature Table\s*\n([\s\S]*?)(?:\n---|\n## Summary|$)/i);
      if (!tableMatch) return false;
      const rows = tableMatch[1].split("\n").filter((l) => /^\s*\|\s*[^|\s-]+\s*\|/.test(l) && !l.includes("| — |"));
      const hasVerified = rows.some((row) => {
        const cols = row.split("|").map((c) => c.trim());
        const statusCol = cols[4] || "";
        return /\b(VERIFIED|COMMITTED|RELEASED)\b/i.test(statusCol);
      });
      if (!hasVerified) return false;
    }

    // Phase 6 gate: session log must contain completed Phase 6 integration
    if (normPath.endsWith("06-session-log.md")) {
      const sessionBlocks = content.split(/## (?:Session|Snapshot):/i).slice(1);
      const hasCompletedPhase6 = sessionBlocks.some((block) => {
        const isPhase6 = /-\s*(?:\*\*)?Phase(?:\*\*)?:\s*(?:Phase\s*6|6\b|Subsystem Integration)/i.test(block);
        const isCompleted = /-\s*(?:\*\*)?(?:Status|Done)(?:\*\*)?:\s*(?:completed|verified|done|integrated)\b/i.test(block);
        return isPhase6 && isCompleted;
      });
      if (!hasCompletedPhase6) return false;
    }

    // Phase 7 gate: verification report must contain verified PASS verdict
    if (normPath.endsWith("08-verification-report.md")) {
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return parsed.verdict === "PASS";
        } catch {}
      }
      const tablePass = /\|\s*Overall\s*\|\s*PASS\s*\|/i.test(content) || /\|\s*PASS\s*\|\s*100%\s*\|/i.test(content);
      const structuredReceipt = /-\s*(?:\*\*)?Verdict(?:\*\*)?:\s*PASS\b/i.test(content) || /##\s*Verdict:\s*PASS\b/i.test(content);
      return tablePass || structuredReceipt;
    }

    return true;
  } catch {
    return false;
  }
}

export function calculatePhase(phaseGates, projectRoot = process.cwd()) {
  let currentPhase = 0;
  for (const gate of phaseGates) {
    const checkPath = path.join(projectRoot, gate.check);
    if (isArtifactPopulated(checkPath)) {
      currentPhase = gate.phase + 1;
      if (currentPhase > 8) currentPhase = 8;
    } else {
      currentPhase = gate.phase;
      break;
    }
  }
  return currentPhase;
}
