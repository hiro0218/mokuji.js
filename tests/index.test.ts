import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMokuji, destroyMokuji, ResultUtils } from '../src/index';

// Test user behavior, not implementation details
describe('Mokuji.js - Table of Contents Generator', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = ''; // Start with clean state
    document.body.append(container);
  });

  afterEach(() => {
    // Clean up after each test to avoid test pollution
    destroyMokuji();
    container.remove();
    vi.restoreAllMocks();
  });

  describe('when no headings are present', () => {
    it('should return error and no longer warn (functional API)', () => {
      container.innerHTML = '<p>Just some regular content without headings</p>';

      const result = createMokuji(container);

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe('Mokuji: No headings found in the target element.');
      }
    });
  });

  describe('when element is not found', () => {
    it('should return error about missing element (functional API)', () => {
      // Simulate user passing invalid element
      const result = createMokuji(undefined as unknown as HTMLElement);

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe('Mokuji: Target element not found.');
      }
    });
  });

  describe('when headings are present', () => {
    beforeEach(() => {
      container.innerHTML = `
        <article>
          <h1>Getting Started Guide</h1>
          <p>Introduction paragraph</p>
          
          <h2>Installation</h2>
          <p>How to install...</p>
          
          <h2>Configuration</h2>
          <h3>Basic Setup</h3>
          <p>Basic configuration...</p>
          
          <h3>Advanced Options</h3>
          <h4>Custom Styling</h4>
          <p>Advanced styling...</p>
        </article>
      `;
    });

    it('should generate a navigable table of contents', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        expect(result.data.targetElement).toBe(container);

        // User should be able to use the generated list for navigation
        const tocList = result.data.listElement;
        expect(tocList).toBeInstanceOf(HTMLElement);
        expect(tocList.tagName).toMatch(/^(UL|OL)$/);

        // Should contain clickable links for navigation
        const navigationLinks = tocList.querySelectorAll('a[href]');
        expect(navigationLinks).toHaveLength(6); // All headings become navigation links (h1 + h2 + h2 + h3 + h3 + h4)

        // Links should point to heading anchors
        for (const link of navigationLinks) {
          const href = link.getAttribute('href');
          expect(href).toMatch(/^#.+/); // Should be internal anchor link
        }
      }
    });

    it('should generate hierarchical navigation structure', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const tocList = result.data.listElement;

        // Should create nested structure for different heading levels
        const topLevelItems = tocList.children;
        expect(topLevelItems).toHaveLength(1); // Only one top-level item (h1)

        // First item should contain nested structure for h2 and below
        const firstItem = topLevelItems[0] as HTMLElement;
        const nestedList = firstItem.querySelector('ul, ol');
        expect(nestedList).toBeTruthy();

        const nestedItems = nestedList!.children;
        expect(nestedItems).toHaveLength(2); // Two h2 items
      }
    });
  });

  describe('when filtering headings by level', () => {
    beforeEach(() => {
      container.innerHTML = `
        <article>
          <h1>Title</h1>
          <h2>Chapter 1</h2>
          <h3>Section 1.1</h3>
          <h4>Subsection 1.1.1</h4>
          <h5>Detail 1.1.1.1</h5>
          <h6>Fine Detail</h6>
        </article>
      `;
    });

    it('should respect user-defined heading level boundaries', () => {
      const result = createMokuji(container, {
        minLevel: 2,
        maxLevel: 4,
      });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const navigationLinks = result.data.listElement.querySelectorAll('a');
        const linkTexts = [...navigationLinks].map((link) => link.textContent);

        // Should include only h2, h3, h4
        expect(linkTexts).toEqual(['Chapter 1', 'Section 1.1', 'Subsection 1.1.1']);

        // Should exclude h1, h5, h6
        expect(linkTexts).not.toContain('Title');
        expect(linkTexts).not.toContain('Detail 1.1.1.1');
        expect(linkTexts).not.toContain('Fine Detail');
      }
    });
  });

  describe('when anchor links are enabled', () => {
    beforeEach(() => {
      container.innerHTML = `
        <article>
          <h2>User Guide</h2>
          <h3>Quick Start</h3>
        </article>
      `;
    });

    it('should add clickable anchor links to headings for easy sharing', () => {
      const result = createMokuji(container, { anchorLink: true });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const headings = container.querySelectorAll('h2, h3');

        for (const heading of headings) {
          const anchorLink = heading.querySelector('a[data-mokuji-anchor]');
          expect(anchorLink).toBeTruthy();
          expect(anchorLink!.getAttribute('href')).toMatch(/^#.+/);
          expect(anchorLink!.textContent).toBe('#'); // Default symbol
        }
      }
    });

    it('should allow customization of anchor symbol and position', () => {
      const result = createMokuji(container, {
        anchorLink: true,
        anchorLinkSymbol: '🔗',
        anchorLinkPosition: 'after',
      });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const heading = container.querySelector('h2');
        const anchorLink = heading!.querySelector('a[data-mokuji-anchor]');

        expect(anchorLink!.textContent).toBe('🔗');
      }
    });
  });

  describe('cleanup functionality', () => {
    it('should remove all generated elements when destroyed', () => {
      container.innerHTML = `
        <h2>Section 1</h2>
        <h3>Subsection</h3>
      `;

      const result = createMokuji(container, { anchorLink: true });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        // Add TOC to DOM to simulate real usage
        document.body.append(result.data.listElement);

        // Verify elements are present
        expect(document.querySelector('[data-mokuji-list]')).toBeTruthy();
        expect(document.querySelectorAll('[data-mokuji-anchor]')).toHaveLength(2);

        // User calls destroy
        destroyMokuji();

        // All generated elements should be cleaned up
        expect(document.querySelector('[data-mokuji-list]')).toBeNull();
        expect(document.querySelectorAll('[data-mokuji-anchor]')).toHaveLength(0);
      }
    });
  });

  describe('accessibility and user experience', () => {
    beforeEach(() => {
      container.innerHTML = `
        <main>
          <h1>Document Title</h1>
          <h2>Introduction</h2>
          <h2>Getting Started</h2>
        </main>
      `;
    });

    it('should generate semantic navigation structure', () => {
      const result = createMokuji(container, { containerTagName: 'ol' });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const list = result.data.listElement;
        expect(list.tagName).toBe('OL');

        // Should be suitable for screen readers and navigation
        const listItems = list.querySelectorAll('li');
        for (const item of listItems) {
          const link = item.querySelector('a');
          expect(link).toBeTruthy();
          expect(link!.textContent).toBeTruthy(); // Should have meaningful text
        }
      }
    });
  });
});
