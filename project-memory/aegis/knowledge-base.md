# Knowledge Base

## Google Antigravity Patterns
- `mode: subagent` hides agents from TUI selector — removed from all 23 sub-agents for visibility
- Block YAML required for `tools` field — flow mapping `{}` treated as string by parser
- Permission values in agent frontmatter: `allow`, `deny`, `ask` (not `"never"`)
- Path-based permissions have catch-all precedence bug (issue #13646) — scope-enforcer plugin is the reliable approach

## Production Level Patterns
- One atomic feature per session
- Spec before code
- Cross-model adversarial review: Gemini 3.8 Flash (builder) → Claude Sonnet 5.5 (auditor) → Claude Opus 5.5 (apex arbitrator)
- 5A-5F atomic build loop per feature (5A Spec → 5B Red Tests → 5C Green Code → 5D Verification → 5E Refactoring → 5F Registry)

---
