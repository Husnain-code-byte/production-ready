export function formatCraftWarnings(findings) {
  return findings.map((f) => {
    const prefix = f.severity === "error" ? "[Craft Error]" : "[Craft Advice]";
    return `${prefix} (${f.rule}): line ${f.line} - ${f.description}`;
  });
}
