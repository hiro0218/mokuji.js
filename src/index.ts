import type { MokujiOption, HeadingLevel } from './types';
import { getFilteredHeadings } from './heading';
import { resolveHeadingIdentities, commitHeadingIdentities } from './heading-identity';
import { buildTocList } from './mokuji-core';
import { insertPerHeadingAnchors } from './anchor';
import { setupScrollSpy } from './scroll-spy';
import { MOKUJI_LIST_DATASET_ATTRIBUTE, defaultOptions } from './utils/constants';

export type MokujiResult<T extends HTMLElement = HTMLElement> = {
  element?: T;
  list: HTMLUListElement | HTMLOListElement;
  destroy: () => void;
};

export { MokujiOption, HeadingLevel };

const processOptions = (externalOptions?: MokujiOption): Required<MokujiOption> => {
  const merged = { ...defaultOptions, ...externalOptions };
  const minLevel = Math.max(1, Math.min(merged.minLevel, 6)) as HeadingLevel;
  const maxLevel = Math.max(minLevel, Math.min(merged.maxLevel, 6)) as HeadingLevel;
  return { ...merged, minLevel, maxLevel };
};

/**
 * Generate a table of contents from headings within the given element.
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
  const { minLevel, maxLevel, includeBlockquoteHeadings, anchorType } = options;
  const headings = getFilteredHeadings(element, minLevel, maxLevel, { includeBlockquoteHeadings });
  if (headings.length === 0) return undefined;

  const resolved = resolveHeadingIdentities(headings, { anchorType });
  commitHeadingIdentities(resolved);

  const list = buildTocList(resolved, options.anchorContainerTagName);
  list.setAttribute(MOKUJI_LIST_DATASET_ATTRIBUTE, '');

  const insertedAnchors = options.anchorLink ? insertPerHeadingAnchors(resolved, options) : [];

  const teardownScrollSpy = options.scrollSpy
    ? setupScrollSpy(resolved, list, { offset: options.scrollSpyOffset })
    : undefined;

  const destroy = () => {
    teardownScrollSpy?.();
    list.remove();
    for (const anchor of insertedAnchors) anchor.remove();
  };

  return { element, list, destroy };
};
