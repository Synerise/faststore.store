Review ALL section components against the project's 5 architectural rules.

## Instructions

1. List all directories in `src/components/sections/`
2. For each component, perform the review described below
3. After all individual reviews, produce a summary dashboard

## Per-Component Review

For each component directory in `src/components/sections/`:

### Rule 1 — No Frontend API Calls
Search all `.ts` and `.tsx` files in the component directory AND any hooks it references (in local `hooks/` subdirectory and in `src/hooks/`) for:
- Direct `fetch(` calls (not imports of fetchAPI/fetchWithAuth)
- `axios` usage
- Direct SDK client instantiation (e.g., `SyneriseSearchClient(`)
- Any HTTP call not going through `useQuery()` or `request()`

### Rule 2 — SDK Patterns
First check if the component's data source already has an SDK resolver in `@synerise/faststore-api`:
- **Recommendations** (`/recommendations/v2/recommend/campaigns/`) → MUST use existing `syneriseAIRecommendations` query (product shelves, banners, category recommendations, personalized content)
- **Search** (`/search/v2/`, autocomplete, listing) → MUST use existing `syneriseAISearch` query (`search`, `autocomplete`, `listing` methods)

If an SDK resolver exists, the component must use it — do NOT create a custom resolver for the same endpoint.

For features NOT covered by the SDK, trace the custom data-fetching chain:
- Does it go Component → Hook (useQuery + gql) → Resolver (client factory) → TypeDef?
- Are naming conventions followed (SyneriseXyzResult)?
- Is the resolver registered in `src/graphql/thirdParty/resolvers/index.ts`?

### Rule 3 — Code Organization
- Types in the right location (shared `src/types/` vs component-specific)?
- Hooks in the right location (shared `src/hooks/` vs `[Component]/hooks/`)?
- Any duplicate type definitions across components?

### Rule 4 — README.md
First, read the shared README rules at `.claude/commands/readme-rules.md`.
- Does the component directory contain a `README.md`?
- If yes, check against the 11 required/recommended sections from readme-rules.md
- Flag missing required sections as FAIL, missing recommended sections (API Response Example, Data Mapping) as WARN
- If no README exists, suggest running `/create-readme [path]`

### Rule 5 — SCSS Design Tokens
Read the component's `.module.scss` file and flag hardcoded values that should use design tokens (reference: `docs/design-tokens.md`):
- **Colors**: hardcoded hex (`#xxx`) or `rgb()`/`rgba()` → use `var(--fs-color-*)`. Exception: `rgba()` inside `linear-gradient` for skeleton/shimmer animations is acceptable.
- **Spacing**: hardcoded `px`/`rem` for `padding`, `margin`, `gap` → use `var(--fs-spacing-0)` through `var(--fs-spacing-13)`
- **Typography**: hardcoded `font-size`, `font-weight`, `font-family` → use `var(--fs-text-size-*)`, `var(--fs-text-weight-*)`, `var(--fs-text-face-*)`
- **Borders**: hardcoded `border-radius`, `border-width`, `border-color` → use `var(--fs-border-*)`
- **Transitions**: hardcoded `transition` timing/easing → use `var(--fs-transition-*)`
- **Structure**: styles should be wrapped in `@layer components { }`
- **Acceptable exceptions**: layout properties (`width: 100%`, `display:`, `position:`), `0` values, breakpoint media queries with raw `768px`

## Output Format

### Individual Findings

For each component, output a brief section:

```
### [ComponentName]
- Rule 1 (No Direct API): [PASS/FAIL] — [brief reason if FAIL]
- Rule 2 (SDK Patterns): [PASS/FAIL/N/A] — [brief reason if FAIL]
- Rule 3 (Organization): [PASS/FAIL/WARN] — [brief reason if not PASS]
- Rule 4 (README): [PASS/FAIL/WARN] — [exists with all sections / missing sections / no README]
- Rule 5 (Design Tokens): [PASS/FAIL/N/A] — [brief reason if FAIL]
```

### Summary Dashboard

```
# Component Review Dashboard
Date: [today's date]

| Component | Rule 1: No Direct API | Rule 2: SDK Patterns | Rule 3: Organization | Rule 4: README | Rule 5: Design Tokens |
|---|---|---|---|---|---|
| [Name] | [PASS/FAIL] | [PASS/FAIL/N/A] | [PASS/FAIL/WARN] | [PASS/FAIL] | [PASS/FAIL/N/A] |
| ... | ... | ... | ... | ... | ... |

## Critical Violations (must fix)
[Components making direct API calls that should use GraphQL. Include specific file paths and what resolver/typeDef/hook needs to be created.]

## Warnings (should fix)
[Organization issues, naming convention violations, missing barrel exports]

## Missing READMEs
[List of components without README.md or with incomplete README]

## Refactoring Candidates
[Components needing full resolver + typeDef + hook refactoring to eliminate direct API calls. For each, describe what needs to be created:]
1. [Component] — needs: [resolver file], [typeDef file], [hook refactoring]
```

### Notes
- Components that don't fetch data (e.g., static UI, tracking scripts) get N/A for Rule 2
- WARN for Rule 3 means minor issues (e.g., a type that could be shared but isn't critical)
- Reference implementation for comparison: PersonalisedPromotions (follows all patterns correctly)
