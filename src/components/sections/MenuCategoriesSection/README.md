# MenuCategoriesSection

Horizontal navigation bar displaying category links with customizable colors. Purely CMS-driven — no API calls.

## How It Works

1. Receives `backgroundColor`, `textColor`, and `menu[]` array from CMS
2. Filters out invalid items (empty text or link)
3. Renders a `<nav>` with styled links

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `backgroundColor` | `string` | yes | Background color (e.g., `#ffffff`) |
| `textColor` | `string` | yes | Link text color (e.g., `#444444`) |
| `menu` | `{ text: string, link: string }[]` | yes | Array of menu items |

## File Structure

```
src/components/sections/MenuCategoriesSection/
├── MenuCategoriesSection.tsx          # Main component
├── MenuCategoriesSection.types.ts     # Props interface
├── MenuCategoriesSection.module.scss  # Styles
├── index.ts                           # Barrel export
└── README.md                          # This file
```
