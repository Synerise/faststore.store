---
name: review-component
description: >
  Use this skill when the user asks to review a component, audit a section
  component, check a component path, run a code review on a FastStore section,
  or wants feedback on a specific component in a FastStore + Synerise project.
  Reviews against 5 architectural rules and produces a structured report with
  priority fixes. Component path is the skill argument.
metadata:
  author: synerise
  version: "1.0.0"
  lastUpdated: 2026-05-04
---

# Review Single Section Component (FastStore + Synerise)

Review the component at the path provided as the skill argument.

Perform a structured code review against this project's 5 architectural rules (defined canonically in `CLAUDE.md`). Follow each step precisely.

## Step 0: Verify project context

This skill is only valid in a FastStore + Synerise project. Before running, confirm at least one of these signals:

- `package.json` lists `@synerise/faststore-api` as a dependency (strongest signal), OR
- `src/components/sections/` directory exists, OR
- `discovery.config.js` file exists at the repo root.

If none are present, stop and tell the user:
> This doesn't look like a FastStore + Synerise project (no `@synerise/faststore-api` dep, no `src/components/sections/`, no `discovery.config.js`). Skipping review.

## Step 1: Inventory

Read ALL files in the component directory. List them by category:
- Component (.tsx)
- Types (.types.ts)
- Hooks (hooks/ directory or inline)
- Styles (.module.scss)
- Tests (.test.ts/.test.tsx)
- README (README.md)
- Other

## Step 2: Trace Dependencies

For each import in the component files:
1. If it references a hook in `src/hooks/` or a local `hooks/` directory — read that hook file
2. If the hook uses `useQuery` with a `gql` query — identify which thirdParty resolver handles it
3. Read the corresponding resolver in `src/graphql/thirdParty/resolvers/`
4. If the resolver imports from `../clients` — follow the import and read the client factory in `src/graphql/thirdParty/clients/[feature]/`. This is where the factory function and the actual HTTP call live for features with dedicated client modules.
5. Read the corresponding typeDef in `src/graphql/thirdParty/typeDefs/`
6. Check if types come from `src/types/`, local `.types.ts` files, or `src/graphql/thirdParty/clients/[feature]/[feature].types.ts`

## Step 3: Check Rules

### Rule 1 — No Frontend API Calls

Search ALL component files AND all hooks used by this component (both local `hooks/` and shared `src/hooks/`) for:
- `fetch(` calls (except imports of fetchAPI/fetchWithAuth which are server-side only)
- `axios` usage
- Direct instantiation of SDK clients (e.g., `SyneriseSearchClient(`)
- Any HTTP client that is NOT going through `useQuery()` or `request()`

The ONLY acceptable frontend data-fetching patterns are:
- `useQuery()` from `src/sdk/graphql/useQuery`
- `request()` from `src/sdk/graphql/request`

### Rule 2 — SDK Patterns

Check the full data-fetching chain for each data source the component uses:

**Step 2a — Check for existing SDK resolver reuse:**

Before reviewing custom resolver code, determine if the component's data source is already covered by `@synerise/faststore-api`:
- **Recommendations** (`/recommendations/v2/recommend/campaigns/`) → MUST use `syneriseAIRecommendations` query. This includes product shelves, banners, category recommendations, and any personalized content from recommendation campaigns.
- **Search** (`/search/v2/`, autocomplete, listing) → MUST use `syneriseAISearch` query. This provides `search(query, ...)`, `autocomplete(query, ...)`, and `listing(...)` methods. Includes full-text search, autocomplete suggestions, product browsing, and visual search.

If the component calls an API endpoint already handled by an SDK resolver but does NOT use that resolver (e.g., calls fetch directly or creates a custom resolver for the same endpoint), flag it as a **Rule 2 violation: SDK resolver not reused**.

**Fix guidance for recommendation-based components:** Refactor the hook to use the existing `syneriseAIRecommendations` query via `useQuery`. The hook should call `gql()` from `@generated/gql` with a query selecting `recommendations(clientUUID, items, ...)` and read the appropriate fields from the response — `data` for products, `extras.slots[].rows[].metadata` for category/image metadata. If a working recommendation hook already exists elsewhere in this repo (search `src/` for `syneriseAIRecommendations`), use it as a local reference.

**Fix guidance for search-based components:** Refactor the hook to use the existing `syneriseAISearch` query via `useQuery`. Pick the method that matches the use case: `autocomplete(query, ...)` for typeahead suggestions, `search(query, page, limit, sortBy, ...)` for full-text search results, `listing(page, limit, ...)` for browsing without a query. All return `{ data: StoreProduct[], extras, meta }`. If a working search hook already exists elsewhere in this repo (search `src/` for `syneriseAISearch`), use it as a local reference.

