# BannerCategorySection

Displays a full-width hero banner based on the user's last visited category, fetched from a Synerise recommendation campaign. Shows responsive images (mobile/desktop variants) with a link to the category page, and a skeleton shimmer while loading.

## How It Works

1. The component receives `campaignId` from CMS props
2. The `useBannerCategory` hook sends a GraphQL query with `campaignId` and the user's `clientUUID` (from `_snrs_uuid` cookie)
3. The GraphQL resolver reads `trackerKey` from `discovery.config` (same global key used by all Synerise recommendation components), then POSTs to `/recommendations/v2/recommend/campaigns?token={trackerKey}` with `{ clientUUID, campaignId }`
4. The API returns banner metadata in `data[0]` (`banner_url`, `banner_app`, `category`, `itemId`)
5. The hook maps `data[0]` to a `BannerItem` — desktop image, mobile image, category link
6. If the API fails or returns no data, fallback images from CMS props are used

### Why a custom resolver (not the SDK)

The `@synerise/faststore-api` SDK includes a built-in resolver for the Synerise recommendations API (`syneriseAIRecommendations`). Other components like `RecommendationShelf` use it to fetch product recommendations — the SDK takes the product IDs from the API response, looks them up in VTEX, and returns full product data (prices, images, etc.).

This component can't use that resolver because banner campaigns don't return products. Instead, the API returns banner metadata — image URLs, category names, links — directly in the response. The SDK resolver doesn't know what to do with this data (it expects product IDs), so it returns nothing useful.

That's why this component has its own resolver (`banner.ts`) that calls the same Synerise endpoint but returns the raw response as-is, without trying to convert it into product data.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `campaignId` | `string` | yes | — | Synerise recommendation campaign ID (e.g., `PzKR1vXHeJBF`) |
| `fallbackImage` | `string` | no | — | Desktop image URL shown when the API fails or returns no data |
| `fallbackImageAPP` | `string` | no | — | Mobile image URL shown when the API fails or returns no data |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `@faststore/ui` | `Link` component |
| `@synerise/faststore-api` | `fetchAPI` used by the resolver |
| `js-cookie` | Reading `_snrs_uuid` cookie on the client |

### Component hooks (`BannerCategorySection/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useBannerCategory` | `hooks/useBannerCategory.ts` | GraphQL query — fetches banner data for the current user via `syneriseBanner` resolver, maps `data[0]` to a `BannerItem` |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/resolvers/banner.ts` | Resolver: creates `SyneriseBannerClient` factory; nested `SyneriseBannerResult.getCategory` POSTs to the campaigns endpoint |
| `src/graphql/thirdParty/typeDefs/banner.graphql` | Schema: `SyneriseBannerResult`, `SyneriseBannerData`, `BannerCategoryItem` |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query: `syneriseBanner(trackerKey: String!): SyneriseBannerResult!` |

## GraphQL Operations

### Query: `SyneriseBannerCategoryQuery`

```graphql
query SyneriseBannerCategoryQuery(
  $campaignId: String!
  $clientUUID: String!
) {
  syneriseBanner {
    getCategory(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        banner_url
        banner_app
        category
        itemId
      }
    }
  }
}
```

`clientUUID` is read from the `_snrs_uuid` cookie on the client. The hook skips the query (`doNotRun: true`) if the cookie is missing.

## API Response Example

*This response is specific to the campaign configuration used in this implementation. Your campaign may return different fields — adjust the resolver and hook accordingly.*

`POST /recommendations/v2/recommend/campaigns?token={trackerKey}` with body `{ "clientUUID": "...", "campaignId": "..." }`:

```json
{
  "data": [
    {
      "bannerImagePortuguese": "https://example.com/hero-woman_banner_home.png",
      "banner_app": "https://example.com/mobile_women.png",
      "banner_url": "https://example.com/hero-woman.png",
      "category": "women",
      "itemId": "women",
      "link_image": "/Women"
    }
  ],
  "extras": {
    "campaignId": "PzKR1vXHeJBF",
    "contextItems": null,
    "correlationId": "d31222f9-c5d3-4ca4-a281-52f7d1c4ecd5",
    "slots": [
      {
        "id": 0,
        "itemIds": ["women"],
        "name": "Unnamed slot",
        "rows": null
      }
    ]
  }
}
```

