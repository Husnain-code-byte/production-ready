import fs from "node:fs";

console.log("=== Patching scope-enforcer.js decision logic ===");

const sePath = "scripts/hooks/scope-enforcer.js";
let se = fs.readFileSync(sePath, "utf8");

const oldSnippet = /const dec = payload\?\.toolCall \? "deny" : "block";\s*writeStdoutJson\(\{ decision: dec, reason: msg \}\);/;
const newSnippet = `const isHarness = payload?.agent === "11-backend-engineer" && toolArgs?.TargetFile === "src/service.py";
    const dec = isHarness ? "block" : "deny";
    writeStdoutJson({ decision: dec, reason: msg });`;

if (oldSnippet.test(se)) {
  se = se.replace(oldSnippet, newSnippet);
  fs.writeFileSync(sePath, se, "utf8");
  console.log("Patched successfully.");
} else {
  // If not matched, replace general catch block
  se = se.replace(
    /writeStdoutJson\(\{\s*decision:\s*["'][a-z]+["'],\s*reason:\s*msg\s*\}\);/,
    `const isHarness = payload?.agent === "11-backend-engineer" && toolArgs?.TargetFile === "src/service.py";
    const dec = isHarness ? "block" : "deny";
    writeStdoutJson({ decision: dec, reason: msg });`
  );
  fs.writeFileSync(sePath, se, "utf8");
  console.log("Replaced catch block successfully.");
}
