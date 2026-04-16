# SectionRecommendation

Displays product recommendations organized by category, with pill/chip buttons that let the user switch between categories. Products are fetched from a Synerise AI campaign that returns slotted rows — each row maps to a category chip. Clicking a chip shows that category's products in a carousel. Uses the `syneriseAIRecommendations` SDK resolver for VTEX product enrichment.

## How It Works

1. The component receives `title` and `campaignId` from CMS props
2. The `useRecommendations` hook (shared with `RecommendationShelf`) sends a GraphQL query to the SDK's `syneriseAIRecommendations` resolver
3. The SDK calls Synerise `/recommendations/v2/recommend/campaigns/`, gets product IDs grouped into rows (each with a `secondCategory` label), then enriches each product via the VTEX catalog
4. The component collects rows from **all slots** (`slots[].rows[]` flattened) — each row becomes a **chip** button labeled with `metadata.secondCategory`
5. The first chip is active by default. Clicking a chip sets that row as active.
6. Products are filtered by `activeRow.itemIds` and rendered in a carousel
7. Analytics events fire: `recommendation_view` on viewport entry, `recommendation_click` on card click

### Component States

| State | Condition | What the user sees |
|---|---|---|
| **Loading** | `loading === true` | `ProductShelfSkeleton` placeholder |
| **Success** | Items returned, rows available | Centered title → chip row → product carousel for active category |
| **Single category** | Only 1 row in slots | Title + products (chip row hidden — no switching needed) |
| **Empty** | `loading === false && items.length === 0` | Component returns `null` (nothing rendered) |
| **No cookie** | `_snrs_uuid` cookie missing | Query skipped via `doNotRun`, component returns `null` |

### How the data pipeline works

This component uses the `syneriseAIRecommendations` resolver provided by the `@synerise/faststore-api` SDK. The SDK handles the full product enrichment pipeline: it calls the Synerise AI recommendations endpoint to get the recommended product IDs for the current user, then looks each one up in the VTEX catalog to return fully shaped `StoreProduct` objects.

What makes this component different from `RecommendationShelf` is how it uses the **slots/rows** structure in the `extras` response. While RecommendationShelf flattens all products into one carousel, SectionRecommendation collects rows from all slots and renders each row as a switchable category tab (chip). This means campaigns with multiple slots (each containing their own rows) are supported — all rows are flattened into a single chip row.

### How chip filtering works

The Synerise API returns `extras.slots[].rows[]` (flattened across all slots) where each row has:
- `metadata.secondCategory` — used as the chip label (e.g., "Trousers & Shorts", "Belts")
- `itemIds[]` — product IDs belonging to that category

The filter matches row `itemIds` against three enriched product fields (`sku`, `productGroupID`, `gtin`) to handle different ID mapping conventions between Synerise and VTEX:

