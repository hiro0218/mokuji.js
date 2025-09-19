import { createElement } from './utils/dom';
import type { MokujiOption, HeadingLevel } from './types';
import { getFilteredHeadings, ensureUniqueHeadingIds } from './heading';
import { createAnchorMap, createTextToAnchorMap, insertAnchorsIntoHeadingsWithMaps } from './anchor';
import { buildMokujiHierarchy } from './mokuji-core';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, defaultOptions } from './utils/constants';

export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  element?: T;
  list: HTMLUListElement | HTMLOListElement;
  destroy: () => void;
};

export { MokujiOption, HeadingLevel };

/**
 * Process option settings, merge with default values, and restrict to valid range
 */
const processOptions = (externalOptions?: MokujiOption): Required<MokujiOption> => {
  const options = {
    ...defaultOptions,
    ...externalOptions,
  };

  options.minLevel = Math.max(1, Math.min(options.minLevel, 6)) as HeadingLevel;
  options.maxLevel = Math.max(options.minLevel, Math.min(options.maxLevel, 6)) as HeadingLevel;

  return options;
};

/**
 * Generate table of contents from headings within the given element (public API)
 */
export const Mokuji = <T extends HTMLElement>(
  element: T | undefined,
  externalOptions?: MokujiOption,
): MokujiResult<T> | undefined => {
  if (!element) {
    console.warn('Mokuji: Target element not found.');
    return undefined;
  }

  const options = processOptions(externalOptions);

  const { minLevel, maxLevel } = options;
  const filteredHeadings = getFilteredHeadings(element, minLevel, maxLevel);

  if (filteredHeadings.length === 0) {
    return undefined;
  }

  // Generate table of contents
  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  buildMokujiHierarchy(filteredHeadings, listContainer, options.anchorType);

  const anchors = [...listContainer.querySelectorAll('a')];

  if (anchors.length === 0) {
    return undefined;
  }

  ensureUniqueHeadingIds(filteredHeadings, anchors);

  const insertedAnchors: HTMLAnchorElement[] = [];

  if (options.anchorLink) {
    const anchorsMap = createAnchorMap(anchors);
    const textToAnchorMap = createTextToAnchorMap(anchors);
    const anchorElements = insertAnchorsIntoHeadingsWithMaps(filteredHeadings, anchorsMap, textToAnchorMap, options);
    insertedAnchors.push(...anchorElements);
  }

  const destroy = () => {
    listContainer.remove();

    for (const anchor of insertedAnchors) {
      anchor.remove();
    }
  };

  return { element, list: listContainer, destroy };
};
