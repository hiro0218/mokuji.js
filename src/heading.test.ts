import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assignInitialIdToHeading, ensureUniqueHeadingIds, getFilteredHeadings, getHeadingLevel } from './heading';

const createHeading = (level: number, text?: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  if (text) {
    heading.textContent = text;
  }
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

  // ========================================
  // Heading ID Management Tests
  // ========================================

  describe('assignInitialIdToHeading', () => {
    it('retains and normalizes an existing id so anchors stay stable', () => {
      const heading = createHeading(2, 'Existing');
      heading.setAttribute('id', '  pre-existing-id  ');

      const assignedId = assignInitialIdToHeading(heading, true);

      expect(assignedId).toBe('pre-existing-id');
      expect(heading.id).toBe('pre-existing-id');
    });

    it('derives an id from text content when none is provided', () => {
      const heading = createHeading(3, 'Generated Heading');

      const assignedId = assignInitialIdToHeading(heading, false);

      expect(assignedId).toBe('Generated%20Heading');
      expect(heading.id).toBe('Generated%20Heading');
    });
  });

  // ========================================
  // Heading Level Tests
  // ========================================

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

  // ========================================
  // Heading Filtering Tests
  // ========================================

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
  });

  // ========================================
  // Heading ID Uniqueness Tests
  // ========================================

  describe('ensureUniqueHeadingIds', () => {
    it('deduplicates conflicting ids and updates matching anchors to keep navigation working', () => {
      const headingOne = createHeading(2, 'Section');
      headingOne.id = 'section';
      const headingTwo = createHeading(2, 'Section');
      headingTwo.id = 'section';
      const headingThree = createHeading(2, 'Section');
      headingThree.id = 'section';

      const anchorOne = document.createElement('a');
      anchorOne.href = '#section';
      const anchorTwo = document.createElement('a');
      anchorTwo.href = '#section';
      const anchorThree = document.createElement('a');
      anchorThree.href = '#section';

      ensureUniqueHeadingIds([headingOne, headingTwo, headingThree], [anchorOne, anchorTwo, anchorThree]);

      expect(headingOne.id).toBe('section');
      expect(headingTwo.id).toBe('section_1');
      expect(headingThree.id).toBe('section_2');
      expect(anchorOne.href.endsWith('#section')).toBe(true);
      expect(anchorTwo.href.endsWith('#section_1')).toBe(true);
      expect(anchorThree.href.endsWith('#section_2')).toBe(true);
    });

    it('creates fallback ids for headings without existing identifiers', () => {
      const headingOne = createHeading(2, '');
      headingOne.id = '';
      const headingTwo = createHeading(3, '');
      headingTwo.id = '';

      const anchorOne = document.createElement('a');
      const anchorTwo = document.createElement('a');

      ensureUniqueHeadingIds([headingOne, headingTwo], [anchorOne, anchorTwo]);

      expect(headingOne.id).toBe('mokuji-heading-0');
      expect(headingTwo.id).toBe('mokuji-heading-1');
      expect(anchorOne.href.endsWith('#mokuji-heading-0')).toBe(true);
      expect(anchorTwo.href.endsWith('#mokuji-heading-1')).toBe(true);
    });

    it('handles percent-encoded ids by decoding only when safe', () => {
      const encoded = createHeading(2, 'Encoded');
      encoded.id = 'heading%20one';
      const invalid = createHeading(2, 'Invalid');
      invalid.id = 'heading%2';

      const anchorForEncoded = document.createElement('a');
      anchorForEncoded.href = '#heading%20one';
      const anchorForInvalid = document.createElement('a');
      anchorForInvalid.href = '#heading%2';

      ensureUniqueHeadingIds([encoded, invalid], [anchorForEncoded, anchorForInvalid]);

      expect(encoded.id).toBe('heading%20one');
      expect(anchorForEncoded.href.endsWith('#heading%20one')).toBe(true);
      expect(invalid.id).toBe('heading%2');
      expect(anchorForInvalid.href.endsWith('#heading%2')).toBe(true);
    });

    it('ignores missing anchors without throwing and still ensures unique ids', () => {
      const headingOne = createHeading(2, 'Section');
      headingOne.id = 'section';
      const headingTwo = createHeading(2, 'Section');
      headingTwo.id = 'section';

      ensureUniqueHeadingIds([headingOne, headingTwo], [document.createElement('a')]);

      expect(headingOne.id).toBe('section');
      expect(headingTwo.id).toBe('section_1');
    });

    it('should preserve original IDs like "aaa_2" when handling duplicates', () => {
      const heading1 = document.createElement('h2');
      heading1.textContent = 'aaa';
      heading1.id = 'aaa';

      const heading2 = document.createElement('h2');
      heading2.textContent = 'aaa';
      heading2.id = 'aaa';

      const heading3 = document.createElement('h2');
      heading3.textContent = 'aaa';
      heading3.id = 'aaa';

      const heading4 = document.createElement('h2');
      heading4.textContent = 'aaa_2';
      heading4.id = 'aaa_2';

      const anchors = [
        document.createElement('a'),
        document.createElement('a'),
        document.createElement('a'),
        document.createElement('a'),
      ];

      ensureUniqueHeadingIds([heading1, heading2, heading3, heading4], anchors);

      // The expected behavior: preserve original "aaa_2" and adjust others
      expect(heading1.id).toBe('aaa');
      expect(heading2.id).toBe('aaa_1');
      expect(heading3.id).toBe('aaa_3'); // Skip aaa_2 since it's reserved for the original
      expect(heading4.id).toBe('aaa_2'); // Original aaa_2 should be preserved as is
    });

    it('should handle complex cases where original IDs appear in different orders', () => {
      // Case 1: Original ID appears first
      const h1 = document.createElement('h2');
      h1.textContent = 'aaa_2';
      h1.id = 'aaa_2';

      const h2 = document.createElement('h2');
      h2.textContent = 'aaa';
      h2.id = 'aaa';

      const h3 = document.createElement('h2');
      h3.textContent = 'aaa';
      h3.id = 'aaa';

      const anchors1 = [document.createElement('a'), document.createElement('a'), document.createElement('a')];

      ensureUniqueHeadingIds([h1, h2, h3], anchors1);

      expect(h1.id).toBe('aaa_2'); // Original preserved
      expect(h2.id).toBe('aaa'); // First aaa gets base
      expect(h3.id).toBe('aaa_1'); // Second aaa gets _1

      // Case 2: Multiple original IDs with same text
      const h4 = document.createElement('h2');
      h4.textContent = 'aaa';
      h4.id = 'aaa';

      const h5 = document.createElement('h2');
      h5.textContent = 'aaa_2';
      h5.id = 'aaa_2';

      const h6 = document.createElement('h2');
      h6.textContent = 'aaa';
      h6.id = 'aaa';

      const h7 = document.createElement('h2');
      h7.textContent = 'aaa_2';
      h7.id = 'aaa_2';

      const anchors2 = [
        document.createElement('a'),
        document.createElement('a'),
        document.createElement('a'),
        document.createElement('a'),
      ];

      ensureUniqueHeadingIds([h4, h5, h6, h7], anchors2);

      expect(h4.id).toBe('aaa'); // First aaa
      expect(h5.id).toBe('aaa_2'); // First aaa_2 preserved
      expect(h6.id).toBe('aaa_1'); // Second aaa gets _1
      expect(h7.id).toBe('aaa_3'); // Second aaa_2 gets _3 (skip _2 since it's taken)
    });
  });
});
