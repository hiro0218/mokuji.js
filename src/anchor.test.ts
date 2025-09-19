import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createAnchorMap,
  findAnchorById,
  findAnchorByIdWithoutSuffix,
  findAnchorByText,
  findMatchingAnchor,
  applyClassNamesToElement,
  createAnchorElement,
  createAnchorForHeading,
  insertAnchorsIntoHeadings,
} from './anchor';
import { ANCHOR_DATASET_ATTRIBUTE, defaultOptions } from './utils/constants';
import type { MokujiOption } from './types';

describe('anchor', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ========================================
  // Anchor Map Generation Tests
  // ========================================

  describe('createAnchorMap', () => {
    it('generates empty Map from empty array', () => {
      const result = createAnchorMap([]);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('creates Map with hash as key from anchor elements', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#heading-1';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-2';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(2);
      expect(result.get('heading-1')).toBe(anchor1);
      expect(result.get('heading-2')).toBe(anchor2);
    });

    it('ignores anchors with empty hash', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#';
      const anchor2 = document.createElement('a');
      anchor2.href = '#heading-1';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.has('')).toBe(false);
      expect(result.get('heading-1')).toBe(anchor2);
    });

    it('retains the last one when multiple anchors have the same hash', () => {
      const anchor1 = document.createElement('a');
      anchor1.href = '#duplicate';
      anchor1.textContent = 'First';
      const anchor2 = document.createElement('a');
      anchor2.href = '#duplicate';
      anchor2.textContent = 'Second';

      const result = createAnchorMap([anchor1, anchor2]);

      expect(result.size).toBe(1);
      expect(result.get('duplicate')).toBe(anchor2);
    });
  });

  // ========================================
  // Anchor Finding Tests
  // ========================================

  describe('findAnchorById', () => {
    it('searches for anchor with matching ID directly', () => {
      const anchor1 = document.createElement('a');
      const anchor2 = document.createElement('a');
      const anchorMap = new Map([
        ['heading1', anchor1],
        ['heading2', anchor2],
      ]);

      expect(findAnchorById(anchorMap, 'heading1')).toBe(anchor1);
      expect(findAnchorById(anchorMap, 'heading2')).toBe(anchor2);
      expect(findAnchorById(anchorMap, 'not-exist')).toBeUndefined();
    });
  });

  describe('findAnchorByIdWithoutSuffix', () => {
    it('searches for ID after removing numeric suffix', () => {
      const anchor1 = document.createElement('a');
      const anchor2 = document.createElement('a');
      const anchorMap = new Map([
        ['overview', anchor1],
        ['installation', anchor2],
      ]);

      // Search from ID with suffix
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview_1')).toBe(anchor1);
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview_2')).toBe(anchor1);
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'installation_10')).toBe(anchor2);
    });

    it('returns undefined when ID has no suffix', () => {
      const anchorMap = new Map([['overview', document.createElement('a')]]);

      // undefined when no suffix
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'overview')).toBeUndefined();
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'not_exist')).toBeUndefined();
    });

    it('contains underscore but is not a suffix', () => {
      const anchor = document.createElement('a');
      const anchorMap = new Map([['user_profile', anchor]]);

      // user_profile is not a suffix
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'user_profile')).toBeUndefined();
      // user_profile_1 has a suffix
      expect(findAnchorByIdWithoutSuffix(anchorMap, 'user_profile_1')).toBe(anchor);
    });
  });

  describe('findAnchorByText', () => {
    it('searches for anchor by text content', () => {
      const anchor1 = document.createElement('a');
      anchor1.textContent = 'Introduction';
      const anchor2 = document.createElement('a');
      anchor2.textContent = 'Getting Started';
      const anchorMap = new Map([
        ['intro', anchor1],
        ['start', anchor2],
      ]);

      expect(findAnchorByText(anchorMap, 'Introduction')).toBe(anchor1);
      expect(findAnchorByText(anchorMap, 'Getting Started')).toBe(anchor2);
      expect(findAnchorByText(anchorMap, 'Not Found')).toBeUndefined();
    });

    it('searches ignoring leading/trailing whitespace', () => {
      const anchor = document.createElement('a');
      anchor.textContent = '  Trimmed Text  ';
      const anchorMap = new Map([['trimmed', anchor]]);

      expect(findAnchorByText(anchorMap, 'Trimmed Text')).toBe(anchor);
      expect(findAnchorByText(anchorMap, '  Trimmed Text  ')).toBe(anchor);
    });

    it('returns undefined for empty string', () => {
      const anchorMap = new Map([['test', document.createElement('a')]]);

      expect(findAnchorByText(anchorMap, '')).toBeUndefined();
      expect(findAnchorByText(anchorMap, '  ')).toBeUndefined();
    });
  });

  describe('findMatchingAnchor', () => {
    it('Priority 1: when ID matches directly', () => {
      const directMatch = document.createElement('a');
      directMatch.textContent = 'Direct';
      const suffixMatch = document.createElement('a');
      suffixMatch.textContent = 'Suffix';
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Text Match';

      const anchorMap = new Map([
        ['heading1', directMatch],
        ['heading', suffixMatch], // Matches after removing suffix from heading1_1
        ['other', textMatch],
      ]);

      // Direct ID match has highest priority
      expect(findMatchingAnchor(anchorMap, 'heading1', 'Text Match')).toBe(directMatch);
    });

    it('Priority 2: when ID matches after suffix removal', () => {
      const suffixMatch = document.createElement('a');
      suffixMatch.textContent = 'Suffix Match';
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Duplicate Heading';

      const anchorMap = new Map([
        ['overview', suffixMatch],
        ['other', textMatch],
      ]);

      // No direct match, matches with suffix removal
      expect(findMatchingAnchor(anchorMap, 'overview_2', 'Duplicate Heading')).toBe(suffixMatch);
    });

    it('Priority 3: when text content matches', () => {
      const textMatch = document.createElement('a');
      textMatch.textContent = 'Installation Guide';

      const anchorMap = new Map([['different-id', textMatch]]);

      // No ID match, matches by text
      expect(findMatchingAnchor(anchorMap, 'install_3', 'Installation Guide')).toBe(textMatch);
    });

    it('when not found by any fallback', () => {
      const anchor = document.createElement('a');
      anchor.textContent = 'Different Text';

      const anchorMap = new Map([['different', anchor]]);

      expect(findMatchingAnchor(anchorMap, 'not-found', 'No Match')).toBeUndefined();
    });
  });

  // ========================================
  // Anchor Factory Tests
  // ========================================

  describe('applyClassNamesToElement', () => {
    it('applies single class name', () => {
      const element = document.createElement('div');
      applyClassNamesToElement(element, 'test-class');

      expect(element.classList.contains('test-class')).toBe(true);
    });

    it('applies multiple class names', () => {
      const element = document.createElement('div');
      applyClassNamesToElement(element, 'class1 class2 class3');

      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
    });

    it('does not add classes for empty string', () => {
      const element = document.createElement('div');
      const originalClassListLength = element.classList.length;
      applyClassNamesToElement(element, '');

      expect(element.classList.length).toBe(originalClassListLength);
    });

    it('adds new classes while preserving existing ones', () => {
      const element = document.createElement('div');
      element.classList.add('existing-class');
      applyClassNamesToElement(element, 'new-class');

      expect(element.classList.contains('existing-class')).toBe(true);
      expect(element.classList.contains('new-class')).toBe(true);
    });
  });

  describe('createAnchorElement', () => {
    it('creates basic anchor template', () => {
      const anchor = createAnchorElement(defaultOptions);

      expect(anchor).toBeInstanceOf(HTMLAnchorElement);
      expect(anchor.dataset.mokujiAnchor).toBe('');
      // Template does not have textContent (set during clone)
      expect(anchor.textContent).toBe('');
    });

    it('when class name is empty with default options', () => {
      const anchor = createAnchorElement(defaultOptions);

      // By default anchorLinkClassName is empty so no class is added
      expect(anchor.classList.length).toBe(0);
    });

    it('applies custom class name', () => {
      const options = { ...defaultOptions, anchorLinkClassName: 'custom-anchor-class' };
      const anchor = createAnchorElement(options);

      expect(anchor.classList.contains('custom-anchor-class')).toBe(true);
    });
  });

  describe('createAnchorForHeading', () => {
    it('handles safely even when heading textContent is null', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      Object.defineProperty(heading, 'textContent', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const anchorTemplate = createAnchorElement(defaultOptions);
      const anchorMap = new Map<string, HTMLAnchorElement>();
      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      anchorMap.set('test-heading', tocAnchor);

      const result = createAnchorForHeading(heading, anchorMap, anchorTemplate, defaultOptions);

      expect(result).toBeDefined();
      expect(result?.href).toContain('#test-heading');
    });

    it('returns undefined when no matching anchor is found', () => {
      const heading = document.createElement('h2');
      heading.id = 'no-match';
      heading.textContent = 'No Match';

      const anchorTemplate = createAnchorElement(defaultOptions);
      const anchorMap = new Map<string, HTMLAnchorElement>();
      // No corresponding entry in anchorMap

      const result = createAnchorForHeading(heading, anchorMap, anchorTemplate, defaultOptions);

      expect(result).toBeUndefined();
    });
  });

  // ========================================
  // Anchor Insertion Tests
  // ========================================

  describe('insertAnchorsIntoHeadings', () => {
    it('inserts anchor links into headings', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: 'anchor-link',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor?.textContent).toBe('#');
    });

    it('places anchor at the end of heading when anchorLinkPosition="after"', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '🔗',
        anchorLinkPosition: 'after' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeTruthy();
      expect(insertedAnchor).toBe(heading.lastElementChild);
      expect(insertedAnchor?.textContent).toBe('🔗');
    });

    it('removes existing anchors before inserting new ones', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';

      // Add existing anchor
      const existingAnchor = document.createElement('a');
      existingAnchor.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
      existingAnchor.textContent = 'old';
      heading.append(existingAnchor);
      container.append(heading);

      const tocAnchor = document.createElement('a');
      tocAnchor.href = '#test-heading';
      const anchorMap = new Map([['test-heading', tocAnchor]]);

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: 'new',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(1);

      const anchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(anchors).toHaveLength(1);
      expect(anchors[0].textContent).toBe('new');
    });

    it('skips headings with no corresponding anchor', () => {
      const heading = document.createElement('h2');
      heading.id = 'test-heading';
      heading.textContent = 'Test Heading';
      container.append(heading);

      const anchorMap = new Map(); // Empty Map

      const options = {
        anchorType: true,
        anchorLink: true,
        anchorLinkSymbol: '#',
        anchorLinkPosition: 'before' as const,
        anchorLinkClassName: '',
        anchorContainerTagName: 'ol' as const,
        minLevel: 1 as const,
        maxLevel: 6 as const,
      } satisfies Required<MokujiOption>;

      const insertedAnchors = insertAnchorsIntoHeadings([heading], anchorMap, options);
      expect(insertedAnchors).toHaveLength(0); // No insertion because Map is empty

      const insertedAnchor = heading.querySelector(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
      expect(insertedAnchor).toBeNull();
    });
  });
});
