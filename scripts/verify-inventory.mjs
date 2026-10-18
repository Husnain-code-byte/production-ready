import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir, fileList = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === ".git" || item === "node_modules") continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, fileList);
    } else {
      fileList.push({
        path: path.relative(ROOT, full),
        size: stat.size,
      });
    }
  }
  return fileList;
}

const files = walk(ROOT);
console.log(`Total files in repository: ${files.length}`);

// Group by top-level
const groups = {};
for (const f of files) {
  const top = f.path.split(path.sep)[0];
  groups[top] = (groups[top] || 0) + 1;
}

console.log("\nBreakdown by top-level:");
for (const [top, count] of Object.entries(groups)) {
  console.log(`  ${top.padEnd(20)} : ${count} files`);
}

// Check for zero-byte files
const zeroByte = files.filter(f => f.size === 0);
if (zeroByte.length > 0) {
  console.log(`\nWarning: Zero-byte files found (${zeroByte.length}):`);
  for (const z of zeroByte) {
    console.log(`  ${z.path}`);
  }
} else {
  console.log("\nZero-byte file check: Clean (all files have non-zero content).");
}
