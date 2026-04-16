# SyneriseNavbarSection

Top navigation bar with Synerise-powered search (autocomplete + suggestions), logo, sign-in, cart, and category navigation. Configuration is fully CMS-driven.

## How It Works

1. Receives full navbar configuration from CMS (logo, search config, navigation links, sign-in/cart icons)
2. Passes search config (`apiHost`, `trackerKey`, `productsIndex`, `suggestionsIndex`, `articlesIndex`) to the inner Navbar component
3. The Navbar's search field uses Synerise AI Search for:
   - **Product autocomplete** — via `syneriseAISearch` SDK resolver (`useAutocomplete` hook)
   - **Search suggestions** — via Synerise search API
   - **Article results** — via Synerise search API (separate index)
4. Supports regionalization toggle, mobile menu slider, and page navigation links

## Props

| Prop | Type | Description |
|------|------|-------------|
| `logo` | `{ src, alt, link: { url, title } }` | Store logo with link |
| `searchInput` | `{ placeholder, apiHost, trackerKey, productsIndex, suggestionsIndex, articlesIndex }` | Synerise search configuration |
| `signInButton` | `{ icon, label, myAccountLabel }` | Account button |
| `cartIcon` | `{ icon, alt }` | Shopping cart icon |
| `navigation` | `{ regionalization, pageLinks, menu, home }` | Navigation menu config |

## Dependencies

| Package | Usage |
|---------|-------|
| `@synerise/faststore-api` | `syneriseAISearch` SDK resolver for autocomplete |
| `@faststore/ui` | Navbar UI atoms |
| `js-cookie` | Reading `_snrs_uuid` for personalised search |

## File Structure

```
src/components/sections/SyneriseNavbarSection/
├── SyneriseNavbarSection.tsx     # Section wrapper — passes CMS config to Navbar
├── Navbar/
│   ├── Navbar.tsx                # Main navbar (logo, search, buttons)
│   ├── NavbarLinks.tsx           # Desktop navigation links
│   ├── NavbarSlider.tsx          # Mobile menu (dynamic import)
│   └── SearchInput.tsx           # Search field with autocomplete dropdown
├── SearchDropdown/               # Dropdown UI (products, suggestions, articles)
├── hooks/
│   ├── useAutocomplete.ts        # Product search via syneriseAISearch
│   ├── useSuggestions.ts         # Search suggestions
│   └── useArticles.ts           # Article search
├── section.module.scss           # Styles
├── index.ts                      # Barrel export
└── README.md                     # This file
```
