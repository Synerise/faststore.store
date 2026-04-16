# RecommendationShelf

Displays a carousel of product recommendations from a Synerise AI campaign. Products are enriched with full VTEX product data (prices, images, variants) via the `syneriseAIRecommendations` SDK resolver. Each card links to the product page. Responsive carousel: 4 items on desktop, 3 on tablet, 2 on mobile.

## How It Works

1. The component receives `title`, `campaignId`, and optional `shouldFilterByCategory` + `productCardConfiguration` from CMS props
2. The `useRecommendations` hook sends a GraphQL query to the SDK's `syneriseAIRecommendations` resolver with `campaignId` and optional context filters
3. If the current page is a **PDP**, the current product's `productGroupID` is sent as `items` context so Synerise can recommend related products
4. If `shouldFilterByCategory` is enabled on a **PLP**, the current category facet is applied as `additionalFilters` so recommendations stay within the category
5. The SDK resolver calls Synerise `/recommendations/v2/recommend/campaigns/`, gets back a list of product IDs, then enriches each with full VTEX product data (prices, images, variants)
6. The hook returns `{ data, error, loading }`
7. Products render in a `<Carousel>` as `<RecommendationItem>` cards (shared with `SectionRecommendation`)
8. When the shelf enters the viewport, a `recommendation_view` analytics event fires once; clicks on cards fire `recommendation_click` events

### Component States

| State | Condition | What the user sees |
|---|---|---|
| **Loading** | `loading === true` | `ProductShelfSkeleton` with N placeholder cards (N = responsive `itemsPerPage`) |
| **Success** | `items.length > 0` | Horizontal carousel of product cards with hover arrow controls |
| **Empty** | `loading === false && items.length === 0` | Component returns `null` (nothing rendered) |

### How the data pipeline works

This component uses the `syneriseAIRecommendations` resolver provided by the `@synerise/faststore-api` SDK. The SDK handles the full product enrichment pipeline: it calls the Synerise AI recommendations endpoint to get the recommended product IDs for the current user, then looks each one up in the VTEX catalog to return fully shaped `StoreProduct` objects — prices, images, variants, SKUs, seller offers, and any other product fields you query for.

That means this component doesn't need a custom GraphQL resolver of its own. It just consumes the enriched response through `useQuery` and renders cards. Authentication (tracker key), product lookup, and data shaping all happen inside the SDK, transparently.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | yes | — | Section heading displayed above the carousel |
| `campaignId` | `string` | yes | — | Synerise AI recommendation campaign ID |
| `shouldFilterByCategory` | `boolean` | no | `false` | On PLPs, restricts recommendations to the current category |
| `productCardConfiguration.showDiscountBadge` | `boolean` | no | `true` | Show a discount badge on cards when there's a price difference |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `@faststore/ui` | `Carousel`, `ProductShelf`, `ProductCard`, `ProductCardImage`, `ProductCardContent` |
| `@faststore/core` | `usePDP`, `usePLP` — for page context (current product / category) |
| `@faststore/sdk` | `sendAnalyticsEvent` — fires `recommendation_view` and `recommendation_click` |
| `@synerise/faststore-api` | Provides the `syneriseAIRecommendations` SDK resolver |
| `react-intersection-observer` | `useInView` — triggers the view analytics event when the shelf scrolls into viewport |
| `next/link` | `NextLink` — used by the shared `RecommendationItem` for client-side navigation |

### Component hooks (`RecommendationShelf/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useRecommendations` | `hooks/useRecommendations.ts` | GraphQL query — fetches recommendations via `syneriseAIRecommendations`, returns `{ data, error, loading }` |

### Shared components (`src/components/shared/`)

| Component | File | Purpose |
|---|---|---|
| `RecommendationItem` | `src/components/shared/RecommendationItem.tsx` | Renders a single product card (image, title, price). Shared with `SectionRecommendation` and other recommendation shelves. |

### Shared types (`src/types/`)

| Export | File | Purpose |
|--------|------|---------|
| `RecommendationViewEvent` | `src/types/recommendationEvents.ts` | Analytics event fired when shelf enters viewport |
| `RecommendationClickEvent` | `src/types/recommendationEvents.ts` | Analytics event fired when a product card is clicked |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `@synerise/faststore-api` (SDK) | Provides `syneriseAIRecommendations` resolver — calls Synerise API, enriches items with VTEX product data |
| `src/graphql/thirdParty/typeDefs/recommendations.graphql` | Extended types (e.g., `Row`, `Slot`, `Metadata`) supporting additional fields for other components. Not strictly required for this component. |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query: `syneriseAIRecommendations(...): SyneriseRecommendationsResult!` |

