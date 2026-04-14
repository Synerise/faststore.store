Review the component at: $ARGUMENTS

Perform a structured code review against this project's 5 architectural rules. Follow each step precisely.

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
4. Read the corresponding typeDef in `src/graphql/thirdParty/typeDefs/`
5. Check if types come from `src/types/` or local `.types.ts` files

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

**Fix guidance for recommendation-based components:** Refactor the hook to use the existing `syneriseAIRecommendations` query via `useQuery`, following the pattern in `RecommendationShelf/hooks/useRecommendations.ts`. Read the appropriate fields from the response (`data` for products, `extras.slots[].rows[].metadata` for category/image metadata).

**Fix guidance for search-based components:** Refactor the hook to use the existing `syneriseAISearch` query via `useQuery`, following the patterns in `SyneriseNavbarSection/hooks/useAutocomplete.ts` (autocomplete) or `ProductGallerySection/hooks/useSearchQuery.ts` (search/listing).

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
- Factory function pattern (not class)?
- Uses `fetchAPI` or `fetchWithAuth` (not raw `fetch`)?

If the component makes direct API calls instead of going through GraphQL, flag this as a Rule 2 violation and describe what refactoring would look like — either reuse an existing SDK resolver or build the custom resolver + typeDef + hook pipeline.

### Rule 3 — Code Organization

- Are shared types in `src/types/` and component-specific types in `[Component].types.ts`?
- Are shared hooks in `src/hooks/` and component-specific hooks in `[Component]/hooks/`?
- Search for type names defined in this component across the entire `src/` directory — are there duplicates?
- If a type or hook is used by multiple components, is it in the shared location?
- Are barrel exports (`index.ts`) updated for any shared items?

### Rule 4 — README.md

First, read the shared README rules at `.claude/commands/readme-rules.md`.

Then check:
- Does the component directory contain a `README.md`?
- If no, flag as FAIL and suggest running `/create-readme [component-path]`
- If yes, verify it against the required sections from readme-rules.md:
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

### Rule 5 — SCSS Design Tokens

Read the component's `.module.scss` file and check for hardcoded values that should use design tokens from `docs/design-tokens.md`. Read the design tokens doc if needed.

**Colors** — flag any hardcoded hex (`#xxx`, `#xxxxxx`) or `rgb()`/`rgba()` values (except inside `linear-gradient` for skeleton animations which are acceptable). Should use:
- `var(--fs-color-text)`, `var(--fs-color-text-inverse)`, `var(--fs-color-text-light)` for text
- `var(--fs-color-neutral-bkg)`, `var(--fs-color-neutral-0)` through `var(--fs-color-neutral-7)` for backgrounds/surfaces
- `var(--fs-color-primary-bkg)`, `var(--fs-color-secondary-bkg)`, etc. for themed backgrounds
- `var(--fs-color-success-*)`, `var(--fs-color-danger-*)`, `var(--fs-color-warning-*)` for states

**Spacing** — flag hardcoded `px`/`rem` values used for `padding`, `margin`, `gap`. Should use `var(--fs-spacing-0)` (0.25rem) through `var(--fs-spacing-13)` (6rem).

**Typography** — flag hardcoded `font-size`, `font-weight`, `font-family` values. Should use:
- `var(--fs-text-size-0)` through `var(--fs-text-size-9)` or semantic sizes like `var(--fs-text-size-body)`, `var(--fs-text-size-title-section)`
- `var(--fs-text-weight-bold)`, `var(--fs-text-weight-regular)`, etc.
- `var(--fs-text-face-body)`, `var(--fs-text-face-title)`

**Borders** — flag hardcoded `border-radius`, `border-width`, `border-color`. Should use:
- `var(--fs-border-radius)`, `var(--fs-border-radius-medium)`, `var(--fs-border-radius-pill)`, etc.
- `var(--fs-border-width)`, `var(--fs-border-width-thick)`
- `var(--fs-border-color)`, `var(--fs-border-color-hover)`, etc.

**Transitions** — flag hardcoded `transition` timing/easing. Should use `var(--fs-transition-timing)`, `var(--fs-transition-property)`, `var(--fs-transition-function)`.

**Structure** — check that styles are wrapped in `@layer components { }` (matching sibling section pattern).

**Acceptable exceptions:**
- `width: 100%`, `max-width: 100%`, `display:`, `position:`, `object-fit:` and similar layout properties that have no token equivalent
- Breakpoint media queries using raw `768px` etc. (mirrors sibling pattern)
- `linear-gradient` with `rgba()` for skeleton/shimmer animations
- `0` values (e.g., `margin: 0`, `padding: 0`)

## Step 4: Report

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

## Rule 2: SDK Patterns [PASS/FAIL]
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

## Rule 3: Code Organization [PASS/FAIL]
- [ ] Types properly located (shared vs component-specific)
- [ ] Hooks properly located (shared vs component-specific)
- [ ] No duplicate type definitions found
- [ ] Barrel exports updated (index.ts files)

[If FAIL, for each violation:]
> **VIOLATION** [description]
> **Fix:** [specific suggestion]

## Rule 4: README.md [PASS/FAIL]
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

[If FAIL, list missing sections. If no README exists, suggest: `/create-readme [path]`]

## Rule 5: SCSS Design Tokens [PASS/FAIL]
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
