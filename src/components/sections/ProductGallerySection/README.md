# ProductGallerySection

Full product search and browsing experience powered by Synerise AI Search. Includes faceted filtering, sorting, pagination, and both search results and product listing pages.

## How It Works

1. Receives `indexId`, `trackerKey`, `apiHost`, `filters`, `sort`, and `itemsPerPage` from CMS
2. Reads URL params for search query, pagination, active facets, and sort order
3. Calls Synerise Search API via the `syneriseAISearch` SDK resolver — supports `search(query)` for search pages and `listing()` for PLPs
4. Renders a filterable product gallery with toolbar, sort controls, facets (text + range), and paginated product grid
5. Updates URL on filter/sort/page changes for shareable/bookmarkable state

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `indexId` | `string` | yes | Synerise search index ID |
| `trackerKey` | `string` | yes | Synerise tracker key |
| `apiHost` | `string` | yes | Synerise API host (e.g., `https://api.azu.synerise.com`) |
| `filters` | `Filter[]` | yes | Facet definitions: `{ label, facetName, facetType: "Range" \| "Text" }` |
| `sort` | `SortOption[]` | yes | Sort options: `{ label, key, sortBy, ordering, isDefault }` |
| `itemsPerPage` | `number` | yes | Products per page (default: 12) |

## Dependencies

| Package | Usage |
|---------|-------|
| `@synerise/faststore-api` | `syneriseAISearch` SDK resolver for search and listing |
| `@faststore/core` | `usePage`, `usePLP` for page context |

## File Structure

```
src/components/sections/ProductGallerySection/
├── ProductGallerySection.tsx             # Section wrapper with SearchProvider
├── ProductGallery.tsx                    # Main gallery (toolbar + filters + products)
├── ProductGalleryPage.tsx                # Single page renderer
├── ProductGallerySort.tsx                # Sort dropdown
├── SearchProvider.tsx                    # React context for search state
├── ProductGalleryFilters/               # Filter components (boolean, range, mobile)
├── hooks/                               # useSearchQuery, usePagination, useSearchPrefetch
├── utils/                               # getFacets, getSelectedFacets, prepareFilters, etc.
├── types.ts                             # Filter, SortOption, SelectedFacetsType
├── styles.module.scss                   # Styles
├── index.ts                             # Barrel export
└── README.md                            # This file
```
