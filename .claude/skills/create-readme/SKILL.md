---
name: create-readme
description: >
  Use this skill when the user asks to create a README, write documentation,
  generate docs, scaffold a README, document a component, or add a README to
  a section component in a FastStore + Synerise project. Traces full data flow:
  component → hook → GraphQL → resolver → Synerise API. Component path is the
  skill argument.
metadata:
  author: synerise
  version: "1.0.0"
  lastUpdated: 2026-05-04
---

# Create Component README (FastStore + Synerise)

Create a README.md for the component at the path provided as the skill argument.

## Step 0: Verify project context

This skill is only valid in a FastStore + Synerise project. Before running, confirm at least one of these signals:

- `package.json` lists `@synerise/faststore-api` as a dependency (strongest signal), OR
- `src/components/sections/` directory exists, OR
- `discovery.config.js` file exists at the repo root.

If none are present, stop and tell the user:
> This doesn't look like a FastStore + Synerise project (no `@synerise/faststore-api` dep, no `src/components/sections/`, no `discovery.config.js`). Skipping README generation.

## Instructions

First, consult the `readme-rules` skill — it defines the required sections, quality criteria, and the goal of the README. Then follow these steps:

### Step 1: Read All Component Files

Read every file in the component directory:
- Component (.tsx)
- Types (.types.ts)
- Hooks (hooks/ directory)
- Styles (.module.scss)
- Barrel exports (index.ts)
- Any existing README.md (to update rather than replace)

### Step 2: Trace the Data Flow

Follow every import to understand the full data pipeline:
1. Read each hook — find the `gql()` query and `useQuery()` call
2. Identify the GraphQL resolver — read it in `src/graphql/thirdParty/resolvers/`
3. If the resolver imports from `../clients`, follow the import and read the client factory in `src/graphql/thirdParty/clients/[feature]/` — this is where the actual HTTP call and request/response types live for features with dedicated client modules.
4. Read the typeDef in `src/graphql/thirdParty/typeDefs/`
5. Check if the resolver uses an SDK resolver or a custom one — if custom, understand why
6. Read any shared types (`src/types/`), hooks (`src/hooks/`), or utils (`src/utils/`) used
6. Check the CMS schema in `cms/faststore/sections.json`
7. Check registration in `src/components/index.tsx`

### Step 3: Understand the API

From the resolver, identify:
- The Synerise API endpoint being called
- Authentication method (tracker key, JWT, none)
- Request shape (method, headers, body)
- Response shape — reconstruct from the resolver's type definitions and the GraphQL typeDef

If you cannot determine the exact API response shape from the code, ask the user: "Can you paste a sample API response from this campaign? This helps document the expected data shape for debugging. If you don't have one now, I'll add a TODO placeholder."

### Step 4: Map Data Flow

Trace how data moves from API response → resolver → GraphQL → hook → component → JSX:
- Which response fields are extracted
- How they're renamed/transformed
- Where each field ends up in the rendered output

### Step 5: Identify States

From the component code, document:
- **Loading state** — what renders while waiting for data
- **Error state** — what renders on API failure
- **Empty state** — what renders when data is empty
- **Success state** — normal rendering

### Step 6: Write the README

Following the structure defined in the `readme-rules` skill, write a complete README.md.

Key quality requirements:
- **GraphQL queries must be complete and copy-pasteable** — include all variables and fields
- **API response example** — include a realistic sample JSON response based on the resolver types. If you can't determine the exact shape, mark it as `<!-- TODO: paste actual API response -->` and flag it to the user
- **Data mapping table** — show API field → component property → where rendered
- **"Implementing in Another Store" must be self-contained** — a developer following only these steps should succeed
- **Error/loading/empty states** — describe what the user sees in each case

### Step 7: Verify

Before outputting the README, check:
- [ ] Every section from the readme-rules skill is present
- [ ] All file paths referenced actually exist
- [ ] GraphQL query matches what's in the hook code
- [ ] Props table matches the types file
- [ ] CMS JSON matches sections.json
- [ ] File structure matches actual directory contents

Write the README to `[component-path]/README.md`.

### Step 8: Update the Root README Index

After writing the component README, update the **Available Section Components** table in the root `README.md`:

- If this component is new, append a row with the component name (linked to `./src/components/sections/<Name>/README.md`) and a one-sentence description derived from the new README's intro paragraph.
- If this component already had a row but the purpose changed, refresh the description to match the new intro.
- Keep the table sorted alphabetically by component name and free of orphan rows.

This keeps the project's component index in sync — see the **Project README Index** section of the `readme-rules` skill for the full rule.
