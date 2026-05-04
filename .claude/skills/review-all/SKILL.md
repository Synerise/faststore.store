---
name: review-all
description: >
  Use this skill when the user asks for a full audit, batch review, review all
  components, overall health check, status overview, or wants a dashboard
  across all section components in a FastStore + Synerise project. Audits
  every component under src/components/sections/ against 5 architectural rules
  and produces a summary dashboard.
metadata:
  author: synerise
  version: "1.0.0"
  lastUpdated: 2026-05-04
---

# Review All Section Components (FastStore + Synerise)

Batch audit across every section component in `src/components/sections/`. This skill iterates components and reuses per-rule logic from the `review-component` skill — it does NOT redefine the rules. Its unique role is the cross-component dashboard and aggregate views.

## Step 0: Verify project context

This skill is only valid in a FastStore + Synerise project. Before running, confirm at least one of these signals:

- `package.json` lists `@synerise/faststore-api` as a dependency, OR
- `src/components/sections/` directory exists, OR
- `discovery.config.js` file exists at the repo root.

If none are present, stop and tell the user:
> This doesn't look like a FastStore + Synerise project (no `@synerise/faststore-api` dep, no `src/components/sections/`, no `discovery.config.js`). Skipping audit.

## Step 1: List components

List every direct child directory under `src/components/sections/`. Each one is a component to review.

## Step 2: Per-component review

For EACH component, apply the rule criteria defined in the `review-component` skill. Do NOT redefine them here — read that skill's Rule 1–5 sections and apply them in turn. The shared sub-skills `readme-rules` and `design-tokens` provide the canonical references for Rule 4 and Rule 5 respectively.

Quick rule reminder (full criteria live in `review-component`):

1. **No Frontend API Calls** — only `useQuery` / `request` for data fetching; no `fetch`, `axios`, or direct SDK client instantiation.
2. **SDK Patterns** — reuse existing `syneriseAIRecommendations` / `syneriseAISearch` resolvers; only build a custom resolver + typeDef + hook when the SDK has no equivalent.
3. **Code Organization** — shared types in `src/types/`, shared hooks in `src/hooks/`, no duplicate type defs.
4. **README** — present, follows `readme-rules` structure, listed in root README index.
5. **SCSS Design Tokens** — no hardcoded values that have a token equivalent in the merged token list (VTEX cache + project overrides).

Output one terse status row per component (NOT the full per-rule report from `review-component` — that is for single-component deep dives):

```
### [ComponentName]
- Rule 1 (No Direct API): [PASS/FAIL] — [brief reason if FAIL]
- Rule 2 (SDK Patterns): [PASS/FAIL/N/A] — [brief reason if FAIL]
- Rule 3 (Organization): [PASS/FAIL/WARN] — [brief reason if not PASS]
- Rule 4 (README): [PASS/FAIL/WARN] — [exists with all sections / missing sections / no README]
- Rule 5 (Design Tokens): [PASS/FAIL/N/A] — [brief reason if FAIL]
```

Status semantics (PASS / FAIL / WARN / N/A) and per-rule applicability are defined canonically in the `review-component` skill — see its "Status semantics" subsection. Apply them identically here.

## Step 3: Aggregate dashboard

After all individual rows, produce a summary dashboard:

```
# Component Review Dashboard
Date: [today's date]

| Component | Rule 1: No Direct API | Rule 2: SDK Patterns | Rule 3: Organization | Rule 4: README | Rule 5: Design Tokens |
|---|---|---|---|---|---|
| [Name] | [PASS/FAIL] | [PASS/FAIL/N/A] | [PASS/FAIL/WARN] | [PASS/FAIL/WARN] | [PASS/FAIL/N/A] |
| ... | ... | ... | ... | ... | ... |

## Critical Violations (must fix)
[Rule 1 violations: components making direct API calls. Include specific file paths and what resolver/typeDef/hook needs to be created.]

## Warnings (should fix)
[Rule 3 organization issues, naming convention violations, missing barrel exports, README warnings.]

## Missing READMEs
[Components without README.md or with incomplete README. For each, suggest invoking the create-readme skill with the component path.]

## Root README Index Drift
[Components missing from the root README "Available Section Components" table, broken links, or descriptions that no longer match the component README intro.]

## Refactoring Candidates
[Rule 1 / Rule 2 violations needing full resolver + typeDef + hook refactoring. For each:]
1. [Component] — needs: [resolver file], [typeDef file], [hook refactoring]
```

## Notes

- The 5 architectural rules and their application criteria are defined canonically in the `review-component` skill. This skill does not redefine them — when `review-component` evolves, the criteria automatically follow.
- Per-rule check details live in the `review-component` skill — keep them in sync there, not here.
- For a full per-rule report with violation snippets and fixes for ONE component, the user should invoke `review-component` directly.
- If a reference implementation is needed for comparison, identify a component in this repo that already passes all 5 rules (typically one with a complete README, SDK-resolver-backed hook, shared types in `src/types/`, and a `.module.scss` using only design tokens) and cite it in the report. Do not hardcode a specific component name — the canonical example varies per store.
