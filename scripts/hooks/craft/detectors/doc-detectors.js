import fs from "node:fs";
import path from "node:path";

const VANITY_WORDS = ["world-class", "world class", "seamless", "seamlessly", "bulletproof", "effortless", "effortlessly", "flawless", "flawlessly"];

function stripFencesAndInlineCode(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");
}

export function auditDocCraft(relPath, content, projectRoot) {
  const findings = [];
  const norm = relPath.replace(/\\/g, "/");
  if (!norm.endsWith(".md")) return findings;

  const lines = content.split(/\r\n|\r|\n/);
  const proseOnly = stripFencesAndInlineCode(content);

  // 1. Vanity words in prose (Advice tier)
  for (const w of VANITY_WORDS) {
    const regex = new RegExp(`\\b${w}\\b`, "i");
    if (regex.test(proseOnly)) {
      findings.push({
        rule: "vanity-word",
        severity: "advice",
        line: 1,
        description: `Documentation contains vanity word '${w}'. Replace with objective metrics or specifications.`,
      });
      break;
    }
  }

  // 2. Relative links check (Error tier)
  if (norm.startsWith("docs/")) {
    const fileDir = path.dirname(path.isAbsolute(relPath) ? relPath : path.join(projectRoot, relPath));
    const linkRe = /\[([^\]]+)\]\(([^)\s#]+)(?:#[^)]*)?\)/g;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      while ((match = linkRe.exec(line)) !== null) {
        const target = match[2];
        if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
        const resolved = path.resolve(fileDir, target);
        const rootNorm = path.resolve(projectRoot);
        if (!resolved.startsWith(rootNorm)) {
          findings.push({
            rule: "link-escapes-root",
            severity: "error",
            line: i + 1,
            description: `Link '${target}' resolves outside project root.`,
          });
        } else if (!fs.existsSync(resolved)) {
          findings.push({
            rule: "broken-link",
            severity: "error",
            line: i + 1,
            description: `Broken relative link '${target}' does not exist on disk.`,
          });
        }
      }
    }
  }

  return findings;
}
