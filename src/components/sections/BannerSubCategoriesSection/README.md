# BannerSubCategoriesSection

Displays a responsive grid of sub-category tiles, fetched from a Synerise recommendation campaign. Each tile shows a category image linking to its category page. Layout follows the foxshop "Browse by popular categories" pattern: 6 columns on desktop, 3 on tablet, 2 on mobile.

## How It Works

1. The component receives `campaignId` from CMS props
2. The `useBannerSubCategories` hook sends a GraphQL query with `campaignId` and the user's `clientUUID` (from `_snrs_uuid` cookie)
3. The GraphQL resolver reads `trackerKey` from `discovery.config`, then POSTs to `/recommendations/v2/recommend/campaigns?token={trackerKey}` with `{ clientUUID, campaignId }`
4. The API returns sub-category metadata in `data[]` — each item has `firstCategory`, `secondCategory`, `subCategoryImage`, `itemId`
5. The hook maps each item to a `BannerItem` — image URL, category link (slugified `/{firstCategory}/{secondCategory}`), and display names
6. Items are rendered in a responsive CSS grid (6 → 3 → 2 columns)

### Component States

| State | Condition | What the user sees |
|---|---|---|
| **Loading** | `!data && !error` | Grid of skeleton shimmer placeholders (6 tiles) |
| **Success** | `data[]` has items | Responsive grid of category tiles with images |
| **Fallback** | API error or empty `data`, but `fallbackImages` prop provided | Carousel of fallback images, links set to `#` |
| **Empty** | API error or empty `data`, no fallback images | Component returns `null` (nothing rendered) |

### Why a custom resolver (not the SDK)

The `@synerise/faststore-api` SDK includes a built-in resolver for the Synerise recommendations API (`syneriseAIRecommendations`). Other components like `RecommendationShelf` use it to fetch product recommendations — the SDK takes the product IDs from the API response, looks them up in VTEX, and returns full product data (prices, images, etc.).

This component can't use that resolver because sub-category campaigns don't return products. Instead, the API returns category metadata — image URLs, category names, item IDs — directly in the response. The SDK resolver doesn't know what to do with this data (it expects product IDs), so it returns nothing useful.

That's why this component uses a custom `syneriseBanner` resolver that calls the same Synerise endpoint but returns the raw response as-is, without trying to convert it into product data.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | no | — | Section heading displayed above the grid (e.g., "Browse by popular categories") |
| `campaignId` | `string` | yes | — | Synerise recommendation campaign ID (e.g., `ugXXWxq3Wpwi`) |
| `fallbackImages` | `string[]` | no | `[]` | Fallback image URLs shown when the API fails or returns no data |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `@faststore/ui` | `Link` component |
| `@synerise/faststore-api` | `fetchAPI` used by the resolver |
| `js-cookie` | Reading `_snrs_uuid` cookie on the client |

### Component hooks (`BannerSubCategoriesSection/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useBannerSubCategories` | `hooks/useBannerSubCategories.ts` | GraphQL query — fetches sub-category banner data via `syneriseBanner.getSubCategories`, maps `data[]` to `BannerItem[]` |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/resolvers/banner.ts` | Resolver: `SyneriseBannerClient` factory with `getSubCategories` method |
| `src/graphql/thirdParty/typeDefs/banner.graphql` | Schema: `SubCategoryBannerItem`, `SyneriseBannerSubCategoryData` (extends `SyneriseBannerResult`) |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query: `syneriseBanner: SyneriseBannerResult!` |

## GraphQL Operations

### Query: `SyneriseBannerSubCategoriesQuery`

```graphql
query SyneriseBannerSubCategoriesQuery(
  $campaignId: String!
  $clientUUID: String!
) {
  syneriseBanner {
    getSubCategories(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        firstCategory
        secondCategory
        subCategoryImage
        itemId
      }
    }
  }
}
```

`clientUUID` is read from the `_snrs_uuid` cookie on the client. The hook skips the query (`doNotRun: true`) if the cookie is missing. The hook reads all items from `data[]`.

## API Response Example

*This response is specific to the campaign configuration used in this implementation. Your campaign may return different fields — adjust the resolver and hook accordingly.*

`POST /recommendations/v2/recommend/campaigns?token={trackerKey}` with body `{ "clientUUID": "...", "campaignId": "..." }`:

