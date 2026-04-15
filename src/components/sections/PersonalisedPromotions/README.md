# PersonalisedPromotions

Displays a carousel of personalised promotional offers for the current user, fetched from the Synerise Promotions API. Each promotion can be activated (applied as a coupon to the VTEX order form).

## How It Works

1. The component receives `apiKey` from CMS props
2. The `usePersonalisedPromotions` hook sends a GraphQL query with `apiKey` and the user's `clientUUID` (from `_snrs_uuid` cookie)
3. The GraphQL resolver authenticates with Synerise using JWT (`/uauth/v2/auth/login/profile`), then calls `/v4/promotions/v2/promotion/get-for-client/uuid/{clientUUID}`
4. Each promotion includes a `status` (`ACTIVE`, `ASSIGNED`, `REDEEMED`) which drives the card UI:
   - `ASSIGNED` — activatable (button enabled, default state)
   - `ACTIVE` — already activated for this client (button shown as activated, disabled)
   - `REDEEMED` — already used (button shown as "Promotion used", disabled)
5. Promotions with images are rendered as cards in a `@faststore/ui` Carousel
6. Clicking "Activate" runs a two-step flow:
   1. **Synerise**: `synerisePromotionActivate` mutation → `POST /v4/promotions/promotion/activate-for-client/uuid/{clientUUID}` with `{ key: "code", value: <promoCode> }` (Bearer JWT, same auth as the fetch). `pointsToUse` is only sent when provided and `> 0`.
   2. **VTEX** (only if Synerise step succeeds): `addOrderFormMarketingTags` mutation → adds the promo code to the order form `marketingData.marketingTags` so the matching VTEX promotion fires at checkout

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiKey` | `string` | yes | — | Synerise API key used for JWT authentication |
| `fallbackText` | `string` | yes | — | Text shown when no promotions are available or the API fails |
| `limit` | `number` | no | `100` | Maximum number of promotions to fetch |

Props are configured per-page in the VTEX CMS (Headless CMS).

## Dependencies

### npm packages

| Package | Usage |
|---------|-------|
| `@faststore/ui` | `Carousel`, `ProductShelf` components |
| `@synerise/faststore-api` | `fetchAPI` used by resolvers and auth utils |
| `js-cookie` | Reading `_snrs_uuid` cookie on the client |

### Shared hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `usePersonalisedPromotions` | `src/hooks/usePersonalisedPromotions.ts` | GraphQL query — fetches promotions for the current user (includes `status`) |
| `useActivatePromotion` | `src/hooks/useActivatePromotion.ts` | Takes `apiKey` and returns `activatePromotion(code, orderFormId?, pointsToUse?)`. Runs the Synerise activation mutation, then (on success) pushes the promo code to the VTEX order form marketing tags. Reads `_snrs_uuid` internally. |

### Shared types (`src/types/`)

| Export | File | Purpose |
|--------|------|---------|
| `Promotion` | `src/types/promotions.ts` | Promotion object shape (used by resolver) |
| `PromotionImage` | `src/types/promotions.ts` | Image with `url` and `type` fields |
| `ImageType` | `src/types/promotions.ts` | Enum-like constant: `IMAGE`, `THUMBNAIL` |

### Shared utils (`src/utils/`)

| Export | File | Purpose |
|--------|------|---------|
| `getValidToken` | `src/utils/auth.ts` | JWT token manager — caches tokens per API key, handles expiry |
| `invalidateToken` | `src/utils/auth.ts` | Removes a cached token (used on 401 retry) |
| `fetchWithAuth` | `src/utils/fetchWithAuth.ts` | Fetch wrapper — injects Bearer token, retries once on 401 |
| `orderFormId` | `src/utils/orderForm.ts` | Reads order form ID from localStorage |

### GraphQL — Query

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/resolvers/promotions.ts` | Resolver: creates `SynerisePromotionsClient` factory; nested `SynerisePromotionsResult.getForClient` calls the API |
| `src/graphql/thirdParty/typeDefs/promotions.graphql` | Schema: `SynerisePromotionsResult`, `SynerisePromotionsData`, `PromotionItem` (with `status`), `PromotionImage`, `extend type Mutation` for `synerisePromotionActivate` |
| `src/graphql/thirdParty/typeDefs/query.graphql` | Root query: `synerisePromotions(apiKey: String!): SynerisePromotionsResult!` |

### GraphQL — Mutations

| File | Purpose |
|------|---------|
| `src/graphql/thirdParty/resolvers/promotions.ts` | Mutation `synerisePromotionActivate(apiKey, clientUUID, code, pointsToUse)` — POSTs to Synerise `/v4/promotions/promotion/activate-for-client/uuid/{clientUUID}` |
| `src/graphql/thirdParty/resolvers/orderForm.ts` | Mutation `addOrderFormMarketingTags` — POSTs promo codes to the VTEX checkout `marketingData` attachment |
| `src/graphql/thirdParty/typeDefs/orderForm.graphql` | Schema: `AddOrderFormMarketingTagsInput`, mutation definitions |

## GraphQL Operations

### Query: `SynerisePromotionsQuery`

```graphql
query SynerisePromotionsQuery($apiKey: String!, $clientUUID: String!, $limit: Int) {
  synerisePromotions(apiKey: $apiKey) {
    getForClient(clientUUID: $clientUUID, limit: $limit) {
      data {
        title
        name
        code
        headline
        discountValue
        discountType
        status
        images { url, type }
        params
      }
    }
  }
}
```

