# ExclusiveCollection

A conditionally rendered product shelf that only displays when a Synerise Expression evaluation matches a desired value. Uses the Synerise Expressions API to gate visibility and the AI Recommendations API to fetch products.

## How It Works

1. CMS provides `expressionId`, `desiredValue`, `campaignId`, and display settings
2. `useExpression` hook sends a GraphQL query (`SyneriseExpressionQuery`) to evaluate the expression for the current user (identified by `_snrs_uuid` cookie)
3. The server-side resolver calls `POST /analytics/{namespace}/expressions/{expressionId}/calculate/by/{identifierType}` via `SyneriseExpressionClient`
4. The component compares the expression result (cast to string) against `desiredValue`
5. If they match, `useRecommendations` fires (otherwise `doNotRun: true` prevents the fetch)
6. `useRecommendations` sends `SyneriseRecommendationsQuery` through the `syneriseAIRecommendations` resolver
7. The component reads the current page context via `usePDP` and `usePLP` from `@faststore/core` -- if a PDP product context exists, the product group ID is passed as `items` to the recommendations query
8. Products render in a `ProductShelf` + `Carousel`

**States:**
- **Loading:** `ProductShelfSkeleton` placeholder renders while recommendations load
- **Expression mismatch:** Returns `null` -- nothing renders
- **Empty data:** Returns `null` if no recommendation items after loading
- **Error:** No explicit error UI -- component returns `null` on empty data
- **Success:** Product carousel with recommendation tracking events

## Props

Props come from VTEX Headless CMS.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `campaignId` | `string` | Yes | -- | Synerise AI Recommendation campaign ID |
| `expressionId` | `string` | Yes | -- | Synerise Expression ID used to gate visibility |
| `title` | `string` | No | -- | Section heading displayed above the shelf |
| `desiredValue` | `string` | Yes | -- | Expression result value that enables the shelf |
| `itemsPerPage` | `number` | Yes | `5` | Number of products visible per carousel page |
| `productCardConfiguration.showDiscountBadge` | `boolean` | No | `true` | Show discount badge on product cards |
| `productCardConfiguration.bordered` | `boolean` | No | `true` | Show borders on product cards |

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `react-intersection-observer` | Detect when shelf enters viewport for analytics |
| `js-cookie` | Read `_snrs_uuid` cookie for user identification |
| `@faststore/ui` | `ProductShelf`, `Carousel` components |
| `@faststore/sdk` | `sendAnalyticsEvent` for tracking |
| `@faststore/core` | `usePDP`, `usePLP` for page context |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useExpression` | `hooks/useExpression.ts` (local) | Evaluates a Synerise Expression for the current user |
| `useRecommendations` | `../RecommendationShelf/hooks/useRecommendations.ts` (shared) | Fetches AI Recommendation products; accepts `doNotRun` parameter to skip the query when the expression does not match |
| `useScreenResize` | `src/sdk/ui/useScreenResize` | Responsive layout (mobile detection) |

### Shared types

| Export | File | Purpose |
|--------|------|---------|
| `RecommendationViewEvent` | `src/types/recommendationEvents.ts` | Analytics event type for shelf impression |
| `RecommendationClickEvent` | `src/types/recommendationEvents.ts` | Analytics event type for product click |
| `ExpressionByCampaignArgs` | `src/graphql/thirdParty/clients/expression/expression.types.ts` | Expression API request args |

### GraphQL files

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/typeDefs/expression.graphql` | Expression type definitions |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query entry for `syneriseExpressionResult` |
| `src/graphql/thirdParty/resolvers/expression.ts` | `SyneriseExpressionResult` resolver |
| `src/graphql/thirdParty/clients/expression/expression.ts` | `SyneriseExpressionClient` factory |

## GraphQL Operations

### Expression Query

```graphql
query SyneriseExpressionQuery(
    $apiHost: String,
    $namespace: String,
    $expressionId: String,
    $identifierType: String,
    $identifierValue: String
) {
  syneriseExpressionResult(apiHost: $apiHost, namespace: $namespace, expressionId: $expressionId, identifierType: $identifierType, identifierValue: $identifierValue) {
    expression(
        apiHost: $apiHost,
        namespace: $namespace,
        expressionId: $expressionId,
        identifierType: $identifierType,
        identifierValue: $identifierValue
    ) {
      clientId
      expressionId
      name
      result
    }
  }
}
```

Variables: `namespace` is `"profiles"`, `identifierType` is `"uuid"`, `identifierValue` comes from `_snrs_uuid` cookie. The hook reads `data.syneriseExpressionResult.expression.result` and casts it to string for comparison.

### Recommendations Query

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

The `useRecommendations` hook accepts a `doNotRun` parameter. When `doNotRun` is `true`, the query is not executed. This component sets `doNotRun: !expressionMatches` so the recommendations query only fires when the expression result matches the desired value. The hook also strips `doNotRun` from the payload before passing variables to the GraphQL query, forwarding it as an option to `useQuery` instead.

The hook reads `data.syneriseAIRecommendations.recommendations.data` for product items and `extras.correlationId` for tracking.

## API Response Example

### Expression API

```json
{
  "clientId": 12345678,
  "expressionId": "7c09dc12-52a1-4f52-80bc-b954bcb7e5e1",
  "name": "Premium User Check",
  "result": "true"
}
```

