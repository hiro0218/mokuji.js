import { ANCHOR_DATASET_ATTRIBUTE } from './constants';
import type { HeadingLevel } from '../types';

export const getAllHeadingElements = (
  containerElement: Element,
  minLevel: HeadingLevel = 1,
  maxLevel: HeadingLevel = 6,
): HTMLHeadingElement[] => {
  if (minLevel > maxLevel) {
    return [];
  }

  const selector = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => `h${minLevel + i}`).join(', ');
  const headings = containerElement.querySelectorAll(selector);
  return [...headings] as HTMLHeadingElement[];
};

export const createElement = <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] => {
  return document.createElement(tagName);
};

export const removeAllElements = (elements: NodeListOf<Element> | Element[]): void => {
  for (const element of elements) {
    element.remove();
  }
};

/**
 * Heading text excluding per-heading anchors inserted by a previous Mokuji call,
 * so repeated invocations never leak the anchor symbol into derived text.
 */
export const getHeadingText = (heading: HTMLHeadingElement): string => {
  let text = '';
  for (const node of heading.childNodes) {
    if (node instanceof Element && node.hasAttribute(ANCHOR_DATASET_ATTRIBUTE)) {
      continue;
    }
    text += node.textContent ?? '';
  }
  return text;
};
