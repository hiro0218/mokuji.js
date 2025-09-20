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
├── index.ts           # Main API entry point (Mokuji function)
├── mokuji-core.ts    # Table of contents hierarchy generation (buildTocHierarchy, buildTocDom)
├── heading.ts        # Heading extraction, filtering, ID management, and RFC 3986 encoding
├── anchor.ts         # Anchor link generation and insertion with Core pattern implementations
├── types.ts          # Type definitions (MokujiOption, HeadingLevel, AnchorLinkPosition)
├── utils/
│   ├── constants.ts  # Default options and data attributes
│   └── dom.ts        # DOM manipulation utilities
└── *.test.ts         # Test files alongside source files
```

### Core Patterns

1. **Functional Composition**: Main `Mokuji()` orchestrates smaller pure functions
2. **Two-Phase Processing**:
   - Phase 1: Extract headings → Filter by levels
   - Phase 2: Build hierarchy → Generate anchors
3. **Stack-based Hierarchy**: Uses array stack for nested list structure
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

### DRY Pattern with Core Suffix

- Internal implementations use `*Core` suffix (e.g., `buildMokujiHierarchy` calls `buildTocHierarchyCore`)
- Maintains public API compatibility while consolidating logic
- Avoids code duplication while keeping clear API boundaries

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
- **Refactoring Pattern**: Core functions use internal `*Core` suffix pattern to consolidate logic while maintaining backward compatibility
- **Coverage Strategy**: Type-only files (`types.ts`) and test files are excluded from coverage metrics
- **Build Tool Migration**: Moved from tsup to tsdown for better ESM support and build performance

## Important Notes

- **No TypeScript Classes**: Avoid using TypeScript classes. Prefer functional programming patterns and object literals.
- **DRY Principle**: Internal implementations use `*Core` suffix pattern to avoid duplication while maintaining public API compatibility.
- **Anchor Generation**:
  - When `anchorType: true` (Wikipedia-style): Spaces become underscores, then percent-encoded with dots replacing %
  - When `anchorType: false` (RFC 3986 compliant): Uses standard `encodeURIComponent`
- **Performance Focus**: Minimize DOM operations, optimize critical rendering path
- **Unique Heading IDs**: The library ensures heading IDs are unique by preserving original IDs when possible and appending numeric suffixes to duplicates
- **Instance-scoped Cleanup**: Each `Mokuji()` call returns its own cleanup function, preventing memory leaks and conflicts between multiple TOC instances
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