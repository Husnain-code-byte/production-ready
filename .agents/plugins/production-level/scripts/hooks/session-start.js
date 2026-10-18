#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import path from "node:path";
const target = path.resolve(import.meta.dirname, "../../../../../scripts/hooks/session-start.js");
process.argv[1] = target;
await import(pathToFileURL(target).href);
