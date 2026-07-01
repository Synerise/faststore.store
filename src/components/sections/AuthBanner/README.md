# AuthBanner

A simple banner section with a **header**, optional **caption**, and optional **CTA button**. It renders different copy depending on whether the visitor is signed in.

---

## How It Works

1. The CMS provides two content groups: `loggedIn` and `loggedOut`, each with `header`, `caption`, `ctaLabel`, and `ctaUrl`.
2. The component reads the current session via `useSession()` (`src/sdk/session`).
3. If `person?.id` is present (signed in) it renders the `loggedIn` copy; otherwise it renders the `loggedOut` copy.
4. The caption renders only when provided; the CTA renders only when both `ctaLabel` and `ctaUrl` are set.

> **Note on hydration:** before the session resolves on the client, `person` is `undefined`, so the `loggedOut` copy renders first and swaps to `loggedIn` once the session is known. This mirrors how the navbar's sign-in button behaves.

---

## Props

Defined in `AuthBanner.types.ts`. Props come from the VTEX Headless CMS.

| Prop        | Type                | Required | Description                              |
|-------------|---------------------|----------|------------------------------------------|
| `loggedOut` | `AuthBannerContent` | Yes      | Content shown to visitors who are not signed in |
| `loggedIn`  | `AuthBannerContent` | Yes      | Content shown to signed-in users         |

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

| Hook         | Source              | Purpose                          |
|--------------|---------------------|----------------------------------|
| `useSession` | `src/sdk/session`   | Determines the current auth state |

No GraphQL, resolvers, or external API calls — this is a purely presentational, session-aware section.

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