```json
{
  "data": [
    {
      "category": "home>lighting",
      "firstCategory": "home",
      "itemId": "home>lighting",
      "secondCategory": "lighting",
      "subCategoryImage": "https://upload.azu.snrcdn.net/.../3bbbb020716e4a7bae7895a648aeaaaf.png",
      "subCategoryImagePortuguese": "https://upload.azu.snrcdn.net/.../caf3993c96764d6dbab22139935a0504.png"
    },
    {
      "category": "men>watches",
      "firstCategory": "men",
      "itemId": "men>watches",
      "secondCategory": "watches",
      "subCategoryImage": "https://upload.azu.snrcdn.net/.../e430eb366d444612be49880c223c7e8b.png",
      "subCategoryImagePortuguese": "https://upload.azu.snrcdn.net/.../1d255e3f12a94524ba1e687151471c5b.png"
    }
  ],
  "extras": {
    "campaignId": "ugXXWxq3Wpwi",
    "contextItems": null,
    "correlationId": "b07b960b-6d59-415a-a4b0-e3e14eed95c7",
    "slots": [
      {
        "id": 0,
        "itemIds": ["home>lighting", "men>watches", "..."],
        "name": "Unnamed slot",
        "rows": null
      }
    ]
  }
}
```

Key points:
- Sub-category data is in **`data[]`** (all items)
- `extras.slots[0].rows` is `null` — metadata is in `data`, not in slots/rows
- The resolver only returns the `data` array — `extras` is discarded
- Each item also has `category` (combined `firstCategory>secondCategory`) and `subCategoryImagePortuguese` (localized variant) — these are available in the API but not used by this implementation
- Fields vary by campaign — `firstCategory`, `secondCategory`, `subCategoryImage`, `itemId` are the ones this implementation uses

## Data Mapping

*This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

| API field (`data[]`) | Hook property (`BannerItem`) | Rendered as |
|---|---|---|
| `firstCategory` | `firstCategory` | Part of `alt` text on `<img>` |
| `secondCategory` | `secondCategory` | Part of `alt` text on `<img>` |
| `subCategoryImage` | `image` | `<img src>` inside carousel item |
| `firstCategory` + `secondCategory` | `link` | `<Link href="/{first}/{second}">` (slugified) |
| `itemId` | `itemId` | React `key` for carousel items |

## Authentication

The banner API uses tracker-key authentication:

1. The resolver reads `trackerKey` from `discovery.config.synerise.trackerKey` — the same global key used by all Synerise recommendation components
2. The resolver appends it as a query parameter: `?token={trackerKey}`
3. No token caching or refresh needed — tracker keys don't expire
4. No CMS configuration needed for authentication — it's handled globally

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`BannerSubCategoriesSection`**

```json
{
  "name": "BannerSubCategoriesSection",
  "schema": {
    "title": "Banner SubCategories - Synerise",
    "description": "Horizontal carousel of sub-category banners (Synerise API).",
    "type": "object",
    "required": ["campaignId"],
    "properties": {
      "campaignId": { "type": "string", "title": "ID da recomendação" },
      "itemsPerPage": { "type": "integer", "title": "Items per page", "default": 4, "minimum": 1, "maximum": 6 },
      "fallbackImages": { "type": "array", "title": "Fallback images", "items": { "type": "string" } }
    }
  }
}
```

The component must also be registered in:
- `src/components/index.tsx` — exported as `BannerSubCategoriesSection`

## File Structure

```
src/components/sections/BannerSubCategoriesSection/
├── BannerSubCategoriesSection.tsx          # Main component — Carousel with sub-category banners
├── BannerSubCategoriesSection.types.ts     # Props interface + BannerItem type
├── BannerSubCategoriesSection.module.scss  # Styles (responsive grid, skeleton, foxshop tile pattern)
├── hooks/
│   ├── useBannerSubCategories.ts           # Hook — useQuery to syneriseBanner.getSubCategories
│   └── index.ts                            # Barrel export
├── index.ts                                # Barrel export
└── README.md                               # This file
```

## Implementing This Component in Another VTEX FastStore App

To add BannerSubCategoriesSection to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api
```

### 2. Add GraphQL schema and resolvers

Copy to your `src/graphql/thirdParty/` directory:

- `typeDefs/banner.graphql` — sub-category banner types (`SubCategoryBannerItem`, `SyneriseBannerSubCategoryData`, `SyneriseBannerResult`)
- `resolvers/banner.ts` — banner resolver with `getSubCategories` method

Update your resolver index to merge them:

```typescript
import bannerResolver, { SyneriseBannerResult } from './banner'

const resolvers = {
  SyneriseBannerResult,
  Query: { ...bannerResolver.Query },
}
```

Update `typeDefs/query.graphql` to add:

```graphql
syneriseBanner: SyneriseBannerResult!
```

### 3. Add the component

Copy the `BannerSubCategoriesSection/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { BannerSubCategoriesSection } from './sections/BannerSubCategoriesSection'
export default { BannerSubCategoriesSection, /* ...other sections */ }
```

### 4. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 5. Configure

- Ensure `discovery.config` has `synerise.apiHost` and `synerise.trackerKey` set
- Add the section to a page in VTEX Headless CMS and provide the `campaignId`

### 6. Prerequisites

- Synerise account with a recommendation campaign configured for sub-category data
- Synerise JS SDK (tracker) installed on the storefront — it sets the `_snrs_uuid` cookie
