# SectionRecommendation

Renders slotted AI recommendation carousels powered by Synerise. Each slot contains one or more rows, where every row displays a category image alongside a product carousel. This layout is designed for campaigns that organize recommendations into categorized sections (e.g., "Shoes", "Accessories"), each with its own hero image and product set.

---

## How It Works

1. **CMS** provides `campaignId`, `itemsPerPage`, and `productCardConfiguration` to the component.
2. The component reads the current product context via the `usePDP` hook from `@faststore/core`. If a product detail page is active, the product's `productGroupID` is passed as the `items` context to the recommendation API.
3. The component calls the shared **`useRecommendations`** hook (from `RecommendationShelf/hooks/`) which executes the `SyneriseRecommendationsQuery` GraphQL query.
4. The query hits the **SDK resolver** for `syneriseAIRecommendations` -- it does **not** use a custom resolver. The SDK connects to the Synerise AI Recommendations API using the tracker key and API host from the store configuration.
5. The response contains two key parts:
   - `recommendations.data` -- a flat array of `StoreProduct` objects.
   - `recommendations.extras.slots` -- an array of slots, each with rows that reference product SKUs and carry metadata (category name, section image, etc.).
6. The component maps slots to `<SectionRecommendationSlot>` components, which in turn map rows to `<SectionRecommendationRow>` components. Each row matches products from the flat `data` array to the row's `itemIds` by comparing against the product `sku` field, then renders a category image (via `<SectionRecommendationLoader>`) next to a `<Carousel>` of product cards.
7. Analytics events (`recommendation_view`, `recommendation_click`) are dispatched via `@faststore/sdk`'s `sendAnalyticsEvent`.

---

## Props

Defined in `SectionRecommendation.types.ts`:

```ts
type SectionRecommendationProps = {
  campaignId: string;
  itemsPerPage: number;
  productCardConfiguration: {
    showDiscountBadge: boolean;
    bordered: boolean;
  };
};
```

| Prop | Type | Description |
|------|------|-------------|
| `campaignId` | `string` | Synerise AI Recommendation campaign ID. |
| `itemsPerPage` | `number` | Number of products visible per page in the carousel (desktop). On mobile, always 1. |
| `productCardConfiguration.showDiscountBadge` | `boolean` | Whether to show the discount badge on product cards. |
| `productCardConfiguration.bordered` | `boolean` | Whether product cards have a visible border. |

---

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `js-cookie` | Reads `_snrs_uuid` cookie to pass as `clientUUID` to the recommendation API. |
| `react-intersection-observer` | Detects when the component enters the viewport to fire the `recommendation_view` analytics event. |
| `@faststore/ui` | Provides `ProductShelf`, `Carousel`, and `Skeleton` UI components. |
| `@faststore/sdk` | `sendAnalyticsEvent` for dispatching analytics events. |
| `@faststore/core` | `usePDP` hook for reading the current product detail page context. |

### Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useRecommendations` | `src/components/sections/RecommendationShelf/hooks/useRecommendations.ts` | Shared hook that executes the `SyneriseRecommendationsQuery` GraphQL query. Also used by `RecommendationShelf`. |
| `useScreenResize` | `src/sdk/ui/useScreenResize` | Detects mobile vs desktop viewport. |

### Types

| Type | Location | Description |
|------|----------|-------------|
| `RecommendationViewEvent` | `src/types/recommendationEvents.ts` | Analytics event fired when recommendations enter the viewport. |
| `RecommendationClickEvent` | `src/types/recommendationEvents.ts` | Analytics event fired when a user clicks a recommended product. |

### GraphQL files

| File | Description |
|------|-------------|
| `src/graphql/thirdParty/typeDefs/recommendations.graphql` | Type definitions for `SyneriseRecommendationsResponse`, `Slot`, `Row`, `Metadata`, etc. |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root `Query` type that exposes the `syneriseAIRecommendations` field. |

---

## GraphQL Operations

The full query executed by `useRecommendations`:

