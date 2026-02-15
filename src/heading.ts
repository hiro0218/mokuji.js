import { getAllHeadingElements } from './utils/dom';
import type { HeadingLevel } from './types';

/**
 * Regular expressions and symbols used for text processing and anchor text generation
 */
const WHITESPACE_PATTERN = /\s+/g;
const COLON_CHARACTER = ':';
const PERCENT_ENCODING_PATTERN = /%+/g;
const DOT_REPLACEMENT = '.';

/**
 * Regular expressions for checking the validity of URL-encoded strings
 */
const VALID_PERCENT_ENCODING = /%[0-9A-F]{2}/i;
const INVALID_PERCENT_PATTERN = /%[^0-9A-F]|%[0-9A-F][^0-9A-F]|%$/i;

const HEADING_DUPLICATE_SUFFIX_PATTERN = /_\d+$/;

const MIN_HEADING_LEVEL: HeadingLevel = 1;
const MAX_HEADING_LEVEL: HeadingLevel = 6;
const FALLBACK_HEADING_LEVEL = MAX_HEADING_LEVEL;

/**
 * Replace spaces with underscores and remove colons in text
 */
const replaceSpacesWithUnderscores = (text: string): string => {
  return text.replaceAll(WHITESPACE_PATTERN, '_').replace(COLON_CHARACTER, '');
};

/**
 * Convert text to Wikipedia-style anchor format
 */
const convertToWikipediaStyleAnchor = (anchor: string): string => {
  return encodeURIComponent(anchor).replaceAll(PERCENT_ENCODING_PATTERN, DOT_REPLACEMENT);
};

/**
 * Generate anchor text
 */
export const generateAnchorText = (baseId: string, isConvertToWikipediaStyleAnchor: boolean): string => {
  if (isConvertToWikipediaStyleAnchor) {
    const anchorText = replaceSpacesWithUnderscores(baseId);
    return convertToWikipediaStyleAnchor(anchorText);
  }

  return encodeURIComponent(baseId.trim());
};

/**
 * Safely decode URI component
 */
const safeDecodeURIComponent = (encoded: string): string => {
  if (!VALID_PERCENT_ENCODING.test(encoded)) {
    return encoded;
  }

  if (INVALID_PERCENT_PATTERN.test(encoded)) {
    return encoded;
  }

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

/**
 * Assign ID to heading element
 */
export const assignInitialIdToHeading = (
  heading: HTMLHeadingElement,
  isConvertToWikipediaStyleAnchor: boolean,
): string => {
  const existingId = heading.getAttribute('id')?.trim();
  if (existingId) {
    heading.id = existingId;
    return existingId;
  }

  const baseHeadingId = (heading.textContent || '').trim();
  const anchorText = generateAnchorText(baseHeadingId, isConvertToWikipediaStyleAnchor);
  heading.id = anchorText;
  return anchorText;
};

/**
 * Resolve duplicate heading IDs and update anchors
 */
export const ensureUniqueHeadingIds = (headings: HTMLHeadingElement[], anchors: HTMLAnchorElement[]) => {
  const usedIds = new Set<string>();
  const idCounts = new Map<string, number>();
  const originalIds = new Set<string>();

  for (const [i, heading] of headings.entries()) {
    const originalId = heading.id || `mokuji-heading-${i}`;
    originalIds.add(safeDecodeURIComponent(originalId));
  }

  for (const [i, heading] of headings.entries()) {
    const anchor = anchors[i];
    const originalId = heading.id || `mokuji-heading-${i}`;
    const decodedId = safeDecodeURIComponent(originalId);

    if (!usedIds.has(decodedId)) {
      heading.id = originalId;
      usedIds.add(decodedId);

      if (anchor) {
        anchor.href = `#${originalId}`;
      }
      continue;
    }

    const baseId = decodedId.replace(HEADING_DUPLICATE_SUFFIX_PATTERN, '') || decodedId;
    let counter = (idCounts.get(baseId) || 0) + 1;

    while (usedIds.has(`${baseId}_${counter}`) || originalIds.has(`${baseId}_${counter}`)) {
      counter++;
    }

    const candidateId = `${baseId}_${counter}`;
    idCounts.set(baseId, counter);
    heading.id = candidateId;
    usedIds.add(candidateId);

    if (anchor) {
      anchor.href = `#${candidateId}`;
    }
  }
};

/**
 * Get heading element level as a numeric value
 */
export const getHeadingLevel = (heading: HTMLHeadingElement): HeadingLevel => {
  const numericLevel = Number.parseInt(heading.tagName.slice(1), 10);
  if (numericLevel >= MIN_HEADING_LEVEL && numericLevel <= MAX_HEADING_LEVEL) {
    return numericLevel as HeadingLevel;
  }
  return FALLBACK_HEADING_LEVEL;
};

/**
 * Get heading elements within the specified level range
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
