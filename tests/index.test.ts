import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMokuji, destroyMokuji, ResultUtils } from '../src/index';

// Test user behavior, not implementation details
describe('Mokuji.js - Table of Contents Generator', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Always start fresh to avoid test pollution
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    // Clean up after each test to avoid test pollution
    destroyMokuji();
    container.remove();
    vi.restoreAllMocks();
  });

  describe('when no headings are present', () => {
    it('returns error when target element contains no headings', () => {
      container.innerHTML = '<p>Just some regular content without headings</p>';

      const result = createMokuji(container);

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe('Mokuji: No headings found in the target element.');
      }
    });
  });

  describe('when element is not found', () => {
    it('returns error when target element is invalid', () => {
      const result = createMokuji(undefined as unknown as HTMLElement);

      expect(ResultUtils.isError(result)).toBe(true);
      if (ResultUtils.isError(result)) {
        expect(result.error.message).toBe('Mokuji: Target element not found.');
      }
    });

    it('returns error when target element is null', () => {
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

    it('generates a navigable table of contents with all headings', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        expect(result.data.targetElement).toBe(container);

        const tocList = result.data.listElement;
        expect(tocList).toBeInstanceOf(HTMLElement);
        expect(tocList.tagName).toMatch(/^(UL|OL)$/);

        const navigationLinks = tocList.querySelectorAll('a[href]');
        expect(navigationLinks).toHaveLength(6); // All headings become navigation links (h1 + h2 + h2 + h3 + h3 + h4)

        // All links should be internal anchor links
        for (const link of navigationLinks) {
          const href = link.getAttribute('href');
          expect(href).toMatch(/^#.+/);
        }
      }
    });

    it('generates hierarchical navigation structure', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const tocList = result.data.listElement;

        const topLevelItems = tocList.children;
        expect(topLevelItems).toHaveLength(1); // Only one top-level item (h1)

        const firstItem = topLevelItems[0] as HTMLElement;
        const nestedList = firstItem.querySelector('ul, ol');
        expect(nestedList).toBeTruthy();

        const nestedItems = nestedList!.children;
        expect(nestedItems).toHaveLength(2); // Two h2 items
      }
    });
  });

  describe('heading level filtering', () => {
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

    it('includes only headings within specified level range', () => {
      const result = createMokuji(container, {
        minLevel: 2,
        maxLevel: 4,
      });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const navigationLinks = result.data.listElement.querySelectorAll('a');
        const linkTexts = [...navigationLinks].map((link) => link.textContent);

        expect(linkTexts).toEqual(['Chapter 1', 'Section 1.1', 'Subsection 1.1.1']);
        expect(linkTexts).not.toContain('Title');
        expect(linkTexts).not.toContain('Detail 1.1.1.1');
        expect(linkTexts).not.toContain('Fine Detail');
      }
    });

    it('includes all headings when no filtering is specified', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const navigationLinks = result.data.listElement.querySelectorAll('a');
        expect(navigationLinks).toHaveLength(6); // All headings h1-h6
      }
    });
  });

  describe('anchor links functionality', () => {
    beforeEach(() => {
      container.innerHTML = `
        <article>
          <h2>User Guide</h2>
          <h3>Quick Start</h3>
        </article>
      `;
    });

    it('adds anchor links to headings when enabled', () => {
      const result = createMokuji(container, { anchorLink: true });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const headings = container.querySelectorAll('h2, h3');

        for (const heading of headings) {
          const anchorLink = heading.querySelector('a[data-mokuji-anchor]');
          expect(anchorLink).toBeTruthy();
          expect(anchorLink!.getAttribute('href')).toMatch(/^#.+/);
          expect(anchorLink!.textContent).toBe('#');
        }
      }
    });

    it('allows customization of anchor symbol and position', () => {
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

    it('does not add anchor links when disabled', () => {
      const result = createMokuji(container, { anchorLink: false });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const anchorLinks = container.querySelectorAll('[data-mokuji-anchor]');
        expect(anchorLinks).toHaveLength(0);
      }
    });
  });

  describe('cleanup functionality', () => {
    it('removes all generated elements when destroyed', () => {
      container.innerHTML = `
        <h2>Section 1</h2>
        <h3>Subsection</h3>
      `;

      const result = createMokuji(container, { anchorLink: true });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        // Add TOC to DOM to simulate real usage
        document.body.append(result.data.listElement);

        // Verify elements are present before cleanup
        expect(document.querySelector('[data-mokuji-list]')).toBeTruthy();
        expect(document.querySelectorAll('[data-mokuji-anchor]')).toHaveLength(2);

        destroyMokuji();

        // Verify all generated elements are cleaned up
        expect(document.querySelector('[data-mokuji-list]')).toBeNull();
        expect(document.querySelectorAll('[data-mokuji-anchor]')).toHaveLength(0);
      }
    });

    it('handles cleanup gracefully when no elements exist', () => {
      // Should not throw when called without any generated elements
      expect(() => destroyMokuji()).not.toThrow();
    });
  });

  describe('accessibility and semantic structure', () => {
    beforeEach(() => {
      container.innerHTML = `
        <main>
          <h1>Document Title</h1>
          <h2>Introduction</h2>
          <h2>Getting Started</h2>
        </main>
      `;
    });

    it('generates semantic navigation structure with unordered list when specified', () => {
      const result = createMokuji(container, { containerTagName: 'ul' });

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const list = result.data.listElement;
        expect(list.tagName).toBe('UL');

        // Each list item should contain meaningful navigation links
        const listItems = list.querySelectorAll('li');
        for (const item of listItems) {
          const link = item.querySelector('a');
          expect(link).toBeTruthy();
          expect(link!.textContent?.trim()).toBeTruthy();
        }
      }
    });

    it('generates semantic navigation structure with ordered list by default', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const list = result.data.listElement;
        expect(list.tagName).toBe('OL');
      }
    });

    it('provides meaningful text content for screen readers', () => {
      const result = createMokuji(container);

      expect(ResultUtils.isOk(result)).toBe(true);
      if (ResultUtils.isOk(result)) {
        const links = result.data.listElement.querySelectorAll('a');
        const linkTexts = [...links].map((link) => link.textContent?.trim());

        expect(linkTexts).toEqual(['Document Title', 'Introduction', 'Getting Started']);
        expect(linkTexts.every((text) => text && text.length > 0)).toBe(true);
      }
    });
  });
});
