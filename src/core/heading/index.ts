/**
 * Business logic for heading processing
 * Maintaining compatibility with Wikipedia style is an important design requirement
 */

import type { HeadingInfo, HeadingLevel } from '../../types/core';
import { REGEX_PATTERNS } from '../../constants';
import { generateUniqueId } from '../../utils/id-generator';

/**
 * Type definition for heading extraction options
 */
type HeadingExtractOptions = {
  filterByLevel?: boolean;
  minLevel?: HeadingLevel;
  maxLevel?: HeadingLevel;
  generateId?: boolean;
  usedIds?: Set<string>;
  anchorType?: boolean;
};

/**
 * Enhanced function to extract information from heading elements
 * Supports various extraction modes based on options
 */
export const extractHeadingInfo = (
  element: HTMLHeadingElement,
  options?: HeadingExtractOptions,
): HeadingInfo | undefined => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;

  // If level filtering is enabled
  if (options?.filterByLevel && (level < (options.minLevel || 1) || level > (options.maxLevel || 6))) {
    return undefined;
  }

  const text = (element.textContent || '').trim();
  let id = element.id || '';

  // If ID generation is needed
  if (options?.generateId && options?.usedIds) {
    const baseId = generateAnchorText(text, options.anchorType || false);
    id = generateUniqueId(baseId, options.usedIds);
  }

  return { id, text, level, element };
};

/**
 * Simple heading information extraction (for backward compatibility)
 */
export const extractSimpleHeadingInfo = (element: HTMLHeadingElement): HeadingInfo => {
  const level = Number(element.tagName.charAt(1)) as HeadingLevel;
  const text = (element.textContent || '').trim();
  const id = element.id || '';

  return {
    id,
    text,
    level,
    element,
  };
};

export const filterHeadingsByLevel = (
  headings: readonly HeadingInfo[],
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel,
): readonly HeadingInfo[] => {
  return headings.filter((heading) => heading.level >= minLevel && heading.level <= maxLevel);
};

/**
 * Implements Wikipedia's anchor generation rules
 * Multibyte characters are % encoded and % is converted to .
 * In normal style, & characters and whitespace are removed
 */
export const generateAnchorText = (text: string, useWikipediaStyle: boolean): string => {
  if (text.length === 0) {
    return '';
  }

  let baseAnchor = text.trim().replaceAll(REGEX_PATTERNS.WHITESPACE, '_').replaceAll(REGEX_PATTERNS.COLON, '');

  if (useWikipediaStyle) {
    return encodeURIComponent(baseAnchor).replaceAll('%', '.');
  }

  baseAnchor = baseAnchor.replaceAll(REGEX_PATTERNS.AMPERSAND, '').replaceAll(REGEX_PATTERNS.AMPERSAND_HTML, '');

  return baseAnchor;
};

/**
 * 見出し要素群に一括でユニークIDを割り当てる
 * 注意: 既存のIDがある場合は上書きされる
 */
export const assignUniqueIds = (
  headings: readonly HeadingInfo[],
  useWikipediaStyle: boolean,
): readonly HeadingInfo[] => {
  const usedIds = new Set<string>();

  return headings.map((heading) => {
    // Branch based on whether an existing ID exists
    if (heading.id.trim()) {
      usedIds.add(heading.id); // Add existing ID to the set
      return heading;
    }

    const baseId = generateAnchorText(heading.text, useWikipediaStyle);
    const uniqueId = generateUniqueId(baseId, usedIds);

    return {
      ...heading,
      id: uniqueId,
    };
  });
};

export const generateHref = (id: string): string => {
  return `#${id}`;
};

export const extractHeadingsInfo = (elements: readonly HTMLHeadingElement[]): readonly HeadingInfo[] => {
  return elements.map((element) => extractSimpleHeadingInfo(element));
};
