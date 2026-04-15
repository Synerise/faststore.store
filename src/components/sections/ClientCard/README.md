# ClientCard

The `ClientCard` component displays a loyalty client card with tier level, points balance, transaction history, points history, promotions, and vouchers. All data is powered by a single Synerise Brickworks API call.

---

## How It Works

1. The CMS provides `schemaIdentifier` and `recordIdentifier` as props (plus an optional `title`).
2. `ClientCard` reads the `_snrs_uuid` cookie via `js-cookie` and passes it along with the CMS props to the `useBrickworks` hook.
3. `useBrickworks` fires the `SyneriseBrickworksQuery` GraphQL query through `useQuery`.
4. The GraphQL layer resolves `syneriseBrickworksResult` using the resolver in `resolvers/brickworks.ts`.
5. The resolver instantiates `SyneriseBrickworksClient` and calls `brickworksByCampaign`, which POSTs to `/brickworks/v1/schemas/{schema}/records/{record}/generate/by/{type}` with Basic auth (`SYNERISE_BASIC_AUTH` env var).
6. The Synerise Brickworks API returns a flat JSON object with fixed `__`-prefixed metadata fields and custom schema fields.
7. The resolver strips the `__` prefixes from metadata fields and bundles all custom fields into a `data` JSON scalar.
8. `ClientCard` extracts `data` from the response and distributes it to three sub-components:
   - `AccountOverview` reads `data.pointsAmount` and `data.tierLevel`
   - `History` reads `data.transactionData` and `data.pointsData`
   - `Offers` reads `data.promotionsList` and `data.vouchersList`

### Error state

Each sub-component (`AccountOverview`, `History`, `Offers`) receives the `error` object from the hook. When `error` is truthy, each sub-component renders a fallback message in place of its data:

- AccountOverview: "Unable to load points" (the tier badge still renders with the default "None" value)
- History: "Unable to load transactions" and "Unable to load points history"
- Offers: "Unable to load promotions" and "Unable to load vouchers"

### Loading state

There is no explicit loading indicator. While the query is in flight, `data` is `undefined` and the sub-components render with default/empty values (0 points, "None" tier, empty tables and lists).

### Empty data state

When the API returns successfully but custom fields are missing or empty:

- `pointsAmount` defaults to `0`, `tierLevel` defaults to `"None"`
- Transaction and points history tables render with headers but no rows
- Promotions and vouchers lists render with headers but no cards

---

## Props

Defined in `ClientCard.types.ts`. Props come from the VTEX Headless CMS.

| Prop               | Type     | Required | Default        | Description                                   |
|--------------------|----------|----------|----------------|-----------------------------------------------|
| `title`            | `string` | No       | `"My Account"` | Section heading displayed above the card       |
| `schemaIdentifier` | `string` | Yes      | --             | Brickworks schema identifier (from CMS)        |
| `recordIdentifier` | `string` | Yes      | --             | Brickworks record identifier (from CMS)        |

---

## Dependencies

### npm packages

| Package      | Usage                                            |
|--------------|--------------------------------------------------|
| `js-cookie`  | Reads `_snrs_uuid` cookie for profile identifier |

### Hooks

| Hook            | File path                          | Purpose                                              |
|-----------------|------------------------------------|------------------------------------------------------|
| `useBrickworks` | `./hooks/useBrickworks.ts`         | Executes the `SyneriseBrickworksQuery` GraphQL query |

The `hooks/index.ts` barrel file re-exports only `useBrickworks`. `ClientCard.tsx` uses only this single hook -- all data (account info, history, promotions, vouchers) comes from the one Brickworks API call.

### GraphQL files

| File                                                             | Purpose                                                        |
|------------------------------------------------------------------|----------------------------------------------------------------|
| `src/graphql/thirdParty/typeDefs/query.graphql`                  | Root query definition (`syneriseBrickworksResult`)             |
| `src/graphql/thirdParty/typeDefs/brickworks.graphql`             | `SyneriseBrickworksResponse` and `SyneriseBrickworksResult` types |
| `src/graphql/thirdParty/resolvers/brickworks.ts`                 | Resolver that calls the Brickworks client                      |
| `src/graphql/thirdParty/clients/brickworks/brickworks.ts`        | HTTP client for the Brickworks REST API                        |
| `src/graphql/thirdParty/clients/brickworks/brickworks.types.ts`  | TypeScript types for client args and response                  |

---

## GraphQL Operations

The full query fired by `useBrickworks` (from `hooks/useBrickworks.ts`):

```graphql
query SyneriseBrickworksQuery(
    $apiHost: String,
    $schemaIdentifier: String,
    $recordIdentifier: String,
    $identifierType: String,
    $identifierValue: String!,
    $context: [String],
    $fieldContext: JSON
) {
  syneriseBrickworksResult(apiHost: $apiHost, schemaIdentifier: $schemaIdentifier, recordIdentifier: $recordIdentifier, identifierType: $identifierType) {
    brickworks(
        identifierValue: $identifierValue,
        context: $context,
        fieldContext: $fieldContext
    ) {
      slug
      recordVersion
      publishedAt
      updatedAt
      schemaId
      id
      schemaVersion
      createdAt
      matchedAudience
      unmatchedAudienceRelations
      data
    }
  }
}
```

