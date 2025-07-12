/**
 * DOM要素ファクトリー
 * DOMアクセスを抽象化し、テストを容易にする
 *
 * @deprecated 代わりに ../core の DomCore を使用してください
 */

import type { ContainerTagName, ElementFactory } from '../../types/core';
import { DomCore } from '../core';

// 後方互換性のために従来のインターフェースを維持しつつ、
// 新しいDomCoreを内部で使用するようにリファクタリング
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
