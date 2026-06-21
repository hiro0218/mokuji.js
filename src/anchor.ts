import { createElement, getHeadingText, removeAllElements } from './utils/dom';
import { ANCHOR_DATASET_ATTRIBUTE } from './utils/constants';
import type { MokujiOption, AnchorLinkPosition } from './types';
import type { ResolvedHeading } from './heading-identity';

const createAnchorTemplate = (className: string): HTMLAnchorElement => {
  const template = createElement('a');
  template.setAttribute(ANCHOR_DATASET_ATTRIBUTE, '');
  const trimmed = className.trim();
  if (trimmed) template.className = trimmed;
  return template;
};

const removeExistingAnchors = (heading: HTMLHeadingElement): void => {
  const existing = heading.querySelectorAll(`[${ANCHOR_DATASET_ATTRIBUTE}]`);
  removeAllElements(existing);
};

const placeAnchorInHeading = (
  heading: HTMLHeadingElement,
  anchor: HTMLAnchorElement,
  position: AnchorLinkPosition,
): void => {
  if (position === 'before') {
    heading.insertBefore(anchor, heading.firstChild);
  } else {
    heading.append(anchor);
  }
};

const createAnchorLabel = (heading: HTMLHeadingElement, identity: string): string => {
  const text = getHeadingText(heading).trim();
  return `Link to heading: ${text || identity}`;
};

export const insertPerHeadingAnchors = (
  resolved: ReadonlyArray<ResolvedHeading>,
  options: Required<MokujiOption>,
): ReadonlyArray<HTMLAnchorElement> => {
  const template = createAnchorTemplate(options.anchorLinkClassName);
  const inserted: HTMLAnchorElement[] = [];

  for (const r of resolved) {
    removeExistingAnchors(r.heading);
    const anchor = template.cloneNode(false) as HTMLAnchorElement;
    anchor.href = `#${r.identity}`;
    anchor.textContent = options.anchorLinkSymbol;
    anchor.setAttribute('aria-label', createAnchorLabel(r.heading, r.identity));
    placeAnchorInHeading(r.heading, anchor, options.anchorLinkPosition);
    inserted.push(anchor);
  }

  return inserted;
};