Variables passed by the component:

```json
{
  "schemaIdentifier": "<from CMS>",
  "recordIdentifier": "<from CMS>",
  "identifierType": "uuid",
  "identifierValue": "<_snrs_uuid cookie value>"
}

```

The `apiHost`, `context`, and `fieldContext` variables are accepted by the hook but are not currently set by `ClientCard.tsx`. They can be used for advanced scenarios (custom API host, audience context, or field-level context).

The hook reads `data?.syneriseBrickworksResult?.brickworks?.data` from the response and passes it to sub-components as a `Record<string, unknown>`.

---

## API Response Example

> *This response is specific to the campaign configuration used in this implementation. Your campaign may return different custom fields -- adjust the resolver and component accordingly.*

The Brickworks REST endpoint returns a flat JSON object. Fixed fields (prefixed with `__`) are mapped to named GraphQL fields by the resolver. Everything else becomes the `data` JSON scalar.

```jsonc
{
  // Fixed fields (stripped of __ prefix by the resolver)
  "__slug": "client-card-schema",
  "__recordVersion": 3,
  "__publishedAt": "2025-11-01T10:00:00Z",
  "__updatedAt": "2025-11-15T08:30:00Z",
  "__schemaId": "abc-123-def",
  "__id": "rec-456-ghi",
  "__schemaVersion": 2,
  "__createdAt": "2025-10-01T09:00:00Z",
  "__matchedAudience": true,
  "__unmatchedAudienceRelations": [],

  // Custom schema fields (become `data` in GraphQL response)
  "pointsAmount": 4250,
  "tierLevel": "Gold",
  "transactionData": [
    { "id": "ORD-001", "date": "2025-11-10", "amount": 129.99 },
    { "id": "ORD-002", "date": "2025-11-05", "amount": 49.50 }
  ],
  "pointsData": [
    { "date": "2025-11-10", "amount": 130 },
    { "date": "2025-11-05", "amount": 50 }
  ],
  "promotionsList": {
    "data": [
      {
        "name": "Winter Sale",
        "discountType": "PERCENTAGE",
        "discountValue": 15,
        "description": "15% off all winter items",
        "code": "WINTER15"
      }
    ]
  },
  "vouchersList": {
    "data": [
      {
        "clientId": 123456,
        "clientUuid": "aaa-bbb-ccc",
        "assignedAt": "2025-11-01T00:00:00Z",
        "code": "VOUCHER-XYZ",
        "status": "ACTIVE",
        "createdAt": "2025-10-28T00:00:00Z",
        "updatedAt": "2025-11-01T00:00:00Z",
        "poolUuid": "pool-111-222"
      }
    ]
  }
}
```

<!-- TODO: paste a sample API response from your campaign here -->

---

## Authentication

The Brickworks REST call uses **HTTP Basic Authentication**.

| Environment Variable   | Description                                                    |
|------------------------|----------------------------------------------------------------|
| `SYNERISE_BASIC_AUTH`  | Base64-encoded `username:password` string for Basic auth header |

The header is set in `clients/brickworks/brickworks.ts`:

```ts
headers: {
    "Authorization": `Basic ${process.env.SYNERISE_BASIC_AUTH}`
}
```

This runs **server-side only** (inside the GraphQL resolver), so the credential is never exposed to the browser.

---

## Data Mapping

> *This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

The resolver separates the raw Brickworks response into fixed metadata fields and a `data` JSON blob containing custom schema fields. The component reads from `data`:

| Brickworks field        | Target component   | How it is used                                                  |
|-------------------------|--------------------|------------------------------------------------------------------|
| `data.pointsAmount`     | `AccountOverview`  | Cast to `Number`, displayed as the points balance with `toLocaleString()` formatting, suffixed with "pts" |
| `data.tierLevel`        | `AccountOverview`  | Cast to `String`, rendered as a badge. The value is a string returned directly by the API (defaults to `"None"` when absent) |
| `data.transactionData`  | `History`          | Array of `{ id, date, amount }` rendered in a table. Amount is formatted as USD with `toFixed(2)` |
| `data.pointsData`       | `History`          | Array of `{ date, amount }` rendered in a table. Positive amounts are prefixed with `+` |
| `data.promotionsList`   | `Offers`           | Object with `{ data: [{ name, discountType, discountValue, description, code }] }`. Each promotion renders as a card showing name, description, discount percentage, and coupon code |
| `data.vouchersList`     | `Offers`           | Object with `{ data: [{ clientId, clientUuid, assignedAt, code, status, createdAt, updatedAt, poolUuid }] }`. Each voucher renders as a card showing code, status, and assignment date |

---

## CMS Configuration

The ClientCard entry in `cms/faststore/sections.json`:

