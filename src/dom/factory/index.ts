/**
 * DOM要素ファクトリー
 * DOMアクセスを抽象化し、テストを容易にする
 */

import type { ContainerTagName, ElementFactory } from '../../types/core';

const createListItem = () => document.createElement('li');
const createAnchor = () => document.createElement('a');

export const ElementFactories = {
  createList:
    (tagName: ContainerTagName): ElementFactory<typeof tagName> =>
    () =>
      document.createElement(tagName),

  createListItem: (): ElementFactory<'li'> => createListItem,

  createAnchor: (): ElementFactory<'a'> => createAnchor,
};
