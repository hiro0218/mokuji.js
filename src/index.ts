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
  const merged = {
    ...defaultOptions,
    ...externalOptions,
  };

  const minLevel = Math.max(1, Math.min(merged.minLevel, 6)) as HeadingLevel;
  const maxLevel = Math.max(minLevel, Math.min(merged.maxLevel, 6)) as HeadingLevel;

  return { ...merged, minLevel, maxLevel };
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

  const { minLevel, maxLevel, includeBlockquoteHeadings } = options;
  const filteredHeadings = getFilteredHeadings(element, minLevel, maxLevel, { includeBlockquoteHeadings });

  if (filteredHeadings.length === 0) {
    return undefined;
  }

  const listContainer = createElement(options.anchorContainerTagName);
  listContainer.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  buildMokujiHierarchy(filteredHeadings, listContainer, options.anchorType);

  const anchors = [...listContainer.querySelectorAll('a')];

  if (anchors.length === 0) {
    return undefined;
  }

  ensureUniqueHeadingIds(filteredHeadings, anchors);

  const insertedAnchors = options.anchorLink
    ? insertAnchorsIntoHeadingsWithMaps(
        filteredHeadings,
        createAnchorMap(anchors),
        createTextToAnchorMap(anchors),
        options,
      )
    : [];

  const destroy = () => {
    listContainer.remove();

    for (const anchor of insertedAnchors) {
      anchor.remove();
    }
  };

  return { element, list: listContainer, destroy };
};
