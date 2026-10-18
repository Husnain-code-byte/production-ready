/**
 * Mutation Targets Extractor - Extracts all file targets from redirection & mutating commands.
 */

export function unquoteToken(tok) {
  if (!tok) return "";
  let s = String(tok).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.replace(/["']/g, "").replace(/\\(.)/g, "$1").trim();
}

export function extractMutationTargets(subCmd, normalizedSub) {
  const targets = [];
  const addTarget = (t) => {
    const clean = unquoteToken(t);
    if (clean && !clean.startsWith("&") && clean !== "/dev/null" && !clean.startsWith("-")) {
      targets.push(clean);
    }
  };

  // 1. Shell output redirections (>, >>, >|, &>, 2>, etc.)
  const redirRegex = /(?:^|[^<>0-9])(?:\d*>>?|\&>>?|>\|)\s*([^\s;&|()<>]+)/g;
  let rMatch;
  while ((rMatch = redirRegex.exec(subCmd)) !== null) {
    addTarget(rMatch[1]);
  }

  // 2. Command-specific file mutation utilities
  const norm = normalizedSub || "";
  const words = norm.split(/\s+/).filter(Boolean);
  const cmd = (words[0] || "").toLowerCase();

  if (cmd === "tee") {
    words.slice(1).forEach((w) => addTarget(w));
  } else if (cmd === "cp" || cmd === "mv" || cmd === "install") {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    nonFlags.forEach((w) => addTarget(w));
    const tMatch = norm.match(/(?:-t|--target-directory=)\s*([^\s;|&\n]+)/i);
    if (tMatch && tMatch[1]) addTarget(tMatch[1]);
  } else if (cmd === "chmod") {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    if (nonFlags.length > 1) nonFlags.slice(1).forEach((w) => addTarget(w));
  } else if (cmd === "ln") {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    nonFlags.forEach((w) => addTarget(w));
  } else if (cmd === "rsync") {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    nonFlags.forEach((w) => addTarget(w));
  } else if (cmd === "sed" && norm.includes("-i")) {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    if (nonFlags.length > 1) nonFlags.slice(1).forEach((w) => addTarget(w));
  } else if (cmd === "perl" && norm.includes("-pi")) {
    const nonFlags = words.slice(1).filter((w) => !w.startsWith("-"));
    if (nonFlags.length > 1) nonFlags.slice(1).forEach((w) => addTarget(w));
  } else if (cmd === "curl") {
    const m = norm.match(/(?:-o|--output)\s+([^\s;&|]+)/i);
    if (m && m[1]) addTarget(m[1]);
  } else if (cmd === "wget") {
    const m = norm.match(/(?:-O|--output-document=)\s*([^\s;&|]+)/i);
    if (m && m[1]) addTarget(m[1]);
  } else if (cmd === "git" && (words[1] === "checkout" || words[1] === "restore")) {
    const dashDash = words.indexOf("--");
    if (dashDash !== -1 && dashDash < words.length - 1) {
      words.slice(dashDash + 1).forEach((w) => addTarget(w));
    }
  }

  return targets;
}
