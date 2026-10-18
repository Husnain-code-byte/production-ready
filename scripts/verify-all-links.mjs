import fs from "node:fs";
import path from "node:path";
import { auditDocCraft } from "./hooks/craft/detectors/doc-detectors.js";

const ROOT = process.cwd();

function walk(dir, mdFiles = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === ".git" || item === "node_modules") continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, mdFiles);
    } else if (item.endsWith(".md")) {
      mdFiles.push(path.relative(ROOT, full));
    }
  }
  return mdFiles;
}

const mdFiles = walk(ROOT);
console.log(`Auditing ${mdFiles.length} markdown files for broken relative links...`);

let issues = 0;
for (const relPath of mdFiles) {
  const content = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  const findings = auditDocCraft(relPath, content, ROOT);
  const brokenLinks = findings.filter(f => f.rule === "broken-markdown-link");
  if (brokenLinks.length > 0) {
    console.log(`Broken links in ${relPath}:`);
    for (const d of brokenLinks) {
      console.log(`  - line ${d.line}: ${d.description}`);
      issues++;
    }
  }
}

if (issues === 0) {
  console.log("All markdown files passed link and doc-craft audit cleanly (0 issues)!");
} else {
  console.log(`Total doc issues found: ${issues}`);
}