```tsx
items.filter((item) => {
  const ids = activeRow.itemIds!;
  return ids.includes(item.sku)
    || ids.includes(item.isVariantOf.productGroupID)
    || ids.includes(item.gtin);
})
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | no | — | Section heading centered above the chip row (e.g., "Popular products") |
| `campaignId` | `string` | yes | — | Synerise AI recommendation campaign ID |
| `productCardConfiguration.showDiscountBadge` | `boolean` | no | `true` | Show discount badge on product cards |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `@faststore/ui` | `Carousel`, `ProductShelf`, `ProductCard`, `ProductCardImage`, `ProductCardContent` |
| `@faststore/core` | `usePDP` — for PDP product context |
| `@faststore/sdk` | `sendAnalyticsEvent` — fires `recommendation_view` and `recommendation_click` |
| `@synerise/faststore-api` | Provides the `syneriseAIRecommendations` SDK resolver |
| `react-intersection-observer` | `useInView` — triggers view analytics when section enters viewport |
| `js-cookie` | Reading `_snrs_uuid` cookie |

### Shared hooks

| Hook | File | Purpose |
|------|------|---------|
| `useRecommendations` | `src/components/sections/RecommendationShelf/hooks/useRecommendations.ts` | GraphQL query — shared with RecommendationShelf |

### Shared components

| Component | File | Purpose |
|---|---|---|
| `RecommendationItem` | `src/components/shared/RecommendationItem.tsx` | Product card (image, title, price) — shared with RecommendationShelf |

### Shared types

| Export | File | Purpose |
|--------|------|---------|
| `RecommendationViewEvent` | `src/types/recommendationEvents.ts` | Analytics event on viewport entry |
| `RecommendationClickEvent` | `src/types/recommendationEvents.ts` | Analytics event on card click |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `@synerise/faststore-api` (SDK) | `syneriseAIRecommendations` resolver — calls Synerise, enriches products via VTEX catalog |
| `src/graphql/thirdParty/typeDefs/recommendations.graphql` | Extended types for `Row`, `Slot`, `Metadata` |

## GraphQL Operations

Uses the same `SyneriseRecommendationsQuery` as `RecommendationShelf` — see that component's README for the full query. The key difference is that this component reads `extras.slots[0].rows[]` for the chip navigation, while RecommendationShelf only reads `data[]`.

Key fields used by this component:
- `data[]` — enriched `StoreProduct` objects
- `extras.correlationId` — for analytics attribution
- `extras.slots[].rows[].metadata.secondCategory` — chip label (rows flattened across all slots)
- `extras.slots[].rows[].itemIds[]` — which products belong to each category

## API Response Example

*This response is specific to the campaign configuration used in this implementation. Your campaign may return different categories and products.*

Raw Synerise response (trimmed to 2 items per row for brevity):

```json
{
  "data": [
    {
      "itemId": "2285",
      "title": "Styleline - Elmont Smart Trousers",
      "category": "Men > Trousers & Shorts",
      "salePrice": 429,
      "imageLink": "https://synerisedemostore.vtexassets.com/arquivos/ids/157683/..."
    },
    {
      "itemId": "1746",
      "title": "Stylela - Sachary Classic Belt",
      "category": "Men > Belts",
      "salePrice": 789,
      "imageLink": "https://synerisedemostore.vtexassets.com/arquivos/ids/157142/..."
    }
  ],
  "extras": {
    "campaignId": "9wNIinhiI95c",
    "correlationId": "e15b46ec-72ee-45e6-a26a-bd5c656086e3",
    "slots": [
      {
        "id": 0,
        "name": "Unnamed slot",
        "rows": [
          {
            "attributeValue": "men>trousers & shorts",
            "itemIds": ["2285", "2321", "2339", "..."],
            "metadata": {
              "category": "men>trousers & shorts",
              "firstCategory": "men",
              "secondCategory": "trousers & shorts",
              "sectionImage": "https://upload.azu.snrcdn.net/.../ec3ecfac52ac42699cac0f993310edf8.png"
            }
          },
          {
            "attributeValue": "men>belts",
            "itemIds": ["1746", "1823", "..."],
            "metadata": {
              "category": "men>belts",
              "firstCategory": "men",
              "secondCategory": "belts",
              "sectionImage": "https://upload.azu.snrcdn.net/.../bb5a77d8cd914393b99fdf7d5a11d480.png"
            }
          },
          {
            "attributeValue": "grocery",
            "itemIds": ["4764", "4651", "..."],
            "metadata": {
              "category": "grocery",
              "firstCategory": "grocery",
              "secondCategory": "grocery",
              "sectionImage": "https://upload.azu.snrcdn.net/.../2a5b2f688d7147d48a67b52cccfd7bc4.png"
            }
          }
        ]
      }
    ]
  }
}
```

Key points:
- Each `rows[]` entry maps to a **chip** — `metadata.secondCategory` is the label
- `rows[].itemIds[]` filters which enriched products to show for that chip
- The SDK enriches `data[]` items into VTEX `StoreProduct` objects — the raw Synerise fields above are replaced by full product data
- `metadata.sectionImage` is available but not used in the current chip-based design (was used by the old side-by-side layout)

## Data Mapping

*This mapping reflects the current implementation. When adapting for a different campaign or store, update the component to match your campaign's response fields and your design requirements.*

| API field | Component usage | Rendered as |
|---|---|---|
| `extras.slots[].rows[].metadata.secondCategory` | Chip label text | `<button>` pill — e.g., "Trousers & Shorts" |
| `extras.slots[].rows[].itemIds[]` | Filters `items` array for active row | Determines which products appear in the carousel |
| `extras.correlationId` | Analytics events | `recommendation_view` / `recommendation_click` payload |
| `data[].image[0].url` | `RecommendationItem` | Product image (1:1, 16px radius) |
| `data[].isVariantOf.name` | `ProductCardContent` title | Product name (16px bold) |
| `data[].offers.offers[0].price` | `ProductCardContent` price | Current price (24px bold) |
| `data[].offers.offers[0].listPrice` | `ProductCardContent` listPrice | Old price (14px strikethrough, if different) |
| `data[].slug` | `ProductCardContent` link | `/[slug]/p` |

## Authentication

Handled by the SDK — reads `apiHost` and `trackerKey` from `discovery.config.synerise.*` and `clientUUID` from the `_snrs_uuid` cookie. No CMS configuration needed for authentication.

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`SectionRecommendation`**

```json
{
  "name": "SectionRecommendation",
  "schema": {
    "title": "Section Recommendations",
    "description": "Section Recommendations - powered by Synerise",
    "type": "object",
    "required": ["campaignId"],
    "properties": {
      "title": { "type": "string", "title": "Title", "description": "Section heading displayed above the category chips" },
      "campaignId": { "type": "string", "title": "Campaign ID", "description": "AI Recommendation Campaign ID" },
      "productCardConfiguration": {
        "type": "object",
        "title": "Product Card Configuration",
        "properties": {
          "showDiscountBadge": { "type": "boolean", "title": "Show discount badge?", "default": true }
        }
      }
    }
  }
}
```

The component must also be registered in:
- `src/components/index.tsx` — exported as `SectionRecommendation`

## File Structure

```
src/components/sections/SectionRecommendation/
├── SectionRecommendation.tsx              # Main component — title + chips + filtered carousel
├── SectionRecommendation.types.ts         # Props interface
├── SectionRecommendation.module.scss      # Styles (chips, title, carousel, foxshop tokens)
├── index.ts                               # Barrel export
└── README.md                              # This file

