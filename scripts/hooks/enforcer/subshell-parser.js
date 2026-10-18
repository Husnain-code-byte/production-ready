/**
 * Subshell Parser - Recursively parses subshells, process substitutions, and chains.
 */

export function isEscaped(str, idx) {
  let backslashes = 0;
  let k = idx - 1;
  while (k >= 0 && str[k] === "\\") {
    backslashes++;
    k--;
  }
  return backslashes % 2 === 1;
}

export function splitTopLevelChains(cmd) {
  const parts = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (ch === '"' && !inSingle && !isEscaped(cmd, i)) {
      inDouble = !inDouble;
      current += ch;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
    } else if (!inDouble && !inSingle) {
      const twoChar = cmd.slice(i, i + 2);
      if (twoChar === "&&" || twoChar === "||" || twoChar === "|&") {
        if (current.trim()) parts.push(current.trim());
        current = "";
        i++;
      } else if (ch === ";" || ch === "|" || ch === "&" || ch === "\n") {
        if (ch === "&" && (cmd[i - 1] === ">" || cmd[i - 1] === "<" || cmd[i + 1] === ">")) {
          current += ch;
        } else {
          if (current.trim()) parts.push(current.trim());
          current = "";
        }
      } else current += ch;
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function extractSubshells(cmd) {
  const results = [];
  let i = 0;
  while (i < cmd.length) {
    if ((cmd[i] === "$" || cmd[i] === "<" || cmd[i] === ">") && cmd[i + 1] === "(" && !isEscaped(cmd, i)) {
      let depth = 1;
      let start = i + 2;
      let j = start;
      let inS = false;
      let inD = false;
      while (j < cmd.length && depth > 0) {
        if (cmd[j] === '"' && !inS && !isEscaped(cmd, j)) inD = !inD;
        else if (cmd[j] === "'" && !inD) inS = !inS;
        else if (!inS && !inD) {
          if (cmd[j] === "(" && !isEscaped(cmd, j)) depth++;
          else if (cmd[j] === ")" && !isEscaped(cmd, j)) depth--;
        }
        j++;
      }
      if (depth === 0) {
        const inner = cmd.slice(start, j - 1).trim();
        if (inner) {
          results.push(inner);
          results.push(...splitShellCommands(inner));
        }
        i = j;
        continue;
      }
    } else if (cmd[i] === "`" && !isEscaped(cmd, i)) {
      let j = i + 1;
      while (j < cmd.length && (cmd[j] !== "`" || isEscaped(cmd, j))) j++;
      if (j < cmd.length) {
        const inner = cmd.slice(i + 1, j).trim();
        if (inner) {
          results.push(inner);
          results.push(...splitShellCommands(inner));
        }
        i = j + 1;
        continue;
      }
    }
    i++;
  }
  return results;
}

export function splitShellCommands(cmd) {
  if (!cmd) return [];
  const results = [];
  results.push(...extractSubshells(cmd));

  const chains = splitTopLevelChains(cmd);
  for (const sub of chains) {
    results.push(sub);
    const unp = sub.replace(/^\s*\(+\s*|\s*\)+\s*$/g, "").trim();
    if (unp && unp !== sub) results.push(unp);

    const forMatch = sub.match(/\bdo\s+([\s\S]+?)\s+done\b/i);
    if (forMatch && forMatch[1]) results.push(...splitShellCommands(forMatch[1]));
    const ifMatch = sub.match(/\bthen\s+([\s\S]+?)(?:\s+else\s+([\s\S]+?))?\s+fi\b/i);
    if (ifMatch) {
      if (ifMatch[1]) results.push(...splitShellCommands(ifMatch[1]));
      if (ifMatch[2]) results.push(...splitShellCommands(ifMatch[2]));
    }
  }

  return results;
}
