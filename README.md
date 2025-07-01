# mokuji.js

A TypeScript library for creating table of contents from target elements.

## Installation

```bash
npm install --save mokuji.js
```

## Basic Usage

```javascript
import { createMokuji, ResultUtils } from 'mokuji.js';

const textElement = document.querySelector('.text');
const result = createMokuji(textElement);

if (ResultUtils.isOk(result)) {
  const listElement = document.querySelector('.list');
  listElement?.appendChild(result.data.listElement);
} else {
  console.error('Error:', result.error.message);
}
```

## Functional API

```javascript
import { createMokuji, ResultUtils } from 'mokuji.js';

const result = createMokuji(textElement, {
  anchorLink: true,
  containerTagName: 'ul'
});

if (ResultUtils.isOk(result)) {
  console.log('Table of contents generated successfully:', result.data);
  // Get the table of contents element
  const tocElement = result.data.listElement;
  document.body.appendChild(tocElement);
} else {
  console.error('Error occurred:', result.error.message);
}
```

## Configuration Options

```javascript
{
  anchorType: true,         // Wikipedia-style anchor
  anchorLink: false,        // Show anchor links
  anchorLinkSymbol: '#',    // Anchor link symbol
  anchorLinkPosition: 'before',  // Anchor link position
  anchorLinkClassName: '',  // CSS class for anchor links
  containerTagName: 'ol',   // Container element tag name
  minLevel: 1,             // Minimum heading level
  maxLevel: 6,             // Maximum heading level
}
```

### `anchorType`

(Default: `true`)

Like Wikipedia's anchor, multibyte characters are replaced by escape sequences.

`こんにちは` → `.E3.81.93.E3.82.93.E3.81.AB.E3.81.A1.E3.81.AF`

### `anchorLink`

(Default: `false`)

Enable/disable anchor links in headings.

### `anchorLinkSymbol`

(Default: `'#'`)

Set the anchor link symbol.

### `anchorLinkPosition`

(Default: `'before'`)

Set the position (before/after) of anchor links within headings.

### `anchorLinkClassName`

(Default: `''`)

Set CSS class names for anchor links. Multiple class names can be specified with spaces.

### `containerTagName`

(Default: `'ol'`)

Set the container element tag name for the table of contents. Possible values are 'ol' or 'ul'.

### `minLevel`

(Default: `1`)

Set the minimum heading level to include in the table of contents (1 means h1).

### `maxLevel`

(Default: `6`)

Set the maximum heading level to include in the table of contents (6 means h6).

## Advanced Usage

### Removing Table of Contents

```javascript
import { destroyMokuji } from 'mokuji.js';

// Remove all table of contents and anchor links
destroyMokuji();

// Remove only table of contents within a specific container
destroyMokuji('container-id');
```

### Configuration Validation

```javascript
import { validateMokujiConfig, getDefaultConfig, validateConfig } from 'mokuji.js';

const config = { minLevel: 2, maxLevel: 4 };
const isValid = validateMokujiConfig(config);
console.log('Configuration is valid:', isValid);

// Get default configuration
const defaultConfig = getDefaultConfig();
console.log('Default configuration:', defaultConfig);

// Full configuration validation
const fullConfig = { ...defaultConfig, minLevel: 2 };
const isConfigValid = validateConfig(fullConfig);
console.log('Full configuration validation:', isConfigValid);
```

### Getting Debug Information

```javascript
import { getMokujiDebugInfo } from 'mokuji.js';

const debugInfo = getMokujiDebugInfo(textElement);
if ('error' in debugInfo) {
  console.error('Error:', debugInfo.error);
} else {
  console.log('Total headings:', debugInfo.totalHeadings);
  console.log('Filtered headings:', debugInfo.filteredHeadings);
  console.log('Heading levels:', debugInfo.headingLevels);
  console.log('Heading texts:', debugInfo.headingTexts);
}
```

## Utility Functions

### Result Type Operations

```javascript
import { ResultUtils } from 'mokuji.js';

const result = createMokuji(element);

// Success check
if (ResultUtils.isOk(result)) {
  console.log('Success:', result.data);
}

// Error check
if (ResultUtils.isError(result)) {
  console.error('Error:', result.error);
}

// Result type transformation
const transformed = ResultUtils.map(result, data => ({
  ...data,
  timestamp: new Date()
}));

// Error handling
const withDefault = ResultUtils.getOrElse(result, {
  targetElement: document.body,
  listElement: document.createElement('ol'),
  structure: { items: [], headings: [] }
});
```

### Array and String Operations

```javascript
import { ArrayUtils, StringUtils } from 'mokuji.js';

// Array operations
const nonEmpty = ArrayUtils.isNonEmpty(headings);
const first = ArrayUtils.head(headings);
const last = ArrayUtils.last(headings);
const found = ArrayUtils.find(headings, h => h.level === 2);

// String operations with functional programming
const isEmpty = StringUtils.isEmpty('');
const isNonEmpty = StringUtils.isNonEmpty('text');

// Safe URL decoding with Result type
const decoded = StringUtils.safeDecodeURIComponent('%E3%83%86%E3%82%B9%E3%83%88');
if (ResultUtils.isOk(decoded)) {
  console.log(decoded.data);
}

// Function composition with pipe
const transform = StringUtils.pipe(
  (str) => str.trim(),
  (str) => str.toLowerCase(),
  (str) => str.replace(/\s+/g, '_')
);
const result = transform('  Hello World  '); // "hello_world"

// Safe string splitting
const parts = StringUtils.safeSplit('a,b,c', ',');
if (ArrayUtils.isNonEmpty(parts)) {
  console.log(parts); // NonEmptyArray guaranteed
}
```

