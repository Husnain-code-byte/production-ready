import { AGENT_SCOPES } from "./agent-scopes.js";
import { commandMatches, hasInterpreterEval, normalizeCommand, splitShellCommands } from "./command-parser.js";
import { extractMutationTargets } from "./mutation-targets.js";
import { checkScope, normalizeAgentName } from "./scope-checker.js";

export function checkBashScope(agentName, command, projectRoot = "") {
  const normalizedAgent = normalizeAgentName(agentName);
  const agent = AGENT_SCOPES[normalizedAgent];
  if (!agent) {
    return { allowed: false, reason: `[SCOPE VIOLATION] Unknown agent identity "${agentName}". Access denied.` };
  }

  const raw = String(command || "");
  const normRaw = normalizeCommand(raw);

  // 1. Global git mutation blocks
  if (/(?:^|[\s;|&`$()<>"'])(?:(?:\/usr\/(?:local\/)?bin\/)?git(?:\s+-[^\s]+)*\s+(?:commit|push|reset\s+--hard|clean\s+-[a-zA-Z]*f|stash\s+drop)|npx\s+git-commit)\b/i.test(raw) ||
      /(?:^|[\s;|&`$()<>"'])(?:(?:\/usr\/(?:local\/)?bin\/)?git(?:\s+-[^\s]+)*\s+(?:commit|push|reset\s+--hard|clean\s+-[a-zA-Z]*f|stash\s+drop)|npx\s+git-commit)\b/i.test(normRaw) ||
      /\bGIT_DIR=.*git\s+commit\b/i.test(raw) || /\balias\s+[a-zA-Z0-9_]+=\s*["']?git\b/i.test(raw) ||
      /\bgit\s+(?:-[^\s]+\s+)*(?:--config-env|-c\s+(?:core\.pager|alias\.|core\.editor|credential\.helper)|--exec-path|--upload-pack)/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: ${normalizedAgent} cannot commit, push, or execute arbitrary git payloads directly via shell.` };
  }

  // 2. Package publishing block
  if (/\b(?:npm|pnpm|bun|cargo)\s+publish\b/i.test(raw) || /\b(?:npm|pnpm|bun|cargo)\s+publish\b/i.test(normRaw)) {
    return { allowed: false, reason: `Production Level Rule: Package publishing is strictly forbidden for ${normalizedAgent}.` };
  }

  // 3. Interpreter execution flag evasion (DEF-01)
  if (hasInterpreterEval(raw) || hasInterpreterEval(normRaw)) {
    return { allowed: false, reason: `Production Level Rule: Interpreter inline code execution is forbidden.` };
  }

  // 4. Recursive directory removal block
  if (/\brm\s+.*(?:-[a-zA-Z]*[rR]|--recursive)\b/i.test(raw) || /\brm\s+-(?:rf|fr|r\s+-f|f\s+-r)\b/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Recursive directory removal is strictly forbidden for ${normalizedAgent}.` };
  }

  // 5. Dangerous piping and indirection
  if (/\|\s*(?:bash|sh|zsh|dash|ksh)\b/i.test(raw) || /\b(?:coproc|exec)\s+/i.test(raw) || /\bxargs\b/i.test(raw) || /\bfind\b.*-exec\b/i.test(raw) || /\bbase64\s+-d\s*\|\s*(?:sh|bash)\b/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Shell piping/indirection is strictly forbidden for ${normalizedAgent}.` };
  }

  // 6. Shell inspection of sensitive files (DEF-04)
  if (/\b(?:cat|head|tail|less|more|od|xxd|strings|hexdump|grep|egrep|awk|sed|git\s+(?:diff|show|log))\s+.*?(?:\.env\b|secrets\/|.*\.pem|.*\.key|id_rsa)/i.test(raw)) {
    if (!/\.env\.(?:template|example|sample|defaults)\b/i.test(raw)) {
      return { allowed: false, reason: `Production Level Rule: Shell inspection of sensitive files is forbidden.` };
    }
  }

  if (/\bgit\s+(?:log|diff)\s+.*--output/i.test(raw) || /\bgit\s+branch\s+.*(?:-[dDmM]|--delete|--move)\b/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Git file output / branch mutation is forbidden for ${normalizedAgent}.` };
  }

  if (/\bpytest\s+.*(?:-p\s+evil|--rootdir\s+\/)/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Pytest arbitrary plugin loading is forbidden.` };
  }

  if (normalizedAgent === "database-designer" && /\b(?:reset|--force|--accept-data-loss|db\s+execute)\b/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Destructive database migration is strictly forbidden.` };
  }

  if (/\bmake\s+.*?(?:SHELL=|-e\b|--environment-overrides|--eval\b)/i.test(raw)) {
    return { allowed: false, reason: `Production Level Rule: Make shell execution overrides are forbidden.` };
  }

  const scope = agent.bash;
  if (!scope) return { allowed: true };

  const subCommands = splitShellCommands(command);
  if (subCommands.length === 0) return { allowed: true };

  for (const subCmd of subCommands) {
    const normalizedSub = normalizeCommand(subCmd);
    if (hasInterpreterEval(subCmd) || hasInterpreterEval(normalizedSub)) {
      return { allowed: false, reason: `Production Level Rule: Interpreter inline code execution is forbidden.` };
    }

    // Explicit non-wildcard denies
    if (scope.deny && scope.deny.length > 0) {
      for (const pattern of scope.deny) {
        if (pattern !== "*" && (commandMatches(subCmd, pattern) || commandMatches(normalizedSub, pattern))) {
          return { allowed: false, reason: `Production Level Rule: ${normalizedAgent} cannot execute: ${subCmd}` };
        }
      }
    }

    // Inspect shell output redirection & file-mutating commands (DEF-02)
    const redirectTargets = extractMutationTargets(subCmd, normalizedSub);
    for (const targetFile of redirectTargets) {
      const editCheck = checkScope(agentName, "edit", targetFile, projectRoot);
      if (!editCheck.allowed) {
        return {
          allowed: false,
          reason: `Production Level Bash File-Mutation Blocked: ${normalizedAgent} cannot write/redirect to "${targetFile}" (${editCheck.reason})`,
        };
      }
    }

    // Check explicit allows
    let matchedAllow = false;
    if (scope.allow && scope.allow.length > 0) {
      matchedAllow = scope.allow.some((pattern) => commandMatches(subCmd, pattern) || commandMatches(normalizedSub, pattern));
    }

    if (!matchedAllow) {
      if (scope.deny && scope.deny.includes("*")) {
        return { allowed: false, reason: `Production Level Rule: ${normalizedAgent} is not permitted to run shell command: ${subCmd}` };
      }
      if (scope.allow && scope.allow.length > 0) {
        return { allowed: false, reason: `Production Level Scope Boundary: ${normalizedAgent} can only run: ${scope.allow.join(", ")}` };
      }
    }
  }

  return { allowed: true };
}
