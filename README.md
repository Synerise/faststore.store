# Faststore Demo

A FastStore + VTEX storefront integrated with Synerise (search, recommendations, promotions, tracking, loyalty). Section components live under `src/components/sections/` and are configured through the VTEX Headless CMS schema in `cms/faststore/sections.json`.

For architecture conventions and rules, see [CLAUDE.md](./CLAUDE.md). For a feature-level overview, see [STORE_FUNCTIONALITIES.md](./STORE_FUNCTIONALITIES.md).

## Available Section Components

| Component | Description |
|---|---|
| [BannerCategorySection](./src/components/sections/BannerCategorySection/README.md) | Full-width hero banner based on the user's last visited category, fetched from a Synerise recommendation campaign. Responsive mobile/desktop images with skeleton shimmer. |
| [BannerSubCategoriesSection](./src/components/sections/BannerSubCategoriesSection/README.md) | Responsive grid of sub-category tiles fetched from a Synerise recommendation campaign. 6 / 3 / 2 columns across desktop / tablet / mobile. |
| [ClientCard](./src/components/sections/ClientCard/README.md) | Loyalty client card showing tier, points balance, transactions, points history, promotions, and vouchers — powered by a single Synerise Brickworks call. |
| [ExclusiveCollection](./src/components/sections/ExclusiveCollection/README.md) | Conditionally rendered product shelf gated by a Synerise Expression evaluation; products from the AI Recommendations API. |
| [GlobalTracker](./src/components/sections/GlobalTracker/README.md) | Invisible tracking component that syncs Synerise cookies with the VTEX order form. Runs on mount, renders nothing. |
| [MenuCategoriesSection](./src/components/sections/MenuCategoriesSection/README.md) | Horizontal navigation bar of category links with customizable colors. Purely CMS-driven, no API calls. |
| [PersonalisedPromotions](./src/components/sections/PersonalisedPromotions/README.md) | Carousel of personalised promotional offers from the Synerise Promotions API. Each promotion can be activated as a coupon on the VTEX order form. |
| [ProductGallerySection](./src/components/sections/ProductGallerySection/README.md) | Full product search and browsing experience powered by Synerise AI Search — faceted filtering, sorting, pagination, search results and listing pages. |
| [RecommendationShelf](./src/components/sections/RecommendationShelf/README.md) | Carousel of product recommendations from a Synerise AI campaign, enriched with VTEX product data. Responsive (4 / 3 / 2 items). |
| [SectionRecommendation](./src/components/sections/SectionRecommendation/README.md) | Recommendations organized by category with chip-style switchers; each chip maps to a slotted row from the campaign. Uses `syneriseAIRecommendations`. |
| [SyneriseBannerSection](./src/components/sections/SyneriseBannerSection/README.md) | Horizontal announcement bar with rotating text titles from a Synerise recommendation campaign. Slide animation at a configurable interval. |
| [SyneriseNavbarSection](./src/components/sections/SyneriseNavbarSection/README.md) | Top navigation bar with Synerise-powered search (autocomplete + suggestions), logo, sign-in, cart, and category navigation. CMS-driven. |

Click any component name above for its full README — data flow, GraphQL, API response example, CMS schema, and the steps to implement it in another store.
