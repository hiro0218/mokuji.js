import { getAllHeadingElements } from './utils/dom';
import type { HeadingLevel } from './types';

const MIN_HEADING_LEVEL: HeadingLevel = 1;
const MAX_HEADING_LEVEL: HeadingLevel = 6;
const FALLBACK_HEADING_LEVEL = MAX_HEADING_LEVEL;

/**
 * Get heading element level as a numeric value.
 */
export const getHeadingLevel = (heading: HTMLHeadingElement): HeadingLevel => {
  const numericLevel = Number.parseInt(heading.tagName.slice(1), 10);
  if (numericLevel >= MIN_HEADING_LEVEL && numericLevel <= MAX_HEADING_LEVEL) {
    return numericLevel as HeadingLevel;
  }
  return FALLBACK_HEADING_LEVEL;
};

/**
 * Get heading elements within the specified level range.
 */
export const getFilteredHeadings = (
  element: Element,
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
  options?: { includeBlockquoteHeadings?: boolean },
): HTMLHeadingElement[] => {
  const includeBlockquoteHeadings = options?.includeBlockquoteHeadings ?? false;
  const allHeadings = getAllHeadingElements(element, minLevel, maxLevel);

  if (includeBlockquoteHeadings) {
    return allHeadings;
  }

  return allHeadings.filter((heading) => !heading.closest('blockquote'));
};