```json
{
  "name": "ClientCard",
  "requiredScopes": [],
  "schema": {
    "title": "Client Card",
    "description": "Client Card - powered by Synerise",
    "type": "object",
    "required": [],
    "properties": {
      "title": {
        "type": "string",
        "title": "Title"
      },
      "schemaIdentifier": {
        "type": "string",
        "title": "Brickworks schema identifier"
      },
      "recordIdentifier": {
        "type": "string",
        "title": "Brickworks record identifier"
      }
    }
  }
}
```

The component is **not registered** in `src/components/index.tsx`. To activate it as a CMS-driven section you must add it to the default export there (see [Implementing in Another Store](#implementing-in-another-store) below).

---

## File Structure

```
src/components/sections/ClientCard/
|-- index.ts                        # Named re-export of ClientCard
|-- ClientCard.tsx                   # Main component (orchestrates sub-components)
|-- ClientCard.types.ts              # Props type (ClientCardProps)
|-- ClientCard.module.scss           # Section-level styles
|-- README.md                        # This file
|
|-- hooks/
|   |-- index.ts                     # Re-exports useBrickworks
|   |-- useBrickworks.ts             # GraphQL hook (SyneriseBrickworksQuery)
|
|-- AccountOverview/
|   |-- index.ts                     # Re-export
|   |-- AccountOverview.tsx          # Tier badge + points balance cards
|   |-- AccountOverview.module.scss  # Grid layout, badge & points styles
|
|-- History/
|   |-- index.ts                     # Re-export
|   |-- History.tsx                   # Transaction history + points history tables
|   |-- History.module.scss          # Table styles
|
|-- Offers/
    |-- index.ts                     # Re-export
    |-- Offers.tsx                   # Promotions list + vouchers list
    |-- Offers.module.scss           # Card grid styles, coupon code styling
```

GraphQL layer (outside the component):

```
src/graphql/thirdParty/
|-- clients/
|   |-- brickworks/
|       |-- brickworks.ts            # SyneriseBrickworksClient (HTTP client)
|       |-- brickworks.types.ts      # Client args + response types
|
|-- resolvers/
|   |-- brickworks.ts                # SyneriseBrickworksResult resolver
|
|-- typeDefs/
|   |-- query.graphql                # Root Query including syneriseBrickworksResult
|   |-- brickworks.graphql           # SyneriseBrickworksResponse + SyneriseBrickworksResult types
|
|-- utils/
    |-- fetch.ts                     # fetchAPI utility used by the Brickworks client
```

---

## Implementing in Another Store

### 1. Install dependencies

```bash
npm install js-cookie
npm install -D @types/js-cookie   # if using TypeScript
```

### 2. Copy the GraphQL layer

Ensure the following files exist in your store:

- `src/graphql/thirdParty/clients/brickworks/brickworks.ts`
- `src/graphql/thirdParty/clients/brickworks/brickworks.types.ts`
- `src/graphql/thirdParty/resolvers/brickworks.ts`
- `src/graphql/thirdParty/typeDefs/brickworks.graphql`
- `src/graphql/thirdParty/utils/fetch.ts` (the `fetchAPI` utility)

Add the Brickworks query to your `query.graphql`:

```graphql
syneriseBrickworksResult(
  apiHost: String,
  schemaIdentifier: String,
  recordIdentifier: String,
  identifierType: String
): SyneriseBrickworksResult
```

Re-export the client from your clients barrel file (`src/graphql/thirdParty/clients/index.ts`):

```ts
export * from './brickworks'
```

Wire the resolver into your resolver map (the exact approach depends on your store's resolver setup).

### 3. Set the environment variable

Add `SYNERISE_BASIC_AUTH` to your `.env` (or hosting provider's environment):

```env
SYNERISE_BASIC_AUTH=<base64 encoded username:password>
```

### 4. Copy the component

Copy the entire `src/components/sections/ClientCard/` directory into your store's `src/components/sections/`.

### 5. Register the CMS section

Add the ClientCard entry to `cms/faststore/sections.json` (see [CMS Configuration](#cms-configuration) above).

### 6. Register the component

In `src/components/index.tsx`, import and export the component:

```ts
import { ClientCard } from "./sections/ClientCard";

export default {
  // ... existing sections
  ClientCard,
};
```

### 7. Configure in the CMS

Add a `ClientCard` section to your page in the Headless CMS and fill in:

- **Title** -- heading text (optional, defaults to "My Account")
- **Brickworks schema identifier** -- your Brickworks schema ID
- **Brickworks record identifier** -- your Brickworks record ID

### 8. Ensure the Synerise tracker is active

The component reads the `_snrs_uuid` cookie set by the Synerise JS SDK tracker. Make sure the tracker snippet or `GlobalTracker` section is present on every page so the cookie is available when `ClientCard` renders.

### 9. Configure your Brickworks schema

In the Synerise platform, your Brickworks schema must be configured to return the fields expected by the component: `pointsAmount`, `tierLevel`, `transactionData`, `pointsData`, `promotionsList`, and `vouchersList`. If your schema uses different field names, update the sub-components (`AccountOverview`, `History`, `Offers`) to match.
