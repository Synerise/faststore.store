# Synerise × VTEX FastStore — Feature Overview

> For the business team presenting the demo store at events. Each feature below is live on the storefront and powered by the Synerise + VTEX integration.

---

## 🔍 AI-Powered Search & Navigation

### Search with Autocomplete
The search bar uses **Synerise AI Search** to deliver real-time results as the user types — product suggestions, search term completions, and related articles appear in a dropdown. All search is personalised based on the user's browsing context.

### Product Gallery with Smart Filters
Product listing and search result pages use Synerise's search engine with **faceted filtering** (text and range), sorting, and pagination. Results are ranked by Synerise's AI scoring, not just catalog order.

### Category Navigation
A horizontal menu bar lets users browse top-level categories. Fully configurable in the CMS — no code changes needed to update links or styling.

---

## 🎯 Personalised Recommendations

### Product Recommendations (Carousel)
A horizontal product carousel showing **AI-recommended products** tailored to each visitor. Adapts to context: on a product page, it shows related items; on a category page, it can filter to that category. Products are enriched with real-time VTEX prices and availability.

### Category-Tabbed Recommendations
An advanced recommendation section with **category pill buttons** — users can switch between personalised categories (e.g., "Trousers & Shorts", "Belts", "Grocery"). Each tab shows a different set of recommended products. Categories come from the Synerise campaign, not hardcoded.

### Exclusive Collection *(requires login)*
A premium product shelf that only appears for qualifying customers. Uses Synerise **expressions** to evaluate whether the user meets specific criteria (e.g., loyalty tier, purchase history). If qualified, shows an exclusive product selection. *(Note: login is being finalised — alternative demo flow available.)*

---

## 🖼️ Personalised Banners & Content

### Hero Banner (Category-Based)
A full-width hero banner that shows a **personalised category image** based on the user's last visited category. First-time visitors see a fallback image. Responsive — different images for mobile and desktop.

### Sub-Category Tiles
A responsive grid of **personalised sub-category tiles** based on the user's recent browsing. Not just "popular categories" — they change per visitor. The selection logic is tunable in Synerise (e.g., last 7 days, exclude purchased categories, prioritise high-margin ones).

### Rotating Text Banner
An announcement strip showing **rotating text titles** from a Synerise campaign — can display personalised messages, promotions, or content recommendations. Slides through multiple titles with smooth animation.

---

## 💰 Personalised Promotions

### Promotion Cards with Activation
Shows personalised **promotional offers** available to the current user. Each card displays the promotion image, title, and an "Activate" button. Activation is a two-step process:
1. **Synerise side** — marks the promotion as activated for the user
2. **VTEX side** — pushes the promo code to the checkout so the discount applies automatically

Promotions respect their lifecycle: ASSIGNED → user can activate, ACTIVE → already activated, REDEEMED → already used.

---

## 📊 Tracking & Attribution

### Global Tracker
An invisible component that **syncs Synerise tracking data to VTEX checkout**. Links the `_snrs_uuid` (Synerise user ID) to the VTEX order form, enabling end-to-end attribution: which Synerise recommendation led to which purchase.

### Analytics Events
All recommendation sections fire **view and click analytics events** when the user scrolls to them or clicks a product. These feed back into Synerise's AI models for continuous improvement of recommendations.

---

## 👤 Client Card *(requires login)*

A personalised dashboard showing the customer's **account overview, purchase history, and available offers** — powered by Synerise Brickworks. Provides a 360° view of the customer relationship directly on the storefront. *(Note: login is being finalised — alternative demo flow available.)*

---

## 🛠️ Technical Highlights (for technical audiences)

- **All Synerise data flows through GraphQL** — no direct API calls from the browser
- **JWT authentication** for sensitive endpoints (promotions), **tracker key** for recommendations/search
- **VTEX product enrichment** — Synerise returns product IDs, the SDK enriches them with real VTEX catalog data (prices, availability, images)
- **Design token system** — all components use a centralised theme matching the foxshop reference design
- **CMS-configurable** — every section can be added, removed, or reconfigured via VTEX Headless CMS without code changes
- **Shared resolver architecture** — one `syneriseBanner` resolver serves 3 different banner types (hero, sub-categories, text); one SDK resolver serves all product recommendations

---

*Last updated: 2026-04-16*
