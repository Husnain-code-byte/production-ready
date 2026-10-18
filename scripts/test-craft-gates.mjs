import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { auditCodeCraft } from "./hooks/craft/detectors/code-detectors.js";
import { auditDocCraft } from "./hooks/craft/detectors/doc-detectors.js";
import { auditCraft } from "./hooks/craft/audit.js";

console.log("=== Running Craft Gates Test Suite ===");

// 1. Swallowed errors
const pyBareExcept = "try:\n    x = 1\nexcept:\n    pass";
const pyFindings = auditCodeCraft("src/app/core.py", pyBareExcept);
assert.ok(pyFindings.some(f => f.rule === "swallowed-error" && f.severity === "error"), "Must flag bare except");

const jsEmptyCatch = "try { x(); } catch (e) {}";
const jsFindings = auditCodeCraft("src/app/core.ts", jsEmptyCatch);
assert.ok(jsFindings.some(f => f.rule === "swallowed-error" && f.severity === "error"), "Must flag empty catch");

// 2. Debug output
const pyDebug = "print('debug info')";
const pyDebugFindings = auditCodeCraft("src/app/service.py", pyDebug);
assert.ok(pyDebugFindings.some(f => f.rule === "debug-output" && f.severity === "error"), "Must flag print in src/");

// 3. Assertion-free test
const pyTestNoAssert = "def test_something():\n    x = 1";
const pyTestFindings = auditCodeCraft("tests/test_something.py", pyTestNoAssert);
assert.ok(pyTestFindings.some(f => f.rule === "assertion-free-test" && f.severity === "error"), "Must flag assertion-free test");

// 4. Broken links
const docWithBrokenLink = "[Missing Doc](does-not-exist.md)";
const docFindings = auditDocCraft("docs/guide.md", docWithBrokenLink, process.cwd());
assert.ok(docFindings.some(f => f.rule === "broken-link" && f.severity === "error"), "Must flag broken relative link");

// 5. Vanity word
const docWithVanity = "Our system provides seamless integration.";
const vanityFindings = auditDocCraft("docs/guide.md", docWithVanity, process.cwd());
assert.ok(vanityFindings.some(f => f.rule === "vanity-word" && f.severity === "advice"), "Must flag vanity word as advice");

console.log("All Craft Gate test assertions PASSED (5/5).");
