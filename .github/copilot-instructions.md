# AI Assistant Instructions for mokuji.js

This file provides guidance to AI assistants (GitHub Copilot, Claude Code, Cursor, Windsurf, and other coding assistants) when working with this repository.

## Project Overview

`mokuji.js` is a functional table of contents generator library that creates hierarchical lists from HTML heading elements. The project follows strict functional programming patterns and avoids TypeScript classes.

> "mokuji" means "table of contents" in Japanese.

## Commands

### Development Commands

```bash
# Build the project
npm run build      # Build with tsdown (ESM, ES2022 target)

# Development mode with watch
npm run dev        # Watch mode development

# Run linting
npm run lint       # ESLint check

# Run tests
npm run test       # Run Vitest tests
npm run test:watch # Vitest watch mode

# Run a specific test file
npx vitest run src/index.test.ts

# Run specific tests using pattern matching
npx vitest run -t "test name pattern"

# Type check without emitting files
npx tsc --noEmit

# Run tests with coverage
npx vitest run --coverage

# Format code
npm run format
```

### Build Configuration

- **Tool**: tsdown (not tsup, not tsc directly)
- **Target**: ES2022
- **Format**: ESM only
- **Entry Point**: `src/index.ts`
- **Output**: `dist/` directory with source maps and type definitions

## Architecture

### Module Structure

```
src/
├── index.ts             # Main API entry point (Mokuji function)
├── heading.ts           # Heading filtering by level + blockquote; level extraction
├── heading-identity.ts  # Single-pass identity resolver (pure) + DOM writer
├── mokuji-core.ts       # TOC list DOM builder (consumes ResolvedHeading[])
├── anchor.ts            # Per-heading anchor link insertion
├── types.ts             # Type definitions (MokujiOption, HeadingLevel, AnchorLinkPosition)
├── utils/
│   ├── constants.ts     # Default options and data attributes
│   └── dom.ts           # DOM manipulation utilities
└── *.test.ts            # Test files alongside source files
```

See `CONTEXT.md` for domain vocabulary (`heading identity`, `resolved heading`, `TOC list anchor`, `per-heading anchor`).

### Core Patterns

1. **Functional Composition**: Main `Mokuji()` orchestrates smaller pure functions
2. **Single-Pass Identity Resolution**: `resolveHeadingIdentities` decides each heading's final unique ID before any DOM is built; `commitHeadingIdentities` writes those IDs once. Downstream consumers (TOC list, per-heading anchors) all derive `href` from `ResolvedHeading.identity` directly — no map lookup or fallback search
3. **Stack-based Hierarchy**: TOC tree built with an array stack for nested list structure
4. **Instance-scoped Cleanup**: Each call returns its own `destroy()` function
5. **DOM Abstraction**: All DOM operations centralized in `utils/dom.ts`

### Core API

```typescript
// Main function that generates table of contents
export const Mokuji = <T extends HTMLElement>(
  element: T | undefined,
  options?: MokujiOption
): MokujiResult<T> | undefined

// Result type includes instance-specific cleanup
export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  element?: T;
  list: HTMLUListElement | HTMLOListElement;
  destroy: () => void;  // Instance-specific cleanup method
}
```

## Design Philosophy

Following principles from industry leaders:

- **Dan Abramov**: Functional programming, simple composability, clear separation of concerns
- **Steve Souders**: Web performance optimization, minimizing critical rendering path
- **Kent C. Dodds**: User behavior testing over implementation details
- **Robert C. Martin**: Self-explanatory code with minimal comments

## Critical Design Rules

### Functional Programming Only

- **Never use TypeScript classes** - Use functions and object literals
- Follow Dan Abramov's functional composition principles
- Prefer pure functions with single responsibilities
- Avoid mutations, prefer immutable updates

### Heading Identity Pipeline

The pipeline orchestrated by `Mokuji()`:

1. `getFilteredHeadings(element, ...)` — DOM query + level / blockquote filter
2. `resolveHeadingIdentities(headings, { anchorType })` — pure: returns `ResolvedHeading[]` with final unique identities
3. `commitHeadingIdentities(resolved)` — side effect: writes `heading.id`
4. `buildTocList(resolved, tag)` — pure render of nested `<ol>` / `<ul>` from resolved headings
5. `insertPerHeadingAnchors(resolved, options)` — optional `data-mokuji-anchor` injection per heading (when `anchorLink: true`)