## GraphQL Operations

### Query: `SyneriseRecommendationsQuery`

```graphql
query SyneriseRecommendationsQuery(
  $apiHost: String
  $trackerKey: String
  $campaignId: String
  $clientUUID: String
  $items: [String]
  $itemsSource: ItemsSourceInput
  $itemsExcluded: [String]
  $additionalFilters: String
  $filtersJoiner: FilterJoiner
  $additionalElasticFilters: String
  $elasticFiltersJoiner: FilterJoiner
  $displayAttributes: [String]
  $includeContextItems: Boolean
) {
  syneriseAIRecommendations(campaignId: $campaignId, apiHost: $apiHost, trackerKey: $trackerKey) {
    recommendations(
      campaignId: $campaignId
      clientUUID: $clientUUID
      items: $items
      itemsSource: $itemsSource
      itemsExcluded: $itemsExcluded
      additionalFilters: $additionalFilters
      filtersJoiner: $filtersJoiner
      additionalElasticFilters: $additionalElasticFilters
      elasticFiltersJoiner: $elasticFiltersJoiner
      displayAttributes: $displayAttributes
      includeContextItems: $includeContextItems
    ) {
      data {
        id: productID
        slug
        sku
        brand { brandName: name }
        name
        gtin
        isVariantOf { productGroupID name }
        image { url alternateName }
        brand { name }
        offers {
          lowPrice
          lowPriceWithTaxes
          offers {
            availability
            price
            listPrice
            listPriceWithTaxes
            quantity
            seller { identifier }
          }
        }
        additionalProperty { propertyID name value valueReference }
      }
      extras {
        correlationId
        contextItems { itemId additionalData }
        slots { id name itemIds error { status error message } rows { attributeValue itemIds metadata { category firstCategory itemId secondCategory sectionImage } } }
      }
    }
  }
}
```

**Key variables used by this component:**
- `campaignId` — from CMS props
- `items` — the current product's `productGroupID` when on a PDP
- `additionalFilters` + `filtersJoiner` — `category=="{currentCategory}" AND` when `shouldFilterByCategory` is enabled on a PLP
- `clientUUID`, `trackerKey`, `apiHost` — handled by the SDK resolver (read from `discovery.config`)

The hook reads `data.syneriseAIRecommendations.recommendations.data` (the products) and `extras.correlationId` (for analytics).

## API Response Example

*This response is specific to the campaign configuration and VTEX catalog used in this implementation. Your campaign may return different products or fields.*

The **raw Synerise response** looks like this (2 items shown for brevity):

```json
{
  "data": [
    {
      "brand": "Sítio da Lagoa",
      "category": "Grocery > Greens",
      "imageLink": "https://synerisedemostore.vtexassets.com/arquivos/ids/160358/Buque-de-Couve-Flor-Sitio-da-Lagoa-300g.jpg",
      "images": ["https://synerisedemostore.vtexassets.com/arquivos/ids/160358/Buque-de-Couve-Flor-Sitio-da-Lagoa-300g.jpg"],
      "itemId": "4919",
      "link": "https://demovtexio.synerise.com/buque-de-couve-flor-sitio-da-lagoa-300g-7835116/p?snrai_campaign=ysMmIvdPkzVK&snrai_id=3a96de76-...",
      "price": "{value:204}",
      "salePrice": 204,
      "sale_price": 204,
      "title": "Buquê de Couve Flor Sítio da Lagoa 300g",
      "variations": { "image": [], "images": [[ "..." ]] }
    },
    {
      "brand": "Bonduelle",
      "category": "Grocery > Greens",
      "imageLink": "https://synerisedemostore.vtexassets.com/arquivos/ids/160249/Couve-Flor-Congelada-Bonduelle-300g.jpg",
      "images": ["https://synerisedemostore.vtexassets.com/arquivos/ids/160249/Couve-Flor-Congelada-Bonduelle-300g.jpg"],
      "itemId": "4810",
      "link": "https://demovtexio.synerise.com/couve-flor-congelada-bonduelle-300g-9690590/p?snrai_campaign=...",
      "price": "{value:319}",
      "salePrice": 319,
      "sale_price": 319,
      "title": "Couve Flor Congelada Bonduelle 300g",
      "variations": { "image": [], "images": [[ "..." ]] }
    }
  ],
  "extras": {
    "campaignId": "ysMmIvdPkzVK",
    "contextItems": null,
    "correlationId": "3a96de76-2f28-4657-b8a4-4e41b811753f",
    "slots": [
      { "id": 0, "itemIds": ["4919", "4810"], "name": "same cat", "rows": null },
      { "id": 1, "itemIds": ["4911", "1751", "1726", "..."], "name": "same cat", "rows": null }
    ]
  }
}
```

