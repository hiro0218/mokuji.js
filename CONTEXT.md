# Domain Vocabulary

`mokuji.js` (Japanese for "table of contents") generates a hierarchical TOC — a nested list of links — from heading elements (`h1`–`h6`) inside an HTML container.

Terms used in this codebase. Keep in sync with code as concepts evolve.

## heading identity

The final, unique, user-facing ID assigned to a heading element after all of:

- preserving an author-provided `id` attribute when present,
- generating an ID from `textContent` when absent (Wikipedia-style or RFC 3986 percent-encoded, depending on `anchorType`),
- deduplicating across the heading set with the `_N` suffix scheme,
- preserving any pre-existing `aaa_N`-shaped IDs so that suffix assignment skips over reserved values.

A heading identity is the single source of truth for the heading's `id` attribute, the TOC list anchor's `href`, and the per-heading anchor's `href`. All three derive from the same identity; they are not reconciled separately.

## resolved heading

A heading element paired with its computed `heading identity` and level. The output of identity resolution and the input to TOC tree construction and per-heading anchor insertion.

Resolved headings are produced by a pure function; committing the identity to the DOM (`heading.id = identity`) is a separate writer step.

## TOC list anchor

The `<a>` element inside the generated `<ol>`/`<ul>` list. Its `href` points at a heading identity.

## per-heading anchor

The `<a>` element inserted *into* a heading (controlled by the `anchorLink` option). Distinct from the TOC list anchor; carries `data-mokuji-anchor`. Its `href` also points at the same heading identity.