`ResolvedHeading.identity` is the single source of truth — `heading.id`, TOC list anchor `href`, and per-heading anchor `href` all derive from it. The encoding strategy (Wikipedia-style vs RFC 3986) and dedup rules are private to `heading-identity.ts`.

### Anchor Encoding Logic

- `anchorType: true` (Wikipedia-style, default):
  - Spaces → underscores, then URL-encode with dots replacing %
  - Example: `日本語` → `.E6.97.A5.E6.9C.AC.E8.AA.9E`
  - Example: `Hello World` → `Hello_World`

- `anchorType: false` (RFC 3986 compliant):
  - Standard `encodeURIComponent`
  - Example: `Hello World` → `Hello%20World`
  - Example: `日本語` → `%E6%97%A5%E6%9C%AC%E8%AA%9E`

### Instance Management

- Each `Mokuji()` call creates isolated instance with own cleanup
- Uses data attributes (`data-mokuji-list`, `data-mokuji-anchor`) for element tracking
- `destroy()` method removes only that instance's generated content
- Supports multiple TOC instances without conflicts

## Testing Conventions

- **Colocated test files**: `*.test.ts` alongside source files
- **Environment**: Vitest with jsdom
- **Philosophy**: Focus on user behavior over implementation details
- **Coverage thresholds**:
  - Statements: 93%
  - Branches: 90%
  - Functions: 91%
  - Lines: 93%
- **Exclusions**: Test files and `types.ts` excluded from coverage
- **Integration over Unit**: Prefer integration tests when possible

## Performance Focus

- Minimize DOM operations through centralized `utils/dom.ts`
- Single-pass heading extraction with filtering
- Efficient hierarchy building using stack-based algorithm
- Optimize critical rendering path (Steve Souders principles)
- Avoid unnecessary re-renders and DOM manipulations

## Recent Architectural Decisions

- **RFC 3986 Compliance**: Standard anchor generation (`anchorType: false`) now uses proper URL encoding via `encodeURIComponent`
- **Single-Pass Identity Resolution**: Heading identities are resolved in one pure pass (`resolveHeadingIdentities`) before any rendering, replacing the prior two-pass DOM-mutating sequence and the multi-strategy anchor matcher. The `*Core` suffix indirection and the anchor `Map`-based lookup machinery were removed.
- **Coverage Strategy**: Type-only files (`types.ts`) and test files are excluded from coverage metrics
- **Build Tool Migration**: Moved from tsup to tsdown for better ESM support and build performance
- **Blockquote Heading Exclusion**: Headings inside `<blockquote>` elements are excluded from TOC by default (`includeBlockquoteHeadings: false`), configurable via option

## Important Notes

- **No TypeScript Classes**: Avoid using TypeScript classes. Prefer functional programming patterns and object literals.
- **Single Source of Truth for Identity**: `ResolvedHeading.identity` is the only authority for `heading.id` and any anchor `href`. Do not reintroduce parallel anchor-matching paths (text fallback, suffix-stripped lookup).
- **Anchor Generation**:
  - When `anchorType: true` (Wikipedia-style): Spaces become underscores, then percent-encoded with dots replacing %
  - When `anchorType: false` (RFC 3986 compliant): Uses standard `encodeURIComponent`
- **Performance Focus**: Minimize DOM operations, optimize critical rendering path
- **Unique Heading IDs**: The library ensures heading IDs are unique by preserving original IDs when possible and appending numeric suffixes to duplicates
- **Instance-scoped Cleanup**: Each `Mokuji()` call returns its own cleanup function, preventing memory leaks and conflicts between multiple TOC instances
- **Blockquote Heading Exclusion**: Headings inside `<blockquote>` are excluded from TOC by default. Use `includeBlockquoteHeadings: true` to include them. Filtering uses `Element.closest('blockquote')` in `getFilteredHeadings`
- **Clean Code**: Follow Clean Code principles - minimal comments, self-explanatory code, single responsibility functions
- **Test Philosophy**: Test user behavior, not implementation details

## Important Reminders

- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the user.
- When modifying code, preserve the existing code style and patterns.
- Always run tests and linting after making changes.
- Focus on maintaining backward compatibility unless explicitly instructed otherwise.