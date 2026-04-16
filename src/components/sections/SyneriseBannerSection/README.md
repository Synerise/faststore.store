# SyneriseBannerSection

Displays a horizontal announcement bar with rotating text titles fetched from a Synerise recommendation campaign. Renders as a rounded card within the page content grid. When multiple titles are returned, they rotate with a slide animation at a configurable interval.

## How It Works

1. The component receives `campaignId`, `backgroundColor`, and `fallbackText` from CMS props
2. The `useSyneriseBanner` hook sends a GraphQL query with `campaignId` and the user's `clientUUID` (from `_snrs_uuid` cookie)
3. The GraphQL resolver reads `trackerKey` from `discovery.config`, then POSTs to `/recommendations/v2/recommend/campaigns?token={trackerKey}` with `{ clientUUID, campaignId }`
4. The API returns campaign items in `data[]` — each item has a `title` field
5. The hook extracts all `title` values into a string array and filters out empty ones
6. If multiple titles exist, the component rotates through them with a slide animation (configurable 3-5 second interval)
7. If only one title exists, it's displayed statically
8. If the API fails or returns no titles, `fallbackText` from CMS is shown

### Component States

| State | Condition | What the user sees |
|---|---|---|
| **Loading** | `!data && !error` | Rounded card with `fallbackText` (no skeleton — avoids layout shift) |
| **Success (single)** | One title returned | Static text in the rounded card |
| **Success (multiple)** | Multiple titles returned | Titles rotating with slide animation |
| **Fallback** | API error or empty titles | `fallbackText` displayed in the rounded card |

### Why a custom resolver (not the SDK)

The `@synerise/faststore-api` SDK includes a built-in resolver for the Synerise recommendations API (`syneriseAIRecommendations`). Other components like `RecommendationShelf` use it to fetch product recommendations — the SDK takes the product IDs from the API response, looks them up in VTEX, and returns full product data (prices, images, etc.).

This component can't use that resolver because the campaign returns blog/content titles — not product IDs. The SDK resolver doesn't know what to do with this data (it expects product IDs), so it returns nothing useful.

That's why this component uses a custom `syneriseBanner` resolver that calls the same Synerise endpoint but returns the raw response as-is, without trying to convert it into product data.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `fallbackText` | `string` | yes | — | Text shown when the API fails or returns no titles |
| `backgroundColor` | `string` | yes | — | Background color of the banner card (e.g., `#1a1a1a`) |
| `textColor` | `string` | no | `#ffffff` | Text color |
| `campaignId` | `string` | yes | — | Synerise recommendation campaign ID (e.g., `O5x2fJb60Omz`) |
| `rotationIntervalSeconds` | `number` | no | `4` | Interval between title rotation (3-5 seconds) |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `js-cookie` | Reading `_snrs_uuid` cookie on the client |
| `@synerise/faststore-api` | `fetchAPI` used by the resolver |

### Component hooks (`SyneriseBannerSection/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useSyneriseBanner` | `hooks/useSyneriseBanner.ts` | GraphQL query — fetches titles via `syneriseBanner.getTitles`, returns `{ loading, error, titles, useFallback, fallbackText }` |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/resolvers/banner.ts` | Resolver: `SyneriseBannerClient` factory with `getTitles` method |
| `src/graphql/thirdParty/typeDefs/banner.graphql` | Schema: `TextBannerItem`, `SyneriseBannerTextData` (extends `SyneriseBannerResult`) |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query: `syneriseBanner: SyneriseBannerResult!` |

## GraphQL Operations

### Query: `SyneriseBannerTextQuery`

```graphql
query SyneriseBannerTextQuery(
  $campaignId: String!
  $clientUUID: String!
) {
  syneriseBanner {
    getTitles(clientUUID: $clientUUID, campaignId: $campaignId) {
      data {
        title
      }
    }
  }
}
```

`clientUUID` is read from the `_snrs_uuid` cookie on the client. The hook skips the query (`doNotRun: true`) if the cookie is missing. Only the `title` field is requested — `category`, `itemId`, and `thumbnail` are available in the API but not used by this component.

## API Response Example

*This response is specific to the campaign configuration used in this implementation. Your campaign may return different fields — adjust the resolver and hook accordingly.*

`POST /recommendations/v2/recommend/campaigns?token={trackerKey}` with body `{ "clientUUID": "...", "campaignId": "..." }`:

