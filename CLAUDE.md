# FastStore Synerise Integration — Project Conventions

## Architecture

Data flows through: **Component → Hook → GraphQL (useQuery) → thirdParty Resolver → Client Factory → Synerise API**

Components live in `src/components/sections/[Name]/`. Each is registered in `cms/faststore/sections.json` for CMS configuration.

## Rules

### Rule 1: No Frontend API Calls

All HTTP calls to external APIs MUST go through GraphQL thirdParty resolvers. Components and hooks MUST NOT use `fetch()`, `axios`, or any direct HTTP client.

**Allowed patterns:**
- `useQuery()` from `src/sdk/graphql/useQuery` — for queries
- `request()` from `src/sdk/graphql/request` — for mutations

**Not allowed in components/hooks:**
- `fetch()`, `axios()`, `XMLHttpRequest`, or any direct HTTP call
- Instantiating SDK clients directly (e.g., `SyneriseSearchClient()`) in frontend code

### Rule 2: SDK Patterns

All new features must follow the patterns established in `@synerise/faststore-api`.

**IMPORTANT — Reuse existing SDK resolvers first:**

Before creating a custom resolver, check if `@synerise/faststore-api` already provides one. The SDK ships resolvers and clients for common Synerise features. If one exists, components MUST use it via `useQuery` — do NOT create a duplicate custom resolver.

| SDK feature | Root query | Methods | Use when |
|---|---|---|---|
| Search | `syneriseAISearch` | `search`, `autocomplete`, `listing` | Full-text search, autocomplete, product listing/browsing, visual search |
| Recommendations | `syneriseAIRecommendations` | `recommendations` | **Any recommendation campaign** — product shelves, banners, category recommendations, personalized content from `/recommendations/v2/recommend/campaigns/` |

**Search:** The `syneriseAISearch` resolver provides `search(query, page, limit, sortBy, ...)`, `autocomplete(query, ...)`, and `listing(page, limit, ...)` (no query needed). All methods return `{ data: StoreProduct[], extras, meta }` enriched with VTEX product data. See existing hooks: `useAutocomplete` (NavbarSection), `useSearch` (ProductGallerySection).

**Recommendations:** Components consuming recommendations (product shelves, banners, category recommendations) should query `syneriseAIRecommendations` and read the relevant fields from the response (`data` for products, `extras.slots[].rows[].metadata` for category/banner metadata). See existing hook: `useRecommendations` (RecommendationShelf).

Only create a custom resolver + client when the feature is NOT covered by an existing SDK resolver (e.g., promotions uses `fetchWithAuth` for JWT-authenticated endpoints not in the SDK).

**Custom resolver pattern (only when no SDK resolver exists):**

**Client (factory function):**
```typescript
const SyneriseXyzClient = (config: ConfigArgs) => {
    const methodName = async (args: MethodArgs): Promise<ReturnType> => {
        return fetchAPI<T>(url, options)  // or fetchWithAuth for JWT endpoints
    }
    return { methodName }
}
```
- Lives in `src/graphql/thirdParty/resolvers/[feature].ts` (inline) or separate file
- Uses `fetchAPI` from `@synerise/faststore-api` or `fetchWithAuth` from `src/utils/fetchWithAuth`

**Resolver (nested pattern):**
```typescript
// Root query creates client, returns it
const Query = {
    syneriseXyz: (_root, { configArg }) => {
        if (!configArg) throw new Error("syneriseXyz: Missing 'configArg'")
        return { xyzClient: SyneriseXyzClient({ configArg }) }
    }
}

// Nested resolver calls client methods
export const SyneriseXyzResult = {
    methodName: (root, args) => root.xyzClient.methodName(args)
}

export default { Query }
```
- Naming: `SyneriseXyzResult` (PascalCase + "Result" suffix)
- Must be merged into `src/graphql/thirdParty/resolvers/index.ts`

**TypeDefs (.graphql):**
- Feature-specific file in `src/graphql/thirdParty/typeDefs/[feature].graphql`
- Result type: `type SyneriseXyzResult { methodName(args): ReturnType }`
- Referenced in `query.graphql`: `syneriseXyz(args): SyneriseXyzResult!`