```graphql
query SyneriseRecommendationsQuery(
  $apiHost: String,
  $trackerKey: String
  $campaignId: String,
  $clientUUID: String,
  $items: [String],
  $itemsSource: ItemsSourceInput,
  $itemsExcluded: [String],
  $additionalFilters: String,
  $filtersJoiner: FilterJoiner,
  $additionalElasticFilters: String,
  $elasticFiltersJoiner: FilterJoiner,
  $displayAttributes: [String],
  $includeContextItems: Boolean
) {
  syneriseAIRecommendations(campaignId: $campaignId, apiHost: $apiHost, trackerKey: $trackerKey) {
    recommendations(
      campaignId: $campaignId,
      clientUUID: $clientUUID,
      items: $items,
      itemsSource: $itemsSource,
      itemsExcluded: $itemsExcluded,
      additionalFilters: $additionalFilters,
      filtersJoiner: $filtersJoiner,
      additionalElasticFilters: $additionalElasticFilters,
      elasticFiltersJoiner: $elasticFiltersJoiner,
      displayAttributes: $displayAttributes,
      includeContextItems: $includeContextItems
    ) {
      data {
        id: productID
        slug
        sku
        brand {
          brandName: name
        }
        name
        gtin
        isVariantOf {
          productGroupID
          name
        }
        image {
          url
          alternateName
        }
        brand {
          name
        }
        offers {
          lowPrice
          lowPriceWithTaxes
          offers {
            availability
            price
            listPrice
            listPriceWithTaxes
            quantity
            seller {
              identifier
            }
          }
        }
        additionalProperty {
          propertyID
          name
          value
          valueReference
        }
      }
      extras {
        correlationId
        contextItems {
          itemId
          additionalData
        }
        slots {
          id
          name
          itemIds
          error {
            status
            error
            message
          }
          rows {
            attributeValue
            itemIds
            metadata {
              category
              firstCategory
              itemId
              secondCategory
              sectionImage
            }
          }
        }
      }
    }
  }
}
```

---

## API Response Example

> **Note:** This response is specific to the campaign configuration. The structure of `extras.slots` and the metadata fields depend on how the Synerise AI campaign is set up.

```jsonc
{
  "syneriseAIRecommendations": {
    "recommendations": {
      "data": [
        {
          "id": "12345",
          "slug": "blue-sneakers-12345",
          "sku": "SKU-001",
          "brand": { "brandName": "BrandX" },
          "name": "Blue Sneakers",
          "gtin": "0012345678901",
          "isVariantOf": { "productGroupID": "PG-100", "name": "Sneakers" },
          "image": [{ "url": "https://cdn.example.com/img/blue-sneakers.jpg", "alternateName": "Blue Sneakers" }],
          "offers": {
            "lowPrice": 79.99,
            "lowPriceWithTaxes": 95.99,
            "offers": [{
              "availability": "https://schema.org/InStock",
              "price": 79.99,
              "listPrice": 99.99,
              "listPriceWithTaxes": 119.99,
              "quantity": 50,
              "seller": { "identifier": "seller-1" }
            }]
          },
          "additionalProperty": []
        }
        // ... more products
      ],
      "extras": {
        "correlationId": "abc-123-def-456",
        "contextItems": [],
        "slots": [
          {
            "id": 1,
            "name": "Footwear",
            "itemIds": ["SKU-001", "SKU-002", "SKU-003"],
            "error": null,
            "rows": [
              {
                "attributeValue": "sneakers",
                "itemIds": ["SKU-001", "SKU-002"],
                "metadata": {
                  "category": "Sneakers",
                  "firstCategory": "Footwear",
                  "itemId": "cat-sneakers",
                  "secondCategory": "Casual",
                  "sectionImage": "https://cdn.example.com/img/sneakers-category.jpg"
                }
              },
              {
                "attributeValue": "boots",
                "itemIds": ["SKU-003"],
                "metadata": {
                  "category": "Boots",
                  "firstCategory": "Footwear",
                  "itemId": "cat-boots",
                  "secondCategory": "Outdoor",
                  "sectionImage": "https://cdn.example.com/img/boots-category.jpg"
                }
              }
            ]
          }
        ]
      }
    }
  }
}
```

---

## Authentication

Authentication is handled entirely by the **FastStore SDK resolver**. The SDK reads the `apiHost` and `trackerKey` from the store configuration and passes them as query variables. On the client side, the component reads the Synerise client UUID from the `_snrs_uuid` cookie (via `js-cookie`) and sends it as `clientUUID`.

No custom authentication logic is required in the component itself.

---

## Data Mapping

| API Response Path | Usage in Component |
|---|---|
| `recommendations.data[]` | Flat list of `StoreProduct` objects rendered as product cards via `<RecommendationItem>`. |
| `recommendations.data[].sku` | Used to match products against row `itemIds` in `SectionRecommendationRow`. |
| `extras.slots[]` | Each slot maps to a `<SectionRecommendationSlot>`. |
| `extras.slots[].rows[]` | Each row maps to a `<SectionRecommendationRow>` (category image + carousel). |
| `extras.slots[].rows[].itemIds` | Iterated in `SectionRecommendationRow`; each ID is matched against `items.find((i) => i.sku === itemId)` to resolve the corresponding `StoreProduct`. Unmatched IDs are skipped (returns `null`). |
| `extras.slots[].rows[].metadata.sectionImage` | URL for the category image displayed next to the carousel. |
| `extras.slots[].rows[].metadata.category` | Used as the `alt` text for the category image. |
| `extras.correlationId` | Passed in analytics events for tracking. |

