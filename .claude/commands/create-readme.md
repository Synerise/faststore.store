Create a README.md for the component at: $ARGUMENTS

## Instructions

First, read the README rules file at `.claude/commands/readme-rules.md` — it defines the required sections, quality criteria, and the goal of the README.

Then follow these steps:

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
3. Read the typeDef in `src/graphql/thirdParty/typeDefs/`
4. Check if the resolver uses an SDK resolver or a custom one — if custom, understand why
5. Read any shared types (`src/types/`), hooks (`src/hooks/`), or utils (`src/utils/`) used
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

Following the structure in `.claude/commands/readme-rules.md`, write a complete README.md.

Key quality requirements:
- **GraphQL queries must be complete and copy-pasteable** — include all variables and fields
- **API response example** — include a realistic sample JSON response based on the resolver types. If you can't determine the exact shape, mark it as `<!-- TODO: paste actual API response -->` and flag it to the user
- **Data mapping table** — show API field → component property → where rendered
- **"Implementing in Another Store" must be self-contained** — a developer following only these steps should succeed
- **Error/loading/empty states** — describe what the user sees in each case

### Step 7: Verify

Before outputting the README, check:
- [ ] Every section from readme-rules.md is present
- [ ] All file paths referenced actually exist
- [ ] GraphQL query matches what's in the hook code
- [ ] Props table matches the types file
- [ ] CMS JSON matches sections.json
- [ ] File structure matches actual directory contents

Write the README to `[component-path]/README.md`.