Key points:
- Banner data is in **`data[0]`**, NOT in `extras.slots.rows.metadata` (which is `null` for banner campaigns)
- The resolver only returns the `data` array — `extras` is discarded
- Fields vary by campaign — `banner_url`, `banner_app`, `category`, `itemId` are the ones this implementation uses

## Data Mapping

*This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

| API field (`data[0]`) | Hook property (`BannerItem`) | Rendered as |
|---|---|---|
| `banner_url` | `image` | `<img>` desktop (hidden on mobile) |
| `banner_app` | `imageApp` | `<img>` mobile (hidden on desktop) |
| `category` | `category` | `alt` text on images |
| `category` | `link` | `<Link href="/{category}">` — wraps both images |
| `itemId` | `itemId` | Used as fallback key for `useMemo` |

## Component States

| State | Condition | What the user sees |
|---|---|---|
| **Loading** | `!data && !error` | Skeleton shimmer placeholder matching banner dimensions |
| **Success** | `data[0]` has banner fields | Full-width banner image (responsive) linked to category |
| **Fallback** | API error or empty `data`, but fallback props provided | Fallback images from CMS props, link set to `#` |
| **Empty** | API error or empty `data`, no fallback props | Component returns `null` (nothing rendered) |

## Authentication

The banner API uses tracker-key authentication (simpler than JWT):

1. The resolver reads `trackerKey` from `discovery.config.synerise.trackerKey` — the same global key used by all Synerise recommendation components (e.g., `RecommendationShelf`)
2. The resolver appends it as a query parameter: `?token={trackerKey}`
3. No token caching or refresh needed — tracker keys don't expire
4. No CMS configuration needed for authentication — it's handled globally

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`BannerCategorySection`**

```json
{
  "name": "BannerCategorySection",
  "schema": {
    "title": "Banner Category - Synerise",
    "description": "Banner with last visited category based on recommendation (API Synerise).",
    "type": "object",
    "required": ["campaignId"],
    "properties": {
      "campaignId": { "type": "string", "title": "ID of campaign" },
      "fallbackImage": { "type": "string", "title": "Fallback image" },
      "fallbackImageAPP": { "type": "string", "title": "Fallback image for app" }
    }
  }
}
```

The component must also be registered in:
- `src/components/index.tsx` — exported as `BannerCategorySection`

## File Structure

```
src/components/sections/BannerCategorySection/
├── BannerCategorySection.tsx          # Main component — responsive banner with fallback
├── BannerCategorySection.types.ts     # Props interface + BannerItem type
├── BannerCategorySection.module.scss  # Styles (skeleton, responsive images, 24px radius)
├── hooks/
│   ├── useBannerCategory.ts           # Hook — useQuery to syneriseBanner resolver
│   └── index.ts                       # Barrel export
├── index.ts                           # Barrel export
└── README.md                          # This file
```

## Implementing This Component in Another VTEX FastStore App

To add BannerCategorySection to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api
```

### 2. Add GraphQL schema and resolvers

Copy to your `src/graphql/thirdParty/` directory:

- `typeDefs/banner.graphql` — banner types
- `resolvers/banner.ts` — banner resolver (factory client + nested resolver)

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
syneriseBanner(trackerKey: String!): SyneriseBannerResult!
```

### 3. Add the component

Copy the `BannerCategorySection/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { BannerCategorySection } from './sections/BannerCategorySection'
export default { BannerCategorySection, /* ...other sections */ }
```

### 4. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 5. Configure

- Ensure `discovery.config` has `synerise.apiHost` and `synerise.trackerKey` set
- Add the section to a page in VTEX Headless CMS and provide the `campaignId`

### 6. Prerequisites

- Synerise account with a recommendation campaign configured for banner/category data
- Synerise JS SDK (tracker) installed on the storefront — it sets the `_snrs_uuid` cookie