### Mutation: `SynerisePromotionActivate`

```graphql
mutation SynerisePromotionActivate(
  $apiKey: String!
  $clientUUID: String!
  $code: String!
  $pointsToUse: Int
) {
  synerisePromotionActivate(
    apiKey: $apiKey
    clientUUID: $clientUUID
    code: $code
    pointsToUse: $pointsToUse
  )
}
```

`clientUUID` is read from the `_snrs_uuid` cookie on the client (same value used by the query). Returns `Boolean` — `true` if Synerise reports a successful activation. The hook only proceeds to the VTEX step when this returns `true`.

### Mutation: `AddOrderFormMarketingTags`

```graphql
mutation AddOrderFormMarketingTags($orderFormId: String, $marketingTags: [String!]!) {
  addOrderFormMarketingTags(input: { orderFormId: $orderFormId, marketingTags: $marketingTags })
}
```

## Authentication Flow

The promotions API requires JWT authentication.

1. Resolver receives `apiKey` from GraphQL args
2. `fetchWithAuth` calls `getValidToken(apiKey)` which:
   - Returns cached token if still valid (with 60s refresh margin)
   - Otherwise authenticates via `POST /uauth/v2/auth/login/profile` with `{ apiKey }`
   - Decodes JWT `exp` claim for expiry tracking
   - Caches token in a `Map<string, TokenEntry>` (supports multiple API keys)
3. Token is injected as `Authorization: Bearer <token>` header
4. On 401 response, token is invalidated and one retry is attempted with a fresh token

## CMS Configuration

Section name in `cms/faststore/sections.json`: **`PersonalisedPromotions`**

```json
{
  "name": "PersonalisedPromotions",
  "schema": {
    "title": "Personalised Promotions",
    "description": "Personalised Promotions - powered by Synerise",
    "type": "object",
    "properties": {
      "fallbackText": { "type": "string" },
      "apiKey": { "type": "string" },
      "limit": { "type": "integer", "minimum": 1, "default": 100 }
    }
  }
}
```

The component must also be registered in:
- `src/components/index.tsx` — exported as `PersonalisedPromotions`

## File Structure

```
src/components/sections/PersonalisedPromotions/
├── PersonalisedPromotions.tsx          # Main component — carousel with promotion cards
├── PersonalisedPromotions.types.ts     # Props interface (fallbackText, apiKey, limit)
├── PersonalisedPromotions.module.scss  # Styles (responsive, card layout, button states)
├── PromotionCard.tsx                   # Individual promotion card (image, title, activate button)
├── index.ts                            # Barrel export
└── README.md                           # This file
```

## Implementing This Component in Another VTEX FastStore App

To add PersonalisedPromotions to a different FastStore storefront:

### 1. Install the SDK

```bash
yarn add @synerise/faststore-api
```

### 2. Copy shared utilities

These files are required and not part of the npm package:

- `src/utils/auth.ts` — JWT token manager (multi-key cache with expiry)
- `src/utils/fetchWithAuth.ts` — authenticated fetch wrapper with 401 retry
- `src/utils/orderForm.ts` — reads order form ID from localStorage

### 3. Add GraphQL schema and resolvers

Copy to your `src/graphql/thirdParty/` directory:

- `typeDefs/promotions.graphql` — promotion types
- `typeDefs/orderForm.graphql` — mutation types for activation
- `resolvers/promotions.ts` — promotions resolver (factory client + nested resolver)
- `resolvers/orderForm.ts` — order form mutation resolver

Update your resolver index to merge them:

```typescript
import promotionsResolver, { SynerisePromotionsResult } from './promotions'
import orderFormResolver from './orderForm'

const resolvers = {
  SynerisePromotionsResult,
  Mutation: {
    ...orderFormResolver.Mutation,
    ...promotionsResolver.Mutation,
  },
  Query: { ...promotionsResolver.Query },
}
```

Update `typeDefs/query.graphql` to add:

```graphql
synerisePromotions(apiKey: String!): SynerisePromotionsResult!
```

### 4. Add shared types and hooks

- `src/types/promotions.ts` — `Promotion`, `PromotionImage`, `ImageType`
- `src/hooks/usePersonalisedPromotions.ts` — query hook
- `src/hooks/useActivatePromotion.ts` — mutation hook

Update barrel exports in `src/types/index.ts` and `src/hooks/index.ts`.

### 5. Add the component

Copy the `PersonalisedPromotions/` directory to `src/components/sections/`.

Register in `src/components/index.tsx`:

```typescript
import { PersonalisedPromotions } from './sections/PersonalisedPromotions'
export default { PersonalisedPromotions, /* ...other sections */ }
```

### 6. Add CMS schema

Add the section entry to `cms/faststore/sections.json` (see CMS Configuration above).

### 7. Configure

- Ensure `discovery.config` has `synerise.apiHost` set (e.g., `https://api.synerise.com`)
- Ensure `secureSubdomain` is set for order form mutations
- Add the section to a page in VTEX Headless CMS and provide the `apiKey`

### 8. Prerequisites

- Synerise account with API key that has promotions access
- Synerise JS SDK (tracker) installed on the storefront — it sets the `_snrs_uuid` cookie
- A matching VTEX promotion configured to be triggered by the value being pushed 
