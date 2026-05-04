---
name: readme-rules
description: >
  Reference skill — do not invoke directly. Defines the required structure and
  quality criteria for section component README files: 11 required sections,
  their contents, and the README's goal. Source of truth for create-readme and
  review-component in a FastStore + Synerise project.
metadata:
  author: synerise
  version: "1.0.0"
  lastUpdated: 2026-05-04
---

# README Rules for Section Components (FastStore + Synerise)

These rules define the required structure and quality criteria for component README files in a FastStore + Synerise project. Both the `review-component` and `create-readme` skills reference these rules.

This is a **reference skill** — it is never executed standalone. It is consulted by other skills, which apply their own project-context guards before reaching it.

## Goal

The README must be sufficient for:
1. A developer with no project context to implement the component in a different FastStore store
2. An AI code assistant to generate correct integration code from the README alone
3. A developer debugging a data issue to compare expected vs actual API responses

## Required Sections (in order)

### 1. Title + Description
- Component name as H1
- 1-2 sentences: what it does, what API it uses, what the user sees

### 2. How It Works
- Numbered flow: CMS props → hook → GraphQL → resolver → API → render
- Include what happens on **error**, **loading**, and **empty data** states
- If using a custom resolver instead of an SDK resolver, explain **why** (e.g., "SDK resolver enriches as products, but this campaign returns metadata")

### 3. Props
- Table with columns: Prop, Type, Required, Default, Description
- Note that props come from VTEX Headless CMS

### 4. Dependencies
Split into sub-tables:
- **npm packages** — Package, Usage
- **Hooks** — Hook name, File path, Purpose (note if shared `src/hooks/` or component-local `hooks/`)
- **Shared types** — Export, File, Purpose (only if types live in `src/types/`)
- **Shared utils** — Export, File, Purpose (only if using shared utils)
- **GraphQL files** — File path, Purpose (resolvers, typeDefs, query.graphql entry)

### 5. GraphQL Operations
- Full query/mutation code blocks (copy-pasteable)
- Brief explanation after each: what variables mean, what the response contains
- Note if the hook reads a specific path from the response (e.g., "reads `data[0]`" or "reads `extras.slots[0].rows[0].metadata`")

### 6. API Response Example
- A sample raw JSON response from the Synerise API (the resolver's upstream call)
- Annotate key fields that the resolver/hook extracts
- This is critical for debugging — developers need to compare expected vs actual response shape

**Important:** Synerise APIs (especially recommendations) are flexible — different campaign configurations return different field names and structures. The sample response documents **this specific campaign's output**, not a universal format. Note this in the README:
> *This response is specific to the campaign configuration used in this implementation. Your campaign may return different fields — adjust the resolver and hook accordingly.*

**How to capture:** The developer should paste a real API response during development. If not available when generating the README, add a `<!-- TODO: paste a sample API response from your campaign here -->` placeholder and flag it to the user.

### 7. Authentication
- How the API is authenticated: tracker key (`?token=`), JWT (Bearer), or none
- Where credentials come from: CMS props, discovery.config.js, etc.
- Any caching/refresh behavior (e.g., JWT token cache with 60s margin)

### 8. Data Mapping
- Table showing: API field → Component property → Where it's rendered
- Especially important when field names differ (e.g., `banner_url` → `image` → `<img>` desktop)

**Important:** This mapping documents how **this implementation** wires up the data. Developers adapting the component for their store will likely adjust which fields they display and how they style them. Prefix the section with a note:
> *This mapping reflects the current implementation. When adapting for a different campaign or store, update the hook and component to match your campaign's response fields and your design requirements.*

### 9. CMS Configuration
- Section name in `cms/faststore/sections.json`
- Full JSON schema block (copy-pasteable)
- Note registration in `src/components/index.tsx`

### 10. File Structure
- Directory tree with one-line descriptions per file

### 11. Implementing in Another Store
Step-by-step guide covering:
1. Install SDK package
2. Copy utilities (if any non-SDK utils are needed)
3. Add GraphQL schema + resolvers (with merge code example)
4. Add types and hooks (if shared)
5. Copy component directory
6. Register in component index
7. Add CMS schema
8. Configure (discovery.config.js, env vars)
9. Prerequisites (Synerise account, tracker SDK, VTEX setup)

## Project README Index

The repository's root `README.md` contains an **Available Section Components** table that lists every component under `src/components/sections/` with a one-line description and a relative link to that component's `README.md`.

Whenever a section component is **added, renamed, removed, or has its purpose materially changed**, the root README index MUST be updated in the same change:

- **Added** — append a row to the table with the component name (linked to `./src/components/sections/<Name>/README.md`) and a single-sentence description derived from the new README's intro paragraph.
- **Renamed** — update both the link text and the path; verify the linked README exists at the new path.
- **Removed** — delete the row.
- **Description drift** — if a component's intro paragraph in its own README changes meaningfully, refresh the root table row to match (keep it to one sentence — full detail lives in the component README).

The description in the table should be:
- One sentence, ideally derived from the first sentence of the component README's intro
- Focused on what the component does and which Synerise/VTEX feature powers it
- Free of marketing language and implementation jargon

Quality criteria for the index:
- [ ] Every directory in `src/components/sections/` has exactly one row in the table
- [ ] Every link resolves to an existing `README.md`
- [ ] Component name in the link text matches the directory name exactly
- [ ] No orphaned rows for components that no longer exist

## Quality Checklist

- [ ] A developer can implement the component by following only the README
- [ ] GraphQL queries are complete and copy-pasteable
- [ ] API response example is included with real field names
- [ ] Error/loading/empty states are documented
- [ ] Data mapping from API → component is clear
- [ ] Authentication method is documented
- [ ] CMS JSON schema is included
- [ ] "Implementing in Another Store" steps are self-contained
- [ ] Root `README.md` index has been updated if a component was added, renamed, removed, or had its purpose changed
