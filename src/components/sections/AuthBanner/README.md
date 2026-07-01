# AuthBanner

A simple banner section with a **header**, optional **caption**, and optional **CTA button**. It renders different copy depending on whether the visitor is signed in.

---

## How It Works

1. The CMS provides two content groups: `loggedIn` and `loggedOut`, each with `header`, `caption`, `ctaLabel`, and `ctaUrl`. An optional `loyalty` group supplies a Synerise expression to check membership.
2. The component reads the current session via `useSession()` (`src/sdk/session`) and, when `loyalty` is configured, evaluates the expression via `useExpression` (keyed on the `_snrs_uuid` cookie).
3. It renders the `loggedIn` copy when the visitor is signed in **or** is a loyalty member per the expression (expression takes precedence over login, so a signed-out member still sees the logged-in copy); otherwise it renders the `loggedOut` copy.
4. The caption renders only when provided; the CTA renders only when both `ctaLabel` and `ctaUrl` are set.

> **Note on hydration:** before the session resolves on the client, `person` is `undefined`, so the `loggedOut` copy renders first and swaps to `loggedIn` once the session (or expression) resolves. This mirrors how the navbar's sign-in button behaves.

---

## Props

Defined in `AuthBanner.types.ts`. Props come from the VTEX Headless CMS.

| Prop        | Type                | Required | Description                              |
|-------------|---------------------|----------|------------------------------------------|
| `loggedOut` | `AuthBannerContent` | Yes      | Content shown to visitors who are neither signed in nor loyalty members |
| `loggedIn`  | `AuthBannerContent` | Yes      | Content shown to signed-in users (and loyalty members, even when signed out) |
| `loyalty`   | `{ expressionId, desiredValue }` | No | Optional Synerise expression check; when set, members see the `loggedIn` copy even when signed out |

`AuthBannerContent`:

| Field      | Type     | Required | Description                                        |
|------------|----------|----------|----------------------------------------------------|
| `header`   | `string` | Yes      | Banner heading                                     |
| `caption`  | `string` | No       | Supporting text under the header                   |
| `ctaLabel` | `string` | No       | CTA button text (button hidden if missing)         |
| `ctaUrl`   | `string` | No       | CTA button link (button hidden if missing)         |

---

## Dependencies

### Hooks

| Hook            | Source                                      | Purpose                                             |
|-----------------|---------------------------------------------|-----------------------------------------------------|
| `useSession`    | `src/sdk/session`                           | Determines the current auth state                    |
| `useExpression` | `../ExclusiveCollection/hooks`              | Evaluates loyalty membership (only when `loyalty` is configured) |

When `loyalty` is set, the component runs the shared `SyneriseExpressionQuery` (via `useExpression`) to check membership. Otherwise it is purely session-aware with no API calls.

---

## CMS Configuration

The `AuthBanner` entry in `cms/faststore/sections.json` exposes the `loggedOut` and `loggedIn` groups, each with `header`, `caption`, `ctaLabel`, and `ctaUrl` fields (with sensible defaults). The component is registered in `src/components/index.tsx` as `AuthBanner`.

---

## File Structure

```
src/components/sections/AuthBanner/
|-- index.ts                 # Named re-export of AuthBanner
|-- AuthBanner.tsx           # Component (session-aware copy selection)
|-- AuthBanner.types.ts      # Props types (AuthBannerProps, AuthBannerContent)
|-- AuthBanner.module.scss   # Banner card styles (design tokens)
|-- README.md                # This file
```