> *This response is specific to the expression configuration used in this implementation. Your expression may return different result types (string, number, boolean, object, array) -- adjust the comparison logic accordingly.*

## Authentication

- **Expression API:** Basic auth via `SYNERISE_BASIC_AUTH` environment variable, sent as `Authorization: Basic {token}` header in `SyneriseExpressionClient`
- **Recommendations API:** Handled by the `@synerise/faststore-api` SDK -- uses tracker key and API host from configuration

Credentials come from environment variables configured in the store's deployment.

## Data Mapping

> *This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

| API Field | Component Property | Where Rendered |
|-----------|--------------------|----------------|
| `expression.result` | `expressionResult` | Compared to `desiredValue` -- gates entire component |
| `recommendations.data[].name` | `item.name` | Product card title |
| `recommendations.data[].image` | `item.image` | Product card image |
| `recommendations.data[].offers.lowPrice` | `item.offers.lowPrice` | Product card price |
| `recommendations.data[].offers.lowPriceWithTaxes` | `item.offers.lowPriceWithTaxes` | Product card price with taxes |
| `recommendations.data[].offers.offers[].listPrice` | `item.offers.offers[].listPrice` | Original price for discount calculation |
| `recommendations.data[].offers.offers[].listPriceWithTaxes` | `item.offers.offers[].listPriceWithTaxes` | Original price with taxes |
| `recommendations.data[].offers.offers[].availability` | `item.offers.offers[].availability` | Product availability status |
| `recommendations.data[].isVariantOf.productGroupID` | Key + click tracking | Carousel key, analytics events |
| `recommendations.data[].additionalProperty` | `item.additionalProperty` | Additional product attributes |
| `recommendations.extras.correlationId` | `correlationId` | Sent with view/click analytics events |

## CMS Configuration

Registered as `ExclusiveCollection` in `src/components/index.tsx`.

```json
{
  "name": "ExclusiveCollection",
  "requiredScopes": [],
  "schema": {
    "title": "Exclusive Collection",
    "description": "Exclusive Collection - powered by Synerise",
    "type": "object",
    "required": ["campaignId", "expressionId", "desiredValue", "itemsPerPage"],
    "properties": {
      "campaignId": {
        "type": "string",
        "title": "Campaign ID",
        "description": "AI Recommendation Campaign ID"
      },
      "title": {
        "type": "string",
        "title": "Title"
      },
      "expressionId": {
        "type": "string",
        "title": "Expression ID",
        "description": "Expression ID used to recognize premium user"
      },
      "desiredValue": {
        "type": "string",
        "title": "Target value",
        "description": "Value of the expression result that will recognize premium user"
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

## File Structure

```
ExclusiveCollection/
├── ExclusiveCollection.tsx          # Main component -- expression gate + recommendation shelf
├── ExclusiveCollection.types.ts     # Props type definition
├── ExclusiveCollection.module.scss  # Scoped styles (product shelf layout)
├── index.ts                         # Barrel export
├── README.md                        # This file
└── hooks/
    ├── index.ts                     # Barrel export for hooks
    └── useExpression.ts             # Expression evaluation hook (custom resolver)
```

## Implementing in Another Store

1. **Install SDK package:** Ensure `@synerise/faststore-api` is installed (provides the recommendations resolver)

2. **Copy GraphQL files:**
   - `src/graphql/thirdParty/clients/expression/` (client + types)
   - `src/graphql/thirdParty/typeDefs/expression.graphql`
   - `src/graphql/thirdParty/resolvers/expression.ts`
   - Add `syneriseExpressionResult` entry to `query.graphql`

3. **Wire resolvers** in `src/graphql/thirdParty/resolvers/index.ts`:
   ```ts
   import { SyneriseExpressionResult } from './expression'
   import { SyneriseExpressionClient } from '../clients'

   const resolvers = {
     ...SyneriseResolvers,
     SyneriseExpressionResult,
     Query: {
       ...SyneriseResolvers.Query,
       syneriseExpressionResult: (_, { apiHost, namespace, expressionId, identifierType }) => ({
         syneriseExpressionClient: SyneriseExpressionClient({
           host: apiHost || process.env.SYNERISE_API_URL,
           namespace: namespace ?? '',
           expressionId: expressionId ?? '',
           identifierType: identifierType ?? '',
         }),
       }),
     },
   };
   ```

4. **Update generated schema:** Add `SyneriseExpressionResult`, `SyneriseExpressionResponse` types and query entry to `.faststore/@generated/schema.graphql`

5. **Run GraphQL codegen** to generate TypeScript types

6. **Copy component directory** `src/components/sections/ExclusiveCollection/`

7. **Ensure shared dependencies exist:**
   - `useRecommendations` hook from `RecommendationShelf/hooks/`
   - `RecommendationItem` shared component
   - `RecommendationViewEvent`/`RecommendationClickEvent` types in `src/types/`
   - `ProductShelfSkeleton` from `src/components/skeletons/`

8. **Register** in `src/components/index.tsx`:
   ```ts
   import { ExclusiveCollection } from "./sections/ExclusiveCollection";
   export default { ..., ExclusiveCollection };
   ```

9. **Add CMS schema** to `cms/faststore/sections.json`

10. **Configure environment:**
    - `SYNERISE_API_URL` -- Synerise API base URL (fallback for `apiHost`)
    - `SYNERISE_BASIC_AUTH` -- Base64-encoded credentials for Basic auth on the Expression API
