import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getFilteredHeadings, getHeadingLevel } from './heading';

const createHeading = (level: number, text?: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  if (text) heading.textContent = text;
  return heading;
};

describe('heading', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('getHeadingLevel', () => {
    it('extracts the numeric level for standard heading elements', () => {
      const heading = createHeading(4, 'Heading');
      expect(getHeadingLevel(heading)).toBe(4);
    });

    it('falls back to level 6 for unexpected tag names', () => {
      const invalidHeading = document.createElement('h7') as HTMLHeadingElement;
      expect(getHeadingLevel(invalidHeading)).toBe(6);
    });
  });

  describe('getFilteredHeadings', () => {
    it('returns headings within the requested level range, preserving their order', () => {
      container.innerHTML = `
        <h1>Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <h4>Details</h4>
        <h5>Appendix</h5>
      `;

      const filtered = getFilteredHeadings(container, 2, 4);

      expect(filtered.map((heading) => heading.tagName)).toEqual(['H2', 'H3', 'H4']);
    });

    it('returns an empty list when the range cannot match any heading', () => {
      container.innerHTML = '<h2>Only heading</h2>';

      const filtered = getFilteredHeadings(container, 4, 3);

      expect(filtered).toEqual([]);
    });

    it('excludes headings inside blockquote elements by default', () => {
      container.innerHTML = `
        <h2>Normal heading</h2>
        <blockquote>
          <h3>Quoted heading</h3>
        </blockquote>
        <h2>Another heading</h2>
      `;

      const filtered = getFilteredHeadings(container, 1, 6);

      expect(filtered.map((h) => h.textContent)).toEqual(['Normal heading', 'Another heading']);
    });

    it('includes headings inside blockquote when includeBlockquoteHeadings is true', () => {
      container.innerHTML = `
        <h2>Normal heading</h2>
        <blockquote>
          <h3>Quoted heading</h3>
        </blockquote>
        <h2>Another heading</h2>
      `;

      const filtered = getFilteredHeadings(container, 1, 6, { includeBlockquoteHeadings: true });

      expect(filtered.map((h) => h.textContent)).toEqual(['Normal heading', 'Quoted heading', 'Another heading']);
    });

    it('excludes headings in nested blockquotes', () => {
      container.innerHTML = `
        <h2>Top</h2>
        <blockquote>
          <h3>Level 1 quote</h3>
          <blockquote>
            <h4>Level 2 quote</h4>
          </blockquote>
        </blockquote>
        <h2>Bottom</h2>
      `;

      const filtered = getFilteredHeadings(container, 1, 6);

      expect(filtered.map((h) => h.textContent)).toEqual(['Top', 'Bottom']);
    });
  });
});