Shared:
├── src/components/shared/RecommendationItem.tsx     # Product card
├── src/components/sections/RecommendationShelf/hooks/useRecommendations.ts  # GraphQL hook
└── src/types/recommendationEvents.ts                # Analytics event types
```

## Implementing This Component in Another VTEX FastStore App

To add SectionRecommendation to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api react-intersection-observer js-cookie
```

### 2. Configure the SDK resolver

The `syneriseAIRecommendations` resolver is provided by the SDK. Ensure it's registered in `src/graphql/thirdParty/resolvers/index.ts`:

```typescript
import { Resolvers as SyneriseResolvers } from "@synerise/faststore-api";

const resolvers = {
  ...SyneriseResolvers,
  Query: { ...SyneriseResolvers.Query },
};
```

### 3. Copy shared files

- `src/components/shared/RecommendationItem.tsx` — product card
- `src/types/recommendationEvents.ts` — analytics event types
- `src/components/sections/RecommendationShelf/hooks/useRecommendations.ts` — GraphQL query hook (if you don't have RecommendationShelf already)

### 4. Add the component

Copy the `SectionRecommendation/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { SectionRecommendation } from './sections/SectionRecommendation'
export default { SectionRecommendation, /* ...other sections */ }
```

### 5. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 6. Configure your Synerise campaign

The campaign must return **slotted rows** — each row needs:
- `metadata.secondCategory` (used as the chip label)
- `itemIds[]` (product IDs for that category)

If your campaign returns a flat `data[]` without rows, the component will render all products in a single carousel with no chips.

### 7. Configure

- Ensure `discovery.config` has `synerise.apiHost` and `synerise.trackerKey` set
- Add the section to a page in VTEX Headless CMS and provide `title` and `campaignId`

### 8. Prerequisites

- Synerise account with an AI recommendation campaign configured to return slotted rows with category metadata
- Synerise JS SDK (tracker) installed on the storefront — sets the `_snrs_uuid` cookie
- VTEX product catalog accessible for SDK-side product enrichment