**Step 2b — Hook checklist:**
- Uses `gql()` from `@generated/gql` for typed queries?
- Uses `useQuery<GeneratedType>()` from `src/sdk/graphql/useQuery`?
- Returns `{ data, error, loading }` pattern?

**Step 2c — Custom resolver checklist (only for features NOT in the SDK):**
- Root query creates a client factory instance and returns it?
- Nested resolver type named `SyneriseXyzResult` calls client methods?
- Config validated with clear error messages (`throw new Error(...)`)?
- Default export has `{ Query }`, named export for `SyneriseXyzResult`?
- Merged into `src/graphql/thirdParty/resolvers/index.ts`?

**TypeDef checklist (only for custom resolvers):**
- Feature-specific `.graphql` file exists in `src/graphql/thirdParty/typeDefs/`?
- Uses `SyneriseXyzResult` naming convention?
- Referenced in `query.graphql`?

**Client checklist (only for custom resolvers):**
Client code lives either inline in the resolver file or in `src/graphql/thirdParty/clients/[feature]/` (imported via `../clients`). Check whichever location applies:
- Factory function pattern (not class)?
- Uses `fetchAPI` or `fetchWithAuth` (not raw `fetch`)?
- If in `clients/`: types exported from `[feature].types.ts` in the same directory?

If the component makes direct API calls instead of going through GraphQL, flag this as a Rule 2 violation and describe what refactoring would look like — either reuse an existing SDK resolver or build the custom resolver + typeDef + hook pipeline.

### Rule 3 — Code Organization

- Are shared types in `src/types/` and component-specific types in `[Component].types.ts`?
- Are shared hooks in `src/hooks/` and component-specific hooks in `[Component]/hooks/`?
- Search for type names defined in this component across the entire `src/` directory — are there duplicates?
- If a type or hook is used by multiple components, is it in the shared location?
- Are barrel exports (`index.ts`) updated for any shared items?

### Rule 4 — README.md

First, consult the `readme-rules` skill.

Then check:
- Does the component directory contain a `README.md`?
- If no, flag as FAIL and suggest invoking the `create-readme` skill with the component path
- If yes, verify it against the required sections from readme-rules:
  1. Title + Description
  2. How It Works (numbered flow, error/loading/empty states)
  3. Props table
  4. Dependencies (npm, hooks, types, utils, GraphQL — as sub-tables)
  5. GraphQL Operations (complete, copy-pasteable query/mutation blocks)
  6. API Response Example (sample JSON from Synerise)
  7. Authentication (method, where credentials come from)
  8. Data Mapping (API field → component property → where rendered)
  9. CMS Configuration (JSON schema block)
  10. File Structure (directory tree)
  11. Implementing in Another Store (step-by-step guide)
- Verify accuracy: do props match types file? Does query match hook code? Does CMS JSON match sections.json?
- Flag any missing or inaccurate sections
- Verify the **Project README Index** in the root `README.md`:
  - The component appears as a row in the **Available Section Components** table
  - The link points to `./src/components/sections/<Name>/README.md` and resolves
  - The one-sentence description matches the component README's current intro
  - Flag a missing/stale row as a Rule 4 issue and suggest the exact row to add or update

### Rule 5 — SCSS Design Tokens

**Step 5a — Load the canonical token list:**

Consult the `design-tokens` skill. It returns the **merged** list of FastStore tokens from two sources: the VTEX cache at `docs/design-tokens.md` and the project overrides in `src/themes/custom-theme.scss`. Each token is annotated with `[vtex]` or `[project]`. Use that merged list as the canonical reference for what tokens exist — do NOT rely on memory or a hardcoded subset, and do NOT flag a token as missing just because it's only in the project overrides.

In the final report, include the VTEX cache's `Last refreshed` date so the reader knows how fresh that half of the list is. If the cache is over 6 months old, suggest running the `refresh-design-tokens` skill before relying on the audit. The project-overrides half is read live from the working tree, so freshness is not a concern there.

**Step 5b — Audit the component's `.module.scss`:**

Read the component's `.module.scss` file and flag hardcoded values that have a token equivalent in the loaded list:

- **Hardcoded hex (`#xxx`, `#xxxxxx`) or `rgb()`/`rgba()`** → must use a `--fs-color-*` token.
- **Hardcoded `px`/`rem` for `padding`, `margin`, `gap`** → must use a `--fs-spacing-*` token.
- **Hardcoded `font-size`, `font-weight`, `font-family`** → must use a `--fs-text-size-*`, `--fs-text-weight-*`, or `--fs-text-face-*` token.
- **Hardcoded `border-radius`, `border-width`, `border-color`** → must use a `--fs-border-*` token.
- **Hardcoded `transition` timing/easing** → must use a `--fs-transition-*` token.

**Structure** — check that styles are wrapped in `@layer components { }` (matching sibling section pattern).

