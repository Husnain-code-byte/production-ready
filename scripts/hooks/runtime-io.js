import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function findProjectRoot(startDir = process.cwd()) {
  let curr = path.resolve(startDir);
  for (let i = 0; i < 6; i++) {
    if (
      fs.existsSync(path.join(curr, "project-memory")) ||
      fs.existsSync(path.join(curr, "AGENTS.md"))
    ) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return startDir;
}

export function resolvePayloadRoot(payload) {
  const candidate =
    (Array.isArray(payload?.workspacePaths) && payload.workspacePaths[0]) ||
    payload?.cwd ||
    payload?.directory ||
    process.cwd();
  return findProjectRoot(candidate);
}

export function resolveToolArgs(payload) {
  return payload?.toolCall?.args || payload?.toolCall?.arguments || payload?.args || {};
}

export function isMainModule(metaUrl) {
  if (!process.argv[1]) return false;
  try {
    return (
      metaUrl === pathToFileURL(fs.realpathSync(process.argv[1])).href ||
      metaUrl === pathToFileURL(path.resolve(process.argv[1])).href
    );
  } catch {
    return false;
  }
}

export async function readStdinJson() {
  if (process.stdin.isTTY) return {};
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeStdoutJson(payload) {
  process.stdout.write(JSON.stringify(payload) + "\n");
}
