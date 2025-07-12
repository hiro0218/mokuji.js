/**
 * Abstraction layer for DOM element selection
 * Centralizes side effects that become mock targets during testing
 *
 * @deprecated Use DomCore from ../core instead
 */

import { DomCore } from '../core';

// Maintain the traditional interface for backward compatibility,
// while refactoring to use the new DomCore internally
export const ElementSelectors = {
  // Using the new implementation
  getAllHeadings: (container: Element): readonly HTMLHeadingElement[] => {
    return DomCore.selector.getAllHeadings(container);
  },

  findByDataAttribute: (container: Document | Element, attribute: string): readonly HTMLElement[] => {
    return DomCore.selector.findByDataAttribute(container, attribute);
  },

  findByTagAndAttribute: (container: Document | Element, tagName: string, attribute: string): HTMLElement | null => {
    return DomCore.selector.findByTagAndAttribute(container, tagName, attribute);
  },
};
