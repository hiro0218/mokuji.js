import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assignInitialIdToHeading, getFilteredHeadings, ensureUniqueHeadingIds } from './heading';

const createHeading = (level: number, text?: string): HTMLHeadingElement => {
  const heading = document.createElement(`h${level}`) as HTMLHeadingElement;
  if (text) {
    heading.textContent = text;
  }
  return heading;
};

describe('heading utilities', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

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

      expect(assignedId).toBe('Generated_Heading');
      expect(heading.id).toBe('Generated_Heading');
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
  });

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

      expect(headingOne.id).toBe('mokuji-heading-0_0');
      expect(headingTwo.id).toBe('mokuji-heading-1_0');
      expect(anchorOne.href.endsWith('#mokuji-heading-0_0')).toBe(true);
      expect(anchorTwo.href.endsWith('#mokuji-heading-1_0')).toBe(true);
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
  });
});
