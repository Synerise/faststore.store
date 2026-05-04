# FastStore + Synerise — Claude Skills

Maintained by: Synerise CSI dev team

Skill set for code review, documentation, and design-token tooling in FastStore stores integrated with the Synerise platform via `@synerise/faststore-api`.

All skills are scoped to FastStore + Synerise projects. Each one verifies the project context (Step 0) before doing any work, so dropping the directory into an unrelated repo is safe — the skills will refuse to run.

## Inventory

| Skill | Type | Purpose | Argument |
|---|---|---|---|
| `review-component` | Executable | Audit one section component against the 5 architectural rules from `CLAUDE.md`. | Component path |
| `review-all` | Executable | Audit every component under `src/components/sections/`, output a per-component breakdown + summary dashboard. | none |
| `create-readme` | Executable | Generate `README.md` for a section component, tracing data flow from JSX → hook → GraphQL → resolver → Synerise API. | Component path |
| `refresh-design-tokens` | Executable | Pull current FastStore global tokens from VTEX docs (via VTEX Developer MCP) and write them to `docs/design-tokens.md`. | none |
| `readme-rules` | Reference | Defines the 11 required sections + quality criteria for component README files. | n/a |
| `design-tokens` | Reference | Returns the merged FastStore token list (VTEX cache + project overrides). | n/a |

**Reference skills** are never invoked by the user directly. Executable skills consult them.

## Dependency graph

```
user
 │
 ├─► review-all ─────► review-component ─┬─► readme-rules
 │                                       │
 │                                       └─► design-tokens ◄─── refresh-design-tokens
 │                                                                  (writes docs/design-tokens.md)
 │
 ├─► review-component ─┬─► readme-rules
 │                     └─► design-tokens
 │
 ├─► create-readme ────► readme-rules
 │
 └─► refresh-design-tokens   (writes the cache that `design-tokens` reads)
```

When editing any rule criterion, update it in the canonical location only — downstream skills delegate, they don't redefine:
- 5 architectural rules → `CLAUDE.md` (project root)
- README structure → `readme-rules`
- Design token list → `design-tokens` (reads cache + overrides)
- Status semantics for reviews → `review-component`

## Prerequisites

For the skills to function, the target store needs:

| File / dir | Required by | Purpose |
|---|---|---|
| `package.json` with `@synerise/faststore-api` dep | All skills (Step 0 guard) | Strongest signal that this is a FastStore + Synerise project. |
| `src/components/sections/` | `review-component`, `review-all`, `create-readme` | Section components live here. |
| `discovery.config.js` | All skills (Step 0 guard) | FastStore store config. |
| `CLAUDE.md` with the 5 architectural rules | `review-component`, `review-all` | Canonical rule definitions — review skills delegate. |
| `cms/faststore/sections.json` | `review-component`, `create-readme` | CMS schema verification + README generation. |
| `src/graphql/thirdParty/{resolvers,typeDefs}/` | `review-component`, `create-readme` | Data-flow tracing (hook → resolver). |
| `docs/design-tokens.md` | `design-tokens` (and indirectly `review-component` Rule 5) | VTEX token cache. Run `refresh-design-tokens` to generate. |
| `src/themes/custom-theme.scss` | `design-tokens` | Project token overrides. Optional — skill falls back to VTEX-only. |
| VTEX Developer MCP | `refresh-design-tokens` | Source of token data. |

The Step 0 guard checks the first three (package dep, sections dir, discovery.config.js). The rest are checked at the point of use, with explicit failure messages if missing.

## Migration to another FastStore + Synerise store

To enable this skill set in a new store:

1. **Copy the directory** — `cp -r .claude/skills/ <new-store>/.claude/skills/` (or commit it to a shared template repo and pull from there).
2. **Copy or merge `CLAUDE.md`** — review skills read the 5 architectural rules from there. Without it, Rule 1–5 audits have no source of truth.
3. **Generate the design-tokens cache** — run `refresh-design-tokens` once. It writes `docs/design-tokens.md`. Commit the result.
4. **Verify Step 0 passes** — run any review skill on a known component. If it stops with "This doesn't look like a FastStore + Synerise project", the guard is failing — check that one of `@synerise/faststore-api` / `src/components/sections/` / `discovery.config.js` is actually present.
5. **(Optional) Confirm `src/themes/custom-theme.scss` exists** — without it, `design-tokens` returns VTEX globals only, and Rule 5 audits won't be aware of any project-overridden token values.

The skills do **not** depend on:
- Any specific component existing (no hardcoded reference components — pattern guidance is generic).
- Any specific git branch, remote, or CI setup.
- User-specific paths.

They **do** depend on the FastStore directory layout and the SDK package name (`@synerise/faststore-api`). Both are stable across stores.

## Conventions

**Frontmatter** — every SKILL.md has:
```yaml
---
name: <skill-id>
description: <what it does + when to use; scoped "FastStore + Synerise project only">
metadata:
  author: <github_username>
  version: "1.0.0"
  lastUpdated: YYYY-MM-DD
---
```

**Step 0 — project guard** — every executable skill starts with the same project-context check (defense-in-depth — if one skill is invoked outside its parent skill's guard, it still refuses to run).

**Reference skills** — `readme-rules` and `design-tokens` are never invoked standalone. Executable skills consult them. Marked as such in the description.

**Status semantics for review skills** — defined canonically in `review-component` ("Status semantics" subsection). `review-all` references that definition rather than restating it.

**Failure messages** — format: `> This doesn't look like a FastStore + Synerise project (...). Skipping <action>.` Other failure modes (missing MCP, missing cache, missing custom-theme) have explicit messages with remediation hints.

## Maintenance

- **Bump `version`** when behavior changes in a way callers should notice (new step, changed output format, new dependency).
- **Update `lastUpdated`** on any edit.
- **Update this README** when adding a skill, removing a skill, changing the dependency graph, or adding a new prerequisite.
- **`design-tokens` cache freshness** — VTEX rarely changes globals. If `docs/design-tokens.md` is older than 6 months, the `design-tokens` skill prompts the user to re-run `refresh-design-tokens`.