### Domain Logic (Advanced Usage)

```javascript
import { 
  extractHeadingInfo,
  filterHeadingsByLevel,
  createTocStructure,
  buildTocHierarchy,
  getTocStatistics,
  flattenTocItems,
  findTocItemById
} from 'mokuji.js';

// Extract heading information
const headingElements = document.querySelectorAll('h1, h2, h3');
const headingInfo = Array.from(headingElements).map(extractHeadingInfo);

// Filter by level
const filtered = filterHeadingsByLevel(headingInfo, 2, 4);

// Create table of contents structure
const structure = createTocStructure(filtered);

// Get statistics
const stats = getTocStatistics(structure);
console.log('Statistics:', stats);

// Flattened items list
const flatItems = flattenTocItems(structure.items);

// Search by ID
const foundItem = findTocItemById(structure.items, 'target-id');
```

## TypeScript Support

When using TypeScript, the following types are available:

```typescript
import type { 
  MokujiConfig, 
  MokujiResult, 
  HeadingInfo, 
  TocStructure,
  HeadingLevel,
  ContainerTagName,
  AnchorPosition,
  TocItem,
  Option,
  Result
} from 'mokuji.js';
```

## React Usage

### Basic React Hook

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { createMokuji, ResultUtils, destroyMokuji } from 'mokuji.js';

const TableOfContents = ({ contentRef }) => {
  const tocRef = useRef(null);
  const [tocGenerated, setTocGenerated] = useState(false);

  useEffect(() => {
    if (contentRef.current && tocRef.current) {
      const result = createMokuji(contentRef.current, {
        anchorLink: true,
        containerTagName: 'ul',
        minLevel: 2,
        maxLevel: 4
      });

      if (ResultUtils.isOk(result)) {
        tocRef.current.appendChild(result.data.listElement);
        setTocGenerated(true);
      } else {
        console.error('TOC generation error:', result.error.message);
      }
    }

    // Cleanup on unmount
    return () => {
      if (tocGenerated) {
        destroyMokuji();
      }
    };
  }, [contentRef, tocGenerated]);

  return <div ref={tocRef} className="table-of-contents" />;
};

// Usage in parent component
const BlogPost = () => {
  const contentRef = useRef(null);

  return (
    <div className="blog-post">
      <aside className="toc-sidebar">
        <h3>Table of Contents</h3>
        <TableOfContents contentRef={contentRef} />
      </aside>
      <main ref={contentRef} className="content">
        <h2>Introduction</h2>
        <p>Content here...</p>
        <h2>Getting Started</h2>
        <h3>Installation</h3>
        <p>More content...</p>
        <h3>Configuration</h3>
        <p>Configuration details...</p>
      </main>
    </div>
  );
};
```

### Custom React Hook

```jsx
import { useEffect, useState, useRef } from 'react';
import { createMokuji, ResultUtils, destroyMokuji } from 'mokuji.js';

const useMokuji = (elementRef, config = {}) => {
  const [toc, setToc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const tocElementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    setLoading(true);
    setError(null);

    const result = createMokuji(elementRef.current, config);

    if (ResultUtils.isOk(result)) {
      setToc(result.data);
      setError(null);
    } else {
      setError(result.error.message);
      setToc(null);
    }

    setLoading(false);

    // Cleanup on unmount or config change
    return () => {
      if (tocElementRef.current) {
        destroyMokuji();
      }
    };
  }, [elementRef, config]);

  return { toc, error, loading, tocElementRef };
};

// Usage example
const DocumentViewer = () => {
  const contentRef = useRef(null);
  const { toc, error, loading, tocElementRef } = useMokuji(contentRef, {
    anchorLink: true,
    containerTagName: 'ol',
    minLevel: 1,
    maxLevel: 3
  });

  useEffect(() => {
    if (toc && tocElementRef.current) {
      tocElementRef.current.append(toc.listElement);
    }
  }, [toc]);

  if (loading) return <div>Generating table of contents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="document-viewer">
      <nav ref={tocElementRef} className="document-nav" />
      <article ref={contentRef} className="document-content">
        <h1>Document Title</h1>
        <h2>Section 1</h2>
        <p>Content...</p>
        <h3>Subsection 1.1</h3>
        <p>More content...</p>
      </article>
    </div>
  );
};
```

### Next.js Integration

```jsx
// components/TableOfContents.jsx
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const DynamicTOC = dynamic(() => import('./TOCClient'), {
  ssr: false,
  loading: () => <div>Loading TOC...</div>
});

const TableOfContents = ({ contentSelector = '.prose' }) => {
  return <DynamicTOC contentSelector={contentSelector} />;
};

// components/TOCClient.jsx
import { useEffect, useRef, useState } from 'react';
import { createMokuji, ResultUtils, destroyMokuji } from 'mokuji.js';

const TOCClient = ({ contentSelector }) => {
  const tocRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const contentElement = document.querySelector(contentSelector);
    if (contentElement && tocRef.current) {
      const result = createMokuji(contentElement, {
        anchorLink: true,
        anchorLinkPosition: 'after',
        containerTagName: 'ul',
        minLevel: 2,
        maxLevel: 4
      });

      if (ResultUtils.isOk(result)) {
        tocRef.current.append(result.data.listElement);
      } else {
        console.error('TOC generation error:', result.error.message);
      }
    }

    return () => {
      destroyMokuji();
    };
  }, [mounted, contentSelector]);

  if (!mounted) return null;

  return (
    <div className="sticky top-4">
      <h3 className="font-semibold mb-4">Table of Contents</h3>
      <div ref={tocRef} className="space-y-2" />
    </div>
  );
};

export default TOCClient;
```

