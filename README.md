# mokuji.js

A table of content JavaScript Library.

> "mokuji" means "table of contents" in Japanese.

## Installation

```bash
npm install --save mokuji.js
```

## Usage

```javascript
import { Mokuji } from 'mokuji.js';

// Get the element containing your content with headings
const textElement = document.querySelector('.text');
if (!textElement) {
  console.warn('Target element not found');
  return;
}

// Generate the table of contents
const result = Mokuji(textElement);
if (!result) {
  console.warn('No headings found in the element');
  return;
}

// Append the generated list to your container
const listElement = document.querySelector('.list');
if (listElement) {
  listElement.appendChild(result.list);
}

// Clean up when no longer needed (instance-scoped)
// For SPAs: Call on component unmount
// For regular pages: Call on page unload
result.destroy();
```

### TypeScript

Full TypeScript support with type definitions included:

```typescript
import { Mokuji, MokujiOption, MokujiResult } from 'mokuji.js';

const options: MokujiOption = {
  anchorType: true, // true: Wikipedia-style, false: RFC 3986 compliant
  anchorLink: true, // Enable anchor links in headings
  anchorLinkSymbol: '🔗', // Symbol for anchor links
  minLevel: 2, // Start from h2 (skip h1)
  maxLevel: 4, // Include up to h4
};

const element = document.querySelector<HTMLElement>('.content');
if (!element) {
  console.warn('Content element not found');
  return;
}

const result: MokujiResult | undefined = Mokuji(element, options);
if (!result) {
  console.warn('No headings found within specified levels');
  return;
}

const tocContainer = document.querySelector<HTMLElement>('.toc');
if (tocContainer) {
  tocContainer.appendChild(result.list);
}

// Cleanup when component unmounts or page unloads
result.destroy();
```

### Cleanup Examples

The `destroy()` method removes generated IDs and anchor links. Call it when the TOC is no longer needed:

#### React

```jsx
import { useEffect, useRef } from 'react';
import { Mokuji } from 'mokuji.js';

function TableOfContents({ contentRef }) {
  const tocRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && tocRef.current) {
      const result = Mokuji(contentRef.current);
      if (result) {
        tocRef.current.appendChild(result.list);
        resultRef.current = result;
      }
    }

    // Cleanup on unmount
    return () => {
      resultRef.current?.destroy();
    };
  }, [contentRef]);

  return <div ref={tocRef} className="toc" />;
}
```

### Anchor Type Examples

The `anchorType` option controls how heading IDs are encoded:

```javascript
// Wikipedia-style encoding (anchorType: true, default)
const wikiStyle = Mokuji(element, {
  anchorType: true,
  anchorLink: true,
});
// Result: "Hello World" → "Hello_World"
//         "日本語" → ".E6.97.A5.E6.9C.AC.E8.AA.9E"

// RFC 3986 compliant encoding (anchorType: false)
const standardStyle = Mokuji(element, {
  anchorType: false,
  anchorLink: true,
});
// Result: "Hello World" → "Hello%20World"
//         "日本語" → "%E6%97%A5%E6%9C%AC%E8%AA%9E"
```

Choose `anchorType: true` for compatibility with Wikipedia-style URLs or when you prefer underscores over percent-encoding. Choose `anchorType: false` for standard URL encoding that works universally with all web frameworks and browsers.

## API

### `Mokuji(element, options)`

Generates a table of contents from heading elements within the specified element.

**Parameters:**

- `element`: HTMLElement - The container element to scan for headings
- `options`: MokujiOption (optional) - Configuration options

**Returns:**

- `MokujiResult` object with:
  - `element`: The original element passed
  - `list`: `HTMLOListElement | HTMLUListElement` - The generated table of contents
  - `destroy()`: Function - Removes this instance's generated content

Returns `undefined` if no headings are found.

## Important Notes

- **Duplicate Headings**: When multiple headings have the same text, they are automatically assigned unique IDs with numeric suffixes (e.g., `section`, `section_1`, `section_2`).

- **RFC 3986 Compliance**: When `anchorType` is `false`, generated anchors are fully RFC 3986 compliant for use as URI fragment identifiers.

- **Instance-scoped Cleanup**: Each `Mokuji()` call returns its own `destroy()` function, allowing multiple TOC instances to coexist without conflicts.

## Options

```javascript
{
  anchorType: true,
  anchorLink: false,
  anchorLinkSymbol: '#',
  anchorLinkPosition: 'before',
  anchorLinkClassName: '',
  anchorContainerTagName: 'ol',
  minLevel: 1,
  maxLevel: 6,
  includeBlockquoteHeadings: false,
  scrollSpy: false,
  scrollSpyOffset: 0,
}
```

### `anchorType`

(default: `true`)

Controls the anchor text encoding format.

- `true`: **Wikipedia-style format** - Spaces replaced with underscores, then URL-encoded with percent signs replaced by dots.

  ```
  "Hello World"     → "Hello_World"
  "Section: Title"  → "Section_Title"
  "こんにちは"      → ".E3.81.93.E3.82.93.E3.81.AB.E3.81.A1.E3.81.AF"
  ```

- `false`: **RFC 3986 compliant format** - Standard URI fragment identifier encoding using `encodeURIComponent`.
  ```
  "Hello World"     → "Hello%20World"
  "Section: Title"  → "Section%3A%20Title"
  "こんにちは"      → "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF"
  ```

### `anchorLink`

(default: `false`)

enable/disable the anchor link in the headings

### `anchorLinkSymbol`

(default: `'#'`)

set the anchor link symbol

### `anchorLinkPosition`

(default: `'before'`)

set position (before/after) the anchor link in headings.

### `anchorLinkClassName`

(default: `''`)

set anchor link class name. Multiple class names can be specified with spaces.

### `anchorContainerTagName`

(default: `'ol'`)

set the container element tag name for the table of contents. Possible values are 'ol' or 'ul'.

### `minLevel`

(default: `1`)

set the minimum heading level to include in the table of contents (1 means h1).

### `maxLevel`

(default: `6`)

set the maximum heading level to include in the table of contents (6 means h6).

### `includeBlockquoteHeadings`

(default: `false`)

Whether to include headings inside `<blockquote>` elements in the table of contents.

By default, headings within blockquotes are excluded from the TOC since they typically represent quoted content rather than the document's own structure.

```javascript
// Default: blockquote headings are excluded
const result = Mokuji(element);

// Include blockquote headings
const result = Mokuji(element, {
  includeBlockquoteHeadings: true,
});
```

### `scrollSpy`

(default: `false`)

Whether to mark the active table-of-contents link while the user scrolls.

When enabled, the active TOC link receives `data-mokuji-active="true"` and `aria-current="true"`. The active heading is the visually closest heading above the viewport offset. When `scrollSpyOffset` is zero or positive, the first visible heading is used before any heading has crossed that offset.

```javascript
const result = Mokuji(element, {
  scrollSpy: true,
});
```

Add CSS for the active state in your own UI:

```css
[data-mokuji-list] a[data-mokuji-active] {
  font-weight: 600;
  color: currentColor;
}
```

### `scrollSpyOffset`

(default: `0`)

Pixel offset from the viewport top used by `scrollSpy`. Set this when a sticky header covers the top of the document.

```javascript
const result = Mokuji(element, {
  scrollSpy: true,
  scrollSpyOffset: 64,
});
```

## License

MIT