**Hook:**
```typescript
const query = gql(`query SyneriseXyzQuery($arg: String!) { ... }`)

export const useXyz = (payload) => {
    const { data, error } = useQuery<GeneratedType>(query, variables)
    return { data, error, loading: !data?.field && !error }
}
```
- Uses `gql()` from `@generated/gql` and `useQuery<T>()` from `src/sdk/graphql/useQuery`
- Returns `{ data, error, loading }`

**Reference: Existing recommendation hook pattern** (see `RecommendationShelf/hooks/useRecommendations.ts`):
```typescript
const query = gql(`query SyneriseRecommendationsQuery(...) {
    syneriseAIRecommendations(campaignId: $campaignId) {
        recommendations(clientUUID: $clientUUID, items: $items, ...) {
            data { ... }
            extras { slots { rows { metadata { category sectionImage } } } }
        }
    }
}`)
```

### Rule 3: Code Organization

| What | Shared location | Component-specific location |
|------|----------------|---------------------------|
| Types | `src/types/` (barrel: `src/types/index.ts`) | `[Component]/[Component].types.ts` |
| Hooks | `src/hooks/` (barrel: `src/hooks/index.ts`) | `[Component]/hooks/` |
| Utils | `src/utils/` | `[Component]/` (inline or local file) |

- No duplicate type definitions across components
- Barrel exports (`index.ts`) must be updated when adding shared items

### Rule 4: Component README

Every component in `src/components/sections/[Name]/` must have a `README.md` with:
- **Purpose** — what the component does
- **Dependencies** — SDK packages, hooks, resolvers, typeDefs needed
- **Props** — interface with descriptions
- **GraphQL** — queries/mutations used
- **File structure** — files in the component directory

## Reference: Full Feature File Structure

A correctly implemented feature called `[FeatureName]` produces these files:

```
src/components/sections/[FeatureName]/
├── [FeatureName].tsx              # React component
├── [FeatureName].types.ts         # Component props
├── [FeatureName].module.scss      # Styles
├── hooks/                         # Component-specific hooks (optional)
│   └── index.ts
├── README.md                      # Documentation
└── index.ts                       # Barrel export

src/hooks/use[FeatureName].ts      # Shared hook (useQuery + gql)
src/types/[featureName].ts         # Shared types (re-exported from index.ts)
src/graphql/thirdParty/
├── resolvers/[featureName].ts     # Client factory + nested resolver
└── typeDefs/[featureName].graphql # GraphQL schema types
```

Registration points:
- `src/graphql/thirdParty/resolvers/index.ts` — merge Query + SyneriseXyzResult
- `src/graphql/thirdParty/typeDefs/query.graphql` — add root query field
- `src/hooks/index.ts` — re-export shared hook
- `src/types/index.ts` — re-export shared types
- `src/components/index.tsx` — register section component
- `cms/faststore/sections.json` — add CMS schema for props

## GraphQL Development Workflow

When adding or modifying GraphQL schema (typeDefs, resolvers, queries):

1. **Dev server restart required** — after adding new `.graphql` typeDef files or modifying `query.graphql`, the FastStore dev server (`yarn dev`) must be restarted. It reads `src/graphql/thirdParty/typeDefs/` at startup and regenerates `.faststore/@generated/schema.graphql`.
2. **Codegen runs automatically** — on dev server restart, `graphql-codegen` regenerates TypeScript types in `.faststore/@generated/` (the `gql.ts`, `graphql.ts` files that hooks import from `@generated/gql` and `@generated/graphql`).
3. **TypeScript errors after schema changes** are expected until the dev server restarts — the IDE can't resolve `@generated/*` imports for new queries until codegen runs.
4. **Codegen config** lives at `.faststore/codegen.ts`. It cannot be run standalone without the generated schema — the dev server must produce `schema.graphql` first.

## Key Files

- `src/graphql/thirdParty/resolvers/index.ts` — resolver registry
- `src/graphql/thirdParty/typeDefs/query.graphql` — root query types
- `src/hooks/index.ts` — shared hooks barrel export
- `src/types/index.ts` — shared types barrel export
- `src/components/index.tsx` — section component registry
- `cms/faststore/sections.json` — CMS section schemas
- `discovery.config` — store configuration (synerise.apiHost, etc.)

## Styling Reference

Before writing or modifying styles (SCSS), read the docs in `docs/`:
- `docs/design-tokens.md` — available design tokens (spacing, colors, typography, etc.)
- `docs/themes.md` — theming system and how to customize
- `docs/icons.md` — available icons and usage patterns

Use the project's design tokens instead of hardcoded values.
