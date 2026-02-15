import { createElement, removeAllElements } from './utils/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from './utils/constants';
import type { MokujiOption, AnchorLinkPosition } from './types';

/**
 * Creates a map from anchor elements within the table of contents, using their href hash values as keys
 */
export const createAnchorMap = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement> => {
  const result = new Map<string, HTMLAnchorElement>();

  for (const anchor of anchors) {
    if (anchor.hash && anchor.hash.length > 1) {
      result.set(anchor.hash.slice(1), anchor);
    }
  }

  return result;
};

/**
 * Creates a map with anchor element text content as keys
 */
export const createTextToAnchorMap = (anchors: HTMLAnchorElement[]): Map<string, HTMLAnchorElement> => {
  const result = new Map<string, HTMLAnchorElement>();

  for (const anchor of anchors) {
    const text = anchor.textContent?.trim();
    if (text) {
      result.set(text, anchor);
    }
  }

  return result;
};

/**
 * Search directly by ID from the anchor map
 */
export const findAnchorById = (
  anchorMap: Map<string, HTMLAnchorElement>,
  id: string,
): HTMLAnchorElement | undefined => {
  return anchorMap.get(id);
};

/**
 * Search by ID with numeric suffix removed
 */
export const findAnchorByIdWithoutSuffix = (
  anchorMap: Map<string, HTMLAnchorElement>,
  id: string,
): HTMLAnchorElement | undefined => {
  const idWithoutSuffix = id.replace(/_\d+$/, '');
  if (idWithoutSuffix !== id) {
    return anchorMap.get(idWithoutSuffix);
  }
  return undefined;
};

/**
 * Search for anchor by text content
 */
export const findAnchorByText = (
  anchorMap: Map<string, HTMLAnchorElement>,
  text: string,
): HTMLAnchorElement | undefined => {
  const trimmedText = text.trim();
  if (!trimmedText) return undefined;

  for (const anchor of anchorMap.values()) {
    if (anchor.textContent?.trim() === trimmedText) {
      return anchor;
    }
  }
  return undefined;
};

const findAnchorInTextMap = (
  textToAnchorMap: Map<string, HTMLAnchorElement>,
  text: string,
): HTMLAnchorElement | undefined => {
  const trimmedText = text.trim();
  if (!trimmedText) return undefined;

  return textToAnchorMap.get(trimmedText);
};

/**
 * Find matching anchor with 3-level fallback (core implementation)
 */
const findMatchingAnchorCore = (
  anchorMap: Map<string, HTMLAnchorElement>,
  headingId: string,
  headingText: string,
  textToAnchorMap?: Map<string, HTMLAnchorElement>,
): HTMLAnchorElement | undefined => {
  // 1. Direct ID search → 2. Search after suffix removal → 3. Search by text content
  const directMatch = findAnchorById(anchorMap, headingId);
  if (directMatch) return directMatch;

  const suffixMatch = findAnchorByIdWithoutSuffix(anchorMap, headingId);
  if (suffixMatch) return suffixMatch;

  if (textToAnchorMap) {
    return findAnchorInTextMap(textToAnchorMap, headingText);
  }

  return findAnchorByText(anchorMap, headingText);
};

/**
 * Find matching anchor with 3-level fallback
 */
export const findMatchingAnchor = (
  anchorMap: Map<string, HTMLAnchorElement>,
  headingId: string,
  headingText: string,
): HTMLAnchorElement | undefined => {
  return findMatchingAnchorCore(anchorMap, headingId, headingText);
};

/**
 * Apply multiple class names to an element
 */
export const applyClassNamesToElement = (element: HTMLElement, classNameString: string): void => {
  const trimmedClassNames = classNameString.trim();
  if (!trimmedClassNames) return;

  element.classList.add(...trimmedClassNames.split(/\s+/).filter(Boolean));
};

/**
 * Create anchor template element
 */
export const createAnchorElement = (options: Required<MokujiOption>): HTMLAnchorElement => {
  const anchorTemplate = createElement('a');
  anchorTemplate.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');

  applyClassNamesToElement(anchorTemplate, options.anchorLinkClassName);

  return anchorTemplate;
};

/**
 * Create anchor element corresponding to a heading element (core implementation)
 */
const createAnchorForHeadingCore = (
  heading: HTMLHeadingElement,
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: Required<MokujiOption>,
  textToAnchorMap?: Map<string, HTMLAnchorElement>,
): HTMLAnchorElement | undefined => {
  const headingId = heading.id;
  const matchedTocAnchor = findMatchingAnchorCore(anchorMap, headingId, heading.textContent || '', textToAnchorMap);

  if (!matchedTocAnchor) {
    return undefined;
  }

  const anchorElement = anchorTemplate.cloneNode(false) as HTMLAnchorElement;
  anchorElement.href = matchedTocAnchor.hash;
  anchorElement.textContent = options.anchorLinkSymbol;

  return anchorElement;
};

/**
 * Create anchor element corresponding to a heading element
 */
export const createAnchorForHeading = (
  heading: HTMLHeadingElement,
  anchorMap: Map<string, HTMLAnchorElement>,
  anchorTemplate: HTMLAnchorElement,
  options: Required<MokujiOption>,
): HTMLAnchorElement | undefined => {
  return createAnchorForHeadingCore(heading, anchorMap, anchorTemplate, options);
};

/**
 * Remove existing table of contents anchors from headings to prevent duplicate insertion
 */
const removeExistingAnchors = (heading: HTMLHeadingElement): void => {
  const existingAnchors = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  removeAllElements(existingAnchors);
};

/**
 * Insert anchor element at specified position within heading element
 */
const placeAnchorInHeading = (
  heading: HTMLHeadingElement,
  anchor: HTMLAnchorElement,
  position: AnchorLinkPosition = 'before',
): void => {
  if (position === 'before') {
    heading.insertBefore(anchor, heading.firstChild);
  } else {
    heading.append(anchor);
  }
};

/**
 * Add anchor links to heading elements (core implementation)
 */
const insertAnchorsIntoHeadingsCore = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: Required<MokujiOption>,
  textToAnchorMap?: Map<string, HTMLAnchorElement>,
): HTMLAnchorElement[] => {
  const anchorTemplate = createAnchorElement(options);
  const insertedAnchors: HTMLAnchorElement[] = [];

  for (const heading of headings) {
    removeExistingAnchors(heading);
    const anchor = createAnchorForHeadingCore(heading, anchorMap, anchorTemplate, options, textToAnchorMap);
    if (!anchor) continue;

    placeAnchorInHeading(heading, anchor, options.anchorLinkPosition);
    insertedAnchors.push(anchor);
  }

  return insertedAnchors;
};

/**
 * Add anchor links to heading elements
 * @returns Array of inserted anchor elements
 */
export const insertAnchorsIntoHeadings = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  options: Required<MokujiOption>,
): HTMLAnchorElement[] => {
  return insertAnchorsIntoHeadingsCore(headings, anchorMap, options);
};

/**
 * Add anchor links to heading elements using maps
 * @returns Array of inserted anchor elements
 */
export const insertAnchorsIntoHeadingsWithMaps = (
  headings: HTMLHeadingElement[],
  anchorMap: Map<string, HTMLAnchorElement>,
  textToAnchorMap: Map<string, HTMLAnchorElement>,
  options: Required<MokujiOption>,
): HTMLAnchorElement[] => {
  return insertAnchorsIntoHeadingsCore(headings, anchorMap, options, textToAnchorMap);
};