Product matching in `SectionRecommendationRow` is a single SKU-based lookup: `items.find((i) => i.sku === itemId)`. There is no fallback matching by `id` or `productGroupID`.

---

## CMS Configuration

The component is registered in the FastStore CMS under the name `SectionRecommendation`. Here is the JSON schema from `cms/faststore/sections.json`:

```json
{
  "name": "SectionRecommendation",
  "requiredScopes": [],
  "schema": {
    "title": "Section Recommendations",
    "description": "Section Recommendations - powered by Synerise",
    "type": "object",
    "required": ["campaignId", "itemsPerPage"],
    "properties": {
      "campaignId": {
        "type": "string",
        "title": "Campaign ID",
        "description": "AI Recommendation Campaign ID"
      },
      "itemsPerPage": {
        "type": "integer",
        "title": "Number of items per page",
        "default": 5,
        "description": "Number of items to display per page in carousel"
      },
      "productCardConfiguration": {
        "title": "Product Card Configuration",
        "type": "object",
        "properties": {
          "showDiscountBadge": {
            "title": "Show discount badge?",
            "type": "boolean",
            "default": true
          },
          "bordered": {
            "title": "Cards should be bordered?",
            "type": "boolean",
            "default": true
          }
        }
      }
    }
  }
}
```

The component is also registered in `src/components/index.tsx` as:

```ts
import { SectionRecommendation } from "./sections/SectionRecommendation";

export default {
  // ...
  SectionRecommendation,
  // ...
};
```

---

## File Structure

```
src/components/sections/SectionRecommendation/
  index.ts                            # Re-exports default from SectionRecommendation.tsx
  SectionRecommendation.tsx           # Main component: fetches data, manages analytics, maps slots
  SectionRecommendation.types.ts      # TypeScript prop types
  SectionRecommendation.module.scss   # Scoped styles (responsive layout for image + carousel)
  SectionRecommendationLoader.tsx     # Skeleton/image loader for the category image
  SectionRecommendationRow.tsx        # Single row: category image + product carousel
  SectionRecommendationSlot.tsx       # Single slot: iterates over rows
  README.md                           # This file
```

Related files outside this directory:

```
src/components/sections/RecommendationShelf/hooks/useRecommendations.ts   # Shared hook (GraphQL query)
src/components/shared/RecommendationItem.tsx                              # Shared product card component
src/types/recommendationEvents.ts                                         # Analytics event types
src/graphql/thirdParty/typeDefs/recommendations.graphql                   # GraphQL type definitions
src/graphql/thirdParty/typeDefs/query.graphql                             # Root Query type
cms/faststore/sections.json                                               # CMS section schema
src/components/index.tsx                                                   # Component registry
```

---

## Implementing in Another Store

To reuse this component in a different FastStore project:

1. **Install dependencies**
   ```bash
   yarn add js-cookie react-intersection-observer
   yarn add -D @types/js-cookie
   ```
   Ensure `@faststore/ui`, `@faststore/sdk`, and `@faststore/core` are already available (standard in FastStore projects).

2. **Copy the GraphQL type definitions**
   - `src/graphql/thirdParty/typeDefs/recommendations.graphql` -- the type definitions for slots, rows, metadata, etc.
   - Add `syneriseAIRecommendations` to your `query.graphql` root Query type.

3. **Copy the shared hook**
   - `src/components/sections/RecommendationShelf/hooks/useRecommendations.ts`
   - This hook uses `@generated/gql` and `@generated/graphql`, so run code generation after adding the GraphQL files.

4. **Copy the component directory**
   - Copy the entire `src/components/sections/SectionRecommendation/` directory.
   - Also copy `src/components/shared/RecommendationItem.tsx` if not already present.
   - Copy `src/types/recommendationEvents.ts` for the analytics event types.

5. **Register in the CMS**
   - Add the `SectionRecommendation` entry to your `cms/faststore/sections.json`.
   - Register the component in your `src/components/index.tsx` override file.

6. **Configure Synerise**
   - Ensure your FastStore SDK is configured with the Synerise `apiHost` and `trackerKey` so the SDK resolver can authenticate requests.
   - Create an AI Recommendation campaign in the Synerise panel with slots and rows configured to return `sectionImage` metadata.

7. **Run code generation**
   ```bash
   yarn generate
   ```
   This regenerates the typed GraphQL hooks and types from your schema.
