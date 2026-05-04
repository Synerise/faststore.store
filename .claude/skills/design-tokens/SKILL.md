---
name: design-tokens
description: >
  Reference skill — do not invoke directly. Loads the merged FastStore design
  tokens (VTEX globals from docs/design-tokens.md + project overrides from
  src/themes/custom-theme.scss) with per-token source annotation. Used by
  review-component and review-all for SCSS audits in a FastStore + Synerise
  project.
metadata:
  author: synerise
  version: "1.0.0"
  lastUpdated: 2026-05-04
---

# FastStore Design Tokens — Cache + Project Overrides Reader (FastStore + Synerise)

Returns the merged list of FastStore design tokens by reading both:
1. the **local VTEX cache** (`docs/design-tokens.md`) — canonical global tokens shipped by FastStore.
2. the **project theme overrides** (`src/themes/custom-theme.scss`) — tokens redefined or added by this store.

Callers (`review-component`, `review-all`) use the returned list to audit SCSS files. A project override means the SCSS author can keep using the same `--fs-*` name, but the value comes from the local theme — so audits must accept any `--fs-*` token that exists in either source.

This skill does NOT fetch from VTEX — that is the job of `refresh-design-tokens`. VTEX's global tokens rarely change, so reading the cache is the default and fast path.

## Step 0: Verify project context

This skill is only valid in a FastStore + Synerise project. Before running, confirm at least one of these signals:

- `package.json` lists `@synerise/faststore-api` as a dependency (strongest signal), OR
- `src/themes/custom-theme.scss` exists, OR
- `docs/design-tokens.md` exists.

If none are present, stop and tell the user:
> This doesn't look like a FastStore + Synerise project (no `@synerise/faststore-api` dep, no theme file, no token cache). Skipping token load.

In practice this skill is invoked by other skills which already guard, so this is a defense-in-depth check.

## Step 1: Read both sources

Read these two files in parallel:

1. `docs/design-tokens.md` — VTEX global cache (markdown).
2. `src/themes/custom-theme.scss` — project theme overrides (SCSS).

Failure modes:
- If `docs/design-tokens.md` is missing, stop and return:
  > `docs/design-tokens.md` is missing. Run the `refresh-design-tokens` skill first to generate it from the VTEX Developer MCP, then commit the result.
- If `src/themes/custom-theme.scss` is missing, continue with VTEX globals only and note in the report:
  > `src/themes/custom-theme.scss` not found — returning VTEX globals only, no project overrides applied.

## Step 2: Parse both sources

**VTEX cache (`docs/design-tokens.md`)** — markdown sections per category, with token lines in the format:
```
- `--fs-token-name`: value-or-reference
```

Expected categories (top-level `##` headings):
- Colors (with sub-sections: Main palette, Neutral palette, Semantic, …)
- Spacing
- Typography (sub-sections: numbered scale, semantic, weights, faces)
- Borders (sub-sections: radius, width, color)
- Transitions
- Shadow

Extract all `--fs-*` token names + values.

**Project theme (`src/themes/custom-theme.scss`)** — SCSS file. Extract every CSS custom property declaration matching the regex:

```
--fs-[\w-]+:\s*[^;]+;
```

For each match, capture the token name (the `--fs-...` part) and its value (everything between `:` and `;`, trimmed; ignore trailing `// ...` SCSS comments).

**Merge rules:**
- Build a map `tokenName → { value, source }`.
- A token present **only in VTEX cache** → `source: "vtex-global"`.
- A token present **only in custom-theme.scss** → `source: "project-override"` (added by the store, no VTEX equivalent).
- A token present in **both** → `source: "project-override"` and use the value from `custom-theme.scss` (the project's value wins at runtime). Optionally keep the VTEX value as `vtexDefault` for context.

Keep values where useful so the caller can suggest a precise replacement (e.g., `--fs-spacing-2 (.75rem)`).

## Step 3: Note the staleness

The VTEX cache header (HTML comment at the top of `docs/design-tokens.md`) contains a `Last refreshed: YYYY-MM-DD` line. Read that date.

When returning results, include the date so the caller can decide whether the snapshot is trustworthy:
- If less than 6 months old → `(VTEX cache last refreshed YYYY-MM-DD)`
- If 6+ months old → `(VTEX cache last refreshed YYYY-MM-DD — over 6 months ago, consider running refresh-design-tokens)`

The project-overrides source (`src/themes/custom-theme.scss`) is read live from the working tree — there is no staleness concern.

## Step 4: Return the merged categorized list

Return the merged token list to the caller. Each token is annotated with its source: `[vtex]` for tokens only in the VTEX cache, `[project]` for tokens defined or overridden in `src/themes/custom-theme.scss`.

Format:

```
## FastStore Design Tokens
Sources: docs/design-tokens.md (VTEX cache, last refreshed YYYY-MM-DD) + src/themes/custom-theme.scss (project overrides)

### Colors
- --fs-color-text (#1d293d) [project]              # overridden, VTEX default was something else
- --fs-color-text-inverse (#f8fafc) [project]
- --fs-color-neutral-bkg [vtex]
- ... (full merged list)

### Spacing
- --fs-spacing-0 (.25rem) [vtex]
- --fs-spacing-1 (.5rem) [vtex]
- ...

### Typography
- --fs-text-size-base (16px) [vtex]
- --fs-text-weight-bold (700) [vtex]
- --fs-text-face-title (...) [project]
- ...

### Borders
- --fs-border-radius-medium (8px) [vtex]
- --fs-border-color (#e2e8f0) [project]
- ...

### Transitions
- --fs-transition-timing (.2s) [vtex]
- --fs-transition-function (ease-in-out) [vtex]

### Project-only tokens (no VTEX equivalent)
- --fs-color-main-0 (#f8fafc) [project]
- ... (any --fs-* defined in custom-theme.scss but not in VTEX cache)
```

Do NOT audit SCSS here — that is the caller's job. Callers should treat any token in the merged list as valid; the `[project]` annotation is informational so the reviewer knows the value comes from the local theme, not the VTEX default.

## Scope

- **In scope:** global tokens (`--fs-color-*`, `--fs-spacing-*`, `--fs-text-*`, `--fs-border-*`, `--fs-transition-*`, `--fs-shadow-*`) from the VTEX cache, plus any `--fs-*` token defined in `src/themes/custom-theme.scss`.
- **Out of scope:** component-local tokens (`--fs-modal-*`, `--fs-button-*`, etc.) that aren't redefined in `custom-theme.scss`. Those are documented per-component on VTEX docs and are not used directly in custom store SCSS.