```json
{
  "data": [
    {
      "category": "fruity",
      "itemId": "blogpost4",
      "thumbnail": "https://upload.snrcdn.net/.../fd3145e2a8314b26a8d6613e9a5556b7.png",
      "title": "Cologne or Perfume? Choosing the Best Scent for Your Next Big Night"
    },
    {
      "category": "necklace",
      "itemId": "blogpost7",
      "thumbnail": "https://upload.snrcdn.net/.../a53318a9dc9d4fd8bc02959dea4e3265.png",
      "title": "Choosing the Perfect Necklace for your Evening Dress"
    },
    {
      "category": "necklace",
      "itemId": "blogpost10",
      "thumbnail": "https://upload.snrcdn.net/.../00f2b904a96a4a24be3703d0535b5886.png",
      "title": "Occasion Dressing: How to Nail the Dress Code with Jewellery"
    }
  ],
  "extras": {
    "campaignId": "O5x2fJb60Omz",
    "contextItems": null,
    "correlationId": "6cbc0399-e519-4267-a13a-592a29b8c811",
    "slots": [
      {
        "id": 0,
        "itemIds": ["blogpost4", "blogpost7", "blogpost10"],
        "name": "Unnamed slot",
        "rows": null
      }
    ]
  }
}
```

Key points:
- Title data is in **`data[]`** — each item has `title`, `category`, `itemId`, `thumbnail`
- `extras.slots[0].rows` is `null` — metadata is in `data`, not in slots/rows
- The hook only extracts `title` from each item — `category`, `itemId`, `thumbnail` are discarded
- Titles with empty/null values are filtered out

## Data Mapping

*This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

| API field (`data[]`) | Hook output | Rendered as |
|---|---|---|
| `title` | `titles: string[]` | `<p>` text inside the banner card, rotated with slide animation |
| _(not used)_ `category` | — | Available in API but not rendered |
| _(not used)_ `itemId` | — | Available in API but not rendered |
| _(not used)_ `thumbnail` | — | Available in API but not rendered |
| _(CMS prop)_ `backgroundColor` | — | `style={{ backgroundColor }}` on `.card` element |
| _(CMS prop)_ `textColor` | — | `style={{ color }}` on `.card` element |

## Authentication

The banner API uses tracker-key authentication:

1. The resolver reads `trackerKey` from `discovery.config.synerise.trackerKey` — the same global key used by all Synerise recommendation components
2. The resolver appends it as a query parameter: `?token={trackerKey}`
3. No token caching or refresh needed — tracker keys don't expire
4. No CMS configuration needed for authentication — it's handled globally

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`SyneriseBannerSection`**

```json
{
  "name": "SyneriseBannerSection",
  "schema": {
    "title": "Synerise Banner",
    "description": "Horizontal banner strip with rotating text titles from a Synerise campaign",
    "type": "object",
    "required": ["fallbackText", "backgroundColor", "campaignId"],
    "properties": {
      "fallbackText": { "type": "string", "title": "Fallback text" },
      "backgroundColor": { "type": "string", "title": "Background color", "default": "#1a1a1a" },
      "textColor": { "type": "string", "title": "Text color", "default": "#ffffff" },
      "campaignId": { "type": "string", "title": "Campaign ID" },
      "rotationIntervalSeconds": { "type": "integer", "title": "Rotation interval (seconds)", "default": 4, "minimum": 3, "maximum": 5 }
    }
  }
}
```

The component must also be registered in:
- `src/components/index.tsx` — exported as `SyneriseBannerSection`

## File Structure

```
src/components/sections/SyneriseBannerSection/
├── SyneriseBannerSection.tsx          # Main component — rounded card with rotating titles
├── SyneriseBannerSection.types.ts     # Props interface
├── SyneriseBannerSection.module.scss  # Styles (contained card, slide animations)
├── hooks/
│   ├── useSyneriseBanner.ts           # Hook — useQuery to syneriseBanner.getTitles
│   └── index.ts                       # Barrel export
├── index.ts                           # Barrel export
└── README.md                          # This file
```

## Implementing This Component in Another VTEX FastStore App

To add SyneriseBannerSection to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api
```

### 2. Add GraphQL schema and resolvers

Copy to your `src/graphql/thirdParty/` directory:

- `typeDefs/banner.graphql` — banner types including `TextBannerItem` and `SyneriseBannerTextData`
- `resolvers/banner.ts` — banner resolver with `getTitles` method

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

Copy the `SyneriseBannerSection/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { SyneriseBannerSection } from './sections/SyneriseBannerSection'
export default { SyneriseBannerSection, /* ...other sections */ }
```

### 4. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 5. Configure

- Ensure `discovery.config` has `synerise.apiHost` and `synerise.trackerKey` set
- Add the section to a page in VTEX Headless CMS and provide `campaignId`, `backgroundColor`, and `fallbackText`

### 6. Prerequisites

- Synerise account with a recommendation campaign configured to return items with `title` fields
- Synerise JS SDK (tracker) installed on the storefront — it sets the `_snrs_uuid` cookie
