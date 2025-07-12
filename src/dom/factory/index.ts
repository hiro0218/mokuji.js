/**
 * DOM element factory
 * Abstracts DOM access to make testing easier
 *
 * @deprecated Use DomCore from ../core instead
 */

import type { ContainerTagName, ElementFactory } from '../../types/core';
import { DomCore } from '../core';

// Maintain the traditional interface for backward compatibility,
// while refactoring to use the new DomCore internally
const createListItem = () => DomCore.creator.createListItem();
const createAnchor = () => DomCore.creator.createAnchor();

export const ElementFactories = {
  createList:
    (tagName: ContainerTagName): ElementFactory<typeof tagName> =>
    () =>
      DomCore.creator.createList(tagName),

  createListItem: (): ElementFactory<'li'> => createListItem,

  createAnchor: (): ElementFactory<'a'> => createAnchor,
};
