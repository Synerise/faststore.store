# GlobalTracker

Invisible tracking component that syncs Synerise cookies with the VTEX order form. Runs on mount, renders nothing.

## How It Works

1. Reads `_snrs_uuid` and `_snrs_params` cookies set by the Synerise JS SDK
2. Detects device type (mobile/desktop) via `is-mobile` library
3. Pushes all three values (`uuid`, `snrs_params`, `source`) into VTEX order form custom data under the `synerise` app via the `addOrderFormCustomData` GraphQL mutation

This links Synerise tracking to the VTEX checkout, enabling attribution of orders back to Synerise-tracked sessions.

## Props

None — no CMS configuration needed. Component is added once globally.

## Dependencies

| Package | Usage |
|---------|-------|
| `is-mobile` | Device type detection |
| `js-cookie` | Reading `_snrs_uuid`, `_snrs_params` cookies |

## File Structure

```
src/components/sections/GlobalTracker/
├── GlobalTrackerSection.tsx   # Main component — reads cookies, fires mutation
└── index.ts                   # Barrel export
```