**Acceptable exceptions:**
- `width: 100%`, `max-width: 100%`, `display:`, `position:`, `object-fit:` and similar layout properties with no token equivalent
- Breakpoint media queries using raw `768px` etc. (mirrors sibling pattern)
- `linear-gradient` with `rgba()` for skeleton/shimmer animations
- `0` values (e.g., `margin: 0`, `padding: 0`)

When flagging a violation, suggest the **specific token name** from the loaded list (e.g., "Replace `padding: 12px` with `var(--fs-spacing-2)`"), not a generic "use a token" message. If no exact match exists in the loaded list, say so — do not invent a token name.

## Step 4: Report

### Status semantics (canonical — also used by `review-all`)

Use exactly these four statuses. Per-rule applicability:

| Status | Meaning | Applies to |
|---|---|---|
| **PASS** | Rule fully satisfied. | All rules. |
| **FAIL** | Rule violated — must fix. | All rules. |
| **WARN** | Rule satisfied in spirit but with minor issues a maintainer should clean up. | Rule 3 (e.g., a type that could be shared but isn't critical), Rule 4 (README present but missing optional sections like API Response Example or Data Mapping; or root README index row stale). |
| **N/A** | Rule does not apply to this component. | Rule 2 (component does not fetch data — static UI, tracking scripts), Rule 5 (component has no `.module.scss` file). |

Rules 1, 3, 4 always apply (every component has files to scan, files to organize, and a directory that should contain a README). Rule 1 is binary: PASS or FAIL — never WARN/N/A.

Output the review in this exact format:

```
# Component Review: [ComponentName]
Path: [full path]
Date: [today's date]

## Summary
[1-2 sentence overall assessment]

## Rule 1: No Frontend API Calls [PASS/FAIL]
- [ ] No direct fetch() calls in component files
- [ ] No direct fetch() calls in hooks used by this component
- [ ] All data fetching goes through useQuery/GraphQL

[If FAIL, for each violation:]
> **VIOLATION** `[file]:[line]` — [description]
> **Fix:** [specific suggestion]

## Rule 2: SDK Patterns [PASS/FAIL/N/A]
- [ ] Existing SDK resolver reused where available (recommendations → syneriseAIRecommendations, search → syneriseAISearch)
- [ ] Hook uses gql() from @generated/gql
- [ ] Hook uses useQuery<GeneratedType>()
- [ ] Hook returns { data, error, loading }
[If custom resolver (not in SDK):]
- [ ] Resolver follows root-query-creates-client pattern
- [ ] Resolver has SyneriseXyzResult nested type
- [ ] Resolver validates config with clear errors
- [ ] TypeDef has feature-specific .graphql file
- [ ] TypeDef uses SyneriseXyzResult naming
- [ ] TypeDef referenced in query.graphql
- [ ] Client uses factory function pattern

[If FAIL, for each violation:]
> **VIOLATION** [description]
> **Fix:** [specific suggestion]

## Rule 3: Code Organization [PASS/FAIL/WARN]
- [ ] Types properly located (shared vs component-specific)
- [ ] Hooks properly located (shared vs component-specific)
- [ ] No duplicate type definitions found
- [ ] Barrel exports updated (index.ts files)

[If FAIL, for each violation:]
> **VIOLATION** [description]
> **Fix:** [specific suggestion]

## Rule 4: README.md [PASS/FAIL/WARN]
- [ ] README.md exists in component directory
- [ ] Title + Description
- [ ] How It Works (flow, error/loading/empty states)
- [ ] Props table (matches types file)
- [ ] Dependencies (npm, hooks, types, utils, GraphQL)
- [ ] GraphQL Operations (complete, copy-pasteable)
- [ ] API Response Example (sample JSON)
- [ ] Authentication documented
- [ ] Data Mapping (API field → component → render)
- [ ] CMS Configuration (JSON schema, matches sections.json)
- [ ] File Structure (matches actual directory)
- [ ] Implementing in Another Store (step-by-step)
- [ ] Listed in root README.md "Available Section Components" table with correct link and current description

[If FAIL, list missing sections. If no README exists, suggest invoking the `create-readme` skill with the component path.]

## Rule 5: SCSS Design Tokens [PASS/FAIL/N/A]
- [ ] No hardcoded hex colors (use --fs-color-* tokens)
- [ ] No hardcoded spacing values (use --fs-spacing-* tokens)
- [ ] No hardcoded font sizes/weights (use --fs-text-* tokens)
- [ ] No hardcoded border values (use --fs-border-* tokens)
- [ ] No hardcoded transition values (use --fs-transition-* tokens)
- [ ] Styles wrapped in @layer components { }

[If FAIL, for each violation:]
> **VIOLATION** `[file]:[line]` — [description of hardcoded value]
> **Fix:** Replace with `[specific token]`

## Priority Fixes
1. [Highest priority — typically Rule 1 violations]
2. [Next priority]
...
```