Key points:
- The raw Synerise response contains **product references** (`itemId`, `title`, `imageLink`, `salePrice`) — not fully shaped VTEX products
- The SDK resolver takes these `itemId`s and **enriches** them via VTEX's catalog, returning `StoreProduct` objects with prices, variants, offers, etc. — so the component only sees the enriched shape (as shown in the GraphQL query above)
- `extras.correlationId` flows through to analytics events for attribution
- `extras.slots` holds multiple groupings (`same cat`, etc.) — this shelf flattens them into a single list; `SectionRecommendation` renders each slot separately
- `extras.slots[].rows` is `null` here — it's only populated for metadata-based campaigns (banners), not product campaigns

## Authentication

The recommendations API uses tracker-key authentication handled by the SDK:

1. The SDK resolver reads `apiHost` and `trackerKey` from `discovery.config.synerise.*` automatically
2. The component does not need to pass or handle these values
3. No CMS configuration needed for authentication — it's a store-level global

## Data Mapping

*This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

| API field (response) | Component/JSX | Rendered as |
|---|---|---|
| `data[].image[0].url` | `<img src>` | Product image inside `ProductCardImage` |
| `data[].image[0].alternateName` | `<img alt>` | Alt text |
| `data[].isVariantOf.name` | `ProductCardContent` `title` | Product title under image |
| `data[].offers.offers[0].price` | `price.value` | Current price (24px bold) |
| `data[].offers.offers[0].listPrice` | `price.listPrice` | Old price (14px bold, line-through) when different from `price` |
| `data[].slug` | `linkProps.href` | Link target: `/{slug}/p` |
| `data[].isVariantOf.productGroupID` | Carousel `key`, analytics `items`/`item` | React key + analytics event payload |
| `extras.correlationId` | Analytics event `correlationId` | For attribution in `recommendation_view` / `recommendation_click` |

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`RecommendationShelf`**

```json
{
  "name": "RecommendationShelf",
  "schema": {
    "title": "Recommendation shelf",
    "description": "Recommended items – powered by Synerise",
    "type": "object",
    "required": ["title", "campaignId"],
    "properties": {
      "title": { "type": "string", "title": "Title" },
      "campaignId": { "type": "string", "title": "Campaign ID", "description": "AI Recommendation Campaign ID" },
      "shouldFilterByCategory": { "type": "boolean", "title": "Filter by category", "default": false },
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
- `src/components/index.tsx` — exported as `RecommendationShelf`

## File Structure

```
src/components/sections/RecommendationShelf/
├── RecommendationShelf.tsx              # Main component — carousel + analytics + responsive itemsPerPage
├── RecommendationShelf.types.ts         # Props interface
├── RecommendationShelf.module.scss      # Section-level styles (container, title, carousel bullets hidden)
├── hooks/
│   ├── useRecommendations.ts            # GraphQL query hook
│   └── index.ts                         # Barrel export
├── index.ts                             # Barrel export
└── README.md                            # This file

src/components/shared/
└── RecommendationItem.tsx               # Product card — shared with SectionRecommendation

src/types/
└── recommendationEvents.ts              # Analytics event types
```

## Implementing This Component in Another VTEX FastStore App

To add RecommendationShelf to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api react-intersection-observer
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

No custom resolver needed — the SDK handles everything.

### 3. Copy shared files

- `src/components/shared/RecommendationItem.tsx` — the product card (used by this and other recommendation shelves)
- `src/types/recommendationEvents.ts` — analytics event types

### 4. Add the component

Copy the `RecommendationShelf/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { RecommendationShelf } from './sections/RecommendationShelf'
export default { RecommendationShelf, /* ...other sections */ }
```

### 5. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 6. Configure

- Ensure `discovery.config` has `synerise.apiHost` and `synerise.trackerKey` set
- Add the section to a page in VTEX Headless CMS and provide `title` and `campaignId`

### 7. Prerequisites

- Synerise account with an AI recommendation campaign that returns product IDs from your VTEX catalog
- Synerise JS SDK (tracker) installed on the storefront — sets the `_snrs_uuid` cookie used by the SDK resolver
- VTEX product catalog accessible to the storefront (for SDK-side product enrichment)
